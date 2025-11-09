// src/app/api/sessions/seed/route.ts
import { NextResponse } from "next/server";
import { db } from "@/db";
import { sessions } from "@/db/schema";

export async function POST() {
  const today = new Date();
  const seedData = [
    { userId: 1, date: today, notes: "Seeded session" },
  ];

  const result = await db.insert(sessions).values(seedData).returning();

  return NextResponse.json({ ok: true, sessions: result });
}