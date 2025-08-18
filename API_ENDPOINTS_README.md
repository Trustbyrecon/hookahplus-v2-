# API Endpoints Documentation 🚀

## Overview
This document describes all the API endpoints created for the Admin Control Center. All endpoints include mock data and are ready for backend integration.

## Base URL
```
http://localhost:3000/api
```

## Authentication
Currently, all endpoints are open. In production, implement proper authentication middleware.

---

## 📊 Admin KPIs

### GET `/api/admin/kpis`
Get key performance indicators for a specific lounge and time range.

**Query Parameters:**
- `lounge` (string): Lounge identifier (e.g., "Pilot #001")
- `range` (string): Time range (e.g., "Last 7 days")

**Response:**
```json
{
  "success": true,
  "data": {
    "sessions": 182,
    "revenue": 5430,
    "avgMarginPct": 41.7,
    "trustScore": 83
  },
  "lounge": "Pilot #001",
  "range": "Last 7 days",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Mock Data:** Includes randomization for realistic testing.

---

## 🔨 Development Commands

### POST `/api/admin/dev`
Trigger development environment startup.

**Request Body:**
```json
{
  "lounge": "Pilot #001",
  "range": "Last 7 days"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Dev environment triggered successfully",
  "data": {
    "status": "running",
    "lounge": "Pilot #001",
    "range": "Last 7 days",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "processId": "dev_1705312200000",
    "estimatedCompletion": "2024-01-15T10:30:30.000Z"
  }
}
```

### POST `/api/admin/build`
Trigger build process for production.

**Request Body:**
```json
{
  "lounge": "Pilot #001",
  "range": "Last 7 days",
  "environment": "staging"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Build process triggered successfully",
  "data": {
    "status": "building",
    "lounge": "Pilot #001",
    "range": "Last 7 days",
    "environment": "staging",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "buildId": "build_1705312200000",
    "estimatedCompletion": "2024-01-15T10:32:00.000Z",
    "steps": [
      "Dependencies installed",
      "TypeScript compilation",
      "Bundle optimization",
      "Asset generation",
      "Deployment preparation"
    ]
  }
}
```

---

## 📈 Orders & Profit Margins

### GET `/api/orders`
Get order data with profit margin analysis.

**Query Parameters:**
- `lounge` (string): Lounge identifier
- `range` (string): Time range

**Response:**
```json
{
  "success": true,
  "orders": [
    {
      "id": "m1",
      "item": "Mint Storm",
      "price": 32,
      "cost": 11,
      "sold": 58
    }
  ],
  "lounge": "Pilot #001",
  "range": "Last 7 days",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "summary": {
    "totalItems": 8,
    "totalSold": 309,
    "totalRevenue": 9456,
    "totalCost": 3120,
    "avgMargin": 66.9
  }
}
```

**Mock Data:** Includes 8 flavor items with realistic pricing and sales data.

---

## 🧠 Reflex Monitoring

### GET `/api/reflex-monitoring`
Get trust pulse data for reflex monitoring.

**Query Parameters:**
- `lounge` (string): Lounge identifier
- `range` (string): Time range

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "t": "Mon",
      "score": 78,
      "timestamp": "2024-01-09T10:30:00.000Z",
      "lounge": "Pilot #001",
      "range": "Last 7 days"
    }
  ],
  "lounge": "Pilot #001",
  "range": "Last 7 days",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "summary": {
    "currentScore": 83,
    "avgScore": 82.1,
    "trend": "up",
    "dataPoints": 8
  }
}
```

**Mock Data:** 7-day trust score history with real-time "Now" data point.

---

## 🔍 Reflex Control

### POST `/api/reflex/scan`
Trigger a reflex agent scan.

**Request Body:**
```json
{
  "lounge": "Pilot #001",
  "range": "Last 7 days"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Reflex scan completed successfully",
  "data": {
    "status": "completed",
    "lounge": "Pilot #001",
    "range": "Last 7 days",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "scanId": "scan_1705312200000",
    "results": {
      "totalAgents": 4,
      "agentsScanned": 4,
      "consensusScore": 87,
      "trustLevel": "high",
      "anomalies": 1,
      "recommendations": [
        "Agent EP performing optimally",
        "Agent Navigator showing slight drift",
        "Agent Sentinel stable",
        "Agent Aliethia calibrated"
      ]
    }
  }
}
```

### POST `/api/reflex/calibration/start`
Start reflex agent calibration.

**Request Body:**
```json
{
  "lounge": "Pilot #001"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Reflex calibration started successfully",
  "data": {
    "status": "calibrating",
    "lounge": "Pilot #001",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "calibrationId": "cal_1705312200000",
    "estimatedDuration": "5-10 minutes",
    "agents": [
      {
        "name": "EP",
        "status": "calibrating",
        "progress": 0
      }
    ],
    "targetConsensus": 0.85,
    "currentConsensus": 0.78
  }
}
```

### POST `/api/reflex/calibration/stop`
Stop reflex agent calibration.

**Request Body:**
```json
{
  "lounge": "Pilot #001"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Reflex calibration stopped successfully",
  "data": {
    "status": "stopped",
    "lounge": "Pilot #001",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "finalResults": {
      "consensusAchieved": 0.82,
      "targetConsensus": 0.85,
      "agentsCalibrated": 4,
      "totalDuration": "3 minutes 45 seconds",
      "finalAgentScores": {
        "EP": 0.89,
        "Navigator": 0.84,
        "Sentinel": 0.87,
        "Aliethia": 0.81
      }
    }
  }
}
```

---

## 🚀 MVP Control

### GET `/api/mvp/status`
Check MVP deployment readiness.

**Query Parameters:**
- `env` (string): Environment (dev|staging|prod)

**Response:**
```json
{
  "success": true,
  "data": {
    "environment": "staging",
    "readinessScore": 78,
    "timestamp": "2024-01-15T10:30:00.000Z",
    "status": "almost",
    "checks": {
      "Reflex Monitoring": true,
      "Profit Margins": true,
      "Admin Controls": true,
      "API Endpoints": false,
      "Security": false,
      "Performance": true
    },
    "recommendations": [
      "Complete reflex agent calibration",
      "Verify all API endpoints",
      "Run security audit",
      "Performance testing needed"
    ]
  }
}
```

**Scoring Logic:**
- **Dev**: 95 ± 5 (high readiness)
- **Staging**: 78 ± 15 (moderate readiness)
- **Prod**: 65 ± 20 (needs work)

---

## 🚀 Deployment Control

### POST `/api/deploy`
Trigger deployment to specified environment.

**Request Body:**
```json
{
  "env": "staging",
  "version": "0.0.1",
  "lounge": "Pilot #001"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Deployment initiated successfully",
  "data": {
    "status": "deploying",
    "environment": "staging",
    "version": "0.0.1",
    "lounge": "Pilot #001",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "deploymentId": "deploy_1705312200000",
    "estimatedCompletion": "2024-01-15T10:33:00.000Z",
    "steps": [
      {
        "name": "Pre-flight checks",
        "status": "completed",
        "duration": "15s"
      }
    ],
    "progress": 25,
    "logs": [
      "✅ Pre-flight checks completed",
      "🔨 Build compilation started"
    ]
  }
}
```

### POST `/api/deploy/rollback`
Rollback to previous version.

**Request Body:**
```json
{
  "env": "staging",
  "version": "0.0.1",
  "lounge": "Pilot #001"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Rollback initiated successfully",
  "data": {
    "status": "rolling-back",
    "environment": "staging",
    "fromVersion": "0.0.1",
    "toVersion": "0.0.0",
    "lounge": "Pilot #001",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "rollbackId": "rollback_1705312200000",
    "estimatedCompletion": "2024-01-15T10:31:30.000Z",
    "steps": [
      {
        "name": "Health assessment",
        "status": "completed",
        "duration": "10s"
      }
    ],
    "progress": 40,
    "logs": [
      "✅ Health assessment completed",
      "✅ Backup verification completed"
    ],
    "reason": "Performance degradation detected",
    "initiatedBy": "admin"
  }
}
```

---

## 🎯 Command Launcher Integration

### Server-Side Commands
The `lib/commandLauncher.ts` file provides server-side command execution:

```typescript
import { executeCommand } from '@/lib/commandLauncher';

// Execute commands
await executeCommand('admin.dev');
await executeCommand('admin.build');
await executeCommand('admin.reflex.scan', { lounge: 'Pilot #001' });
await executeCommand('admin.deploy', { env: 'staging' });
```

### Available Commands
- `admin.dev` - Start development environment
- `admin.build` - Build application
- `admin.reflex.scan` - Trigger reflex scan
- `admin.reflex.calibrate.start` - Start calibration
- `admin.reflex.calibrate.stop` - Stop calibration
- `admin.deploy` - Deploy to environment
- `admin.rollback` - Rollback deployment
- `admin.mvp.status` - Check MVP status
- `admin.status` - Get system status
- `admin.health` - Run health checks

---

## 🔧 Error Handling

All endpoints include comprehensive error handling:

```json
{
  "success": false,
  "error": "Error description",
  "fallback": "Fallback data if available"
}
```

**HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request
- `500` - Internal Server Error

---

## 📝 Implementation Notes

### Mock Data
- All endpoints include realistic mock data
- Data includes randomization for testing
- Timestamps are current and realistic

### Performance
- Simulated processing delays for realistic UX
- Async/await patterns for scalability
- Proper error boundaries and fallbacks

### Security
- Input validation on all endpoints
- Query parameter sanitization
- CORS headers for cross-origin requests

---

## 🚀 Next Steps

1. **Replace Mock Data**: Connect to actual database/storage
2. **Add Authentication**: Implement proper auth middleware
3. **Add Validation**: Input validation and sanitization
4. **Add Logging**: Comprehensive request/response logging
5. **Add Monitoring**: Health checks and metrics
6. **Add Rate Limiting**: Prevent abuse and ensure stability

---

## 📚 Related Files

- `app/admin/page.tsx` - Admin Control Center UI
- `lib/commandLauncher.ts` - Server-side command execution
- `ADMIN_CONTROL_CENTER.md` - Admin Center documentation
- `components/AdminNavHeader.tsx` - Navigation component

---

*Built with Next.js 14, TypeScript, and comprehensive error handling.*
