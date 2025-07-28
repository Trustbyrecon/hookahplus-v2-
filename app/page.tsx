// app/page.tsx
"use client";

import Link from "next/link";
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

    // Simulated reflex log and bloom trigger
    window.dispatchEvent(new CustomEvent("reflex-agent-log", {
      detail: { agentId, trustLevel, routeName, sessionContext },
    }));

    localStorage.setItem("user_visited_before", "true");
  }, [routeName]);
}

export default function Home() {
  useReflexAgent("Home");

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold mb-8 text-orange-400">Hookah+ Gateway</h1>
      <p className="mb-10 text-center max-w-xl">
        Select your operational mode. Each route is empowered by Reflex Agents, Memory Logs, Trust Bloom layers, and UI/UX intelligence.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-3xl">
        <Link href="/dashboard" className="bg-orange-500 hover:bg-orange-600 text-white py-4 px-6 rounded-xl text-center shadow-xl">
          Lounge Dashboard
        </Link>
        <Link href="/preorder" className="bg-purple-500 hover:bg-purple-600 text-white py-4 px-6 rounded-xl text-center shadow-xl">
          QR Pre-Order Portal
        </Link>
        <Link href="/admin" className="bg-red-500 hover:bg-red-600 text-white py-4 px-6 rounded-xl text-center shadow-xl">
          Admin Intelligence Hub
        </Link>
        <Link href="/operator" className="bg-blue-500 hover:bg-blue-600 text-white py-4 px-6 rounded-xl text-center shadow-xl">
          Main Operator Panel
        </Link>
      </div>
    </div>
  );
}
