"use client";

import { useState } from "react";
import BOHPrepRoom from "@/components/BOHPrepRoom";
import FOHFloorDashboard from "@/components/FOHFloorDashboard";

const FireSessionDashboard = () => {
  const [activeView, setActiveView] = useState<"foh" | "boh">("foh");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Fire Session Dashboard</h1>
              <p className="text-sm text-gray-600">Hookah Lounge Session Management</p>
            </div>
            
            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveView("foh")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeView === "foh"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                🍃 Front of House
              </button>
              <button
                onClick={() => setActiveView("boh")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeView === "boh"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                🔧 Back of House
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="py-6">
        {activeView === "foh" ? <FOHFloorDashboard /> : <BOHPrepRoom />}
      </div>

              {/* Quick Actions Footer */}
        <div className="fixed bottom-6 right-6">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => {
                  // Seed a demo session
                  fetch("/api/sessions/sess_demo/command", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ cmd: "PAYMENT_CONFIRMED" })
                  }).then(() => window.location.reload());
                }}
                className="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
              >
                Seed Demo Session
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gray-600 text-white px-3 py-2 rounded text-sm hover:bg-gray-700"
              >
                Refresh Dashboard
              </button>
              <a
                href="/admin-control"
                className="w-full bg-purple-600 text-white px-3 py-2 rounded text-sm hover:bg-purple-700 text-center block"
              >
                Admin Control
              </a>
            </div>
          </div>
        </div>
    </div>
  );
};

export default FireSessionDashboard;
