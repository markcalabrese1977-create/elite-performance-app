import { NextResponse } from "next/server";
import { getDb } from "@/db/client";
import { exercises } from "@/db/schema";
import { ilike } from "drizzle-orm"; // if you're on pg & drizzle; otherwise adjust

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = (url.searchParams.get("q") ?? "").trim();
    const db = getDb();

    if (q.length > 0) {
      // case-insensitive search against name and (if present) category
      const rows = await db
        .select()
        .from(exercises)
        .where(
          ilike(exercises.name, `%${q}%`)
          // If you also have a category column in your schema, combine with OR
          // or(ilike(exercises.name, `%${q}%`), ilike(exercises.category, `%${q}%`))
        )
        .limit(50);

      return NextResponse.json({ exercises: rows });
    }

    const rows = await db.select().from(exercises).limit(200);
    return NextResponse.json({ exercises: rows });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: String(err?.message ?? err) },
      { status: 500 }
    );
  }
}