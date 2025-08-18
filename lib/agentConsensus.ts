// MVP Agent Consensus System — Hookah+ (Agent-Ready v0.4)
// Agents: Aliethia (Memory), EP (Payments), Navigator (UX), Sentinel (Trust)
// Consensus triggers when ≥3 agents issue green pulses within same operational cycle

export interface AgentPulse {
  agentId: string;
  status: 'green' | 'amber' | 'red';
  message: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface ReflexScore {
  score: number;
  confirmedOrders: number;
  returningCustomers: number;
  anomalyFlags: number;
  trustLockUptime: number;
  lastUpdate: number;
}

export interface ConsensusState {
  agents: {
    aliethia: AgentPulse;
    ep: AgentPulse;
    navigator: AgentPulse;
    sentinel: AgentPulse;
  };
  consensus: boolean;
  reflexScore: ReflexScore;
  lastCycle: number;
  cycleCount: number;
}

export class AgentConsensus {
  private state: ConsensusState;
  private listeners: Set<(state: ConsensusState) => void> = new Set();
  private cycleInterval: NodeJS.Timeout | null = null;
  private readonly CYCLE_DURATION = 5000; // 5 second operational cycles
  private readonly CONSENSUS_THRESHOLD = 3; // ≥3 green pulses required

  constructor() {
    this.state = this.initializeState();
    this.startOperationalCycle();
  }

  private initializeState(): ConsensusState {
    return {
      agents: {
        aliethia: this.createAgentPulse('aliethia', 'amber', 'Scaffolding flavor memory logs...'),
        ep: this.createAgentPulse('ep', 'amber', 'Initializing Stripe Checkout...'),
        navigator: this.createAgentPulse('navigator', 'amber', 'Spinning Lounge Dashboard...'),
        sentinel: this.createAgentPulse('sentinel', 'amber', 'Enforcing Trust Bloom layers...'),
      },
      consensus: false,
      reflexScore: {
        score: 75,
        confirmedOrders: 0,
        returningCustomers: 0,
        anomalyFlags: 0,
        trustLockUptime: 0,
        lastUpdate: Date.now(),
      },
      lastCycle: Date.now(),
      cycleCount: 0,
    };
  }

  private createAgentPulse(agentId: string, status: 'green' | 'amber' | 'red', message: string): AgentPulse {
    return {
      agentId,
      status,
      message,
      timestamp: Date.now(),
      metadata: {},
    };
  }

  // Agent Pulse Methods
  public aliethiaPulse(status: 'green' | 'amber' | 'red', message: string, metadata?: Record<string, any>) {
    this.state.agents.aliethia = this.createAgentPulse('aliethia', status, message);
    if (metadata) this.state.agents.aliethia.metadata = metadata;
    this.evaluateConsensus();
    this.broadcastUpdate();
  }

  public epPulse(status: 'green' | 'amber' | 'red', message: string, metadata?: Record<string, any>) {
    this.state.agents.ep = this.createAgentPulse('ep', status, message);
    if (metadata) this.state.agents.ep.metadata = metadata;
    
    // Update Reflex Score based on EP status
    if (status === 'green' && metadata?.orderConfirmed) {
      this.state.reflexScore.confirmedOrders++;
      this.state.reflexScore.score = Math.min(100, this.state.reflexScore.score + 1);
    }
    if (status === 'green' && metadata?.returningCustomer) {
      this.state.reflexScore.returningCustomers++;
      this.state.reflexScore.score = Math.min(100, this.state.reflexScore.score + 2);
    }
    if (status === 'red' && metadata?.anomalyFlag) {
      this.state.reflexScore.anomalyFlags++;
      this.state.reflexScore.score = Math.max(0, this.state.reflexScore.score - 1);
    }
    
    this.evaluateConsensus();
    this.broadcastUpdate();
  }

  public navigatorPulse(status: 'green' | 'amber' | 'red', message: string, metadata?: Record<string, any>) {
    this.state.agents.navigator = this.createAgentPulse('navigator', status, message);
    if (metadata) this.state.agents.navigator.metadata = metadata;
    
    // Update Reflex Score for seamless operator actions
    if (status === 'green' && metadata?.seamlessAction) {
      this.state.reflexScore.score = Math.min(100, this.state.reflexScore.score + 1);
    }
    
    this.evaluateConsensus();
    this.broadcastUpdate();
  }

  public sentinelPulse(status: 'green' | 'amber' | 'red', message: string, metadata?: Record<string, any>) {
    this.state.agents.sentinel = this.createAgentPulse('sentinel', status, message);
    if (metadata) this.state.agents.sentinel.metadata = metadata;
    
    // Update trust-lock uptime
    if (metadata?.trustLockUptime !== undefined) {
      this.state.reflexScore.trustLockUptime = metadata.trustLockUptime;
    }
    
    this.evaluateConsensus();
    this.broadcastUpdate();
  }

  private evaluateConsensus() {
    const greenPulses = Object.values(this.state.agents).filter(agent => agent.status === 'green').length;
    this.state.consensus = greenPulses >= this.CONSENSUS_THRESHOLD;
    
    if (this.state.consensus) {
      this.state.reflexScore.lastUpdate = Date.now();
    }
  }

  private startOperationalCycle() {
    this.cycleInterval = setInterval(() => {
      this.state.cycleCount++;
      this.state.lastCycle = Date.now();
      
      // Simulate agent activities during operational cycles
      this.simulateAgentActivities();
      
      // Broadcast cycle update
      this.broadcastUpdate();
    }, this.CYCLE_DURATION);
  }

  private simulateAgentActivities() {
    // Simulate real-world agent behaviors
    const now = Date.now();
    
    // EP: Simulate order processing
    if (Math.random() > 0.7) {
      this.epPulse('green', 'Order confirmed', {
        orderConfirmed: true,
        returningCustomer: Math.random() > 0.8,
        anomalyFlag: false,
      });
    }
    
    // Navigator: Simulate UX interactions
    if (Math.random() > 0.8) {
      this.navigatorPulse('green', 'Seamless operator action', {
        seamlessAction: true,
        sessionId: `session_${now}`,
      });
    }
    
    // Sentinel: Simulate trust validation
    if (Math.random() > 0.9) {
      this.sentinelPulse('green', 'Trust-lock validated', {
        trustLockUptime: Math.min(100, this.state.reflexScore.trustLockUptime + 0.1),
        sessionKey: `key_${now}`,
      });
    }
    
    // Aliethia: Simulate memory scaffolding (dormant until stability)
    if (this.state.reflexScore.confirmedOrders >= 3) {
      this.aliethiaPulse('green', 'Flavor memory logs active', {
        stabilityThreshold: 'met',
        qrCycles: this.state.reflexScore.confirmedOrders,
      });
    }
  }

  // Public API
  public getState(): ConsensusState {
    return { ...this.state };
  }

  public subscribe(listener: (state: ConsensusState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private broadcastUpdate() {
    this.listeners.forEach(listener => listener(this.getState()));
  }

  // Manual agent triggers for testing
  public triggerOrder(orderData: { customerId: string; flavor: string; amount: number }) {
    // EP processes order
    this.epPulse('green', 'Order processed', {
      orderConfirmed: true,
      customerId: orderData.customerId,
      flavor: orderData.flavor,
      amount: orderData.amount,
    });
    
    // Sentinel validates
    this.sentinelPulse('green', 'Order trust-locked', {
      trustLockUptime: Math.min(100, this.state.reflexScore.trustLockUptime + 0.5),
      sessionKey: `order_${Date.now()}`,
    });
    
    // Navigator updates dashboard
    this.navigatorPulse('green', 'Dashboard updated', {
      seamlessAction: true,
      orderId: `order_${Date.now()}`,
    });
  }

  public destroy() {
    if (this.cycleInterval) {
      clearInterval(this.cycleInterval);
    }
    this.listeners.clear();
  }
}

// Global instance
export const agentConsensus = new AgentConsensus();

// Export for use in components
export default agentConsensus;
