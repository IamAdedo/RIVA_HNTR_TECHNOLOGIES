import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { processSuccessfulPayment } from '@/lib/paymentProcessor';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-paystack-signature');

    if (!signature) {
      console.warn('Paystack webhook received without x-paystack-signature header');
      return new NextResponse('Unauthorized - Missing signature', { status: 401 });
    }

    const secret = process.env.PAYSTACK_SECRET_KEY || '';
    const hash = createHmac('sha512', secret).update(rawBody).digest('hex');

    if (hash !== signature) {
      console.warn('Paystack webhook signature verification failed');
      return new NextResponse('Unauthorized - Invalid signature', { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    console.log(`Paystack Webhook Event Received: ${event}`);

    if (event === 'charge.success') {
      const data = payload.data;
      const trackingNumber = data.metadata?.tracking_number;
      const paymentReference = data.reference;

      if (!trackingNumber) {
        console.warn('Paystack charge.success received without tracking_number in metadata');
        return NextResponse.json({ success: false, message: 'Missing tracking number' }, { status: 400 });
      }

      await processSuccessfulPayment(trackingNumber, paymentReference);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Paystack Webhook Internal Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
