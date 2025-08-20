// app/api/checkout-session/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { signTrust } from "../../../lib/trustlock";
import { addOrder } from "../../../lib/orders";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function POST(req: Request) {
  try {
    // Rate limiting (MVP-light)
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const rateLimitKey = `rate_limit:${clientIP}`;
    
    // Simple in-memory rate limiting (deny if >3 creates from same IP in 30s)
    const now = Date.now();
    const recentRequests = (global as any).rateLimitRequests || new Map();
    
    if (!recentRequests.has(clientIP)) {
      recentRequests.set(clientIP, []);
    }
    
    const userRequests = recentRequests.get(clientIP);
    const validRequests = userRequests.filter((timestamp: number) => now - timestamp < 30000);
    
    if (validRequests.length >= 3) {
      return NextResponse.json({ error: "Rate limit exceeded. Please wait before creating another order." }, { status: 429 });
    }
    
    validRequests.push(now);
    recentRequests.set(clientIP, validRequests);
    (global as any).rateLimitRequests = recentRequests;

    const body = await req.json().catch(() => ({}));
    const { tableId = "T-001", flavor = "Blue Mist + Mint", addons = 0 } = body;

    // Create a local order id for trust binding
    const orderId = `ord_${Math.random().toString(36).slice(2, 10)}`;
    const trustSig = signTrust(orderId);

    // Record order (demo, ephemeral)
    addOrder({
      id: orderId,
      tableId,
      flavor,
      amount: 3000 + (addons * 150), // $30 base + $1.50 per addon
      currency: "usd",
      status: "created",
      createdAt: Date.now(),
    });
    
    // Audit log (MVP)
    console.log(`audit.order.created: ${new Date().toISOString()} | orderId: ${orderId} | tableId: ${tableId} | trustSig: ${trustSig} | addons: ${addons}`);

    // Build line items using the new product structure
    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      { 
        price: process.env.PRICE_SESSION_30!, 
        quantity: 1 
      }
    ];
    
    // Add flavor add-ons if requested
    if (addons > 0) {
      line_items.push({ 
        price: process.env.PRICE_FLAVOR_150!, 
        quantity: addons 
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?sid={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cancel`,
      line_items,
      metadata: {
        orderId,
        trustSig,
        tableId,
        flavor,
        addons: addons.toString(),
      },
    });

    return NextResponse.json({ url: session.url, orderId });
  } catch (e: any) {
    console.error('Checkout session creation error:', e);
    return NextResponse.json({ error: e.message ?? "Failed to create checkout session" }, { status: 500 });
  }
}
