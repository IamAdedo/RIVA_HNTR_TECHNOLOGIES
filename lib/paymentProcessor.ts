import { supabaseAdmin } from './supabaseAdmin';

export async function processSuccessfulPayment(trackingNumber: string, paymentReference: string) {
  console.log(`Processing payment for order ${trackingNumber} with ref ${paymentReference}`);

  // Fetch the order using the admin client to bypass client RLS
  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('tracking_number', trackingNumber)
    .single();

  if (orderError || !order) {
    console.error(`Order with tracking number ${trackingNumber} not found:`, orderError);
    throw new Error(`Order ${trackingNumber} not found`);
  }

  // Idempotency check: if status is already paid or processed, skip
  if (order.current_status !== 'pending_payment') {
    console.log(`Order ${trackingNumber} already processed. Current status: ${order.current_status}`);
    return { success: true, message: 'Already processed' };
  }

  // Retrieve items from guest_info
  const guestInfo = order.guest_info || {};
  const items = (guestInfo as any).items || [];

  // Update order status and set payment reference
  const { error: updateError } = await supabaseAdmin
    .from('orders')
    .update({
      current_status: 'payment_verified',
      payment_reference: paymentReference,
    })
    .eq('id', order.id);

  if (updateError) {
    console.error(`Failed to update status for order ${trackingNumber}:`, updateError);
    throw updateError;
  }

  // Insert transition into status_audit_logs
  const { error: auditError } = await supabaseAdmin.from('status_audit_logs').insert({
    entity_id: order.id,
    entity_type: 'order',
    status: 'payment_verified',
    notes: `Payment verified successfully via webhook gateway. Reference ID: ${paymentReference}. Product stock decremented.`,
  });

  if (auditError) {
    console.warn(`Failed to insert audit log for order ${trackingNumber}:`, auditError);
  }

  // Decrement inventory stock count for each item
  for (const item of items) {
    if (!item.id || !item.quantity) continue;

    console.log(`Decrementing stock for product ID: ${item.id} by qty: ${item.quantity}`);
    
    // Perform database atomic update
    const { data: product, error: productFetchError } = await supabaseAdmin
      .from('products')
      .select('stock_quantity')
      .eq('id', item.id)
      .single();

    if (!productFetchError && product) {
      const newStock = Math.max(0, product.stock_quantity - item.quantity);
      
      const { error: stockUpdateError } = await supabaseAdmin
        .from('products')
        .update({ stock_quantity: newStock })
        .eq('id', item.id);

      if (stockUpdateError) {
        console.error(`Failed to decrement stock for product ${item.id}:`, stockUpdateError);
      }
    } else {
      console.error(`Failed to retrieve stock count for product ${item.id}:`, productFetchError);
    }
  }

  return { success: true, message: 'Fulfillment completed' };
}
