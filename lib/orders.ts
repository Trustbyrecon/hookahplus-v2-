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
