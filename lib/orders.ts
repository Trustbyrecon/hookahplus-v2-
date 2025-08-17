// lib/orders.ts
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
  // Customer profile metadata for network ecosystem
  customerName?: string;
  customerId?: string; // Unique identifier across lounges
  customerPreferences?: {
    favoriteFlavors?: string[];
    sessionDuration?: number;
    addOnPreferences?: string[];
    notes?: string;
  };
  previousSessions?: string[]; // Array of previous session IDs
};

let ORDERS: Order[] = [];

export function addOrder(o: Order) {
  ORDERS.unshift(o);
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
    console.log('Marked order as paid:', id);
  }
}

export function clearOrders() {
  console.log('Clearing orders, previous count:', ORDERS.length);
  ORDERS = [];
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
    console.log('Started session for order:', orderId);
  }
}

export function updateCoalStatus(orderId: string, status: "active" | "needs_refill" | "burnt_out") {
  const order = ORDERS.find(o => o.id === orderId);
  if (order) {
    order.coalStatus = status;
    console.log('Updated coal status for order:', orderId, 'to:', status);
  }
}

// New function to handle refill and reset status
export function handleRefill(orderId: string) {
  const order = ORDERS.find(o => o.id === orderId);
  if (order && order.coalStatus === 'needs_refill') {
    order.coalStatus = 'active';
    console.log('Refilled and reset status to active for order:', orderId);
    return true;
  }
  return false;
}

export function addFlavorToSession(orderId: string, flavor: string, addOnRate: number = 500) {
  const order = ORDERS.find(o => o.id === orderId);
  if (order && order.status === 'paid') {
    if (!order.addOnFlavors) order.addOnFlavors = [];
    order.addOnFlavors.push(flavor);
    order.addOnRate = (order.addOnRate || 0) + addOnRate;
    order.totalRevenue = (order.baseRate || order.amount) + order.addOnRate;
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

// Get customer's previous 3 sessions for flavor recommendations
export function getCustomerPreviousSessions(customerId: string, currentSessionId: string) {
  const customerOrders = ORDERS.filter(o => 
    o.customerId === customerId && 
    o.id !== currentSessionId && 
    o.status === 'paid' &&
    o.sessionStartTime
  );
  
  return customerOrders
    .sort((a, b) => (b.sessionStartTime || 0) - (a.sessionStartTime || 0))
    .slice(0, 3);
}

// Get flavor mix library (popular combinations)
export function getFlavorMixLibrary() {
  const paidOrders = ORDERS.filter(o => o.status === 'paid');
  const flavorCombinations: Record<string, number> = {};
  
  paidOrders.forEach(o => {
    if (o.flavor) {
      const baseFlavor = o.flavor;
      if (o.addOnFlavors && o.addOnFlavors.length > 0) {
        o.addOnFlavors.forEach(addOn => {
          const combination = `${baseFlavor} + ${addOn}`;
          flavorCombinations[combination] = (flavorCombinations[combination] || 0) + 1;
        });
      } else {
        flavorCombinations[baseFlavor] = (flavorCombinations[baseFlavor] || 0) + 1;
      }
    }
  });
  
  return Object.entries(flavorCombinations)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10) // Top 10 combinations
    .map(([combination, count]) => ({ combination, count }));
}
