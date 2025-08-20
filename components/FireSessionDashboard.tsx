'use client';

import React, { useState, useEffect } from 'react';
import { 
  fireSessionWorkflow, 
  SessionState, 
  SessionStatus, 
  WorkflowEvent 
} from '../lib/fire-session-workflow';

interface FireSessionDashboardProps {
  staffRole: 'prep' | 'front';
  staffId: string;
}

export default function FireSessionDashboard({ 
  staffRole, 
  staffId 
}: FireSessionDashboardProps) {
  const [sessions, setSessions] = useState<SessionState[]>([]);
  const [filterStatus, setFilterStatus] = useState<SessionStatus | 'all'>('all');
  const [metrics, setMetrics] = useState<any>(null);
  const [recentEvents, setRecentEvents] = useState<WorkflowEvent[]>([]);

  // 🔄 Subscribe to workflow events
  useEffect(() => {
    const unsubscribe = fireSessionWorkflow.subscribeToAgentEvents((event) => {
      // Update sessions list
      const updatedSessions = Array.from(fireSessionWorkflow.getSessionsByStaff(staffId));
      setSessions(updatedSessions);

      // Update recent events
      const events = fireSessionWorkflow.getEventHistory();
      setRecentEvents(events.slice(-10).reverse());

      // Update metrics
      setMetrics(fireSessionWorkflow.getSessionMetrics());
    });

    // Load initial data
    const initialSessions = fireSessionWorkflow.getSessionsByStaff(staffId);
    setSessions(initialSessions);
    setMetrics(fireSessionWorkflow.getSessionMetrics());

    return unsubscribe;
  }, [staffId]);

  // Filter sessions by status
  const filteredSessions = filterStatus === 'all' 
    ? sessions 
    : sessions.filter(s => s.currentStatus === filterStatus);

  const statusOptions: { value: SessionStatus | 'all'; label: string; color: string }[] = [
    { value: 'all', label: 'All Sessions', color: 'bg-gray-500' },
    { value: 'prep', label: 'Prep', color: 'bg-blue-500' },
    { value: 'delivery', label: 'Delivery', color: 'bg-yellow-500' },
    { value: 'service', label: 'Service', color: 'bg-green-500' },
    { value: 'recovery', label: 'Recovery', color: 'bg-red-500' },
    { value: 'completed', label: 'Completed', color: 'bg-purple-500' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-gray-400' }
  ];

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {staffRole === 'prep' ? 'Prep Room' : 'Front Staff'} Dashboard
          </h1>
          <div className="text-sm text-gray-500">
            Staff ID: {staffId}
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex space-x-2 mb-4">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilterStatus(option.value)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filterStatus === option.value
                  ? `${option.color} text-white`
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Quick Stats */}
        {metrics && (
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{metrics.totalSessions}</div>
              <div className="text-sm text-blue-700">Total Sessions</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(metrics.averagePrepTime / 1000 / 60)}m
              </div>
              <div className="text-sm text-green-700">Avg Prep Time</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {Math.round(metrics.averageDeliveryTime / 1000 / 60)}m
              </div>
              <div className="text-sm text-yellow-700">Avg Delivery Time</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-600">
                {Math.round(metrics.recoveryRate * 100)}%
              </div>
              <div className="text-sm text-red-700">Recovery Rate</div>
            </div>
          </div>
        )}
      </div>

      {/* Active Sessions */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Active Sessions ({filteredSessions.length})
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredSessions.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No sessions found with the selected filter.
            </div>
          ) : (
            filteredSessions.map((session) => (
              <SessionCard 
                key={session.sessionId} 
                session={session} 
                staffRole={staffRole}
              />
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
      {metrics?.frequentIssues && metrics.frequentIssues.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Frequent Issues</h2>
          </div>
          
          <div className="p-6">
            <div className="space-y-3">
              {metrics.frequentIssues.map((issue: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 capitalize">
                    {issue.issue.replace('_', ' ')}
                  </span>
                  <span className="text-sm font-medium text-red-600">
                    {issue.count} times
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 🃏 Session Card Component
interface SessionCardProps {
  session: SessionState;
  staffRole: 'prep' | 'front';
}

function SessionCard({ session, staffRole }: SessionCardProps) {
  const getStatusColor = (status: SessionStatus) => {
    switch (status) {
      case 'prep': return 'bg-blue-100 text-blue-800';
      case 'delivery': return 'bg-yellow-100 text-yellow-800';
      case 'service': return 'bg-green-100 text-green-800';
      case 'recovery': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getNextAction = () => {
    if (staffRole === 'prep') {
      if (!session.prepStage.isStarted) return 'Start Prep';
      if (!session.prepStage.isFlavorLocked) return 'Lock Flavor';
      if (!session.prepStage.isTimerArmed) return 'Arm Timer';
      if (!session.prepStage.isReadyForDelivery) return 'Ready for Delivery';
      return 'Waiting for Pickup';
    } else {
      if (session.prepStage.isReadyForDelivery && !session.deliveryStage.isPickedUp) {
        return 'Pick Up Hookah';
      }
      if (session.deliveryStage.isPickedUp && !session.deliveryStage.isDelivered) {
        return 'Deliver to Table';
      }
      return 'Monitor Service';
    }
  };

  return (
    <div className="p-6 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-medium text-gray-900">
            Session {session.sessionId}
          </h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.currentStatus)}`}>
            {session.currentStatus.toUpperCase()}
          </span>
        </div>
        <div className="text-sm text-gray-500">
          Table {session.tableId}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <span className="text-sm font-medium text-gray-700">Flavor Mix:</span>
          <div className="text-sm text-gray-900">{session.flavorMix}</div>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-700">Next Action:</span>
          <div className="text-sm text-blue-600 font-medium">{getNextAction()}</div>
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
      </div>

      {/* Progress Indicators */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${session.prepStage.isStarted ? 'bg-green-500' : 'bg-gray-300'}`} />
          <span className="text-xs text-gray-600">Prep Started</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${session.prepStage.isFlavorLocked ? 'bg-green-500' : 'bg-gray-300'}`} />
          <span className="text-xs text-gray-600">Flavor Locked</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${session.prepStage.isTimerArmed ? 'bg-green-500' : 'bg-gray-300'}`} />
          <span className="text-xs text-gray-600">Timer Armed</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${session.prepStage.isReadyForDelivery ? 'bg-green-500' : 'bg-gray-300'}`} />
          <span className="text-xs text-gray-600">Ready for Delivery</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${session.deliveryStage.isPickedUp ? 'bg-green-500' : 'bg-gray-300'}`} />
          <span className="text-xs text-gray-600">Picked Up</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${session.deliveryStage.isDelivered ? 'bg-green-500' : 'bg-gray-300'}`} />
          <span className="text-xs text-gray-600">Delivered</span>
        </div>
      </div>

      {session.recoveryStage && (
        <div className="mt-4 p-3 bg-red-50 rounded-lg">
          <div className="text-sm font-medium text-red-800">Recovery Required</div>
          <div className="text-sm text-red-700">{session.recoveryStage.reason}</div>
          <div className="text-xs text-red-600 mt-1">
            {session.recoveryStage.initiatedAt.toLocaleTimeString()}
          </div>
        </div>
      )}
    </div>
  );
}

// 📊 Event Card Component
interface EventCardProps {
  event: WorkflowEvent;
}

function EventCard({ event }: EventCardProps) {
  const getButtonColor = (button: string) => {
    if (['prep_started', 'flavor_locked', 'session_timer_armed', 'ready_for_delivery'].includes(button)) {
      return 'bg-blue-100 text-blue-800';
    }
    if (['picked_up', 'delivered', 'customer_confirmed'].includes(button)) {
      return 'bg-green-100 text-green-800';
    }
    if (['hold', 'redo_remix', 'return_to_prep'].includes(button)) {
      return 'bg-red-100 text-red-800';
    }
    if (['swap_charcoal'].includes(button)) {
      return 'bg-yellow-100 text-yellow-800';
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
