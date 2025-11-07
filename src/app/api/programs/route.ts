// src/app/api/programs/route.ts
import { NextResponse } from "next/server";
// Use a RELATIVE import to avoid alias issues inside /app routes.
import { PROGRAMS } from "../../../programs";

export async function GET() {
  try {
    return NextResponse.json({
      programs: PROGRAMS.map(p => ({
        id: p.id,
        name: p.name,
        goal: p.goal,
        durationWeeks: p.durationWeeks,
        daysPerWeek: p.daysPerWeek,
        notes: p.notes ?? "",
      })),
    });
  } catch (err) {
    console.error("GET /api/programs failed:", err);
    return NextResponse.json(
      { ok: false, error: "Programs route failed", details: String(err) },
      { status: 500 }
    );
  }
}