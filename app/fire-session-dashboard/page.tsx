"use client";

import { useState, useEffect } from "react";
import GlobalNavigation from "../../components/GlobalNavigation";
import { getAllSessions, seedMultipleSessions, type Session, type SessionState } from "@/lib/sessionState";

const FireSessionDashboard = () => {
  const [activeView, setActiveView] = useState<"foh" | "boh">("foh");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);

  // Refresh sessions based on current view
  const refreshSessions = () => {
    const allSessions = getAllSessions();
    let filteredSessions: Session[] = [];
    
    if (activeView === "foh") {
      // Front of House: sessions ready for delivery, out for delivery, delivered, active, close pending
      // Only show sessions that have progressed through the proper workflow
      filteredSessions = allSessions.filter(s => 
        ["READY_FOR_DELIVERY", "OUT_FOR_DELIVERY", "DELIVERED", "ACTIVE", "CLOSE_PENDING"].includes(s.state)
      );
    } else {
      // Back of House: sessions in prep, heating, ready for delivery
      // Only show sessions that are in prep workflow
      filteredSessions = allSessions.filter(s => 
        ["PAID_CONFIRMED", "QUEUED_PREP", "PREP_IN_PROGRESS", "HEAT_UP", "READY_FOR_DELIVERY"].includes(s.state)
      );
    }
    
    setSessions(filteredSessions);
  };

  useEffect(() => {
    refreshSessions();
    const interval = setInterval(refreshSessions, 5000);
    return () => clearInterval(interval);
  }, [activeView]);

  const handleGenerateDemoData = async () => {
    setLoading(true);
    try {
      // Generate 15 demo hookah sessions with proper state progression
      for (let i = 0; i < 15; i++) {
        const tableId = `T-${Math.floor(Math.random() * 20) + 1}`;
        const sessionId = `demo_${tableId}_${Date.now()}_${i}`;
        
        // Start with PAYMENT_CONFIRMED to get into proper workflow
        await fetch(`/api/sessions/${sessionId}/command`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            cmd: "PAYMENT_CONFIRMED",
            data: { 
              table: tableId,
              customerId: `customer_${Math.floor(Math.random() * 1000)}`,
              flavor: ['Double Apple', 'Mint', 'Strawberry', 'Grape', 'Rose', 'Vanilla'][Math.floor(Math.random() * 6)],
              amount: 2500 + Math.floor(Math.random() * 3000)
            }
          })
        });

        // Randomly progress some sessions through the workflow
        const randomProgress = Math.random();
        if (randomProgress > 0.7) {
          // Progress to PREP_IN_PROGRESS
          await fetch(`/api/sessions/${sessionId}/command`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cmd: "CLAIM_PREP" })
          });
          
          if (randomProgress > 0.85) {
            // Progress to HEAT_UP
            await fetch(`/api/sessions/${sessionId}/command`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ cmd: "HEAT_UP" })
            });
            
            if (randomProgress > 0.95) {
              // Progress to READY_FOR_DELIVERY
              await fetch(`/api/sessions/${sessionId}/command`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cmd: "READY_FOR_DELIVERY" })
              });
            }
          }
        }
      }
      
      alert("Generated 15 demo hookah sessions with proper workflow progression! Check both FOH and BOH views.");
      refreshSessions();
    } catch (error) {
      console.error("Error generating demo data:", error);
      alert("Error generating demo data");
    } finally {
      setLoading(false);
    }
  };

  const getStateColor = (state: SessionState) => {
    const colors: Record<string, string> = {
      PAID_CONFIRMED: "bg-blue-500/20 text-blue-300",
      QUEUED_PREP: "bg-yellow-500/20 text-yellow-300",
      PREP_IN_PROGRESS: "bg-orange-500/20 text-orange-300",
      HEAT_UP: "bg-red-500/20 text-red-300",
      READY_FOR_DELIVERY: "bg-emerald-500/20 text-emerald-300",
      OUT_FOR_DELIVERY: "bg-blue-500/20 text-blue-300",
      DELIVERED: "bg-purple-500/20 text-purple-300",
      ACTIVE: "bg-emerald-500/20 text-emerald-300",
      CLOSE_PENDING: "bg-yellow-500/20 text-yellow-300"
    };
    return colors[state] || "bg-zinc-800 text-zinc-400";
  };

  const getStateIcon = (state: SessionState) => {
    const icons: Record<string, string> = {
      PAID_CONFIRMED: "💰",
      QUEUED_PREP: "⏳",
      PREP_IN_PROGRESS: "🔧",
      HEAT_UP: "🔥",
      READY_FOR_DELIVERY: "✅",
      OUT_FOR_DELIVERY: "🚚",
      DELIVERED: "🎯",
      ACTIVE: "🍃",
      CLOSE_PENDING: "⏰"
    };
    return icons[state] || "❓";
  };

  const getPriorityScore = (session: Session) => {
    const priorityMap: Record<string, number> = {
      READY_FOR_DELIVERY: 100,
      OUT_FOR_DELIVERY: 90,
      DELIVERED: 80,
      ACTIVE: 70,
      CLOSE_PENDING: 60,
      HEAT_UP: 50,
      PREP_IN_PROGRESS: 40,
      QUEUED_PREP: 30,
      PAID_CONFIRMED: 20
    };
    return priorityMap[session.state] || 0;
  };

  const sortedSessions = [...sessions].sort((a, b) => getPriorityScore(b) - getPriorityScore(a));

  // Validate session state before allowing actions
  const canExecuteCommand = (session: Session, command: string): boolean => {
    const validCommands: Record<string, string[]> = {
      // FOH commands
      DELIVER_NOW: ["READY_FOR_DELIVERY"],
      MARK_DELIVERED: ["OUT_FOR_DELIVERY"],
      START_ACTIVE: ["DELIVERED"],
      CLOSE_SESSION: ["ACTIVE"],
      
      // BOH commands
      CLAIM_PREP: ["PAID_CONFIRMED"],
      HEAT_UP: ["PREP_IN_PROGRESS"],
      READY_FOR_DELIVERY: ["HEAT_UP"],
      
      // Common commands
      REMAKE: ["PREP_IN_PROGRESS", "HEAT_UP", "READY_FOR_DELIVERY", "OUT_FOR_DELIVERY", "DELIVERED", "ACTIVE"],
      STAFF_HOLD: ["PREP_IN_PROGRESS", "HEAT_UP", "READY_FOR_DELIVERY", "OUT_FOR_DELIVERY", "DELIVERED", "ACTIVE"]
    };

    return validCommands[command]?.includes(session.state) || false;
  };

  const getAvailableCommands = (session: Session): string[] => {
    const commands: string[] = [];
    
    if (activeView === "foh") {
      if (session.state === "READY_FOR_DELIVERY") commands.push("DELIVER_NOW");
      if (session.state === "OUT_FOR_DELIVERY") commands.push("MARK_DELIVERED");
      if (session.state === "DELIVERED") commands.push("START_ACTIVE");
      if (session.state === "ACTIVE") commands.push("CLOSE_SESSION");
    } else {
      if (session.state === "PAID_CONFIRMED") commands.push("CLAIM_PREP");
      if (session.state === "PREP_IN_PROGRESS") commands.push("HEAT_UP");
      if (session.state === "HEAT_UP") commands.push("READY_FOR_DELIVERY");
    }
    
    // Common commands
    if (["PREP_IN_PROGRESS", "HEAT_UP", "READY_FOR_DELIVERY", "OUT_FOR_DELIVERY", "DELIVERED", "ACTIVE"].includes(session.state)) {
      commands.push("REMAKE", "STAFF_HOLD");
    }
    
    return commands;
  };

  const executeCommand = async (session: Session, command: string) => {
    if (!canExecuteCommand(session, command)) {
      alert(`Command ${command} is not valid for session in state ${session.state}`);
      return;
    }

    try {
      const response = await fetch(`/api/sessions/${session.id}/command`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          cmd: command,
          actor: activeView === "foh" ? "foh" : "boh"
        })
      });

      if (response.ok) {
        alert(`Command ${command} executed successfully!`);
        refreshSessions();
        // Clear selection if session state changed significantly
        if (["CLOSE_SESSION", "CLOSED"].includes(command)) {
          setSelectedSession(null);
        }
      } else {
        const error = await response.json();
        alert(`Command failed: ${error.error}`);
      }
    } catch (error) {
      console.error("Error executing command:", error);
      alert("Error executing command");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <GlobalNavigation />
      
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-teal-400 mb-2">Fire Session Dashboard</h1>
              <p className="text-zinc-400">Hookah Lounge Session Management</p>
            </div>
            
            {/* View Toggle */}
            <div className="flex bg-zinc-800 rounded-xl p-1 border border-zinc-700">
              <button
                onClick={() => setActiveView("foh")}
                className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                  activeView === "foh"
                    ? "bg-teal-500 text-zinc-950 shadow-lg"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-700"
                }`}
              >
                <span className="text-lg">🍃</span>
                <span>Front of House</span>
              </button>
              <button
                onClick={() => setActiveView("boh")}
                className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                  activeView === "boh"
                    ? "bg-teal-500 text-zinc-950 shadow-lg"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-700"
                }`}
              >
                <span className="text-lg">🔧</span>
                <span>Back of House</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Control Actions */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 mb-6">
          <h2 className="text-xl font-semibold text-teal-300 mb-4">Control Actions</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleGenerateDemoData}
              disabled={loading}
              className="bg-teal-500 text-zinc-950 px-6 py-3 rounded-xl hover:bg-teal-400 disabled:opacity-50 transition-colors font-medium"
            >
              {loading ? "Generating..." : "🎯 Generate 15 Demo Sessions"}
            </button>
            <button
              onClick={refreshSessions}
              className="bg-zinc-700 text-white px-6 py-3 rounded-xl hover:bg-zinc-600 transition-colors font-medium"
            >
              🔄 Refresh Dashboard
            </button>
            <a
              href="/admin-control"
              className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-500 transition-colors font-medium"
            >
              ⚙️ Admin Control
            </a>
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
                <span className="text-2xl">{activeView === "foh" ? "🏠" : "🔧"}</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-zinc-400">{activeView === "foh" ? "Floor Sessions" : "Prep Sessions"}</p>
                <p className="text-2xl font-semibold text-white">{sessions.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-zinc-400">Current View</p>
                <p className="text-lg font-semibold text-white">{activeView === "foh" ? "Front of House" : "Back of House"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Session Queue */}
          <div className="lg:col-span-2">
            <div className="bg-zinc-900 rounded-xl border border-zinc-800">
              <div className="px-6 py-4 border-b border-zinc-800">
                <h2 className="text-lg font-semibold text-teal-300">
                  {activeView === "foh" ? "Floor Queue" : "Prep Queue"}
                </h2>
                <p className="text-sm text-zinc-400">
                  {sessions.length} sessions {activeView === "foh" ? "on floor" : "in prep"}
                </p>
              </div>
              <div className="p-6">
                {sessions.length === 0 ? (
                  <div className="text-center py-8 text-zinc-500">
                    <div className="text-4xl mb-2">🍃</div>
                    <p>No sessions {activeView === "foh" ? "on floor" : "in prep queue"}</p>
                    <p className="text-sm mt-2">Use the control actions above to generate demo data</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sortedSessions.map((session) => (
                      <div
                        key={session.id}
                        className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-lg ${
                          selectedSession?.id === session.id 
                            ? 'border-teal-500 bg-teal-500/10' 
                            : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600'
                        }`}
                        onClick={() => setSelectedSession(session)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{getStateIcon(session.state)}</span>
                            <div>
                              <div className="font-medium text-white">
                                Table {session.table}
                              </div>
                              <div className="text-sm text-zinc-400">
                                Session {session.id.slice(-6)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStateColor(session.state)}`}>
                              {session.state.replace(/_/g, ' ')}
                            </span>
                          </div>
                        </div>
                        
                        {session.meta.customerId && (
                          <div className="mt-2 text-sm text-zinc-400">
                            Customer: {session.meta.customerId}
                          </div>
                        )}

                        {/* Timer info */}
                        {session.timers.heatUpStart && (
                          <div className="mt-2 text-xs text-zinc-500">
                            Heat started: {new Date(session.timers.heatUpStart).toLocaleTimeString()}
                          </div>
                        )}
                        {session.timers.deliveredAt && (
                          <div className="mt-1 text-xs text-zinc-500">
                            Delivered: {new Date(session.timers.deliveredAt).toLocaleTimeString()}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Session Controls */}
          <div className="lg:col-span-1">
            <div className="bg-zinc-900 rounded-xl border border-zinc-800">
              <div className="px-6 py-4 border-b border-zinc-800">
                <h2 className="text-lg font-semibold text-teal-300">Session Controls</h2>
                {selectedSession && (
                  <p className="text-sm text-zinc-400">
                    Table {selectedSession.table} - {selectedSession.state.replace(/_/g, ' ')}
                  </p>
                )}
              </div>
              <div className="p-6">
                {!selectedSession ? (
                  <div className="text-center py-8 text-zinc-500">
                    <p>Select a session to control</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Session Info */}
                    <div className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                      <h3 className="font-medium text-white mb-2">Session Details</h3>
                      <div className="space-y-1 text-sm text-zinc-400">
                        <div>ID: {selectedSession.id}</div>
                        <div>Table: {selectedSession.table}</div>
                        <div>State: {selectedSession.state}</div>
                        <div>Items: {selectedSession.items.length}</div>
                        {selectedSession.timers.heatUpStart && (
                          <div>Heat Start: {new Date(selectedSession.timers.heatUpStart).toLocaleTimeString()}</div>
                        )}
                        {selectedSession.timers.deliveredAt && (
                          <div>Delivered: {new Date(selectedSession.timers.deliveredAt).toLocaleTimeString()}</div>
                        )}
                      </div>
                    </div>

                    {/* Available Commands */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-white text-sm">Available Actions:</h4>
                      {getAvailableCommands(selectedSession).map((command) => (
                        <button
                          key={command}
                          onClick={() => executeCommand(selectedSession, command)}
                          className="w-full bg-teal-500 text-zinc-950 px-4 py-2 rounded-lg hover:bg-teal-400 transition-colors font-medium"
                        >
                          {command.replace(/_/g, ' ')}
                        </button>
                      ))}
                      {getAvailableCommands(selectedSession).length === 0 && (
                        <p className="text-zinc-500 text-sm text-center py-2">
                          No actions available for this state
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <h3 className="text-lg font-semibold text-teal-300 mb-4">Dashboard Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-white mb-2">Front of House (FOH)</h4>
              <p className="text-sm text-zinc-400">
                Manages customer delivery, table management, and active sessions. 
                Handles sessions from "Ready for Delivery" through "Active" to "Close Pending".
              </p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">Back of House (BOH)</h4>
              <p className="text-sm text-zinc-400">
                Manages hookah preparation, heating, and prep queue. 
                Handles sessions from "Paid Confirmed" through "Prep in Progress" to "Ready for Delivery".
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FireSessionDashboard;
