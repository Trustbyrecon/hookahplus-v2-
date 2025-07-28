// app/admin/page.tsx
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

export default function AdminPage() {
  useReflexAgent("Admin");

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white p-8">
      <h1 className="text-3xl font-bold text-purple-400 mb-6">Admin Control Center</h1>
      <p className="mb-4 text-lg">
        Manage system settings, review trust logs, and oversee lounge configurations.
      </p>
      <div className="mt-8 border border-purple-500 p-6 rounded-xl bg-zinc-900 shadow-xl">
        <p className="text-purple-200">🌀 Reflex Agent Live — Admin Integrity Active</p>
      </div>
    </div>
  );
}
