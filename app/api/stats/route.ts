import { getRedis } from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const redis = getRedis();
    const keys = await redis.keys("session:*");
    const activeConnections = keys.length;

    return NextResponse.json({
      activeConnections,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Redis error:", error);
    return NextResponse.json({ error: "Failed to get stats" }, { status: 500 });
  }
}
