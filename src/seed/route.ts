// src/seed/route.ts
import { NextResponse } from "next/server";
import { db } from "../drizzle/db";
import { exercises } from "../drizzle/db/schema";

export async function POST() {
  const seedData = [
    { name: "Squat", slug: "squat", muscleGroup: "legs" },
    { name: "Bench Press", slug: "bench-press", muscleGroup: "chest" },
    { name: "Deadlift", slug: "deadlift", muscleGroup: "back" },
  ];

  const result = await db.insert(exercises).values(seedData).onConflictDoNothing().returning();

  return NextResponse.json({ ok: true, inserted: result.length });
}