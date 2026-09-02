import { NextRequest } from "next/server";

// Always call the VPS backend directly — server-side, no mixed content
const BACKEND_URL = "http://65.0.141.163:8000";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const backendRes = await fetch(`${BACKEND_URL}/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!backendRes.ok) {
      return new Response(
        JSON.stringify({ error: "Backend error", status: backendRes.status }),
        { status: backendRes.status, headers: { "Content-Type": "application/json" } }
      );
    }

    // Stream the response directly
    return new Response(backendRes.body, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    console.error("Chat proxy error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to connect to backend" }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }
}
