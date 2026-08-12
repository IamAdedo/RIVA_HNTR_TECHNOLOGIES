import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const trackingId = searchParams.get('id')?.trim();
    const phone = searchParams.get('phone')?.trim();

    if (!trackingId || !phone) {
      return NextResponse.json({ error: 'Tracking ID and Phone Number are required' }, { status: 400 });
    }

    let entityType: 'order' | 'repair' | 'solar' = 'order';
    let dbTable = 'orders';
    let idColumn = 'tracking_number';

    if (trackingId.startsWith('ORD-')) {
      entityType = 'order';
      dbTable = 'orders';
      idColumn = 'tracking_number';
    } else if (trackingId.startsWith('REP-')) {
      entityType = 'repair';
      dbTable = 'repair_tickets';
      idColumn = 'ticket_number';
    } else if (trackingId.startsWith('SOL-')) {
      entityType = 'solar';
      dbTable = 'solar_projects';
      idColumn = 'project_number';
    } else {
      return NextResponse.json({ error: 'Invalid Tracking ID format. Must start with ORD-, REP-, or SOL-' }, { status: 400 });
    }

    // Query database with admin client to bypass RLS, checking details
    const { data: record, error: fetchError } = await supabaseAdmin
      .from(dbTable)
      .select('*')
      .eq(idColumn, trackingId)
      .single();

    if (fetchError || !record) {
      console.warn(`Tracking lookup failed for ID ${trackingId}`);
      return NextResponse.json({ error: 'Record not found. Check your Ticket ID.' }, { status: 404 });
    }

    // Verify Phone Number Match inside JSONB guest_info
    const guestInfo = record.guest_info || {};
    const recordedPhone = guestInfo.phone || '';

    // Standardize phone numbers to match (removing lead 0 or country code for similarity)
    const cleanPhone = (p: string) => p.replace(/[^0-9]/g, '').slice(-10);

    if (!recordedPhone || cleanPhone(recordedPhone) !== cleanPhone(phone)) {
      console.warn(`Phone number verification failed for tracking ID ${trackingId}. Inputs: ${phone}, Records: ${recordedPhone}`);
      return NextResponse.json({ error: 'Unauthorized. Phone number does not match this tracking ID.' }, { status: 401 });
    }

    // Fetch Audit history logs
    const { data: logs, error: logsError } = await supabaseAdmin
      .from('status_audit_logs')
      .select('*')
      .eq('entity_id', record.id)
      .order('created_at', { ascending: true });

    if (logsError) {
      console.error('Audit logs query error:', logsError);
    }

    return NextResponse.json({
      success: true,
      entityType,
      entity: record,
      timeline: logs || [],
    });
  } catch (err: any) {
    console.error('Tracking API internal error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
