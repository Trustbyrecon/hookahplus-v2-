"use client";

import { useState, useEffect } from "react";
import { 
  getAllSessions, 
  getLiveSessions, 
  getSessionsByStatus, 
  seedMultipleSessions,
  seedSession 
} from "@/lib/sessionState";
import { 
  getLiveOrders, 
  getTotalRevenue, 
  getPaidOrderCount, 
  getPendingOrderCount,
  getTopFlavors,
  getFlavorMixLibrary
} from "@/lib/orders";

const AdminControlCenter = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [sessionStats, setSessionStats] = useState<Record<string, number>>({});
  const [orderStats, setOrderStats] = useState({
    total: 0,
    paid: 0,
    pending: 0,
    revenue: 0
  });
  const [topFlavors, setTopFlavors] = useState<Array<{ flavor: string; count: number }>>([]);
  const [flavorCombinations, setFlavorCombinations] = useState<Array<{ combination: string; count: number }>>([]);
  const [loading, setLoading] = useState(false);

  const refreshData = () => {
    // Get all live data
    const allSessions = getAllSessions();
    const liveSessions = getLiveSessions();
    const allOrders = getLiveOrders();
    const statusCounts = getSessionsByStatus();
    
    setSessions(allSessions);
    setOrders(allOrders);
    setSessionStats(statusCounts);
    
    // Order statistics
    setOrderStats({
      total: allOrders.length,
      paid: getPaidOrderCount(),
      pending: getPendingOrderCount(),
      revenue: getTotalRevenue()
    });
    
    // Flavor analytics
    const flavors = getTopFlavors();
    const combinations = getFlavorMixLibrary();
    
    setTopFlavors(flavors || []);
    setFlavorCombinations(combinations || []);
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleSeedMultipleSessions = () => {
    setLoading(true);
    try {
      seedMultipleSessions();
      refreshData();
    } finally {
      setLoading(false);
    }
  };

  const handleSeedSingleSession = () => {
    setLoading(true);
    try {
      seedSession(`admin_${Date.now()}`, "T-ADMIN");
      refreshData();
    } finally {
      setLoading(false);
    }
  };

  const getStateColor = (state: string) => {
    const colors: Record<string, string> = {
      NEW: "bg-zinc-800 text-zinc-300",
      PAID_CONFIRMED: "bg-teal-500/20 text-teal-300",
      PREP_IN_PROGRESS: "bg-orange-500/20 text-orange-300",
      HEAT_UP: "bg-red-500/20 text-red-300",
      READY_FOR_DELIVERY: "bg-emerald-500/20 text-emerald-300",
      OUT_FOR_DELIVERY: "bg-blue-500/20 text-blue-300",
      DELIVERED: "bg-purple-500/20 text-purple-300",
      ACTIVE: "bg-emerald-500/20 text-emerald-300",
      CLOSE_PENDING: "bg-yellow-500/20 text-yellow-300",
      CLOSED: "bg-zinc-800 text-zinc-400",
      STAFF_HOLD: "bg-yellow-500/20 text-yellow-300",
      STOCK_BLOCKED: "bg-red-500/20 text-red-300"
    };
    return colors[state] || "bg-zinc-800 text-zinc-400";
  };

  const getStateIcon = (state: string) => {
    const icons: Record<string, string> = {
      NEW: "🆕",
      PAID_CONFIRMED: "💰",
      PREP_IN_PROGRESS: "🔧",
      HEAT_UP: "🔥",
      READY_FOR_DELIVERY: "✅",
      OUT_FOR_DELIVERY: "🚚",
      DELIVERED: "🎯",
      ACTIVE: "🍃",
      CLOSE_PENDING: "⏰",
      CLOSED: "🔒",
      STAFF_HOLD: "⏸️",
      STOCK_BLOCKED: "🚫"
    };
    return icons[state] || "❓";
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <GlobalNavigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-teal-400 mb-2">Admin Control Center</h1>
          <p className="text-zinc-400">Live Session Management & Analytics Dashboard</p>
        </div>

        {/* Control Actions */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 mb-6">
          <h2 className="text-xl font-semibold text-teal-300 mb-4">Control Actions</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleSeedMultipleSessions}
              disabled={loading}
              className="bg-teal-500 text-zinc-950 px-6 py-3 rounded-xl hover:bg-teal-400 disabled:opacity-50 transition-colors"
            >
              {loading ? "Processing..." : "Seed 10 Demo Sessions"}
            </button>
            <button
              onClick={handleSeedSingleSession}
              disabled={loading}
              className="bg-emerald-500 text-zinc-950 px-6 py-3 rounded-xl hover:bg-emerald-400 disabled:opacity-50 transition-colors"
            >
              {loading ? "Processing..." : "Seed Single Session"}
            </button>
            <button
              onClick={refreshData}
              className="bg-zinc-700 text-white px-6 py-3 rounded-xl hover:bg-zinc-600 transition-colors"
            >
              Refresh Data
            </button>
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-teal-500/20 rounded-lg">
                <span className="text-2xl">🍃</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-zinc-400">Total Sessions</p>
                <p className="text-2xl font-semibold text-white">{sessions.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <span className="text-2xl">🔥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-zinc-400">Live Sessions</p>
                <p className="text-2xl font-semibold text-white">{sessions.filter(s => !["CLOSED", "REFUNDED", "VOIDED"].includes(s.state)).length}</p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <span className="text-2xl">💰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-zinc-400">Total Orders</p>
                <p className="text-2xl font-semibold text-white">{orderStats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <span className="text-2xl">💵</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-zinc-400">Revenue</p>
                <p className="text-2xl font-semibold text-white">${(orderStats.revenue / 100).toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Session Status Breakdown */}
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <h3 className="text-lg font-semibold text-teal-300 mb-4">Session Status Breakdown</h3>
            <div className="space-y-3">
              {Object.entries(sessionStats)
                .filter(([_, count]) => count > 0)
                .sort(([_, a], [__, b]) => b - a)
                .map(([state, count]) => (
                  <div key={state} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getStateIcon(state)}</span>
                      <span className="text-sm font-medium text-zinc-300">
                        {state.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300">
                      {count}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Top Flavors */}
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <h3 className="text-lg font-semibold text-teal-300 mb-4">Top Flavors</h3>
            {topFlavors.length > 0 ? (
              <div className="space-y-3">
                {topFlavors.map((item, index) => (
                  <div key={item.flavor} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">#{index + 1}</span>
                      <span className="text-sm font-medium text-zinc-300">{item.flavor}</span>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-500/20 text-teal-300">
                      {item.count}x
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-zinc-500 text-sm">No flavor data available</p>
            )}
          </div>
        </div>

        {/* Live Sessions Table */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 mb-6">
          <h3 className="text-lg font-semibold text-teal-300 mb-4">Live Sessions</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-zinc-400 bg-zinc-800">
                <tr>
                  <th className="p-3 text-left">Session ID</th>
                  <th className="p-3 text-left">Table</th>
                  <th className="p-3 text-left">State</th>
                  <th className="p-3 text-left">Customer</th>
                  <th className="p-3 text-left">Payment</th>
                  <th className="p-3 text-left">Created</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.length > 0 ? (
                  sessions.map((session) => (
                    <tr key={session.id} className="border-t border-zinc-800 hover:bg-zinc-800/50">
                      <td className="p-3 font-mono text-xs text-zinc-300">{session.id.slice(0, 12)}...</td>
                      <td className="p-3 font-medium text-white">{session.table}</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStateColor(session.state)}`}>
                          {getStateIcon(session.state)} {session.state.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-3">
                        {session.meta.customerId ? (
                          <div className="text-xs">
                            <div className="font-medium text-white">{session.meta.customerId}</div>
                            {session.flags.vip && <div className="text-yellow-400">VIP</div>}
                          </div>
                        ) : (
                          <span className="text-zinc-500">-</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          session.payment.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                        }`}>
                          {session.payment.status}
                        </span>
                      </td>
                      <td className="p-3 text-xs text-zinc-400">
                        {session.audit.length > 0 ? 
                          new Date(session.audit[0].ts).toLocaleTimeString() : 
                          'N/A'
                        }
                      </td>
                      <td className="p-3">
                        <button className="text-teal-400 hover:text-teal-300 text-xs transition-colors">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-zinc-500">
                      <div className="space-y-2">
                        <div className="text-4xl">🍃</div>
                        <div>No sessions available</div>
                        <div className="text-sm">Use the control actions above to seed demo data</div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Flavor Combinations */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <h3 className="text-lg font-semibold text-teal-300 mb-4">Popular Flavor Combinations</h3>
          {flavorCombinations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {flavorCombinations.slice(0, 9).map((item, index) => (
                <div key={item.combination} className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">#{index + 1}</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-teal-500/20 text-teal-300">
                      {item.count}x
                    </span>
                  </div>
                  <p className="text-sm text-zinc-300">{item.combination}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-500 text-sm">No flavor combination data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminControlCenter;
