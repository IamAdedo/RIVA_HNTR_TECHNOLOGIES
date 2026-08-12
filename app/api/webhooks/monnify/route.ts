import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { processSuccessfulPayment } from '@/lib/paymentProcessor';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('monnify-signature');

    if (!signature) {
      console.warn('Monnify webhook received without monnify-signature header');
      return new NextResponse('Unauthorized - Missing signature', { status: 401 });
    }

    const secret = process.env.MONNIFY_SECRET_KEY || '';
    const hash = createHmac('sha512', secret).update(rawBody).digest('hex');

    if (hash !== signature) {
      console.warn('Monnify webhook signature verification failed');
      return new NextResponse('Unauthorized - Invalid signature', { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const eventType = payload.eventType;

    console.log(`Monnify Webhook Event Type Received: ${eventType}`);

    if (eventType === 'SUCCESSFUL_TRANSACTION') {
      const data = payload.eventData;
      // We set Monnify's paymentReference to our order's tracking_number when initiating
      const trackingNumber = data.paymentReference;
      const monnifyRef = data.transactionReference;

      if (!trackingNumber) {
        console.warn('Monnify charge event received without transaction paymentReference');
        return NextResponse.json({ success: false, message: 'Missing paymentReference' }, { status: 400 });
      }

      await processSuccessfulPayment(trackingNumber, monnifyRef);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Monnify Webhook Internal Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
