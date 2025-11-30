import { getRedis } from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const redis = getRedis();
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID required" },
        { status: 400 }
      );
    }

    await redis.del(`session:${sessionId}`);

    const keys = await redis.keys("session:*");
    const activeConnections = keys.length;

    return NextResponse.json({
      success: true,
      activeConnections,
    });
  } catch (error) {
    console.error("Redis error:", error);
    return NextResponse.json({ error: "Disconnect failed" }, { status: 500 });
  }
}
