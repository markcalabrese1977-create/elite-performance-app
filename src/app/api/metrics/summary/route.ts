// src/app/api/metrics/summary/route.ts
import { NextResponse } from "next/server";
import { db } from "@/db";
import { sets } from "@/db/schema";
import { sql } from "drizzle-orm";

export async function GET() {
  const totalVolume = await db
    .select({
      volume: sql<number>`${sets.load} * ${sets.reps}`,
    })
    .from(sets);

  const total = totalVolume.reduce((sum, row) => sum + (row.volume ?? 0), 0);

  return NextResponse.json({ totalVolume: total });
}