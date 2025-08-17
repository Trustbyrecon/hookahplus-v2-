// app/sessions/page.tsx
"use client";
import { useEffect, useState } from "react";
import CustomerProfileManager from "@/components/CustomerProfileManager";
import LoungeLayout from "@/components/LoungeLayout";

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
  // Customer profile metadata for network ecosystem
  customerName?: string;
  customerId?: string;
  customerPreferences?: {
    favoriteFlavors?: string[];
    sessionDuration?: number;
    addOnPreferences?: string[];
    notes?: string;
  };
  previousSessions?: string[];
  // Table mapping for ScreenCoder integration
  tableType?: "high_boy" | "table" | "2x_booth" | "4x_booth" | "8x_sectional" | "4x_sofa";
  tablePosition?: { x: number; y: number };
  refillTimerStart?: number;
};

type FlavorSuggestion = {
  combination: string;
  count: number;
};

type CustomerHistory = {
  id: string;
  flavor?: string;
  addOnFlavors?: string[];
  sessionStartTime?: number;
};

export default function SessionsDashboard() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [flavorSuggestions, setFlavorSuggestions] = useState<{
    flavorLibrary: FlavorSuggestion[];
    customerHistory: CustomerHistory[];
  } | null>(null);
  const [showFlavorModal, setShowFlavorModal] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [refillTimers, setRefillTimers] = useState<Record<string, number>>({});

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

  async function handleRefill(orderId: string) {
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'handle_refill',
          orderId
        })
      });
      if (res.ok) {
        await fetchSessions(); // Refresh data
      }
    } catch (error) {
      console.error('Error handling refill:', error);
    }
  }

  async function getFlavorSuggestions(orderId: string, customerId?: string) {
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_flavor_suggestions',
          orderId,
          data: { customerId }
        })
      });
      if (res.ok) {
        const data = await res.json();
        setFlavorSuggestions(data);
        setSelectedSessionId(orderId);
        setShowFlavorModal(true);
      }
    } catch (error) {
      console.error('Error getting flavor suggestions:', error);
    }
  }

  function getSessionTimer(sessionStartTime: number, sessionDuration: number, coalStatus?: string, refillTimerStart?: number, totalPausedTime?: number) {
    if (!sessionStartTime) return "—";
    
    let elapsed = Date.now() - sessionStartTime;
    
    // Subtract total paused time
    if (totalPausedTime) {
      elapsed -= totalPausedTime;
    }
    
    // If currently paused (burnt_out), don't count current pause time
    if (coalStatus === 'burnt_out' && refillTimerStart) {
      const currentPauseTime = Date.now() - refillTimerStart;
      elapsed -= currentPauseTime;
    }
    
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

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

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

        {/* Session Summary - Moved below header */}
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

        {/* Sessions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => (
            <div 
              key={session.id} 
              id={`session-${session.id}`}
              className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 space-y-4 transition-all duration-200"
            >
              {/* Table Header with Customer Info and Table Type */}
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

              {/* Customer Profile Metadata */}
              {session.customerId && (
                <div className="bg-zinc-800 rounded-lg p-3">
                  <div className="text-sm text-zinc-400 mb-1">Customer Profile</div>
                  <div className="text-xs text-zinc-300">
                    ID: {session.customerId}
                  </div>
                  {session.customerPreferences?.favoriteFlavors && (
                    <div className="text-xs text-teal-400 mt-1">
                      Favorites: {session.customerPreferences.favoriteFlavors.join(', ')}
                    </div>
                  )}
                  {session.customerPreferences?.notes && (
                    <div className="text-xs text-yellow-400 mt-1">
                      Notes: {session.customerPreferences.notes}
                    </div>
                  )}
                </div>
              )}

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

              {/* Coal Status with Refill Timer */}
              <div className="bg-zinc-800 rounded-lg p-3">
                <div className="text-sm text-zinc-400 mb-2">Status</div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold text-center ${getCoalStatusColor(session.coalStatus || 'unknown')}`}>
                  {getCoalStatusText(session.coalStatus || 'unknown')}
                </div>
                {/* Refill Timer Display */}
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
                  onClick={() => {
                    if (session.coalStatus === 'needs_refill') {
                      handleRefill(session.id);
                    } else {
                      updateCoalStatus(session.id, 'needs_refill');
                    }
                  }}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    session.coalStatus === 'needs_refill'
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-orange-600 hover:bg-orange-700 text-white'
                  }`}
                >
                  {session.coalStatus === 'needs_refill' ? 'Complete Refill' : 'Refill'}
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
                onClick={() => getFlavorSuggestions(session.id, session.customerId)}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Add Flavor (+$5.00)
              </button>

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

          {/* Empty State */}
          {sessions.length === 0 && (
            <div className="col-span-full text-center py-12">
              <div className="text-6xl mb-4">🍃</div>
              <div className="text-xl text-zinc-400 mb-2">No Active Sessions</div>
              <div className="text-zinc-500">Sessions will appear here when customers start their hookah experience</div>
            </div>
          )}
        </div>

        {/* Customer Profile Manager */}
        <CustomerProfileManager />

        {/* Lounge Layout for ScreenCoder Integration */}
        <LoungeLayout 
          sessions={sessions}
          onTableClick={(session) => {
            // Scroll to the session card
            const sessionElement = document.getElementById(`session-${session.id}`);
            if (sessionElement) {
              sessionElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
              // Add highlight effect
              sessionElement.classList.add('ring-2', 'ring-teal-400');
              setTimeout(() => {
                sessionElement.classList.remove('ring-2', 'ring-teal-400');
              }, 2000);
            }
          }}
        />
      </div>

      {/* Flavor Selection Modal */}
      {showFlavorModal && flavorSuggestions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-teal-400">Add Flavor</h3>
              <button
                onClick={() => setShowFlavorModal(false)}
                className="text-zinc-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            {/* Flavor Mix Library */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-white mb-3">Popular Flavor Combinations</h4>
              <div className="grid grid-cols-2 gap-2">
                {flavorSuggestions.flavorLibrary.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (selectedSessionId) {
                        addFlavorToSession(selectedSessionId, suggestion.combination);
                        setShowFlavorModal(false);
                      }
                    }}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white p-3 rounded-lg text-left transition-colors"
                  >
                    <div className="font-medium">{suggestion.combination}</div>
                    <div className="text-xs text-teal-400">Used {suggestion.count} times</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Customer History */}
            {flavorSuggestions.customerHistory.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-white mb-3">Your Previous Sessions</h4>
                <div className="grid grid-cols-2 gap-2">
                  {flavorSuggestions.customerHistory.map((session, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        if (selectedSessionId) {
                          const flavor = session.addOnFlavors && session.addOnFlavors.length > 0
                            ? `${session.flavor} + ${session.addOnFlavors.join(', ')}`
                            : session.flavor || 'Unknown';
                          addFlavorToSession(selectedSessionId, flavor);
                          setShowFlavorModal(false);
                        }
                      }}
                      className="bg-zinc-800 hover:bg-zinc-700 text-white p-3 rounded-lg text-left transition-colors"
                    >
                      <div className="font-medium">
                        {session.addOnFlavors && session.addOnFlavors.length > 0
                          ? `${session.flavor} + ${session.addOnFlavors.join(', ')}`
                          : session.flavor || 'Unknown'}
                      </div>
                      <div className="text-xs text-teal-400">
                        {session.sessionStartTime 
                          ? new Date(session.sessionStartTime).toLocaleDateString()
                          : 'Recent'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Flavor Input */}
            <div className="mb-4">
              <h4 className="text-lg font-semibold text-white mb-3">Custom Flavor</h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter custom flavor..."
                  className="flex-1 bg-zinc-800 text-white px-3 py-2 rounded-lg border border-zinc-600 focus:border-teal-500 focus:outline-none"
                  id="customFlavor"
                />
                <button
                  onClick={() => {
                    const customFlavor = (document.getElementById('customFlavor') as HTMLInputElement).value;
                    if (customFlavor && selectedSessionId) {
                      addFlavorToSession(selectedSessionId, customFlavor);
                      setShowFlavorModal(false);
                    }
                  }}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
