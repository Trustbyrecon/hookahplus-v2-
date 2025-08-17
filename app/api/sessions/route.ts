// app/api/sessions/route.ts
import { NextResponse } from "next/server";
import { getActiveSessions, updateCoalStatus, addFlavorToSession, startSession } from "@/lib/orders";

export async function GET() {
  try {
    const activeSessions = getActiveSessions();
    return NextResponse.json({ 
      success: true,
      sessions: activeSessions,
      count: activeSessions.length
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    const body = await request.json();
    const { action, orderId, data } = body;
    
    switch (action) {
      case 'start_session':
        startSession(orderId);
        return NextResponse.json({ success: true, message: 'Session started' });
        
      case 'update_coal_status':
        updateCoalStatus(orderId, data.status);
        return NextResponse.json({ success: true, message: 'Coal status updated' });
        
      case 'add_flavor':
        addFlavorToSession(orderId, data.flavor, data.rate);
        return NextResponse.json({ success: true, message: 'Flavor added' });
        
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
