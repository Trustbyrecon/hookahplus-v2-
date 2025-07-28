// app/preorder/page.tsx
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

export default function PreOrder() {
  useReflexAgent("PreOrder");

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white p-8">
      <h1 className="text-3xl font-bold text-teal-400 mb-6">Pre-Order Station</h1>
      <p className="mb-4 text-lg">
        Customize and reserve your Hookah+ session ahead of time. Trust tokens apply.
      </p>
      <div className="mt-8 border border-teal-500 p-6 rounded-xl bg-zinc-900 shadow-xl">
        <p className="text-teal-200">🌀 Reflex Agent Monitoring — Loyalty Sync Enabled</p>
      </div>
    </div>
  );
}
