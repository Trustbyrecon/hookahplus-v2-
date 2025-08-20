'use client';

import React, { useState } from 'react';
import FireSessionWorkflow from '../../../components/FireSessionWorkflow';
import FireSessionDashboard from '../../../components/FireSessionDashboard';
import { fireSessionWorkflow } from '../../../lib/fire-session-workflow';

export default function FireSessionDemoPage() {
  const [selectedRole, setSelectedRole] = useState<'prep' | 'front'>('prep');
  const [staffId, setStaffId] = useState('staff_001');
  const [sessionId, setSessionId] = useState('session_001');
  const [tableId, setTableId] = useState('T-001');
  const [flavorMix, setFlavorMix] = useState('Blue Mist + Mint');
  const [activeSessions, setActiveSessions] = useState<string[]>([]);

  // Create a new session
  const createSession = async () => {
    try {
      const response = await fetch('/api/fire-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          sessionId,
          tableId,
          flavorMix,
          prepStaffId: staffId
        })
      });

      if (response.ok) {
        setActiveSessions(prev => [...prev, sessionId]);
        // Generate new session ID for next creation
        setSessionId(`session_${Date.now()}`);
      }
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🔥 Hookah+ Fire Session Workflow Demo
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the seamless handoff between prep room and front staff with our 
            agent-friendly workflow system. Each button press creates a cursor event 
            that agents can subscribe to for real-time synchronization.
          </p>
        </div>

        {/* Role Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Select Your Role</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Prep Room Role */}
            <div className={`p-6 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
              selectedRole === 'prep' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-blue-300'
            }`} onClick={() => setSelectedRole('prep')}>
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">🔧</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Prep Room Staff</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Manage hookah assembly, flavor mixing, and preparation workflow.
                Control the prep → delivery handoff process.
              </p>
              <div className="mt-3 text-xs text-gray-500">
                Buttons: Prep Started → Flavor Locked → Timer Armed → Ready for Delivery
              </div>
            </div>

            {/* Front Staff Role */}
            <div className={`p-6 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
              selectedRole === 'front' 
                ? 'border-yellow-500 bg-yellow-50' 
                : 'border-gray-200 hover:border-yellow-300'
            }`} onClick={() => setSelectedRole('front')}>
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">🚚</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Front Staff</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Handle delivery, customer service, and session monitoring.
                Manage the delivery → service transition.
              </p>
              <div className="mt-3 text-xs text-gray-500">
                Buttons: Picked Up → Delivered → Monitor Service
              </div>
            </div>
          </div>

          {/* Staff Configuration */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Staff ID
                </label>
                <input
                  type="text"
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter staff ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Role
                </label>
                <div className="px-3 py-2 bg-white border border-gray-300 rounded-md">
                  <span className={`font-medium ${
                    selectedRole === 'prep' ? 'text-blue-600' : 'text-yellow-600'
                  }`}>
                    {selectedRole === 'prep' ? '🔧 Prep Room' : '🚚 Front Staff'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Session Creation */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Create New Session</h2>
          
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Table ID
              </label>
              <input
                type="text"
                value={tableId}
                onChange={(e) => setTableId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., T-001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Flavor Mix
              </label>
              <input
                type="text"
                value={flavorMix}
                onChange={(e) => setFlavorMix(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Blue Mist + Mint"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={createSession}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
              >
                Create Session
              </button>
            </div>
          </div>

          {activeSessions.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Active Sessions:</h3>
              <div className="flex flex-wrap gap-2">
                {activeSessions.map((session) => (
                  <span
                    key={session}
                    className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                  >
                    {session}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Workflow Controls */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Workflow Controls</h2>
              
              {activeSessions.length > 0 ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Session
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      {activeSessions.map((session) => (
                        <option key={session} value={session}>{session}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <p>Selected: <span className="font-medium">{activeSessions[0] || 'None'}</span></p>
                    <p>Role: <span className="font-medium capitalize">{selectedRole}</span></p>
                    <p>Staff: <span className="font-medium">{staffId}</span></p>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <div className="text-4xl mb-2">🔥</div>
                  <p>Create a session to start the workflow</p>
                </div>
              )}
            </div>
          </div>

          {/* Workflow Interface */}
          <div className="lg:col-span-2">
            {activeSessions.length > 0 ? (
              <FireSessionWorkflow
                sessionId={activeSessions[0]}
                staffRole={selectedRole}
                staffId={staffId}
                onEvent={(event) => {
                  console.log('Workflow event:', event);
                  // Agents can subscribe to these events
                }}
              />
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="text-6xl mb-4">🚀</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Ready to Start
                </h3>
                <p className="text-gray-600">
                  Create your first session to see the workflow in action
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Dashboard */}
        {activeSessions.length > 0 && (
          <div className="mt-8">
            <FireSessionDashboard
              staffRole={selectedRole}
              staffId={staffId}
            />
          </div>
        )}

        {/* System Information */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">System Information</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">🔑 Button Language</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Prep → Front:</strong> Prep Started → Flavor Locked → Timer Armed → Ready for Delivery</p>
                <p><strong>Front → Customer:</strong> Picked Up → Delivered → Customer Confirmed</p>
                <p><strong>Edge Cases:</strong> Hold, Redo/Remix, Swap Charcoal, Cancel, Return to Prep</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">🔄 Cursor Events</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>Each button press emits a cursor event with:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Session ID & Staff Role</li>
                  <li>Timestamp & Status Tag</li>
                  <li>Previous & New State</li>
                  <li>Metadata & Recovery Info</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-medium text-blue-900 mb-2">🎯 Agent Build Benefits</h3>
            <div className="text-sm text-blue-800">
              <p><strong>No Hidden Logic:</strong> States map directly to button language</p>
              <p><strong>Reduced Complexity:</strong> Edge cases stored as same event type</p>
              <p><strong>Extensible:</strong> Add new buttons without breaking flow</p>
              <p><strong>Real-time Sync:</strong> Dashboards update automatically via event subscription</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
