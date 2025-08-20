import { EventEmitter } from 'events';

// 🔑 Core Workflow Button Language Types
export type WorkflowButton = 
  // Prep Room → Front Staff
  | 'prep_started'      // signals staff that hookah is in assembly
  | 'flavor_locked'     // confirms chosen flavor/mix is final and logged
  | 'session_timer_armed' // back staff sets session start (not yet delivered)
  | 'ready_for_delivery'  // triggers notification to front staff
  
  // Front Staff → Delivery/Customer
  | 'picked_up'         // floor staff acknowledges taking hookah from prep
  | 'delivered'          // hookah placed at table, session officially started
  | 'customer_confirmed' // optional button if customer verifies order
  
  // ⚠️ Edge Case Buttons (Rescue & Recovery)
  | 'hold'               // prep paused (e.g., customer changes mind or delay)
  | 'redo_remix'         // flavor or equipment error requires remake
  | 'swap_charcoal'      // mid-session service handoff
  | 'cancel'             // order dropped before delivery
  | 'return_to_prep';    // hookah sent back after delivery issue

export type StaffRole = 'prep' | 'front' | 'customer';
export type SessionStatus = 'prep' | 'delivery' | 'service' | 'recovery' | 'completed' | 'cancelled';

// 🔄 Cursor / Agent Event Interface
export interface WorkflowEvent {
  sessionId: string;
  staffRole: StaffRole;
  timestamp: Date;
  statusTag: SessionStatus;
  buttonPressed: WorkflowButton;
  metadata?: Record<string, any>;
  previousState?: SessionState;
  newState: SessionState;
}

// Session State Interface
export interface SessionState {
  sessionId: string;
  currentStatus: SessionStatus;
  prepStage: PrepStage;
  deliveryStage: DeliveryStage;
  serviceStage: ServiceStage;
  recoveryStage?: RecoveryStage;
  createdAt: Date;
  updatedAt: Date;
  staffAssigned: {
    prep?: string;
    front?: string;
  };
  flavorMix: string;
  tableId: string;
  sessionTimer?: {
    armedAt?: Date;
    startedAt?: Date;
    duration?: number; // in minutes
  };
}

export interface PrepStage {
  isStarted: boolean;
  isFlavorLocked: boolean;
  isTimerArmed: boolean;
  isReadyForDelivery: boolean;
  startedAt?: Date;
  flavorLockedAt?: Date;
  timerArmedAt?: Date;
  readyForDeliveryAt?: Date;
}

export interface DeliveryStage {
  isPickedUp: boolean;
  isDelivered: boolean;
  isCustomerConfirmed: boolean;
  pickedUpAt?: Date;
  deliveredAt?: Date;
  customerConfirmedAt?: Date;
}

export interface ServiceStage {
  isActive: boolean;
  startedAt?: Date;
  duration: number; // in minutes
  charcoalSwaps: number;
  lastCharcoalSwap?: Date;
}

export interface RecoveryStage {
  reason: string;
  initiatedAt: Date;
  resolvedAt?: Date;
  actionTaken: string;
}

// 🔄 Workflow State Machine
export class FireSessionWorkflow extends EventEmitter {
  private sessions: Map<string, SessionState> = new Map();
  private eventHistory: WorkflowEvent[] = [];

  constructor() {
    super();
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    // Emit events for cursor/agent consumption
    this.on('workflowEvent', (event: WorkflowEvent) => {
      this.eventHistory.push(event);
      this.emit('cursorEvent', event);
      this.emit('agentEvent', event);
    });
  }

  // 🚀 Create New Fire Session
  createSession(sessionId: string, tableId: string, flavorMix: string, prepStaffId: string): SessionState {
    const session: SessionState = {
      sessionId,
      currentStatus: 'prep',
      prepStage: {
        isStarted: false,
        isFlavorLocked: false,
        isTimerArmed: false,
        isReadyForDelivery: false
      },
      deliveryStage: {
        isPickedUp: false,
        isDelivered: false,
        isCustomerConfirmed: false
      },
      serviceStage: {
        isActive: false,
        duration: 0,
        charcoalSwaps: 0
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      staffAssigned: { prep: prepStaffId },
      flavorMix,
      tableId
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  // 🔑 Button Press Handlers
  pressButton(
    sessionId: string, 
    button: WorkflowButton, 
    staffRole: StaffRole, 
    staffId: string,
    metadata?: Record<string, any>
  ): WorkflowEvent | null {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const previousState = { ...session };
    const event = this.processButtonPress(session, button, staffRole, staffId, metadata);
    
    if (event) {
      this.emit('workflowEvent', event);
      return event;
    }

    return null;
  }

  private processButtonPress(
    session: SessionState, 
    button: WorkflowButton, 
    staffRole: StaffRole, 
    staffId: string,
    metadata?: Record<string, any>
  ): WorkflowEvent | null {
    const timestamp = new Date();
    session.updatedAt = timestamp;

    switch (button) {
      // 🔧 Prep Room Buttons
      case 'prep_started':
        if (staffRole !== 'prep') return null;
        session.prepStage.isStarted = true;
        session.prepStage.startedAt = timestamp;
        break;

      case 'flavor_locked':
        if (staffRole !== 'prep') return null;
        session.prepStage.isFlavorLocked = true;
        session.prepStage.flavorLockedAt = timestamp;
        break;

      case 'session_timer_armed':
        if (staffRole !== 'prep') return null;
        session.prepStage.isTimerArmed = true;
        session.prepStage.timerArmedAt = timestamp;
        session.sessionTimer = {
          armedAt: timestamp,
          duration: metadata?.duration || 60 // default 60 minutes
        };
        break;

      case 'ready_for_delivery':
        if (staffRole !== 'prep') return null;
        session.prepStage.isReadyForDelivery = true;
        session.prepStage.readyForDeliveryAt = timestamp;
        session.currentStatus = 'delivery';
        break;

      // 🚚 Front Staff Buttons
      case 'picked_up':
        if (staffRole !== 'front') return null;
        session.deliveryStage.isPickedUp = true;
        session.deliveryStage.pickedUpAt = timestamp;
        session.staffAssigned.front = staffId;
        break;

      case 'delivered':
        if (staffRole !== 'front') return null;
        session.deliveryStage.isDelivered = true;
        session.deliveryStage.deliveredAt = timestamp;
        session.currentStatus = 'service';
        session.serviceStage.isActive = true;
        session.serviceStage.startedAt = timestamp;
        if (session.sessionTimer?.armedAt) {
          session.sessionTimer.startedAt = timestamp;
        }
        break;

      case 'customer_confirmed':
        if (staffRole !== 'customer') return null;
        session.deliveryStage.isCustomerConfirmed = true;
        session.deliveryStage.customerConfirmedAt = timestamp;
        break;

      // ⚠️ Edge Case Buttons
      case 'hold':
        session.currentStatus = 'recovery';
        session.recoveryStage = {
          reason: metadata?.reason || 'Session paused',
          initiatedAt: timestamp,
          actionTaken: 'Session placed on hold'
        };
        break;

      case 'redo_remix':
        session.currentStatus = 'recovery';
        session.recoveryStage = {
          reason: metadata?.reason || 'Flavor or equipment error',
          initiatedAt: timestamp,
          actionTaken: 'Hookah remake required'
        };
        // Reset prep stage
        session.prepStage = {
          isStarted: false,
          isFlavorLocked: false,
          isTimerArmed: false,
          isReadyForDelivery: false
        };
        break;

      case 'swap_charcoal':
        if (session.currentStatus === 'service') {
          session.serviceStage.charcoalSwaps++;
          session.serviceStage.lastCharcoalSwap = timestamp;
        }
        break;

      case 'cancel':
        session.currentStatus = 'cancelled';
        break;

      case 'return_to_prep':
        session.currentStatus = 'recovery';
        session.recoveryStage = {
          reason: metadata?.reason || 'Delivery issue',
          initiatedAt: timestamp,
          actionTaken: 'Hookah returned to prep room'
        };
        // Reset delivery stage
        session.deliveryStage = {
          isPickedUp: false,
          isDelivered: false,
          isCustomerConfirmed: false
        };
        session.currentStatus = 'prep';
        break;

      default:
        return null;
    }

    // Create and return event
    const event: WorkflowEvent = {
      sessionId: session.sessionId,
      staffRole,
      timestamp,
      statusTag: session.currentStatus,
      buttonPressed: button,
      metadata,
      previousState: previousState,
      newState: { ...session }
    };

    return event;
  }

  // 📊 Query Methods for Agents/Dashboards
  getSession(sessionId: string): SessionState | undefined {
    return this.sessions.get(sessionId);
  }

  getSessionsByStatus(status: SessionStatus): SessionState[] {
    return Array.from(this.sessions.values()).filter(s => s.currentStatus === status);
  }

  getSessionsByStaff(staffId: string): SessionState[] {
    return Array.from(this.sessions.values()).filter(s => 
      s.staffAssigned.prep === staffId || s.staffAssigned.front === staffId
    );
  }

  getEventHistory(sessionId?: string): WorkflowEvent[] {
    if (sessionId) {
      return this.eventHistory.filter(e => e.sessionId === sessionId);
    }
    return this.eventHistory;
  }

  // 🔄 Cursor/Agent Event Subscription
  subscribeToCursorEvents(callback: (event: WorkflowEvent) => void): () => void {
    this.on('cursorEvent', callback);
    return () => this.off('cursorEvent', callback);
  }

  subscribeToAgentEvents(callback: (event: WorkflowEvent) => void): () => void {
    this.on('agentEvent', callback);
    return () => this.off('agentEvent', callback);
  }

  // 📈 Analytics and Pattern Analysis
  getSessionMetrics(): {
    totalSessions: number;
    sessionsByStatus: Record<SessionStatus, number>;
    averagePrepTime: number;
    averageDeliveryTime: number;
    recoveryRate: number;
    frequentIssues: Array<{ issue: string; count: number }>;
  } {
    const sessions = Array.from(this.sessions.values());
    const totalSessions = sessions.length;
    
    const sessionsByStatus = sessions.reduce((acc, s) => {
      acc[s.currentStatus] = (acc[s.currentStatus] || 0) + 1;
      return acc;
    }, {} as Record<SessionStatus, number>);

    // Calculate average prep time
    const prepTimes = sessions
      .filter(s => s.prepStage.startedAt && s.prepStage.readyForDeliveryAt)
      .map(s => s.prepStage.readyForDeliveryAt!.getTime() - s.prepStage.startedAt!.getTime());
    
    const averagePrepTime = prepTimes.length > 0 
      ? prepTimes.reduce((a, b) => a + b, 0) / prepTimes.length 
      : 0;

    // Calculate average delivery time
    const deliveryTimes = sessions
      .filter(s => s.deliveryStage.pickedUpAt && s.deliveryStage.deliveredAt)
      .map(s => s.deliveryStage.deliveredAt!.getTime() - s.deliveryStage.pickedUpAt!.getTime());
    
    const averageDeliveryTime = deliveryTimes.length > 0 
      ? deliveryTimes.reduce((a, b) => a + b, 0) / deliveryTimes.length 
      : 0;

    // Calculate recovery rate
    const recoveryRate = totalSessions > 0 
      ? (sessionsByStatus.recovery || 0) / totalSessions 
      : 0;

    // Find frequent issues
    const issueCounts = this.eventHistory
      .filter(e => ['redo_remix', 'return_to_prep', 'hold'].includes(e.buttonPressed))
      .reduce((acc, e) => {
        acc[e.buttonPressed] = (acc[e.buttonPressed] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const frequentIssues = Object.entries(issueCounts)
      .map(([issue, count]) => ({ issue, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalSessions,
      sessionsByStatus,
      averagePrepTime,
      averageDeliveryTime,
      recoveryRate,
      frequentIssues
    };
  }
}

// 🎯 Singleton Instance for Global Access
export const fireSessionWorkflow = new FireSessionWorkflow();
