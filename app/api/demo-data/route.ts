// app/api/demo-data/route.ts
// Generate demo data for dashboard testing

import { NextResponse } from "next/server";
import { addOrder, markPaid, clearOrders, startSession, updateCoalStatus, addFlavorToSession } from "@/lib/orders";

// Simulate orders over a 4-hour period (6 PM - 10 PM) to show historical data
const startTime = new Date();
startTime.setHours(startTime.getHours() - 2); // 2 hours ago
const endTime = new Date(); // Current time

// Realistic hookah flavors and durations
const flavors = [
  'Blue Mist + Mint',
  'Double Apple',
  'Grape + Mint', 
  'Peach + Mint',
  'Strawberry + Mint',
  'Watermelon + Mint',
  'Mango + Mint',
  'Pineapple + Mint',
  'Rose + Mint',
  'Lavender + Mint'
];

const durations = [
  { label: '30 min', value: 3000, time: 30 },
  { label: '60 min', value: 5000, time: 60 },
  { label: '90 min', value: 7000, time: 90 },
  { label: '120 min', value: 9000, time: 120 }
];

const tables = ['T-001', 'T-002', 'T-003', 'T-004', 'T-005', 'T-006', 'T-007', 'T-008'];

// Customer profiles for network ecosystem simulation
const customerProfiles = [
  {
    id: 'cust_001',
    name: 'Alex Johnson',
    preferences: {
      favoriteFlavors: ['Peach + Mint', 'Strawberry + Mint'],
      sessionDuration: 90,
      addOnPreferences: ['Mint', 'Grape'],
      notes: 'Prefers strong mint flavors, regular customer'
    }
  },
  {
    id: 'cust_002',
    name: 'Sarah Chen',
    preferences: {
      favoriteFlavors: ['Blue Mist + Mint', 'Lavender + Mint'],
      sessionDuration: 60,
      addOnPreferences: ['Rose', 'Lavender'],
      notes: 'Likes floral notes, moderate session length'
    }
  },
  {
    id: 'cust_003',
    name: 'Mike Rodriguez',
    preferences: {
      favoriteFlavors: ['Double Apple', 'Mango + Mint'],
      sessionDuration: 120,
      addOnPreferences: ['Mint', 'Pineapple'],
      notes: 'Long sessions, prefers classic flavors'
    }
  },
  {
    id: 'cust_004',
    name: 'Emily Davis',
    preferences: {
      favoriteFlavors: ['Watermelon + Mint', 'Grape + Mint'],
      sessionDuration: 60,
      addOnPreferences: ['Mint', 'Strawberry'],
      notes: 'Fruit-forward preferences, quick sessions'
    }
  },
  {
    id: 'cust_005',
    name: 'David Kim',
    preferences: {
      favoriteFlavors: ['Rose + Mint', 'Pineapple + Mint'],
      sessionDuration: 90,
      addOnPreferences: ['Mint', 'Lavender'],
      notes: 'Sophisticated palate, medium sessions'
    }
  }
];

// Generate realistic order timestamps over the past 2 hours + current
function generateOrderTimes() {
  const times: Date[] = [];
  const baseTime = startTime.getTime();
  const duration = endTime.getTime() - baseTime;
  
  // Generate 20-30 orders over the time period
  const numOrders = Math.floor(Math.random() * 11) + 20; // 20-30 orders
  
  for (let i = 0; i < numOrders; i++) {
    // More orders during peak hours (7-9 PM)
    let timeOffset;
    if (i < numOrders * 0.6) { // 60% of orders in peak time
      timeOffset = (duration * 0.2) + (Math.random() * duration * 0.6); // 7-9 PM equivalent
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
    console.log('Cleared existing orders');
    
    // Define the order type to match lib/orders.ts
    type Order = {
      id: string;
      tableId?: string;
      flavor?: string;
      amount: number;
      currency: string;
      status: "created" | "paid" | "failed";
      createdAt: number;
      sessionStartTime?: number;
      sessionDuration?: number;
      coalStatus?: "active" | "needs_refill" | "burnt_out";
      addOnFlavors?: string[];
      baseRate?: number;
      addOnRate?: number;
      totalRevenue?: number;
      // Customer profile metadata for network ecosystem
      customerName?: string;
      customerId?: string;
      customerPreferences?: {
        favoriteFlavors?: string[];
        sessionDuration?: number;
        addOnPreferences?: string[];
        notes?: string;
      };
      previousSessions?: string[];
    };
    
    const orderTimes = generateOrderTimes();
    const orders: Order[] = [];
    console.log('Generating', orderTimes.length, 'orders');
    
    orderTimes.forEach((orderTime, index) => {
      const flavor = flavors[Math.floor(Math.random() * flavors.length)];
      const duration = durations[Math.floor(Math.random() * durations.length)];
      const table = tables[Math.floor(Math.random() * tables.length)];
      
      // Create order ID
      const orderId = `demo_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      
      // Simulate some orders being paid, some still pending
      const isPaid = Math.random() > 0.2; // 80% paid, 20% pending
      
      // Base rate + potential add-ons
      const baseRate = duration.value;
      const hasAddOns = Math.random() > 0.5; // 50% chance of add-ons
      const addOnRate = hasAddOns ? Math.floor(Math.random() * 3 + 1) * 500 : 0; // 1-3 add-ons
      const totalAmount = baseRate + addOnRate;
      
      // Assign customer profile (70% chance of having a profile)
      const hasCustomerProfile = Math.random() > 0.3;
      const customerProfile = hasCustomerProfile ? customerProfiles[Math.floor(Math.random() * customerProfiles.length)] : null;
      
      const order: Order = {
        id: orderId,
        tableId: table,
        flavor: flavor,
        amount: totalAmount,
        currency: 'usd',
        status: isPaid ? 'paid' : 'created',
        createdAt: orderTime.getTime(),
        sessionDuration: duration.time,
        baseRate: baseRate,
        addOnRate: addOnRate,
        totalRevenue: totalAmount,
        // Customer profile data
        customerName: customerProfile?.name || 'Staff Customer',
        customerId: customerProfile?.id,
        customerPreferences: customerProfile?.preferences,
        previousSessions: customerProfile ? [`prev_${Math.random().toString(36).slice(2, 8)}`] : undefined
      };
      
      orders.push(order);
      
      // Add to the orders system
      addOrder(order);
      console.log(`Added order ${index + 1}:`, orderId, order.status, order.flavor, customerProfile?.name || 'Staff Customer');
      
      // If paid, mark it as paid and potentially start session
      if (isPaid) {
        markPaid(orderId);
        
        // Simulate session management for some orders
        if (Math.random() > 0.3) { // 70% of paid orders get sessions
          // Start session
          startSession(orderId);
          
          // Simulate coal status changes over time
          setTimeout(() => {
            if (Math.random() > 0.6) {
              updateCoalStatus(orderId, "needs_refill");
            }
          }, Math.random() * 30000 + 10000); // 10-40 seconds later
          
          // Simulate some orders getting burnt out
          setTimeout(() => {
            if (Math.random() > 0.7) {
              updateCoalStatus(orderId, "burnt_out");
            }
          }, Math.random() * 60000 + 30000); // 30-90 seconds later
          
          // Simulate add-on flavors for some sessions
          if (hasAddOns) {
            setTimeout(() => {
              const addOnFlavor = flavors[Math.floor(Math.random() * flavors.length)];
              addFlavorToSession(orderId, addOnFlavor, 500);
            }, Math.random() * 20000 + 15000); // 15-35 seconds later
          }
        }
      }
    });
    
    console.log('Final order count in system:', orders.length);
    
    return NextResponse.json({ 
      success: true,
      message: `Generated ${orders.length} demo orders`,
      orders: orders.length,
      paid: orders.filter(o => o.status === 'paid').length,
      pending: orders.filter(o => o.status === 'created').length,
      timeRange: `${startTime.toLocaleTimeString()} - ${endTime.toLocaleTimeString()}`,
      activeSessions: orders.filter(o => o.status === 'paid' && o.sessionStartTime).length,
      customersWithProfiles: orders.filter(o => o.customerId).length
    });
    
  } catch (error: any) {
    console.error('Error in demo-data generation:', error);
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
    tables: tables,
    customerProfiles: customerProfiles.length
  });
}
