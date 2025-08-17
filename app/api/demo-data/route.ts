// app/api/demo-data/route.ts
// Generate demo data for dashboard testing

import { NextResponse } from "next/server";
import { addOrder, markPaid, clearOrders } from "../../lib/orders";

// Simulate orders over a 2-hour period (8 PM - 10 PM)
const startTime = new Date('2025-08-16T20:00:00Z'); // 8:00 PM
const endTime = new Date('2025-08-16T22:00:00Z');   // 10:00 PM

// Realistic hookah flavors and durations
const flavors = [
  'Blue Mist + Mint',
  'Double Apple',
  'Grape + Mint', 
  'Peach + Mint',
  'Strawberry + Mint',
  'Watermelon + Mint',
  'Mango + Mint',
  'Pineapple + Mint'
];

const durations = [
  { label: '30 min', value: 3000, time: 30 },
  { label: '60 min', value: 5000, time: 60 },
  { label: '90 min', value: 7000, time: 90 }
];

const tables = ['T-001', 'T-002', 'T-003', 'T-004', 'T-005', 'T-006'];

// Generate realistic order timestamps (more orders during peak hours)
function generateOrderTimes() {
  const times: Date[] = [];
  const baseTime = startTime.getTime();
  const duration = endTime.getTime() - baseTime;
  
  // Generate 15-20 orders over 2 hours
  const numOrders = Math.floor(Math.random() * 6) + 15; // 15-20 orders
  
  for (let i = 0; i < numOrders; i++) {
    // More orders between 8:30-9:30 PM (peak time)
    let timeOffset;
    if (i < numOrders * 0.7) { // 70% of orders in peak time
      timeOffset = (duration * 0.25) + (Math.random() * duration * 0.5); // 8:30-9:30 PM
    } else {
      timeOffset = Math.random() * duration; // Spread remaining orders
    }
    
    const orderTime = new Date(baseTime + timeOffset);
    times.push(orderTime);
  }
  
  return times.sort((a, b) => a.getTime() - b.getTime()); // Sort chronologically
}

export async function POST() {
  try {
    // Clear existing orders before generating new ones
    clearOrders();
    
    // Define the order type to match lib/orders.ts
    type Order = {
      id: string;
      tableId?: string;
      flavor?: string;
      amount: number;
      currency: string;
      status: "created" | "paid" | "failed";
      createdAt: number;
    };
    
    const orderTimes = generateOrderTimes();
    const orders: Order[] = [];
    
    orderTimes.forEach((orderTime, index) => {
      const flavor = flavors[Math.floor(Math.random() * flavors.length)];
      const duration = durations[Math.floor(Math.random() * durations.length)];
      const table = tables[Math.floor(Math.random() * tables.length)];
      
      // Create order ID
      const orderId = `demo_${Math.random().toString(36).slice(2, 10)}`;
      
      // Simulate some orders being paid, some still pending
      const isPaid = Math.random() > 0.3; // 70% paid, 30% pending
      
      const order: Order = {
        id: orderId,
        tableId: table,
        flavor: flavor,
        amount: duration.value,
        currency: 'usd',
        status: isPaid ? 'paid' : 'created',
        createdAt: orderTime.getTime()
      };
      
      orders.push(order);
      
      // Add to the orders system
      addOrder(order);
      
      // If paid, mark it as paid
      if (isPaid) {
        markPaid(orderId);
      }
    });
    
    return NextResponse.json({ 
      success: true,
      message: `Generated ${orders.length} demo orders`,
      orders: orders.length,
      paid: orders.filter(o => o.status === 'paid').length,
      pending: orders.filter(o => o.status === 'created').length,
      timeRange: `${startTime.toLocaleTimeString()} - ${endTime.toLocaleTimeString()}`
    });
    
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: "POST to /api/demo-data to generate demo orders",
    timeRange: `${startTime.toLocaleTimeString()} - ${endTime.toLocaleTimeString()}`,
    flavors: flavors,
    tables: tables
  });
}
