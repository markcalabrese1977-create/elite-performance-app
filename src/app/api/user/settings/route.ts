// src/app/api/user/settings/route.ts
import { NextResponse } from "next/server";
import { db } from "@/db";
import { userSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

const USER_ID = 1;

export async function GET() {
  const settings = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, USER_ID))
    .limit(1);

  return NextResponse.json({
    ok: true,
    settings: settings[0] || { goal: "hypertrophy", experience: "beginner" }
  });
}

export async function POST(req: Request) {
  const { goal, experience } = await req.json();

  await db
    .insert(userSettings)
    .values({ userId: USER_ID, goal, experience })
    .onConflictDoUpdate({
      target: userSettings.userId,
      set: { goal, experience, updatedAt: new Date() }
    });

  return NextResponse.json({ ok: true });
}