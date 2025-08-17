// lib/orders.ts
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

type Order = {
  id: string;
  tableId?: string;
  flavor?: string;
  amount: number;
  currency: string;
  status: "created" | "paid" | "failed";
  createdAt: number;
  // New fields for enhanced tracking
  sessionStartTime?: number;
  sessionDuration?: number; // in minutes
  coalStatus?: "active" | "needs_refill" | "burnt_out";
  addOnFlavors?: string[];
  baseRate?: number;
  addOnRate?: number;
  totalRevenue?: number;
};

const ORDERS_FILE = join(process.cwd(), 'data', 'orders.json');

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = join(process.cwd(), 'data');
  if (!existsSync(dataDir)) {
    try {
      require('fs').mkdirSync(dataDir, { recursive: true });
    } catch (error) {
      console.log('Data directory creation failed:', error);
    }
  }
}

// Load orders from file
function loadOrders(): Order[] {
  try {
    ensureDataDir();
    if (existsSync(ORDERS_FILE)) {
      const data = readFileSync(ORDERS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading orders:', error);
  }
  return [];
}

// Save orders to file
function saveOrders(orders: Order[]) {
  try {
    ensureDataDir();
    writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
  } catch (error) {
    console.error('Error saving orders:', error);
  }
}

let ORDERS: Order[] = loadOrders();

export function addOrder(o: Order) {
  ORDERS.unshift(o);
  saveOrders(ORDERS);
  console.log('Added order:', o.id, 'Total orders now:', ORDERS.length);
}

export function listOrders() {
  console.log('Listing orders, total count:', ORDERS.length);
  return ORDERS.slice(0, 100); // Increased limit for historical data
}

export function markPaid(id: string) {
  const o = ORDERS.find(x => x.id === id);
  if (o) {
    o.status = "paid";
    saveOrders(ORDERS);
    console.log('Marked order as paid:', id);
  }
}

export function clearOrders() {
  console.log('Clearing orders, previous count:', ORDERS.length);
  ORDERS = [];
  saveOrders(ORDERS);
}

export function getOrderCount() {
  return ORDERS.length;
}

export function getPaidOrderCount() {
  return ORDERS.filter(o => o.status === 'paid').length;
}

export function getPendingOrderCount() {
  return ORDERS.filter(o => o.status === 'created').length;
}

export function getTotalRevenue() {
  return ORDERS.filter(o => o.status === 'paid').reduce((sum, o) => sum + o.amount, 0);
}

// Enhanced session management
export function startSession(orderId: string) {
  const order = ORDERS.find(o => o.id === orderId);
  if (order && order.status === 'paid') {
    order.sessionStartTime = Date.now();
    order.coalStatus = "active";
    saveOrders(ORDERS);
    console.log('Started session for order:', orderId);
  }
}

export function updateCoalStatus(orderId: string, status: "active" | "needs_refill" | "burnt_out") {
  const order = ORDERS.find(o => o.id === orderId);
  if (order) {
    order.coalStatus = status;
    saveOrders(ORDERS);
    console.log('Updated coal status for order:', orderId, 'to:', status);
  }
}

export function addFlavorToSession(orderId: string, flavor: string, addOnRate: number = 500) {
  const order = ORDERS.find(o => o.id === orderId);
  if (order && order.status === 'paid') {
    if (!order.addOnFlavors) order.addOnFlavors = [];
    order.addOnFlavors.push(flavor);
    order.addOnRate = (order.addOnRate || 0) + addOnRate;
    order.totalRevenue = (order.baseRate || order.amount) + order.addOnRate;
    saveOrders(ORDERS);
    console.log('Added flavor to session:', orderId, flavor);
  }
}

// Get orders for specific time range (last 2 hours + current)
export function getRecentOrders(hoursBack: number = 2) {
  const cutoffTime = Date.now() - (hoursBack * 60 * 60 * 1000);
  return ORDERS.filter(o => o.createdAt >= cutoffTime);
}

// Get active sessions
export function getActiveSessions() {
  return ORDERS.filter(o => 
    o.status === 'paid' && 
    o.sessionStartTime && 
    o.coalStatus !== 'burnt_out'
  );
}

// Flavor intent capture for Aliethia
export function getTopFlavors() {
  const paidOrders = ORDERS.filter(o => o.status === 'paid');
  console.log('Getting top flavors from', paidOrders.length, 'paid orders');
  if (paidOrders.length < 3) return null; // Need at least 3 paid orders
  
  const flavorCounts: Record<string, number> = {};
  paidOrders.forEach(o => {
    if (o.flavor) {
      flavorCounts[o.flavor] = (flavorCounts[o.flavor] || 0) + 1;
    }
    // Include add-on flavors
    if (o.addOnFlavors) {
      o.addOnFlavors.forEach(addOn => {
        flavorCounts[addOn] = (flavorCounts[addOn] || 0) + 1;
      });
    }
  });
  
  return Object.entries(flavorCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([flavor, count]) => ({ flavor, count }));
}

export function getReturningCustomers() {
  const paidOrders = ORDERS.filter(o => o.status === 'paid');
  console.log('Getting returning customers from', paidOrders.length, 'paid orders');
  if (paidOrders.length < 3) return null;
  
  // Simple calculation: count unique table IDs
  const uniqueTables = new Set(paidOrders.map(o => o.tableId).filter(Boolean));
  return uniqueTables.size;
}
