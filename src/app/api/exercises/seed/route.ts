import { NextResponse } from "next/server";
import { getDb } from "@/db/client";
import { exercises } from "@/db/schema";

export async function POST() {
  const db = getDb();

  const seed = [
    { name: "Back Squat",    muscleGroup: "legs" },
    { name: "Bench Press",   muscleGroup: "chest" },
    { name: "Deadlift",      muscleGroup: "back" },
    { name: "Overhead Press",muscleGroup: "shoulders" },
    { name: "Pull-up",       muscleGroup: "back" },
  ];

  // insert; ignore if you rerun
  await db.insert(exercises).values(seed as any).catch(() => {});

  const rows = await db.select().from(exercises);
  return NextResponse.json({ ok: true, count: rows.length, exercises: rows });
}

// (optional) allow GET so you can hit it in the browser too
export const GET = POST;