// src/app/api/sessions/route.ts
import { NextResponse } from "next/server";
import { db } from "@/db";
import { sessions } from "@/db/schema";

export async function GET() {
  const result = await db.select().from(sessions);
  return NextResponse.json({ sessions: result });
}