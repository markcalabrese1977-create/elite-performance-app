// src/app/api/programs/[id]/route.ts
import "server-only";
export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { PROGRAM_BY_ID } from "@/programs";
import { applyProgram } from "@/programs/builders/applyProgram";

type Params = { id: string };

export async function GET(_req: NextRequest, ctx: { params: Promise<Params> }) {
  const { id } = await ctx.params;
  const program = PROGRAM_BY_ID[id];
  if (!program) {
    return NextResponse.json({ ok: false, error: `Program not found: ${id}` }, { status: 404 });
  }
  return NextResponse.json({ ok: true, program });
}

export async function POST(req: NextRequest, ctx: { params: Promise<Params> }) {
  try {
    const { id } = await ctx.params;
    const template = PROGRAM_BY_ID[id];
    if (!template) {
      return NextResponse.json({ ok: false, error: `Program not found: ${id}` }, { status: 404 });
    }

    const body = (await req.json().catch(() => ({}))) as { userId?: number; startDate?: string };
    const userId = Number.isFinite(Number(body.userId)) ? Number(body.userId) : 1;
    const startDate =
      typeof body.startDate === "string" && body.startDate.trim()
        ? body.startDate
        : new Date().toISOString().slice(0, 10);

    const result = await applyProgram({ template, userId, startDate });
    return NextResponse.json({ ok: true, ...result }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Failed to apply program", stack: err?.stack },
      { status: 500 }
    );
  }
}