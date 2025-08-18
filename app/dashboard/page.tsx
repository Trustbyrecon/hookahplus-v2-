// app/dashboard/page.tsx
"use client";
import { useEffect, useState } from "react";
import { getTopFlavors, getReturningCustomers, listOrders, getTotalRevenue, getPaidOrderCount, getPendingOrderCount } from "@/lib/orders";
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
  // Customer profile metadata
  customerName?: string;
  customerId?: string;
  customerPreferences?: {
    favoriteFlavors?: string[];
    sessionDuration?: number;
    addOnPreferences?: string[];
    notes?: string;
  };
  previousSessions?: string[];
  // Table mapping data
  tableType?: "high_boy" | "table" | "2x_booth" | "4x_booth" | "8x_sectional" | "4x_sofa";
  tablePosition?: { x: number; y: number };
  refillTimerStart?: number;
};

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [aliethiaInsights, setAliethiaInsights] = useState<{
    topFlavors: Array<{ flavor: string; count: number }>;
    returningCustomers: Array<{ customerId: string; customerName: string; visitCount: number; lastVisit: number }>;
    promotionalOffers: Array<{ customerId: string; customerName: string; offer: string; qrCode: string }>;
  }>({ topFlavors: [], returningCustomers: [], promotionalOffers: [] });

  async function fetchOrders() {
    console.log('Fetching orders...');
    setIsLoading(true);
    try {
      // Use the local orders from lib/orders.ts instead of API call
      const localOrders = listOrders();
      console.log('Local orders:', localOrders);
      setOrders(localOrders);
      
      // Generate Aliethia insights
      generateAliethiaInsights(localOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  }

  function generateAliethiaInsights(orders: Order[]) {
    // Generate top flavors
    const flavorCounts: Record<string, number> = {};
    orders.forEach(order => {
      if (order.flavor && order.status === 'paid') {
        flavorCounts[order.flavor] = (flavorCounts[order.flavor] || 0) + 1;
      }
    });
    
    const topFlavors = Object.entries(flavorCounts)
      .map(([flavor, count]) => ({ flavor, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    // Generate returning customer insights
    const customerVisits: Record<string, { name: string; visits: number; lastVisit: number }> = {};
    orders.forEach(order => {
      if (order.customerId && order.status === 'paid') {
        if (!customerVisits[order.customerId]) {
          customerVisits[order.customerId] = {
            name: order.customerName || 'Unknown Customer',
            visits: 0,
            lastVisit: 0
          };
        }
        customerVisits[order.customerId].visits++;
        customerVisits[order.customerId].lastVisit = Math.max(customerVisits[order.customerId].lastVisit, order.createdAt);
      }
    });

    const returningCustomers = Object.entries(customerVisits)
      .filter(([_, data]) => data.visits >= 2)
      .map(([customerId, data]) => ({
        customerId,
        customerName: data.name,
        visitCount: data.visits,
        lastVisit: data.lastVisit
      }))
      .sort((a, b) => b.visitCount - a.visitCount);

    // Generate promotional offers for returning customers
    const promotionalOffers = returningCustomers
      .filter(customer => customer.visitCount >= 3)
      .map(customer => {
        const offers = [
          "Free hookah flavor mix on next session! 🎁",
          "50% off premium tobacco upgrade 🚀",
          "Complimentary fruit bowl with any order 🍎",
          "VIP seating priority for next visit ⭐",
          "Free session extension (30 min) ⏰"
        ];
        const randomOffer = offers[Math.floor(Math.random() * offers.length)];
        const qrCode = `QR_${customer.customerId}_${Date.now()}`;
        
        return {
          customerId: customer.customerId,
          customerName: customer.customerName,
          offer: randomOffer,
          qrCode
        };
      });

    setAliethiaInsights({
      topFlavors,
      returningCustomers,
      promotionalOffers
    });
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

  // Calculate metrics using local functions
  const totalOrders = orders.length;
  const paidOrders = getPaidOrderCount();
  const totalRevenue = getTotalRevenue() / 100; // Convert cents to dollars
  const pendingOrders = getPendingOrderCount();

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Format duration
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  // Get status color and icon
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'paid':
        return { color: 'text-green-400', icon: '✅', label: 'Paid' };
      case 'created':
        return { color: 'text-yellow-400', icon: '⏳', label: 'Pending' };
      case 'failed':
        return { color: 'text-red-400', icon: '❌', label: 'Failed' };
      default:
        return { color: 'text-gray-400', icon: '❓', label: 'Unknown' };
    }
  };

  // Get coal status display
  const getCoalStatusDisplay = (status?: string) => {
    switch (status) {
      case 'active':
        return { color: 'text-green-400', icon: '🔥', label: 'Active' };
      case 'needs_refill':
        return { color: 'text-yellow-400', icon: '⚠️', label: 'Needs Refill' };
      case 'burnt_out':
        return { color: 'text-red-400', icon: '💀', label: 'Burnt Out' };
      default:
        return { color: 'text-gray-400', icon: '❓', label: 'N/A' };
    }
  };

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
            <div className="text-2xl font-bold text-blue-400">{formatCurrency(totalRevenue)}</div>
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
                  <th className="p-4 text-left">Customer</th>
                  <th className="p-4 text-left">Created</th>
                </tr>
              </thead>
              <tbody>
                {orders.length > 0 ? (
                  orders.map((order) => {
                    const statusDisplay = getStatusDisplay(order.status);
                    const coalDisplay = getCoalStatusDisplay(order.coalStatus);
                    
                    return (
                      <tr key={order.id} className="border-t border-zinc-800 hover:bg-zinc-800/50">
                        <td className="p-4 font-mono text-xs">{order.id.slice(0, 8)}...</td>
                        <td className="p-4">{order.tableId || 'N/A'}</td>
                        <td className="p-4">{order.flavor || 'N/A'}</td>
                        <td className="p-4">{order.sessionDuration ? formatDuration(order.sessionDuration) : 'N/A'}</td>
                        <td className="p-4 font-medium">{formatCurrency(order.amount / 100)}</td>
                        <td className="p-4">
                          <span className={`${statusDisplay.color} flex items-center gap-1`}>
                            <span>{statusDisplay.icon}</span>
                            <span>{statusDisplay.label}</span>
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`${coalDisplay.color} flex items-center gap-1`}>
                            <span>{coalDisplay.icon}</span>
                            <span>{coalDisplay.label}</span>
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="text-xs">
                            <div className="font-medium">{order.customerName || 'Staff Customer'}</div>
                            {order.customerId && (
                              <div className="text-zinc-500">ID: {order.customerId.slice(0, 6)}...</div>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-xs text-zinc-400">
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </td>
                      </tr>
                    );
                  })
                ) : (
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

        {/* Enhanced Aliethia Memory Widget */}
        <div className="bg-zinc-900 border border-teal-500 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-teal-300 mb-4">🧠 Aliethia Memory - AI-Powered Insights</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <h4 className="text-md font-medium text-teal-200 mb-3">🔥 Top 3 Mixes Today</h4>
              {aliethiaInsights.topFlavors.length > 0 ? (
                <div className="space-y-2">
                  {aliethiaInsights.topFlavors.map((item, i) => (
                    <div key={item.flavor} className="flex justify-between items-center p-2 bg-zinc-800/50 rounded">
                      <span className="text-zinc-300">{i + 1}. {item.flavor}</span>
                      <span className="text-teal-400 font-medium">{item.count}x</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-zinc-500 text-sm">
                  {totalOrders === 0 ? 'Generate demo data to see trends' : 'Need 3+ paid orders to show trends'}
                </div>
              )}
            </div>
            
            <div>
              <h4 className="text-md font-medium text-teal-200 mb-3">👥 Returning Customers</h4>
              {aliethiaInsights.returningCustomers.length > 0 ? (
                <div className="space-y-2">
                  {aliethiaInsights.returningCustomers.slice(0, 3).map((customer) => (
                    <div key={customer.customerId} className="p-2 bg-zinc-800/50 rounded">
                      <div className="text-zinc-300 font-medium">{customer.customerName}</div>
                      <div className="text-teal-400 text-sm">{customer.visitCount} visits</div>
                      <div className="text-zinc-500 text-xs">
                        Last: {new Date(customer.lastVisit).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-zinc-500 text-sm">
                  {totalOrders === 0 ? 'Generate demo data to see patterns' : 'Need 3+ paid orders to calculate'}
                </div>
              )}
            </div>

            <div>
              <h4 className="text-md font-medium text-teal-200 mb-3">🎁 Promotional Offers</h4>
              {aliethiaInsights.promotionalOffers.length > 0 ? (
                <div className="space-y-2">
                  {aliethiaInsights.promotionalOffers.slice(0, 2).map((offer) => (
                    <div key={offer.customerId} className="p-3 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/50 rounded">
                      <div className="text-zinc-300 font-medium text-sm">{offer.customerName}</div>
                      <div className="text-purple-300 text-xs mb-2">{offer.offer}</div>
                      <div className="text-center">
                        <div className="text-xs text-zinc-500 mb-1">QR Code:</div>
                        <div className="font-mono text-xs bg-black p-2 rounded border border-purple-500/50">
                          {offer.qrCode}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-zinc-500 text-sm">
                  {totalOrders === 0 ? 'Generate demo data to see offers' : 'Need 3+ visits to unlock offers'}
                </div>
              )}
            </div>
          </div>
          
          {/* Aliethia Memory Status */}
          <div className="mt-4 p-3 bg-zinc-800/50 rounded-lg border border-teal-500/50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-zinc-400">
                <span className="text-teal-400">🧠 Aliethia Status:</span> 
                {aliethiaInsights.topFlavors.length > 0 ? ' Active - Learning customer preferences' : ' Dormant - Waiting for data'}
              </div>
              <div className="text-xs text-zinc-500">
                {aliethiaInsights.promotionalOffers.length > 0 && (
                  <span className="text-purple-400">✨ {aliethiaInsights.promotionalOffers.length} active offers</span>
                )}
              </div>
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
              <div className={`text-2xl ${aliethiaInsights.topFlavors.length > 0 ? 'text-green-400' : 'text-amber-400'}`}>
                {aliethiaInsights.topFlavors.length > 0 ? '🟢' : '🟡'}
              </div>
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
