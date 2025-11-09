// src/app/api/health/import/route.ts
import { NextResponse } from "next/server";
import { db } from "@/db";
import { healthRaw } from "@/db/schema";

export async function POST(req: Request) {
  try {
    const { userId, metrics } = await req.json();

    if (!userId || !metrics || typeof metrics !== "object") {
      return NextResponse.json(
        { ok: false, error: "Invalid payload: userId and metrics required" },
        { status: 400 }
      );
    }

    await db.insert(healthRaw).values({
      userId,
      source: "apple_health",
      payload: metrics, // ← Drizzle handles JSONB
    });

    return NextResponse.json({ ok: true, imported: 1 });
  } catch (error: any) {
    console.error("HEALTH IMPORT ERROR:", error);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}