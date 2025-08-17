// app/api/orders/route.ts
import { NextResponse } from "next/server";
import { listOrders } from "@/lib/orders";

export async function GET() {
  return NextResponse.json({ orders: listOrders() });
}
