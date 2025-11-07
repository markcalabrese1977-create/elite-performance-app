import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { ok: false, error: "Users table not present; seeding disabled." },
    { status: 501 }
  );
}