// src/app/api/sets/[id]/route.ts
import { NextResponse } from "next/server";
import { db } from "../drizzle/db";
import { sets } from "../drizzle/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const setId = Number(params.id);
  const result = await db.select().from(sets).where(eq(sets.id, setId));
  return NextResponse.json({ set: result[0] });
}