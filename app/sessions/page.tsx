"use client";
import { useEffect, useState } from "react";
import CustomerProfileManager from "../../components/CustomerProfileManager";
import LoungeLayout from "../../components/LoungeLayout";
import ConnectorPartnershipManager from "../../components/ConnectorPartnershipManager";
import HookahRoomDashboard from "../../components/HookahRoomDashboard";
import GlobalNavigation from "../../components/GlobalNavigation";

type Session = {
  id: string;
  tableId?: string;
  flavor?: string;
  amount: number;
  status: string;
  createdAt: number;
  sessionStartTime?: number;
  sessionDuration?: number;
  coalStatus?: "active" | "needs_refill" | "burnt_out";
  addOnFlavors?: string[];
  baseRate?: number;
  addOnRate?: number;
  totalRevenue?: number;
  customerName?: string;
  customerId?: string;
  customerPreferences?: {
    favoriteFlavors?: string[];
    sessionDuration?: number;
    addOnPreferences?: string[];
    notes?: string;
  };
  previousSessions?: string[];
  tableType?: "high_boy" | "table" | "2x_booth" | "4x_booth" | "8x_sectional" | "4x_sofa";
  tablePosition?: { x: number; y: number };
  refillTimerStart?: number;
  sessionPauseTime?: number;
  totalPausedTime?: number;
  // Delivery workflow fields
  deliveryStatus?: "preparing" | "ready" | "delivered";
  deliveryStartTime?: number;
  actualDeliveryTime?: number;
  hookahRoomStaff?: string;
  deliveryConfirmedBy?: string;
  deliveryConfirmedAt?: number;
};

export default function SessionsDashboard() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refillTimers, setRefillTimers] = useState<Record<string, number>>({});

  // Function to add table positions to sessions
  function addTablePositions(sessions: Session[]): Session[] {
    const tablePositions = [
      { x: 50, y: 100 },   // T-1
      { x: 150, y: 100 },  // T-2
      { x: 250, y: 100 },  // T-3
      { x: 350, y: 100 },  // T-4
      { x: 450, y: 100 },  // T-5
      { x: 550, y: 100 },  // T-6
      { x: 50, y: 200 },   // T-7
      { x: 150, y: 200 },  // T-8
      { x: 250, y: 200 },  // T-9
      { x: 350, y: 200 },  // T-10
      { x: 450, y: 200 },  // T-11
      { x: 550, y: 200 },  // T-12
      { x: 50, y: 300 },   // Bar-1
      { x: 150, y: 300 },  // Bar-2
      { x: 250, y: 300 },  // Bar-3
      { x: 350, y: 300 },  // Bar-4
      { x: 450, y: 300 },  // Bar-5
      { x: 550, y: 300 },  // Bar-6
    ];

    return sessions.map((session, index) => ({
      ...session,
      tablePosition: tablePositions[index % tablePositions.length],
      tableType: session.tableType || (session.tableId?.startsWith('Bar') ? 'high_boy' : 'table'),
      coalStatus: session.coalStatus || 'active'
    }));
  }

  // Function to generate demo sessions with table positions
  function generateDemoSessions(): Session[] {
    const demoSessions: Session[] = [
      {
        id: 'demo-1',
        tableId: 'T-7',
        flavor: 'Blue Mist',
        amount: 3200,
        status: 'active',
        createdAt: Date.now(),
        sessionStartTime: Date.now() - 1800000, // 30 minutes ago
        sessionDuration: 1800000,
        coalStatus: 'active',
        customerName: 'Demo Customer 1',
        tableType: 'table',
        tablePosition: { x: 50, y: 200 },
        deliveryStatus: 'delivered',
        deliveryStartTime: Date.now() - 2000000, // 33 minutes ago
        actualDeliveryTime: Date.now() - 1980000, // 33 minutes ago
        hookahRoomStaff: 'John D.',
        deliveryConfirmedBy: 'Sarah M.',
        deliveryConfirmedAt: Date.now() - 1980000
      },
      {
        id: 'demo-2',
        tableId: 'Bar-3',
        flavor: 'Mint Storm',
        amount: 4500,
        status: 'active',
        createdAt: Date.now() - 900000, // 15 minutes ago
        sessionStartTime: Date.now() - 900000,
        sessionDuration: 900000,
        coalStatus: 'needs_refill',
        customerName: 'Demo Customer 2',
        tableType: 'high_boy',
        tablePosition: { x: 250, y: 300 },
        deliveryStatus: 'ready',
        deliveryStartTime: Date.now() - 1200000, // 20 minutes ago
        hookahRoomStaff: 'Mike R.'
      },
      {
        id: 'demo-3',
        tableId: 'T-12',
        flavor: 'Double Apple',
        amount: 2800,
        status: 'active',
        createdAt: Date.now() - 3600000, // 1 hour ago
        sessionStartTime: Date.now() - 3600000,
        sessionDuration: 3600000,
        coalStatus: 'burnt_out',
        customerName: 'Demo Customer 3',
        tableType: 'table',
        tablePosition: { x: 550, y: 200 },
        deliveryStatus: 'preparing',
        deliveryStartTime: Date.now() - 3500000, // 58 minutes ago
        hookahRoomStaff: 'Lisa K.'
      }
    ];

    return demoSessions;
  }

  async function fetchSessions() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/sessions", { 
        cache: "no-store",
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      const json = await res.json();
      if (json.success) {
        const sessionsWithPositions = addTablePositions(json.sessions || []);
        setSessions(sessionsWithPositions);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      // Fallback to demo data with positions
      const demoSessions = generateDemoSessions();
      setSessions(demoSessions);
    } finally {
      setIsLoading(false);
    }
  }

  // Update refill timers every second
  useEffect(() => {
    const interval = setInterval(() => {
      const timers: Record<string, number> = {};
      sessions.forEach(session => {
        if (session.coalStatus === 'needs_refill' && session.refillTimerStart) {
          const elapsed = Date.now() - session.refillTimerStart;
          const remaining = 10000 - elapsed; // 10 seconds total
          timers[session.id] = Math.max(0, Math.ceil(remaining / 1000));
        }
      });
      setRefillTimers(timers);
    }, 1000);

    return () => clearInterval(interval);
  }, [sessions]);

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Function to get table type display name
  function getTableTypeDisplay(tableType?: string) {
    switch (tableType) {
      case 'high_boy': return 'High Boy';
      case 'table': return 'Table';
      case '2x_booth': return '2x Booth';
      case '4x_booth': return '4x Booth';
      case '8x_sectional': return '8x Sectional';
      case '4x_sofa': return '4x Sofa';
      default: return 'Table';
    }
  }

  // Function to get table type color
  function getTableTypeColor(tableType?: string) {
    switch (tableType) {
      case 'high_boy': return 'text-blue-400';
      case 'table': return 'text-green-400';
      case '2x_booth': return 'text-yellow-400';
      case '4x_booth': return 'text-orange-400';
      case '8x_sectional': return 'text-purple-400';
      case '4x_sofa': return 'text-pink-400';
      default: return 'text-gray-400';
    }
  }

  // Function to get coal status color
  function getCoalStatusColor(status?: string) {
    switch (status) {
      case 'active': return 'bg-green-600 text-white';
      case 'needs_refill': return 'bg-yellow-600 text-white';
      case 'burnt_out': return 'bg-red-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  }

  // Function to get coal status text
  function getCoalStatusText(status: string) {
    switch (status) {
      case 'active': return 'ACTIVE';
      case 'needs_refill': return 'NEEDS REFILL';
      case 'burnt_out': return 'BURNT OUT';
      default: return 'UNKNOWN';
    }
  }

  // Function to get session timer
  function getSessionTimer(startTime: number, duration: number, coalStatus?: string, refillStart?: number, totalPaused?: number) {
    if (coalStatus === 'burnt_out') {
      return 'PAUSED';
    }
    
    const now = Date.now();
    const elapsed = now - startTime;
    const adjustedElapsed = totalPaused ? elapsed - totalPaused : elapsed;
    
    const hours = Math.floor(adjustedElapsed / 3600000);
    const minutes = Math.floor((adjustedElapsed % 3600000) / 60000);
    const seconds = Math.floor((adjustedElapsed % 60000) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  // Function to handle coal actions (refill, resume, etc.)
  async function handleCoalAction(sessionId: string, currentStatus?: string) {
    try {
      let newStatus: "active" | "needs_refill" | "burnt_out";
      
      if (currentStatus === 'needs_refill') {
        newStatus = 'active'; // Complete refill
      } else if (currentStatus === 'burnt_out') {
        newStatus = 'active'; // Resume session
      } else {
        newStatus = 'needs_refill'; // Request refill
      }

      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_coal_status',
          sessionId,
          data: { status: newStatus }
        })
      });

      if (res.ok) {
        await fetchSessions(); // Refresh data
      }
    } catch (error) {
      console.error('Error updating coal status:', error);
    }
  }

  // Function to end session
  async function endSession(sessionId: string) {
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'end_session',
          sessionId
        })
      });

      if (res.ok) {
        await fetchSessions(); // Refresh data
      }
    } catch (error) {
      console.error('Error ending session:', error);
    }
  }

  // Function to confirm delivery
  async function confirmDelivery(sessionId: string) {
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'confirm_delivery',
          sessionId,
          data: { 
            confirmedBy: 'Staff Member',
            confirmedAt: Date.now()
          }
        })
      });

      if (res.ok) {
        await fetchSessions(); // Refresh data
      }
    } catch (error) {
      console.error('Error confirming delivery:', error);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <GlobalNavigation />
      <div className="p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-4xl">🌿</div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-teal-400">HOOKAH+</h1>
                <h2 className="text-xl text-zinc-300">SESSION TRACKER</h2>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={fetchSessions}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {isLoading ? '🔄' : '🔄'} Refresh
              </button>
              <div className="text-sm text-zinc-400">
                {sessions.length} Active Sessions
              </div>
              <div className="text-sm text-purple-400 font-medium">
                🌐 {sessions.filter(s => s.customerId).length} Network Customers
              </div>
            </div>
          </div>

          {/* Session Summary */}
          {sessions.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-teal-300 mb-4">Session Summary & MOAT Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {sessions.filter(s => s.coalStatus === 'active').length}
                  </div>
                  <div className="text-zinc-400 text-sm">Active</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">
                    {sessions.filter(s => s.coalStatus === 'needs_refill').length}
                  </div>
                  <div className="text-zinc-400 text-sm">Need Refill</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">
                    {sessions.filter(s => s.coalStatus === 'burnt_out').length}
                  </div>
                  <div className="text-zinc-400 text-sm">Paused (Burnt Out)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    ${(sessions.reduce((sum, s) => sum + (s.totalRevenue || s.amount), 0) / 100).toFixed(2)}
                  </div>
                  <div className="text-zinc-400 text-sm">Total Revenue</div>
                </div>
              </div>
            </div>
          )}

          {/* Sessions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session) => (
              <div 
                key={session.id} 
                id={`session-${session.id}`}
                className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 space-y-4 transition-all duration-200"
              >
                {/* Table Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {session.tableId || 'Unknown Table'}
                    </h3>
                    <div className={`text-sm font-medium ${getTableTypeColor(session.tableType)}`}>
                      {getTableTypeDisplay(session.tableType)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-zinc-400">
                      #{session.id.slice(-6)}
                    </div>
                    <div className="text-xs text-teal-400 font-medium">
                      {session.customerName || 'Staff Customer'}
                    </div>
                  </div>
                </div>

                {/* Timer */}
                <div className="text-center">
                  <div className="text-3xl font-mono font-bold text-teal-400">
                    {getSessionTimer(
                      session.sessionStartTime || 0, 
                      session.sessionDuration || 0,
                      session.coalStatus,
                      session.refillTimerStart,
                      session.totalPausedTime
                    )}
                  </div>
                  <div className="text-sm text-zinc-400">
                    {session.coalStatus === 'burnt_out' ? 'Session Paused' : 'Session Timer'}
                  </div>
                </div>

                {/* Flavor */}
                <div className="bg-zinc-800 rounded-lg p-3">
                  <div className="text-sm text-zinc-400 mb-1">Current Flavor</div>
                  <div className="text-white font-medium">
                    {session.flavor || 'Choose flavors'}
                  </div>
                  {session.addOnFlavors && session.addOnFlavors.length > 0 && (
                    <div className="mt-2 text-sm text-white">
                      + {session.addOnFlavors.join(', ')}
                    </div>
                  )}
                </div>

                              {/* Coal Status */}
              <div className="bg-zinc-800 rounded-lg p-3">
                <div className="text-sm text-zinc-400 mb-2">Status</div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold text-center ${getCoalStatusColor(session.coalStatus)}`}>
                  {getCoalStatusText(session.coalStatus || 'unknown')}
                </div>
                {session.coalStatus === 'needs_refill' && refillTimers[session.id] !== undefined && (
                  <div className="mt-2 text-center">
                    <div className="text-xs text-zinc-400 mb-1">Auto-burnout in:</div>
                    <div className={`text-lg font-mono font-bold ${
                      refillTimers[session.id] <= 3 ? 'text-red-400' : 
                      refillTimers[session.id] <= 6 ? 'text-yellow-400' : 'text-orange-400'
                    }`}>
                      {refillTimers[session.id]}s
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleCoalAction(session.id, session.coalStatus)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    session.coalStatus === 'needs_refill'
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : session.coalStatus === 'burnt_out'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-orange-600 hover:bg-orange-700 text-white'
                  }`}
                >
                  {session.coalStatus === 'needs_refill' 
                    ? 'Complete Refill' 
                    : session.coalStatus === 'burnt_out'
                    ? 'Resume Session'
                    : 'Request Refill'
                  }
                </button>
                <button
                  onClick={() => endSession(session.id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  End Session
                </button>
              </div>

              {/* Delivery Status */}
              {session.deliveryStatus && (
                <div className="bg-zinc-800 rounded-lg p-3">
                  <div className="text-sm text-zinc-400 mb-2">Delivery Status</div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold text-center ${
                    session.deliveryStatus === 'preparing' ? 'bg-blue-600 text-white' :
                    session.deliveryStatus === 'ready' ? 'bg-green-600 text-white' :
                    session.deliveryStatus === 'delivered' ? 'bg-purple-600 text-white' :
                    'bg-gray-600 text-white'
                  }`}>
                    {session.deliveryStatus.toUpperCase()}
                  </div>
                  {session.deliveryStatus === 'ready' && (
                    <div className="mt-2 text-center">
                      <button
                        onClick={() => confirmDelivery(session.id)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Confirm Delivery
                      </button>
                    </div>
                  )}
                </div>
              )}

                {/* Amount */}
                <div className="bg-zinc-800 rounded-lg p-3">
                  <div className="text-sm text-zinc-400 mb-1">Current Amount</div>
                  <div className="text-white font-bold text-lg">
                    ${((session.totalRevenue || session.amount) / 100).toFixed(2)}
                  </div>
                </div>

                {/* ScreenCoder Integration Info */}
                {session.tablePosition && (
                  <div className="bg-zinc-800 rounded-lg p-3">
                    <div className="text-sm text-zinc-400 mb-1">ScreenCoder Position</div>
                    <div className="text-xs text-zinc-300">
                      X: {session.tablePosition.x}, Y: {session.tablePosition.y}
                    </div>
                    <div className="text-xs text-blue-400 mt-1">
                      Click to view lounge layout
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Hookah Room Dashboard */}
          <HookahRoomDashboard />

          {/* Lounge Layout */}
          <LoungeLayout 
            sessions={sessions} 
            onTableClick={(session) => {
              // Scroll to session card
              const sessionElement = document.getElementById(`session-${session.id}`);
              if (sessionElement) {
                sessionElement.scrollIntoView({ behavior: 'smooth' });
              }
            }} 
          />

          {/* Customer Profile Manager */}
          <CustomerProfileManager />

          {/* Connector Partnership Manager */}
          <ConnectorPartnershipManager />
        </div>
      </div>
    </main>
  );
}
