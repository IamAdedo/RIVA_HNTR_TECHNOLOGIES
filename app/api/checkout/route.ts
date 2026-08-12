import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Monnify Token Cache
let cachedToken: string | null = null;
let tokenExpiryTime = 0;

async function getMonnifyToken() {
  const apiKey = process.env.MONNIFY_API_KEY;
  const secretKey = process.env.MONNIFY_SECRET_KEY;
  const baseUrl = process.env.MONNIFY_BASE_URL || 'https://sandbox.monnify.com';

  if (!apiKey || !secretKey || apiKey.includes('YOUR') || secretKey.includes('YOUR')) {
    console.warn('Monnify keys are not configured. Using fallback mocks.');
    return null;
  }

  // Return cached token if valid
  if (cachedToken && Date.now() < tokenExpiryTime) {
    return cachedToken;
  }

  try {
    const authString = Buffer.from(`${apiKey}:${secretKey}`).toString('base64');
    const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${authString}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Monnify Auth failed: ${res.statusText}`);
    }

    const data = await res.json();
    if (data.requestSuccessful && data.responseBody?.accessToken) {
      cachedToken = data.responseBody.accessToken;
      // Expire token slightly early
      tokenExpiryTime = Date.now() + (data.responseBody.expiresIn || 3600) * 1000 - 60000;
      return cachedToken;
    }
    return null;
  } catch (err) {
    console.error('Monnify Auth Token Fetch Error:', err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, deliveryAddress, items, totalAmount, paymentGateway, fulfillmentType } = body;

    if (!name || !email || !phone || !items || items.length === 0 || !totalAmount) {
      return NextResponse.json({ error: 'Missing required checkout parameters' }, { status: 400 });
    }

    // Generate ORD-YEAR-RANDOM
    const year = new Date().getFullYear();
    const rand = Math.floor(10000 + Math.random() * 90000);
    const trackingNumber = `ORD-${year}-${rand}`;

    // Insert Order as pending_payment
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        tracking_number: trackingNumber,
        guest_info: { name, email, phone, delivery_address: deliveryAddress, items },
        total_amount: totalAmount,
        payment_gateway: paymentGateway,
        fulfillment_type: fulfillmentType,
        current_status: 'pending_payment',
      })
      .select()
      .single();

    if (orderError) {
      console.error('Database error saving order:', orderError);
      return NextResponse.json({ error: 'Database failed to register order' }, { status: 500 });
    }

    // Log initial audit trail
    await supabaseAdmin.from('status_audit_logs').insert({
      entity_id: order.id,
      entity_type: 'order',
      status: 'pending_payment',
      notes: `Order created. Awaiting payment validation via ${paymentGateway.toUpperCase()}.`,
    });

    // If Monnify, attempt to generate virtual account details
    if (paymentGateway === 'monnify') {
      const token = await getMonnifyToken();
      const baseUrl = process.env.MONNIFY_BASE_URL || 'https://sandbox.monnify.com';
      const contractCode = process.env.MONNIFY_CONTRACT_CODE || '';

      if (token) {
        try {
          const initRes = await fetch(`${baseUrl}/api/v1/merchant/transactions/init-transaction`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              amount: totalAmount,
              customerName: name,
              customerEmail: email,
              paymentReference: trackingNumber,
              paymentDescription: `Order payment for RIVA HNTR (Tracking: ${trackingNumber})`,
              currencyCode: 'NGN',
              contractCode: contractCode,
              paymentMethods: ['ACCOUNT_TRANSFER'],
            }),
          });

          const initData = await initRes.json();
          if (initData.requestSuccessful && initData.responseBody?.accounts) {
            // Success! Return account details to client
            return NextResponse.json({
              success: true,
              trackingNumber,
              orderId: order.id,
              virtualAccounts: initData.responseBody.accounts.map((acc: any) => ({
                bankName: acc.bankName,
                accountNumber: acc.accountNumber,
                accountName: acc.accountName,
              })),
            });
          }
        } catch (err) {
          console.error('Failed to initialize Monnify transaction:', err);
        }
      }

      // High-Fidelity local Mock fallback for testing if API credentials are not live/valid
      const mockAccounts = [
        {
          bankName: 'Providus Bank (Demo)',
          accountNumber: '1029' + Math.floor(100000 + Math.random() * 900000).toString(),
          accountName: `RIVA HNTR - ${name}`,
        },
        {
          bankName: 'Wema Bank (Demo)',
          accountNumber: '0238' + Math.floor(100000 + Math.random() * 900000).toString(),
          accountName: `RIVA HNTR - ${name}`,
        },
      ];

      return NextResponse.json({
        success: true,
        trackingNumber,
        orderId: order.id,
        virtualAccounts: mockAccounts,
        isMock: true,
      });
    }

    // Default response for Paystack
    return NextResponse.json({
      success: true,
      trackingNumber,
      orderId: order.id,
    });
  } catch (err: any) {
    console.error('Checkout API error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
