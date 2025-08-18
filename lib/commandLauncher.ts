// lib/commandLauncher.ts
// Command Launcher integration for Admin Control Center
// This file provides server-side command registration for automation

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Command registry type
type CommandRegistry = {
  [key: string]: (...args: any[]) => Promise<any>;
};

// HTTP client for API calls
async function httpCall(method: 'GET' | 'POST', url: string, data?: any) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const fullUrl = `${baseUrl}${url}`;
  
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data && method === 'POST') {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(fullUrl, options);
    return await response.json();
  } catch (error) {
    console.error(`HTTP ${method} error:`, error);
    throw error;
  }
}

// Command implementations
export const adminCommands: CommandRegistry = {
  // Development commands
  "admin.dev": async (args: any = {}) => {
    console.log('🚀 Starting development environment...');
    try {
      const result = await execAsync('pnpm dev');
      console.log('✅ Dev environment started:', result.stdout);
      return { success: true, message: 'Dev environment started', output: result.stdout };
    } catch (error) {
      console.error('❌ Failed to start dev environment:', error);
      throw error;
    }
  },

  "admin.build": async (args: any = {}) => {
    console.log('🔨 Starting build process...');
    try {
      const result = await execAsync('pnpm build');
      console.log('✅ Build completed:', result.stdout);
      return { success: true, message: 'Build completed', output: result.stdout };
    } catch (error) {
      console.error('❌ Build failed:', error);
      throw error;
    }
  },

  // Reflex monitoring commands
  "admin.reflex.scan": async (args: any = {}) => {
    console.log('🔍 Triggering reflex scan...', args);
    try {
      const result = await httpCall('POST', '/api/reflex/scan', args);
      console.log('✅ Reflex scan completed:', result);
      return result;
    } catch (error) {
      console.error('❌ Reflex scan failed:', error);
      throw error;
    }
  },

  "admin.reflex.calibrate.start": async (args: any = {}) => {
    console.log('🚀 Starting reflex calibration...', args);
    try {
      const result = await httpCall('POST', '/api/reflex/calibration/start', args);
      console.log('✅ Reflex calibration started:', result);
      return result;
    } catch (error) {
      console.error('❌ Failed to start calibration:', error);
      throw error;
    }
  },

  "admin.reflex.calibrate.stop": async (args: any = {}) => {
    console.log('🛑 Stopping reflex calibration...', args);
    try {
      const result = await httpCall('POST', '/api/reflex/calibration/stop', args);
      console.log('✅ Reflex calibration stopped:', result);
      return result;
    } catch (error) {
      console.error('❌ Failed to stop calibration:', error);
      throw error;
    }
  },

  // Deployment commands
  "admin.deploy": async (args: any = {}) => {
    console.log('🚀 Triggering deployment...', args);
    try {
      const result = await httpCall('POST', '/api/deploy', args);
      console.log('✅ Deployment initiated:', result);
      return result;
    } catch (error) {
      console.error('❌ Deployment failed:', error);
      throw error;
    }
  },

  "admin.rollback": async (args: any = {}) => {
    console.log('🔄 Triggering rollback...', args);
    try {
      const result = await httpCall('POST', '/api/deploy/rollback', args);
      console.log('✅ Rollback initiated:', result);
      return result;
    } catch (error) {
      console.error('❌ Rollback failed:', error);
      throw error;
    }
  },

  // Status commands
  "admin.mvp.status": async (args: any = {}) => {
    console.log('📊 Checking MVP status...', args);
    try {
      const queryParams = new URLSearchParams(args).toString();
      const result = await httpCall('GET', `/api/mvp/status?${queryParams}`);
      console.log('✅ MVP status retrieved:', result);
      return result;
    } catch (error) {
      console.error('❌ Failed to get MVP status:', error);
      throw error;
    }
  },

  // Utility commands
  "admin.status": async () => {
    console.log('📊 Checking system status...');
    try {
      const [kpis, mvpStatus] = await Promise.all([
        httpCall('GET', '/api/admin/kpis?lounge=Pilot%20%23001&range=Last%207%20days'),
        httpCall('GET', '/api/mvp/status?env=staging')
      ]);
      
      const status = {
        timestamp: new Date().toISOString(),
        kpis: kpis.data,
        mvpStatus: mvpStatus.data,
        systemHealth: 'operational'
      };
      
      console.log('✅ System status:', status);
      return status;
    } catch (error) {
      console.error('❌ Failed to get system status:', error);
      throw error;
    }
  },

  "admin.health": async () => {
    console.log('🏥 Running health check...');
    try {
      const healthChecks = await Promise.allSettled([
        httpCall('GET', '/api/admin/kpis?lounge=Pilot%20%23001&range=Last%207%20days'),
        httpCall('GET', '/api/reflex-monitoring?lounge=Pilot%20%23001&range=Last%207%20days'),
        httpCall('GET', '/api/mvp/status?env=staging')
      ]);

      const results = healthChecks.map((result, index) => {
        const endpoints = ['KPIs', 'Reflex Monitoring', 'MVP Status'];
        return {
          endpoint: endpoints[index],
          status: result.status === 'fulfilled' ? 'healthy' : 'unhealthy',
          error: result.status === 'rejected' ? result.reason : null
        };
      });

      const overallHealth = results.every(r => r.status === 'healthy') ? 'healthy' : 'degraded';
      
      const health = {
        timestamp: new Date().toISOString(),
        overall: overallHealth,
        checks: results
      };

      console.log('✅ Health check completed:', health);
      return health;
    } catch (error) {
      console.error('❌ Health check failed:', error);
      throw error;
    }
  }
};

// Command executor
export async function executeCommand(command: string, args: any = {}) {
  if (!adminCommands[command]) {
    throw new Error(`Unknown command: ${command}`);
  }

  try {
    console.log(`🎯 Executing command: ${command}`, args);
    const result = await adminCommands[command](args);
    console.log(`✅ Command ${command} completed successfully`);
    return result;
  } catch (error) {
    console.error(`❌ Command ${command} failed:`, error);
    throw error;
  }
}

// Command list getter
export function getAvailableCommands(): string[] {
  return Object.keys(adminCommands);
}

// Command help
export function getCommandHelp(command?: string): any {
  if (command) {
    if (!adminCommands[command]) {
      return { error: `Unknown command: ${command}` };
    }
    
    const help = {
      command,
      description: getCommandDescription(command),
      usage: getCommandUsage(command),
      examples: getCommandExamples(command)
    };
    
    return help;
  }

  return {
    availableCommands: getAvailableCommands(),
    totalCommands: getAvailableCommands().length,
    categories: {
      'Development': ['admin.dev', 'admin.build'],
      'Reflex Monitoring': ['admin.reflex.scan', 'admin.reflex.calibrate.start', 'admin.reflex.calibrate.stop'],
      'Deployment': ['admin.deploy', 'admin.rollback'],
      'Status': ['admin.mvp.status', 'admin.status', 'admin.health']
    }
  };
}

function getCommandDescription(command: string): string {
  const descriptions: { [key: string]: string } = {
    'admin.dev': 'Start the development environment',
    'admin.build': 'Build the application for production',
    'admin.reflex.scan': 'Trigger a reflex agent scan',
    'admin.reflex.calibrate.start': 'Start reflex agent calibration',
    'admin.reflex.calibrate.stop': 'Stop reflex agent calibration',
    'admin.deploy': 'Deploy to specified environment',
    'admin.rollback': 'Rollback to previous version',
    'admin.mvp.status': 'Check MVP deployment readiness',
    'admin.status': 'Get overall system status',
    'admin.health': 'Run comprehensive health checks'
  };
  
  return descriptions[command] || 'No description available';
}

function getCommandUsage(command: string): string {
  const usage: { [key: string]: string } = {
    'admin.dev': 'admin.dev()',
    'admin.build': 'admin.build()',
    'admin.reflex.scan': 'admin.reflex.scan({ lounge: "Pilot #001", range: "Last 7 days" })',
    'admin.reflex.calibrate.start': 'admin.reflex.calibrate.start({ lounge: "Pilot #001" })',
    'admin.reflex.calibrate.stop': 'admin.reflex.calibrate.stop({ lounge: "Pilot #001" })',
    'admin.deploy': 'admin.deploy({ env: "staging", version: "0.0.1" })',
    'admin.rollback': 'admin.rollback({ env: "staging" })',
    'admin.mvp.status': 'admin.mvp.status({ env: "dev" })',
    'admin.status': 'admin.status()',
    'admin.health': 'admin.health()'
  };
  
  return usage[command] || 'Usage not available';
}

function getCommandExamples(command: string): string[] {
  const examples: { [key: string]: string[] } = {
    'admin.reflex.scan': [
      'admin.reflex.scan({ lounge: "Pilot #001", range: "Last 7 days" })',
      'admin.reflex.scan({ lounge: "Pilot #002", range: "Last 30 days" })'
    ],
    'admin.deploy': [
      'admin.deploy({ env: "staging", version: "0.0.1" })',
      'admin.deploy({ env: "prod", version: "1.0.0" })'
    ],
    'admin.mvp.status': [
      'admin.mvp.status({ env: "dev" })',
      'admin.mvp.status({ env: "staging" })',
      'admin.mvp.status({ env: "prod" })'
    ]
  };
  
  return examples[command] || [];
}

// Export for use in other modules
export default {
  executeCommand,
  getAvailableCommands,
  getCommandHelp,
  adminCommands
};
