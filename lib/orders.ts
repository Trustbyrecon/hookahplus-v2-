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
}

export function listOrders() {
  return ORDERS.slice(0, 50);
}

export function markPaid(id: string) {
  const o = ORDERS.find(x => x.id === id);
  if (o) o.status = "paid";
}

// Flavor intent capture for Aliethia
export function getTopFlavors() {
  const paidOrders = ORDERS.filter(o => o.status === 'paid');
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
  if (paidOrders.length < 3) return null;
  
  // Simple calculation: count unique table IDs
  const uniqueTables = new Set(paidOrders.map(o => o.tableId).filter(Boolean));
  return uniqueTables.size;
}
