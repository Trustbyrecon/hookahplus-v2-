'use client';

import React, { useState } from 'react';
import FireSessionWorkflow from '../../components/FireSessionWorkflow';
import FireSessionDashboard from '../../components/FireSessionDashboard';
import HookahRoomDashboard from '../../components/HookahRoomDashboard';

export default function FireSessionDemoPage() {
  const [staffRole, setStaffRole] = useState<'prep' | 'front' | 'customer' | 'hookah_room'>('prep');
  const [staffId, setStaffId] = useState('demo-staff-001');
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [showDashboard, setShowDashboard] = useState(true);
  const [showHookahRoom, setShowHookahRoom] = useState(false);

  const handleCreateSession = async () => {
    try {
      const response = await fetch('/api/fire-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          tableId: `T-${Math.floor(Math.random() * 20) + 1}`,
          flavorMix: 'Blue Mist + Mint',
          prepStaffId: staffId,
          demoMode: true
        })
      });

      if (response.ok) {
        const data = await response.json();
        setActiveSessionId(data.sessionId);
      }
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'prep':
        return 'Hookah preparation and assembly';
      case 'front':
        return 'Front of house delivery and customer service';
      case 'customer':
        return 'Customer interaction and session management';
      case 'hookah_room':
        return 'Hookah room operations and coal management';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                🔥 Fire Session Workflow Demo
              </h1>
              <p className="text-sm text-gray-600">
                Interactive demonstration of the Hookah+ Fire Session system
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Demo Mode: <span className="font-medium text-green-600">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Staff Configuration */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                👤 Staff Configuration
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Staff Role
                  </label>
                  <select
                    value={staffRole}
                    onChange={(e) => setStaffRole(e.target.value as any)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="prep">Prep Room Staff</option>
                    <option value="front">Front Staff</option>
                    <option value="customer">Customer</option>
                    <option value="hookah_room">Hookah Room Staff</option>
                  </select>
                  <p className="mt-1 text-sm text-gray-500">
                    {getRoleDescription(staffRole)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Staff ID
                  </label>
                  <input
                    type="text"
                    value={staffId}
                    onChange={(e) => setStaffId(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter staff ID"
                  />
                </div>

                <button
                  onClick={handleCreateSession}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
                >
                  🚀 Create New Demo Session
                </button>
              </div>
            </div>

            {/* Demo Instructions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                📋 Demo Instructions
              </h2>
              
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <span className="text-blue-500 font-bold">1.</span>
                  <p>Select your staff role and enter a staff ID</p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-500 font-bold">2.</span>
                  <p>Create a new demo session</p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-500 font-bold">3.</span>
                  <p>Use the workflow buttons to progress through the session</p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-500 font-bold">4.</span>
                  <p>Watch the dashboard update in real-time</p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-500 font-bold">5.</span>
                  <p>Demo automatically cycles: 30s service → 15s refill → 10s coals</p>
                </div>
              </div>
            </div>

            {/* View Controls */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                📊 View Controls
              </h2>
              
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showDashboard}
                    onChange={(e) => setShowDashboard(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Show Main Dashboard</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showHookahRoom}
                    onChange={(e) => setShowHookahRoom(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Show Hookah Room Dashboard</span>
                </label>
              </div>
            </div>
          </div>

          {/* Center Column - Workflow */}
          <div className="lg:col-span-1">
            {activeSessionId ? (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    🔥 Active Session: {activeSessionId}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Role: {staffRole} | Staff: {staffId}
                  </p>
                </div>
                
                <div className="p-6">
                  <FireSessionWorkflow
                    sessionId={activeSessionId}
                    staffRole={staffRole}
                    staffId={staffId}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="text-6xl mb-4">🚀</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Active Session
                </h3>
                <p className="text-gray-500">
                  Create a new demo session to get started
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Dashboards */}
          <div className="lg:col-span-1 space-y-6">
            {/* Main Dashboard */}
            {showDashboard && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    📊 Main Dashboard
                  </h2>
                  <p className="text-sm text-gray-600">
                    Real-time session overview and metrics
                  </p>
                </div>
                
                <div className="p-6">
                  <FireSessionDashboard />
                </div>
              </div>
            )}

            {/* Hookah Room Dashboard */}
            {showHookahRoom && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    🔥 Hookah Room Dashboard
                  </h2>
                  <p className="text-sm text-gray-600">
                    Specialized view for hookah room operations
                  </p>
                </div>
                
                <div className="p-6">
                  <HookahRoomDashboard staffId={staffId} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Demo Status Footer */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              🔥 Demo System Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-green-800 font-medium">Workflow Engine</div>
                <div className="text-green-600">Active & Running</div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-blue-800 font-medium">Event System</div>
                <div className="text-blue-600">Real-time Updates</div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <div className="text-purple-800 font-medium">Demo Mode</div>
                <div className="text-purple-600">Auto-cycle Enabled</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
