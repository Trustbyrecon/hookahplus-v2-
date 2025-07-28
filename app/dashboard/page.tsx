// app/dashboard/page.tsx
"use client";

import { useEffect } from "react";

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

export default function Dashboard() {
  useReflexAgent("Dashboard");

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-neutral-800 text-white p-8">
      <h1 className="text-3xl font-bold text-orange-400 mb-6">Lounge Dashboard</h1>
      <p className="mb-4 text-lg">
        Welcome to the operational nerve center. Monitor sessions, loyalty arcs, and real-time Reflex Events.
      </p>
      <div className="mt-8 border border-orange-400 p-6 rounded-xl bg-zinc-900 shadow-xl">
        <p className="text-orange-200">📡 Reflex Agent Active — Session Intelligence Engaged</p>
      </div>
    </div>
  );
}
