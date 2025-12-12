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

    // セッションを30秒のTTLで保存
    await redis.setex(`session:${sessionId}`, 30, Date.now().toString());

    // 現在の接続数を取得
    const keys = await redis.keys("session:*");
    const activeConnections = keys.length;

    return NextResponse.json({
      success: true,
      activeConnections,
      sessionId,
    });
  } catch (error) {
    console.error("Redis error:", error);
    return NextResponse.json({ error: "Failed to connect" }, { status: 500 });
  }
}
