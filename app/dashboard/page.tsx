// app/dashboard/page.tsx
"use client";
import { useEffect, useState } from "react";

type Order = {
  id: string;
  tableId?: string;
  flavor?: string;
  amount: number;
  currency: string;
  status: "created" | "paid" | "failed";
  createdAt: number;
};

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);

  async function fetchOrders() {
    const res = await fetch("/api/orders", { cache: "no-store" });
    const json = await res.json();
    setOrders(json.orders || []);
  }

  useEffect(() => {
    fetchOrders();
    const t = setInterval(fetchOrders, 5000); // poll every 5s for demo
    return () => clearInterval(t);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl md:text-4xl font-bold text-teal-400">Lounge Dashboard</h1>
          <div className="flex items-center gap-2">
            <span className="text-green-400">🔒</span>
            <span className="text-teal-200">Trust-Lock: Active</span>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-zinc-900 border border-teal-500 rounded-lg p-4">
            <div className="text-2xl font-bold text-teal-400">{orders.length}</div>
            <div className="text-zinc-400">Total Orders</div>
          </div>
          <div className="bg-zinc-900 border border-teal-500 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-400">
              {orders.filter(o => o.status === 'paid').length}
            </div>
            <div className="text-zinc-400">Paid Orders</div>
          </div>
          <div className="bg-zinc-900 border border-teal-500 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-400">
              ${(orders.filter(o => o.status === 'paid').reduce((sum, o) => sum + o.amount, 0) / 100).toFixed(2)}
            </div>
            <div className="text-zinc-400">Total Revenue</div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-zinc-900 border border-teal-500 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-teal-500">
            <h2 className="text-xl font-semibold text-teal-300">Live Orders</h2>
            <p className="text-zinc-400 text-sm">Real-time updates every 5 seconds</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-neutral-400 bg-zinc-800">
                <tr>
                  <th className="p-4 text-left">Order ID</th>
                  <th className="p-4 text-left">Table</th>
                  <th className="p-4 text-left">Flavor</th>
                  <th className="p-4 text-left">Amount</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left">Created</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} className="border-t border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                    <td className="p-4 font-mono text-teal-400">{o.id}</td>
                    <td className="p-4">{o.tableId || '—'}</td>
                    <td className="p-4">{o.flavor || '—'}</td>
                    <td className="p-4">${(o.amount / 100).toFixed(2)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        o.status === "paid" 
                          ? "bg-green-900 text-green-400" 
                          : o.status === "created"
                          ? "bg-blue-900 text-blue-400"
                          : "bg-red-900 text-red-400"
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="p-4 text-zinc-400">
                      {new Date(o.createdAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-zinc-500">
                      <div className="space-y-2">
                        <div className="text-4xl">🍃</div>
                        <div>No orders yet…</div>
                        <div className="text-sm">Orders will appear here as customers place them</div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reflex Agent Status */}
        <div className="bg-zinc-900 border border-teal-500 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-teal-300 mb-4">Reflex Agent Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-green-400 text-2xl">🟢</div>
              <div className="text-sm text-zinc-400">EP (Payments)</div>
            </div>
            <div className="text-center">
              <div className="text-green-400 text-2xl">🟢</div>
              <div className="text-sm text-zinc-400">Navigator (UX)</div>
            </div>
            <div className="text-center">
              <div className="text-green-400 text-2xl">🟢</div>
              <div className="text-sm text-zinc-400">Sentinel (Trust)</div>
            </div>
            <div className="text-center">
              <div className="text-blue-400 text-2xl">🔵</div>
              <div className="text-sm text-zinc-400">Aliethia (Memory)</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
