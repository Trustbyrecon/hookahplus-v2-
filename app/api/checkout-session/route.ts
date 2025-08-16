// app/api/checkout-session/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { signTrust } from "@/lib/trustlock";
import { addOrder } from "@/lib/orders";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { tableId = "T-001", flavor = "Blue Mist + Mint", amount = 3000 } = body;

    // Create a local order id for trust binding
    const orderId = `ord_${Math.random().toString(36).slice(2, 10)}`;
    const trustSig = signTrust(orderId);

    // Record order (demo, ephemeral)
    addOrder({
      id: orderId,
      tableId,
      flavor,
      amount,
      currency: "usd",
      status: "created",
      createdAt: Date.now(),
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/checkout?success=1&order=${orderId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/checkout?canceled=1&order=${orderId}`,
      line_items: [
        { price_data: { currency: "usd", product_data: { name: `Hookah Session — ${flavor}` }, unit_amount: amount }, quantity: 1 },
      ],
      metadata: {
        orderId,
        trustSig,
        tableId,
        flavor,
      },
    });

    return NextResponse.json({ id: session.id, orderId });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "failed" }, { status: 500 });
  }
}
