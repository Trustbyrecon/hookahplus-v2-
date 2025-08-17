// app/api/reflex-monitoring/route.ts
import { NextResponse } from "next/server";
import { reflexOrchestrator } from "@/lib/reflex-orchestrator";

export async function GET() {
  try {
    const cycleStatus = reflexOrchestrator.getCycleStatus();
    const agentScores = reflexOrchestrator.getAgentScores();
    const consensus = reflexOrchestrator.getConsensus();
    const isMVPReady = reflexOrchestrator.isMVPReady();

    return NextResponse.json({
      success: true,
      cycle: cycleStatus,
      agents: agentScores,
      consensus,
      isMVPReady,
      timestamp: Date.now()
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'start_calibration':
        reflexOrchestrator.startCalibrationLoop();
        return NextResponse.json({ 
          success: true, 
          message: 'Calibration loop started' 
        });

      case 'stop_calibration':
        reflexOrchestrator.stop();
        return NextResponse.json({ 
          success: true, 
          message: 'Calibration loop stopped' 
        });

      case 'get_status':
        const cycleStatus = reflexOrchestrator.getCycleStatus();
        return NextResponse.json({
          success: true,
          cycle: cycleStatus
        });

      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid action' 
        }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
