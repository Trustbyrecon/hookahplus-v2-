// app/api/orders/route.ts
import { NextResponse } from "next/server";
import { listOrders } from "@/lib/orders";

export async function GET() {
  const orders = listOrders();
  console.log('Orders API called, returning', orders.length, 'orders');
  console.log('Sample orders:', orders.slice(0, 3));
  return NextResponse.json({ orders });
}
