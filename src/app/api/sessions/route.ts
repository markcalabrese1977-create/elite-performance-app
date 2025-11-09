// src/app/api/sessions/route.ts
import { NextResponse } from "next/server";
import { db } from "../drizzle/db";
import { sessions } from "../drizzle/db/schema";

export async function GET() {
  const result = await db.select().from(sessions);
  return NextResponse.json({ sessions: result });
}