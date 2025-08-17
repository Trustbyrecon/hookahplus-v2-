// app/sessions/page.tsx
"use client";
import { useEffect, useState } from "react";

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
};

export default function SessionsDashboard() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
        setSessions(json.sessions || []);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function updateCoalStatus(orderId: string, status: "active" | "needs_refill" | "burnt_out") {
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_coal_status',
          orderId,
          data: { status }
        })
      });
      if (res.ok) {
        await fetchSessions(); // Refresh data
      }
    } catch (error) {
      console.error('Error updating coal status:', error);
    }
  }

  async function addFlavorToSession(orderId: string, flavor: string) {
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_flavor',
          orderId,
          data: { flavor, rate: 500 }
        })
      });
      if (res.ok) {
        await fetchSessions(); // Refresh data
      }
    } catch (error) {
      console.error('Error adding flavor:', error);
    }
  }

  function getSessionTimer(sessionStartTime: number, sessionDuration: number) {
    if (!sessionStartTime) return "—";
    
    const elapsed = Date.now() - sessionStartTime;
    const elapsedMinutes = Math.floor(elapsed / 60000);
    const elapsedSeconds = Math.floor((elapsed % 60000) / 1000);
    
    if (elapsedMinutes >= sessionDuration) {
      return "EXPIRED";
    }
    
    const remaining = sessionDuration - elapsedMinutes;
    const remainingSeconds = 60 - elapsedSeconds;
    
    return `${remaining.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  function getCoalStatusColor(status: string) {
    switch (status) {
      case 'active': return 'bg-green-600 text-white';
      case 'needs_refill': return 'bg-yellow-600 text-white';
      case 'burnt_out': return 'bg-red-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  }

  function getCoalStatusText(status: string) {
    switch (status) {
      case 'active': return 'ACTIVE';
      case 'needs_refill': return 'NEEDS REFILL';
      case 'burnt_out': return 'BURNT OUT';
      default: return 'UNKNOWN';
    }
  }

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white p-8">
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
          </div>
        </div>

        {/* Sessions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => (
            <div key={session.id} className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 space-y-4">
              {/* Table Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">
                  {session.tableId || 'Unknown Table'}
                </h3>
                <div className="text-sm text-zinc-400">
                  #{session.id.slice(-6)}
                </h3>
              </div>

              {/* Timer */}
              <div className="text-center">
                <div className="text-3xl font-mono font-bold text-teal-400">
                  {getSessionTimer(session.sessionStartTime || 0, session.sessionDuration || 0)}
                </div>
                <div className="text-sm text-zinc-400">Session Timer</div>
              </div>

              {/* Flavor */}
              <div className="bg-zinc-800 rounded-lg p-3">
                <div className="text-sm text-zinc-400 mb-1">Flavor</div>
                <div className="text-white font-medium">
                  {session.flavor || 'Choose flavors'}
                </div>
                {session.addOnFlavors && session.addOnFlavors.length > 0 && (
                  <div className="mt-2 text-sm text-teal-400">
                    + {session.addOnFlavors.join(', ')}
                  </div>
                )}
              </div>

              {/* Coal Status */}
              <div className="bg-zinc-800 rounded-lg p-3">
                <div className="text-sm text-zinc-400 mb-2">Status</div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold text-center ${getCoalStatusColor(session.coalStatus || 'unknown')}`}>
                  {getCoalStatusText(session.coalStatus || 'unknown')}
                </div>
              </div>

              {/* Amount */}
              <div className="bg-zinc-800 rounded-lg p-3">
                <div className="text-sm text-zinc-400 mb-1">Current Amount</div>
                <div className="text-white font-bold text-lg">
                  ${((session.totalRevenue || session.amount) / 100).toFixed(2)}
                </div>
                {session.addOnRate && session.addOnRate > 0 && (
                  <div className="text-xs text-teal-400">
                    Base: ${(session.baseRate || 0) / 100} + Add-ons: ${session.addOnRate / 100}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => updateCoalStatus(session.id, 'needs_refill')}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Refill
                </button>
                <button
                  onClick={() => updateCoalStatus(session.id, 'burnt_out')}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  End Session
                </button>
              </div>

              {/* Add Flavor Button */}
              <button
                onClick={() => {
                  const flavor = prompt('Enter new flavor:');
                  if (flavor) {
                    addFlavorToSession(session.id, flavor);
                  }
                }}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Add Flavor (+$5.00)
              </button>
            </div>
          ))}

          {/* Empty State */}
          {sessions.length === 0 && (
            <div className="col-span-full text-center py-12">
              <div className="text-6xl mb-4">🍃</div>
              <div className="text-xl text-zinc-400 mb-2">No Active Sessions</div>
              <div className="text-zinc-500">Sessions will appear here when customers start their hookah experience</div>
            </div>
          )}
        </div>

        {/* Session Summary */}
        {sessions.length > 0 && (
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-teal-300 mb-4">Session Summary</h3>
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
                <div className="text-zinc-400 text-sm">Burnt Out</div>
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
      </div>
    </main>
  );
}
