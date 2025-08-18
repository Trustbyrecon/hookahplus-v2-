// app/dashboard/page.tsx
"use client";
import { useEffect, useState } from "react";
import { getTopFlavors, getReturningCustomers } from "@/lib/orders";
import AdminNavHeader from "@/components/AdminNavHeader";

type Order = {
  id: string;
  tableId?: string;
  flavor?: string;
  amount: number;
  currency: string;
  status: "created" | "paid" | "failed";
  createdAt: number;
  // Enhanced fields for session management
  sessionStartTime?: number;
  sessionDuration?: number;
  coalStatus?: "active" | "needs_refill" | "burnt_out";
  addOnFlavors?: string[];
  baseRate?: number;
  addOnRate?: number;
  totalRevenue?: number;
};

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function fetchOrders() {
    console.log('Fetching orders...');
    setIsLoading(true);
    try {
      const res = await fetch("/api/orders", { 
        cache: "no-store",
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      const json = await res.json();
      console.log('Orders response:', json);
      setOrders(json.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function generateDemoData() {
    setIsGenerating(true);
    try {
      console.log('Generating demo data...');
      const res = await fetch('/api/demo-data', { method: 'POST' });
      const data = await res.json();
      console.log('Demo data response:', data);
      
      if (data.success) {
        setLastGenerated(`${data.orders} orders (${data.paid} paid, ${data.pending} pending) - ${data.timeRange}`);
        
        // Wait a moment for the data to be processed, then refresh
        setTimeout(async () => {
          console.log('Refreshing orders after demo generation...');
          await fetchOrders();
        }, 1000);
      }
    } catch (error) {
      console.error('Error generating demo data:', error);
    } finally {
      setIsGenerating(false);
    }
  }

  useEffect(() => {
    fetchOrders();
    const t = setInterval(fetchOrders, 5000); // poll every 5s for demo
    
    // Track dashboard view
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'Dashboard_View', {
        event_category: 'Navigation',
        event_label: 'Dashboard',
      });
    }
    
    return () => clearInterval(t);
  }, []);

  // Calculate metrics
  const totalOrders = orders.length;
  const paidOrders = orders.filter(o => o.status === 'paid').length;
  const totalRevenue = orders.filter(o => o.status === 'paid').reduce((sum, o) => sum + o.amount, 0) / 100;
  const pendingOrders = orders.filter(o => o.status === 'created').length;

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <AdminNavHeader />
      <div className="p-8">
        <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl md:text-4xl font-bold text-teal-400">Lounge Dashboard</h1>
          <div className="flex items-center gap-4">
            <a
              href="/admin"
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              ⚙️ Admin Control
            </a>
            <a
              href="/sessions"
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              🎯 Live Sessions
            </a>
            <button
              onClick={fetchOrders}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              {isLoading ? '🔄' : '🔄'} 
              {isLoading ? 'Refreshing...' : 'Refresh Data'}
            </button>
            <button
              onClick={generateDemoData}
              disabled={isGenerating}
              className="bg-teal-600 hover:bg-teal-700 disabled:bg-teal-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              {isGenerating ? '🔄' : '🎭'} 
              {isGenerating ? 'Generating...' : 'Generate Demo Data'}
            </button>
            <div className="flex items-center gap-2">
              <span className="text-green-400">🔒</span>
              <span className="text-teal-200">Trust-Lock: Active</span>
            </div>
          </div>
        </div>

        {/* Generation Status */}
        {lastGenerated && (
          <div className="bg-green-900/20 border border-green-500 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <span className="text-green-400">✅</span>
              <span className="text-green-200">Demo data generated: {lastGenerated}</span>
            </div>
          </div>
        )}

        {/* Data Status */}
        <div className="bg-zinc-800/50 border border-zinc-600 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="text-zinc-300">
              <span className="font-medium">Data Status:</span> 
              {isLoading ? ' 🔄 Refreshing...' : ` 📊 ${totalOrders} orders loaded`}
            </div>
            <div className="text-sm text-zinc-400">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-zinc-900 border border-teal-500 rounded-lg p-4">
            <div className="text-2xl font-bold text-teal-400">{totalOrders}</div>
            <div className="text-zinc-400">Total Orders</div>
          </div>
          <div className="bg-zinc-900 border border-green-500 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-400">{paidOrders}</div>
            <div className="text-zinc-400">Paid Orders</div>
          </div>
          <div className="bg-zinc-900 border border-blue-500 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-400">${totalRevenue.toFixed(2)}</div>
            <div className="text-zinc-400">Total Revenue</div>
          </div>
          <div className="bg-zinc-900 border border-yellow-500 rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-400">{pendingOrders}</div>
            <div className="text-zinc-400">Pending Orders</div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-zinc-900 border border-teal-500 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-teal-500">
            <h2 className="text-xl font-semibold text-teal-300">Live Orders & Historical Data</h2>
            <p className="text-zinc-400 text-sm">Real-time updates every 5 seconds • {totalOrders} orders • Shows last 2 hours + current</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-neutral-400 bg-zinc-800">
                <tr>
                  <th className="p-4 text-left">Order ID</th>
                  <th className="p-4 text-left">Table</th>
                  <th className="p-4 text-left">Flavor</th>
                  <th className="p-4 text-left">Duration</th>
                  <th className="p-4 text-left">Amount</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left">Coal Status</th>
                  <th className="p-4 text-left">Session</th>
                  <th className="p-4 text-left">Created</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} className="border-t border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                    <td className="p-4 font-mono text-teal-400">{o.id}</td>
                    <td className="p-4">{o.tableId || '—'}</td>
                    <td className="p-4">
                      <div>
                        <div className="text-white">{o.flavor || '—'}</div>
                        {o.addOnFlavors && o.addOnFlavors.length > 0 && (
                          <div className="text-xs text-teal-400">
                            + {o.addOnFlavors.join(', ')}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      {o.sessionDuration ? `${o.sessionDuration} min` : '—'}
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="text-white">${(o.amount / 100).toFixed(2)}</div>
                        {o.addOnRate && o.addOnRate > 0 && (
                          <div className="text-xs text-teal-400">
                            Base: ${(o.baseRate || 0) / 100} + Add-ons: ${o.addOnRate / 100}
                          </div>
                        )}
                      </div>
                    </td>
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
                    <td className="p-4">
                      {o.coalStatus ? (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          o.coalStatus === "active" 
                            ? "bg-green-900 text-green-400" 
                            : o.coalStatus === "needs_refill"
                            ? "bg-yellow-900 text-yellow-400"
                            : "bg-red-900 text-red-400"
                        }`}>
                          {o.coalStatus === "active" ? "Active" : 
                           o.coalStatus === "needs_refill" ? "Refill" : "Burnt Out"}
                        </span>
                      ) : (
                        <span className="text-zinc-500">—</span>
                      )}
                    </td>
                    <td className="p-4">
                      {o.sessionStartTime ? (
                        <div className="text-xs">
                          <div className="text-teal-400">Active</div>
                          <div className="text-zinc-400">
                            {Math.floor((Date.now() - o.sessionStartTime) / 60000)}m ago
                          </div>
                        </div>
                      ) : (
                        <span className="text-zinc-500">—</span>
                      )}
                    </td>
                    <td className="p-4 text-zinc-400">
                      {new Date(o.createdAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-zinc-500">
                      <div className="space-y-2">
                        <div className="text-4xl">🍃</div>
                        <div>No orders yet…</div>
                        <div className="text-sm">Click "Generate Demo Data" to populate the dashboard</div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Aliethia Flavor History Widget */}
        <div className="bg-zinc-900 border border-teal-500 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-teal-300 mb-4">🧠 Aliethia Memory</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-md font-medium text-teal-200 mb-3">Top 3 Mixes Today</h4>
              {(() => {
                const topFlavors = getTopFlavors();
                if (!topFlavors) {
                  return (
                    <div className="text-zinc-500 text-sm">
                      {totalOrders === 0 ? 'Generate demo data to see trends' : 'Need 3+ paid orders to show trends'}
                    </div>
                  );
                }
                return (
                  <div className="space-y-2">
                    {topFlavors.map((item, i) => (
                      <div key={item.flavor} className="flex justify-between items-center">
                        <span className="text-zinc-300">{i + 1}. {item.flavor}</span>
                        <span className="text-teal-400 font-medium">{item.count}x</span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
            <div>
              <h4 className="text-md font-medium text-teal-200 mb-3">Returning Customers</h4>
              {(() => {
                const returningCount = getReturningCustomers();
                if (!returningCount) {
                  return (
                    <div className="text-zinc-500 text-sm">
                      {totalOrders === 0 ? 'Generate demo data to see patterns' : 'Need 3+ paid orders to calculate'}
                    </div>
                  );
                }
                return (
                  <div className="text-center">
                    <div className="text-3xl font-bold text-teal-400">{returningCount}</div>
                    <div className="text-zinc-400 text-sm">unique tables</div>
                  </div>
                );
              })()}
            </div>
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
              <div className="text-green-400 text-2xl">🟢</div>
              <div className="text-sm text-zinc-400">Aliethia (Memory)</div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-zinc-800/50 rounded-lg border border-teal-500/50">
            <p className="text-sm text-zinc-400 text-center">
              💡 For detailed monitoring, analytics, and MVP controls, visit the{' '}
              <a href="/admin" className="text-teal-400 hover:text-teal-300 underline">Admin Control Center</a>
            </p>
          </div>
        </div>
        </div>
      </div>
    </main>
  );
}
