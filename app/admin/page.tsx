// app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { reflexOrchestrator } from "@/lib/reflex-orchestrator";
import AdminNavHeader from "@/components/AdminNavHeader";

interface AgentScore {
  name: string;
  score: number;
  status: 'calibrating' | 'stable' | 'ready';
  lastUpdate: number;
  drift: number;
}

interface ReflexCycle {
  id: number;
  status: 'active' | 'calibrating' | 'mvp-ready' | 'locked';
  startTime: number;
  consensus: number;
  agents: Record<string, AgentScore>;
  calibrationRounds: number;
  mvpTriggered: boolean;
}

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
};

function useReflexAgent(routeName: string) {
  useEffect(() => {
    const agentId = `reflex-${routeName.toLowerCase()}`;
    const trustLevel = localStorage.getItem("trust_tier") || "Tier I";
    const sessionContext = {
      timestamp: Date.now(),
      returning: localStorage.getItem("user_visited_before") === "true",
    };

    console.log(`[ReflexAgent] ${agentId} loaded`, {
      trustLevel,
      sessionContext,
    });

    window.dispatchEvent(new CustomEvent("reflex-agent-log", {
      detail: { agentId, trustLevel, routeName, sessionContext },
    }));

    localStorage.setItem("user_visited_before", "true");
  }, [routeName]);
}

export default function AdminPage() {
  useReflexAgent("Admin");
  
  const [activeTab, setActiveTab] = useState<'overview' | 'reflex' | 'analytics' | 'mvp'>('overview');
  const [cycleStatus, setCycleStatus] = useState<ReflexCycle | null>(null);
  const [agentScores, setAgentScores] = useState<Record<string, AgentScore>>({});
  const [consensus, setConsensus] = useState(0);
  const [isMVPReady, setIsMVPReady] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);

  async function fetchReflexStatus() {
    try {
      const res = await fetch("/api/reflex-monitoring", { 
        cache: "no-store",
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      const json = await res.json();
      if (json.success) {
        setCycleStatus(json.cycle);
        setAgentScores(json.agents);
        setConsensus(json.consensus);
        setIsMVPReady(json.isMVPReady);
      }
    } catch (error) {
      console.error('Error fetching Reflex status:', error);
    }
  }

  async function fetchOrders() {
    try {
      const res = await fetch("/api/orders", { 
        cache: "no-store",
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      const json = await res.json();
      setOrders(json.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  }

  async function startCalibration() {
    try {
      const res = await fetch('/api/reflex-monitoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start_calibration' })
      });
      if (res.ok) {
        setIsCalibrating(true);
        console.log('🚀 Calibration loop started');
      }
    } catch (error) {
      console.error('Error starting calibration:', error);
    }
  }

  async function stopCalibration() {
    try {
      const res = await fetch('/api/reflex-monitoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stop_calibration' })
      });
      if (res.ok) {
        setIsCalibrating(false);
        console.log('🛑 Calibration loop stopped');
      }
    } catch (error) {
      console.error('Error stopping calibration:', error);
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'ready': return 'text-green-400';
      case 'stable': return 'text-blue-400';
      case 'calibrating': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'ready': return '✅';
      case 'stable': return '🟢';
      case 'calibrating': return '🔄';
      default: return '⚪';
    }
  }

  function getCycleStatusColor(status: string) {
    switch (status) {
      case 'mvp-ready': return 'text-green-400';
      case 'locked': return 'text-purple-400';
      case 'calibrating': return 'text-yellow-400';
      case 'active': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  }

  function formatTime(timestamp: number) {
    return new Date(timestamp).toLocaleTimeString();
  }

  useEffect(() => {
    fetchReflexStatus();
    fetchOrders();
    const interval = setInterval(() => {
      fetchReflexStatus();
      fetchOrders();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Calculate metrics
  const totalOrders = orders.length;
  const paidOrders = orders.filter(o => o.status === 'paid').length;
  const totalRevenue = orders.filter(o => o.status === 'paid').reduce((sum, o) => sum + o.amount, 0) / 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <AdminNavHeader />
      <div className="p-8">
        <h1 className="text-3xl font-bold text-purple-400 mb-6">Admin Control Center</h1>
      
      {/* Navigation Tabs */}
      <div className="flex space-x-2 mb-8">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'overview' 
              ? 'bg-purple-600 text-white' 
              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
          }`}
        >
          🏠 Overview
        </button>
        <button
          onClick={() => setActiveTab('reflex')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'reflex' 
              ? 'bg-purple-600 text-white' 
              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
          }`}
        >
          🧠 Reflex Monitoring
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'analytics' 
              ? 'bg-purple-600 text-white' 
              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
          }`}
        >
          📊 Analytics & Insights
        </button>
        <button
          onClick={() => setActiveTab('mvp')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'mvp' 
              ? 'bg-purple-600 text-white' 
              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
          }`}
        >
          🚀 MVP Control
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <p className="mb-4 text-lg">
            Manage system settings, review trust logs, and oversee lounge configurations.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-zinc-900 border border-purple-500 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-purple-300 mb-4">System Status</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-green-400">🟢</span>
                  <span>All systems operational</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-400">🔵</span>
                  <span>Trust-Lock: Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-400">🟣</span>
                  <span>Reflex Agents: Stable</span>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 border border-teal-500 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-teal-300 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="text-2xl font-bold text-teal-400">{totalOrders}</div>
                <div className="text-zinc-400">Total Orders</div>
                <div className="text-2xl font-bold text-green-400">${totalRevenue.toFixed(2)}</div>
                <div className="text-zinc-400">Total Revenue</div>
              </div>
            </div>

            <div className="bg-zinc-900 border border-blue-500 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-blue-300 mb-4">Recent Activity</h3>
              <div className="space-y-3 text-sm">
                <div className="text-zinc-400">Last updated: {new Date().toLocaleTimeString()}</div>
                <div className="text-zinc-400">Orders: {paidOrders} paid, {totalOrders - paidOrders} pending</div>
                <div className="text-zinc-400">Reflex consensus: {consensus.toFixed(2)}</div>
              </div>
            </div>
          </div>

          <div className="mt-8 border border-purple-500 p-6 rounded-xl bg-zinc-900 shadow-xl">
            <p className="text-purple-200">🌀 Reflex Agent Live — Admin Integrity Active</p>
          </div>
        </div>
      )}

      {/* Reflex Monitoring Tab */}
      {activeTab === 'reflex' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-teal-400">Reflex Agent Monitoring</h2>
              <p className="text-zinc-400 text-lg">Cycle 10 — Full MVP-Ready Run</p>
            </div>
            <div className="flex items-center gap-4">
              {!isCalibrating ? (
                <button
                  onClick={startCalibration}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg text-lg font-medium transition-colors"
                >
                  🚀 Start Calibration
                </button>
              ) : (
                <button
                  onClick={stopCalibration}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg text-lg font-medium transition-colors"
                >
                  🛑 Stop Calibration
                </button>
              )}
              <button
                onClick={fetchReflexStatus}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg text-lg font-medium transition-colors"
              >
                🔄 Refresh
              </button>
            </div>
          </div>

          {/* Cycle Status */}
          {cycleStatus && (
            <div className="bg-zinc-900 border border-teal-500 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-semibold text-teal-300">Cycle {cycleStatus.id} Status</h3>
                <div className={`text-xl font-bold ${getCycleStatusColor(cycleStatus.status)}`}>
                  {cycleStatus.status.toUpperCase()}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-teal-400">{cycleStatus.id}</div>
                  <div className="text-zinc-400 text-sm">Cycle ID</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">
                    {cycleStatus.calibrationRounds}
                  </div>
                  <div className="text-zinc-400 text-sm">Calibration Rounds</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">
                    {consensus.toFixed(2)}
                  </div>
                  <div className="text-zinc-400 text-sm">Consensus Score</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400">
                    {cycleStatus.mvpTriggered ? 'YES' : 'NO'}
                  </div>
                  <div className="text-zinc-400 text-sm">MVP Triggered</div>
                </div>
              </div>

              {cycleStatus.startTime && (
                <div className="mt-4 text-center text-zinc-400">
                  Started: {formatTime(cycleStatus.startTime)}
                </div>
              )}
            </div>
          )}

          {/* Agent Scores */}
          <div className="bg-zinc-900 border border-teal-500 rounded-xl p-6">
            <h3 className="text-2xl font-semibold text-teal-300 mb-6">Agent Performance</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.entries(agentScores).map(([key, agent]) => (
                <div key={key} className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-semibold text-white">{agent.name}</h4>
                    <span className={`text-2xl ${getStatusColor(agent.status)}`}>
                      {getStatusIcon(agent.status)}
                    </span>
                  </div>
                  
                  <div className="text-center mb-3">
                    <div className="text-3xl font-bold text-teal-400">
                      {agent.score.toFixed(2)}
                    </div>
                    <div className="text-zinc-400 text-sm">Score</div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Status:</span>
                      <span className={`font-medium ${getStatusColor(agent.status)}`}>
                        {agent.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Drift:</span>
                      <span className={`font-medium ${agent.drift >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {agent.drift >= 0 ? '+' : ''}{agent.drift.toFixed(3)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Updated:</span>
                      <span className="text-zinc-300">
                        {formatTime(agent.lastUpdate)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MVP Ready Status */}
          <div className={`bg-zinc-900 border rounded-xl p-6 ${
            isMVPReady ? 'border-green-500' : 'border-yellow-500'
          }`}>
            <div className="text-center">
              <div className="text-6xl mb-4">
                {isMVPReady ? '🎉' : '⏳'}
              </div>
              <h3 className={`text-2xl font-bold mb-2 ${
                isMVPReady ? 'text-green-400' : 'text-yellow-400'
              }`}>
                {isMVPReady ? 'MVP READY!' : 'Calibrating for MVP...'}
              </h3>
              <p className="text-zinc-400 text-lg">
                {isMVPReady 
                  ? 'Cycle 10 has achieved consensus ≥0.85 and is ready for deployment'
                  : `Target consensus: ≥0.85 (Current: ${consensus.toFixed(2)})`
                }
              </p>
              
              {isMVPReady && (
                <div className="mt-4 p-4 bg-green-900/20 border border-green-500 rounded-lg">
                  <h4 className="text-lg font-semibold text-green-300 mb-2">🚀 MVP Deployment Sequence:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="text-green-200">✅ Netlify Deploy (hookahplus.net/demo)</div>
                    <div className="text-green-200">✅ Stripe Checkout (Sandbox)</div>
                    <div className="text-green-200">✅ QR Onboarding</div>
                    <div className="text-green-200">✅ Session Assistant</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Analytics & Insights Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-blue-400">Analytics & Insights</h2>
          
          {/* Profit Margin Analysis */}
          <div className="bg-zinc-900 border border-green-500 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-300 mb-4">💰 Profit Margin Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <h4 className="text-md font-medium text-green-200 mb-3">Base Revenue</h4>
                <div className="text-2xl font-bold text-green-400">
                  ${(orders.filter(o => o.status === 'paid').reduce((sum, o) => sum + (o.baseRate || o.amount), 0) / 100).toFixed(2)}
                </div>
                <div className="text-zinc-400 text-sm">from session fees</div>
              </div>
              <div className="text-center">
                <h4 className="text-md font-medium text-blue-200 mb-3">Add-on Revenue</h4>
                <div className="text-2xl font-bold text-blue-400">
                  ${(orders.filter(o => o.status === 'paid').reduce((sum, o) => sum + (o.addOnRate || 0), 0) / 100).toFixed(2)}
                </div>
                <div className="text-zinc-400 text-sm">from flavor upgrades</div>
              </div>
              <div className="text-center">
                <h4 className="text-md font-medium text-purple-200 mb-3">Total Revenue</h4>
                <div className="text-2xl font-bold text-purple-400">
                  ${totalRevenue.toFixed(2)}
                </div>
                <div className="text-zinc-400 text-sm">combined earnings</div>
              </div>
            </div>
            
            {/* Profit Margin Insights */}
            <div className="mt-6 p-4 bg-zinc-800/50 rounded-lg">
              <h4 className="text-md font-medium text-yellow-200 mb-3">💡 Transparency Insights</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-zinc-300 mb-2">Session Management:</div>
                  <div className="text-zinc-400">
                    • Active sessions: {orders.filter(o => o.coalStatus === 'active').length}<br/>
                    • Need refill: {orders.filter(o => o.coalStatus === 'needs_refill').length}<br/>
                    • Burnt out: {orders.filter(o => o.coalStatus === 'burnt_out').length}
                  </div>
                </div>
                <div>
                  <div className="text-zinc-300 mb-2">Revenue Optimization:</div>
                  <div className="text-zinc-400">
                    • Add-on rate: {orders.filter(o => o.addOnRate && o.addOnRate > 0).length} orders<br/>
                    • Avg add-on: ${orders.filter(o => o.addOnRate && o.addOnRate > 0).length > 0 ? 
                      (orders.filter(o => o.addOnRate && o.addOnRate > 0).reduce((sum, o) => sum + (o.addOnRate || 0), 0) / 
                       orders.filter(o => o.addOnRate && o.addOnRate > 0).length / 100).toFixed(2) : '0.00'}<br/>
                    • Profit margin: {totalRevenue > 0 ? 
                      ((orders.filter(o => o.addOnRate && o.addOnRate > 0).reduce((sum, o) => sum + (o.addOnRate || 0), 0) / 100) / totalRevenue * 100).toFixed(1) : '0'}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* System Health Metrics */}
          <div className="bg-zinc-900 border border-blue-500 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-300 mb-4">System Health Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{totalOrders}</div>
                <div className="text-zinc-400 text-sm">Total Orders</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{paidOrders}</div>
                <div className="text-zinc-400 text-sm">Paid Orders</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">${totalRevenue.toFixed(2)}</div>
                <div className="text-zinc-400 text-sm">Total Revenue</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{consensus.toFixed(2)}</div>
                <div className="text-zinc-400 text-sm">Reflex Consensus</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MVP Control Tab */}
      {activeTab === 'mvp' && (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-yellow-400">MVP Control Center</h2>
          
          {/* MVP Status */}
          <div className={`bg-zinc-900 border rounded-xl p-6 ${
            isMVPReady ? 'border-green-500' : 'border-yellow-500'
          }`}>
            <div className="text-center">
              <div className="text-6xl mb-4">
                {isMVPReady ? '🎉' : '⏳'}
              </div>
              <h3 className={`text-2xl font-bold mb-2 ${
                isMVPReady ? 'text-green-400' : 'text-yellow-400'
              }`}>
                {isMVPReady ? 'MVP READY FOR DEPLOYMENT!' : 'MVP Calibration in Progress...'}
              </h3>
              <p className="text-zinc-400 text-lg">
                {isMVPReady 
                  ? 'All systems are calibrated and ready for production deployment'
                  : `Current consensus: ${consensus.toFixed(2)} (Target: ≥0.85)`
                }
              </p>
            </div>
          </div>

          {/* Deployment Controls */}
          <div className="bg-zinc-900 border border-purple-500 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-purple-300 mb-4">🚀 Deployment Controls</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-purple-200">Production Deployment</h4>
                <button className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                  🚀 Deploy to Production
                </button>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                  🔄 Rollback to Previous
                </button>
              </div>
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-purple-200">Environment Management</h4>
                <button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                  🔧 Configure Environment
                </button>
                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                  📊 View Deployment Logs
                </button>
              </div>
            </div>
          </div>

          {/* MVP Features Status */}
          <div className="bg-zinc-900 border border-teal-500 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-teal-300 mb-4">✅ MVP Features Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✅</span>
                  <span>Stripe Payment Integration</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✅</span>
                  <span>QR Code Onboarding</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✅</span>
                  <span>Session Management</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✅</span>
                  <span>Trust-Lock Security</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✅</span>
                  <span>Real-time Dashboard</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✅</span>
                  <span>Flavor Selection</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✅</span>
                  <span>Order Tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✅</span>
                  <span>Analytics & Insights</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
}
