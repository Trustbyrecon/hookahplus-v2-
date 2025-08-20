// app/api/sessions/route.ts
import { NextResponse } from "next/server";
import { getAllSessions, getSessionsByState, seedSession } from "@/lib/sessionState";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const state = searchParams.get('state');
  const table = searchParams.get('table');
  
  // Seed demo session if none exist
  if (getAllSessions().length === 0) {
    seedSession();
  }
  
  let sessions = getAllSessions();
  
  // Filter by state if specified
  if (state) {
    sessions = getSessionsByState(state as any);
  }
  
  // Filter by table if specified
  if (table) {
    sessions = sessions.filter(s => s.table === table);
  }
  
  return NextResponse.json({ 
    sessions,
    count: sessions.length,
    total: getAllSessions().length
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { table = "T-1", items = [{ sku: "hookah.session", qty: 1 }] } = body;
    
    // Generate a new session ID
    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    
    // Create new session
    const newSession = {
      id: sessionId,
      state: "NEW" as const,
      table,
      items,
      payment: { status: "started" as const },
      timers: {},
      flags: {},
      meta: { 
        createdBy: body.createdBy || "system", 
        loungeId: body.loungeId || "lounge_demo" 
      },
      audit: [],
    };
    
    // Import and use the store functions
    const { putSession } = await import("@/lib/sessionState");
    putSession(newSession);
    
    return NextResponse.json({ 
      ok: true, 
      session: newSession 
    }, { status: 201 });
    
  } catch (error: any) {
    return NextResponse.json({ 
      error: "Failed to create session",
      details: error.message 
    }, { status: 500 });
  }
}
