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

    // TTLを更新
    const exists = await redis.expire(`session:${sessionId}`, 30);

    if (!exists) {
      // セッションが存在しない場合は再作成
      await redis.setex(`session:${sessionId}`, 30, Date.now().toString());
    }

    const keys = await redis.keys("session:*");
    const activeConnections = keys.length;

    return NextResponse.json({
      success: true,
      activeConnections,
    });
  } catch (error) {
    console.error("Redis error:", error);
    return NextResponse.json({ error: "Heartbeat failed" }, { status: 500 });
  }
}
