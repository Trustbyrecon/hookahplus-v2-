// lib/orders.ts
type Order = {
  id: string;
  tableId?: string;
  flavor?: string;
  amount: number;
  currency: string;
  status: "created" | "paid" | "failed";
  createdAt: number;
};

let ORDERS: Order[] = [];

export function addOrder(o: Order) {
  ORDERS.unshift(o);
  console.log('Added order:', o.id, 'Total orders now:', ORDERS.length);
}

export function listOrders() {
  console.log('Listing orders, total count:', ORDERS.length);
  return ORDERS.slice(0, 50);
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
