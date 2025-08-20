'use client';

import React, { useState, useEffect } from 'react';
import { 
  fireSessionWorkflow, 
  SessionState, 
  SessionStatus, 
  WorkflowEvent 
} from '../lib/fire-session-workflow';

export default function FireSessionDashboard() {
  const [sessions, setSessions] = useState<SessionState[]>([]);
  const [recentEvents, setRecentEvents] = useState<WorkflowEvent[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<SessionStatus | 'all'>('all');

  // 🔄 Subscribe to workflow events
  useEffect(() => {
    const unsubscribe = fireSessionWorkflow.subscribeToAgentEvents((event) => {
      // Update sessions list
      const allSessions = Array.from(fireSessionWorkflow.getAllSessions().values());
      setSessions(allSessions);

      // Update recent events
      const events = fireSessionWorkflow.getEventHistory();
      setRecentEvents(events.slice(-10).reverse());

      // Update metrics
      setMetrics(fireSessionWorkflow.getSessionMetrics());
    });

    // Load initial data
    const allSessions = Array.from(fireSessionWorkflow.getAllSessions().values());
    setSessions(allSessions);
    setRecentEvents(fireSessionWorkflow.getEventHistory().slice(-10).reverse());
    setMetrics(fireSessionWorkflow.getSessionMetrics());

    return unsubscribe;
  }, []);

  // Filter sessions by status
  const filteredSessions = statusFilter === 'all' 
    ? sessions 
    : sessions.filter(session => session.currentStatus === statusFilter);

  // Get status color
  const getStatusColor = (status: SessionStatus) => {
    switch (status) {
      case 'prep': return 'bg-blue-100 text-blue-800';
      case 'delivery': return 'bg-yellow-100 text-yellow-800';
      case 'service': return 'bg-green-100 text-green-800';
      case 'refill': return 'bg-purple-100 text-purple-800';
      case 'coals_needed': return 'bg-orange-100 text-orange-800';
      case 'recovery': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status icon
  const getStatusIcon = (status: SessionStatus) => {
    switch (status) {
      case 'prep': return '🔧';
      case 'delivery': return '🚚';
      case 'service': return '✅';
      case 'refill': return '🥤';
      case 'coals_needed': return '🔥';
      case 'recovery': return '⚠️';
      case 'completed': return '🎉';
      case 'cancelled': return '❌';
      default: return '❓';
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">{metrics.totalSessions}</div>
            <div className="text-sm text-blue-700">Total Sessions</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">{metrics.activeSessions}</div>
            <div className="text-sm text-green-700">Active Sessions</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(metrics.refillRate * 100)}%
            </div>
            <div className="text-sm text-purple-700">Refill Rate</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-orange-600">
              {Math.round(metrics.coalBurnoutRate * 100)}%
            </div>
            <div className="text-sm text-orange-700">Coal Burnout Rate</div>
          </div>
        </div>
      )}

      {/* Status Filter */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            📊 Active Sessions ({filteredSessions.length})
          </h2>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as SessionStatus | 'all')}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="prep">Prep</option>
            <option value="delivery">Delivery</option>
            <option value="service">Service</option>
            <option value="refill">Refill</option>
            <option value="coals_needed">Coals Needed</option>
            <option value="recovery">Recovery</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="space-y-3">
          {filteredSessions.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No sessions found with the selected status.
            </div>
          ) : (
            filteredSessions.map((session) => (
              <SessionCard key={session.sessionId} session={session} />
            ))
          )}
        </div>
      </div>

      {/* Recent Events */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Events</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {recentEvents.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No recent events.
            </div>
          ) : (
            recentEvents.map((event, index) => (
              <EventCard key={index} event={event} />
            ))
          )}
        </div>
      </div>

      {/* Frequent Issues */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Frequent Issues</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="font-medium text-red-900 mb-2">⚠️ Recovery Sessions</h3>
            <div className="text-2xl font-bold text-red-600">
              {sessions.filter(s => s.currentStatus === 'recovery').length}
            </div>
            <p className="text-sm text-red-700">Sessions requiring attention</p>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-medium text-yellow-900 mb-2">⏰ Overdue Deliveries</h3>
            <div className="text-2xl font-bold text-yellow-600">
              {sessions.filter(s => {
                if (s.currentStatus === 'delivery' && s.sessionTimer?.armedAt) {
                  const elapsed = Date.now() - s.sessionTimer.armedAt.getTime();
                  return elapsed > 5 * 60 * 1000; // 5 minutes
                }
                return false;
              }).length}
            </div>
            <p className="text-sm text-yellow-700">Deliveries taking too long</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Session Card Component
function SessionCard({ session }: { session: SessionState }) {
  const getStatusColor = (status: SessionStatus) => {
    switch (status) {
      case 'prep': return 'bg-blue-100 text-blue-800';
      case 'delivery': return 'bg-yellow-100 text-yellow-800';
      case 'service': return 'bg-green-100 text-green-800';
      case 'refill': return 'bg-purple-100 text-purple-800';
      case 'coals_needed': return 'bg-orange-100 text-orange-800';
      case 'recovery': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: SessionStatus) => {
    switch (status) {
      case 'prep': return '🔧';
      case 'delivery': return '🚚';
      case 'service': return '✅';
      case 'refill': return '🥤';
      case 'coals_needed': return '🔥';
      case 'recovery': return '⚠️';
      case 'completed': return '🎉';
      case 'cancelled': return '❌';
      default: return '❓';
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-lg">{getStatusIcon(session.currentStatus)}</span>
          </div>
          <div>
            <h3 className="font-medium text-gray-900">
              Session {session.sessionId}
            </h3>
            <p className="text-sm text-gray-500">Table {session.tableId}</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.currentStatus)}`}>
          {session.currentStatus.replace('_', ' ').toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <span className="text-sm font-medium text-gray-700">Flavor Mix:</span>
          <div className="text-sm text-gray-900">{session.flavorMix}</div>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-700">Prep Staff:</span>
          <div className="text-sm text-gray-900">{session.staffAssigned.prep}</div>
        </div>
        {session.staffAssigned.front && (
          <div>
            <span className="text-sm font-medium text-gray-700">Front Staff:</span>
            <div className="text-sm text-gray-900">{session.staffAssigned.front}</div>
          </div>
        )}
        {session.staffAssigned.hookah_room && (
          <div>
            <span className="text-sm font-medium text-gray-700">Hookah Room:</span>
            <div className="text-sm text-gray-900">{session.staffAssigned.hookah_room}</div>
          </div>
        )}
      </div>

      {/* Service Statistics */}
      {session.serviceStage.isActive && (
        <div className="bg-blue-50 p-3 rounded-lg mb-3">
          <div className="text-sm text-blue-800">
            <strong>Service Stats:</strong> {session.serviceStage.refillCount} refills, {session.serviceStage.charcoalSwaps} coal swaps, {session.serviceStage.coalBurnoutCount} coal burnouts
          </div>
        </div>
      )}

      {/* Demo Mode Status */}
      {session.demoMode && (
        <div className="bg-yellow-50 p-3 rounded-lg mb-3">
          <div className="text-sm text-yellow-800">
            <strong>Demo Mode:</strong> Cycle {session.sessionTimer?.currentCycle || 0} - {session.currentStatus === 'service' && '🔄 Running 30s cycle'}
            {session.currentStatus === 'refill' && '⏳ 15s refill period'}
            {session.currentStatus === 'coals_needed' && '⏳ 10s coal replacement'}
          </div>
        </div>
      )}

      {/* Session Timer Info */}
      {session.sessionTimer && (
        <div className="text-xs text-gray-500">
          {session.sessionTimer.armedAt && (
            <span>Armed: {session.sessionTimer.armedAt.toLocaleTimeString()} </span>
          )}
          {session.sessionTimer.startedAt && (
            <span>Started: {session.sessionTimer.startedAt.toLocaleTimeString()} </span>
          )}
          {session.sessionTimer.duration && (
            <span>Duration: {session.sessionTimer.duration}min </span>
          )}
        </div>
      )}
    </div>
  );
}

// Event Card Component
function EventCard({ event }: { event: WorkflowEvent }) {
  const getButtonColor = (button: string) => {
    if (['prep_started', 'flavor_locked', 'session_timer_armed', 'ready_for_delivery'].includes(button)) {
      return 'bg-blue-100 text-blue-800';
    }
    if (['picked_up', 'delivered', 'customer_confirmed', 'refill_delivered', 'coals_delivered'].includes(button)) {
      return 'bg-green-100 text-green-800';
    }
    if (['hold', 'redo_remix', 'return_to_prep'].includes(button)) {
      return 'bg-red-100 text-red-800';
    }
    if (['swap_charcoal'].includes(button)) {
      return 'bg-yellow-100 text-yellow-800';
    }
    if (['refill_requested'].includes(button)) {
      return 'bg-purple-100 text-purple-800';
    }
    if (['coals_burned_out'].includes(button)) {
      return 'bg-orange-100 text-orange-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getButtonColor(event.buttonPressed)}`}>
            {event.buttonPressed.replace('_', ' ').toUpperCase()}
          </span>
          <span className="text-sm font-medium text-gray-900">
            Session {event.sessionId}
          </span>
        </div>
        <div className="text-xs text-gray-500">
          {event.timestamp.toLocaleTimeString()}
        </div>
      </div>
      
      <div className="text-sm text-gray-600">
        <span className="font-medium">{event.staffRole}</span> staff member pressed{' '}
        <span className="font-medium">{event.buttonPressed.replace('_', ' ')}</span>
      </div>
      
      {event.metadata?.reason && (
        <div className="mt-2 text-xs text-gray-500">
          Reason: {event.metadata.reason}
        </div>
      )}
    </div>
  );
}
