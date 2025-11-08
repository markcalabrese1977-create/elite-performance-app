import { NextResponse } from "next/server";
import { PROGRAMS } from "@/programs";
import { applyProgram } from "@/programs/builders/applyProgram";

// Helper: support Next 16 where params may be a Promise
async function getParams(context: any): Promise<{ id?: string }> {
  const p = context?.params;
  if (p && typeof p.then === "function") return await p; // params is a Promise
  return p ?? {};
}

export async function POST(req: Request, context: any) {
  try {
    const body = await req.json();
    const userId = Number(body?.userId);
    const startDate = body?.startDate as string | undefined;

    const { id } = await getParams(context);
    if (!id) {
      return NextResponse.json(
        { ok: false, error: "Missing program id in route params" },
        { status: 400 }
      );
    }

    if (!userId || !startDate) {
      return NextResponse.json(
        { ok: false, error: "Missing userId or startDate" },
        { status: 400 }
      );
    }

    const template = PROGRAMS.find(p => p.id === id);
    if (!template) {
      return NextResponse.json(
        { ok: false, error: `Program not found: ${id}` },
        { status: 404 }
      );
    }

    const result = await applyProgram({ template, userId, startDate });
    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Failed to apply program", stack: err?.stack },
      { status: 500 }
    );
  }
}