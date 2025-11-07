// src/app/api/health/import/route.ts
import { sql } from "drizzle-orm";
// Ensure Node runtime (so Buffer/pg work on the server)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import Papa from "papaparse"; // static import is fine on the server
import { db } from "@/db";     // uses the same db you use elsewhere

// --- GET: quick sanity check; proves route + db are wired ---
export async function GET() {
  try {
    const { rows } = await db.execute<{
      id: number;
      provider: string;
      captured_at: string;
    }>(`SELECT id, provider, captured_at FROM health_raw ORDER BY id DESC LIMIT 5`);
    return NextResponse.json({ ok: true, sample: rows });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: String(err?.message ?? err) },
      { status: 500 }
    );
  }
}



// Helper: insert one row (Drizzle SQL object, not string)
const insertOne = async (provider: string, payload: unknown) => {
  await db.execute(
    sql`INSERT INTO health_raw (provider, payload)
        VALUES (${provider}, ${JSON.stringify(payload)}::jsonb)`
  );
};

// --- POST: accept JSON or CSV and store raw payload rows ---
export async function POST(req: NextRequest) {
  try {
    const ctype = req.headers.get("content-type") || "";

    // 1) JSON body
    if (ctype.includes("application/json")) {
      const body = await req.json();
      const provider = (body?.provider as string) ?? "unknown";
      await insertOne(provider, body);
      return NextResponse.json({ ok: true, mode: "json", rowsInserted: 1 });
    }

    // 2) CSV body (simple non-stream parse; streaming can come later)
    if (ctype.includes("text/csv")) {
      const text = await req.text();
      const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });

      if (parsed.errors?.length) {
        return NextResponse.json(
          { ok: false, error: "CSV parse error", details: parsed.errors.slice(0, 3) },
          { status: 400 }
        );
      }

      const rows = (parsed.data as Record<string, unknown>[]) ?? [];
      if (!rows.length) {
        return NextResponse.json(
          { ok: false, error: "No CSV rows found" },
          { status: 400 }
        );
      }

      // Insert each row (small batches are fine; we can batch later if needed)
      for (const row of rows) {
        const provider = (row.provider as string) ?? "unknown";
        await insertOne(provider, row);
      }

      return NextResponse.json({ ok: true, mode: "csv", rowsInserted: rows.length });
    }

    // Unsupported
    return NextResponse.json(
      { ok: false, error: "Unsupported content-type", contentType: ctype },
      { status: 415 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: "Import failed", details: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}