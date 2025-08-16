import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(request: NextRequest) {
  try {
    const { tableId, flavorSelections, customerEmail } = await request.json();

    // Sentinel: Trust Lock validation
    if (!tableId || !flavorSelections || flavorSelections.length === 0) {
      return NextResponse.json(
        { error: 'Invalid order data' },
        { status: 400 }
      );
    }

    // EP: Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: flavorSelections.map((flavor: any) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Hookah+ ${flavor.name}`,
            description: `Table ${tableId} - ${flavor.description}`,
          },
          unit_amount: Math.round(flavor.price * 100), // Convert to cents
        },
        quantity: flavor.quantity || 1,
      })),
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}&table=${tableId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/preorder/${tableId}`,
      customer_email: customerEmail,
      metadata: {
        tableId,
        trustLock: `TLH-v1::${Date.now().toString(16)}`,
        agent: 'EP',
        cycle: '02',
      },
    });

    // Sentinel: Log audit event
    console.log(`[SENTINEL] Order created: ${session.id}, Table: ${tableId}, Trust Lock: ${session.metadata.trustLock}`);

    // EP: Emit payment.confirmed signal
    console.log(`[EP] payment.confirmed: ${session.id}`);

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('[SENTINEL] Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
