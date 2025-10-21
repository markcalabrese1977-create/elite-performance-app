import { NextResponse } from "next/server";
import { getDb } from "@/db/client";
import { exercises } from "@/db/schema";

export async function POST() {
  const db = getDb();

  // seed data – tweak as you like
  const seed = [
    { name: "Back Squat", muscleGroup: "legs" },
    { name: "Bench Press", muscleGroup: "chest" },
    { name: "Deadlift", muscleGroup: "back" },
    { name: "Overhead Press", muscleGroup: "shoulders" },
    { name: "Pull-up", muscleGroup: "back" },
  ];

  // insert but ignore duplicates if you rerun
  await db
    .insert(exercises)
    .values(seed as any)
    // drizzle/neon combo: use onConflict if you have a unique constraint,
    // otherwise just let duplicates happen during first setup
    .catch(() => { /* no-op on reruns without unique constraints */ });

  const rows = await db.select().from(exercises);
  return NextResponse.json({ ok: true, count: rows.length, exercises: rows });
}

// (Optional) allow GET so you can hit it in the browser too
export const GET = POST;