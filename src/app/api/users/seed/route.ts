import { getDb } from "@/db/client";
import { users } from "@/db/schema";
import { NextResponse } from "next/server";

export async function POST() {
  const db = getDb(); // ✅ creates or reuses the drizzle connection
  await db.insert(users).values({
    name: "Mark",
    email: "mark@example.com",
  });

  const allUsers = await db.select().from(users);
  return NextResponse.json({ ok: true, users: allUsers });
}