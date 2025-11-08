// src/app/sessions/page.tsx
import Link from "next/link";
import { revalidatePath } from "next/cache";

import { getDb } from "@/db/client";
import { sessions, sets } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

import { PROGRAM_BY_ID } from "@/programs";
import { applyProgram } from "@/programs/builders/applyProgram";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ListRow = {
  id: number;
  date: Date | null;
  notes: string | null;
  setsCount: number;
};

async function loadSessions(): Promise<ListRow[]> {
  const db = getDb();
  const rows = await db
    .select({
      id: sessions.id,
      date: sessions.date,
      notes: sessions.notes,
      // cast COUNT(*) to number so TS doesn't infer string
      setsCount: sql<number>`CAST(COUNT(${sets.id}) AS int)`,
    })
    .from(sessions)
    .leftJoin(sets, eq(sets.sessionId, sessions.id))
    .groupBy(sessions.id, sessions.date, sessions.notes)
    .orderBy(sessions.date);

  return rows;
}

export default async function SessionsPage() {
  const rows = await loadSessions();

  // Server action to apply a program (no client hooks)
  async function applyProgramAction(formData: FormData) {
    "use server";
    const programId = String(formData.get("program") ?? "").trim();
    const startDate =
      String(formData.get("startDate") ?? "").trim() ||
      new Date().toISOString().slice(0, 10);

    const template = PROGRAM_BY_ID[programId as keyof typeof PROGRAM_BY_ID];
    if (!template) throw new Error(`Unknown program: ${programId}`);

    // TODO: plug in real auth later
    await applyProgram({ template, userId: 1, startDate });
    revalidatePath("/sessions");
  }

  const programOptions = Object.entries(PROGRAM_BY_ID).map(([id, p]) => ({
    id,
    name: p.name ?? id,
  }));

  const display = [...rows].sort((a, b) => {
    const da = a.date ? a.date.getTime() : 0;
    const db = b.date ? b.date.getTime() : 0;
    return db - da; // newest first
  });

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Sessions</h1>

        <div className="flex items-center gap-3">
          <form action={applyProgramAction} className="flex items-center gap-2">
            <select name="program" className="border rounded-md px-2 py-1">
              {programOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <input
              type="date"
              name="startDate"
              defaultValue={new Date().toISOString().slice(0, 10)}
              className="border rounded-md px-2 py-1"
            />
            <button
              type="submit"
              className="px-3 py-2 rounded-md border hover:bg-gray-50"
            >
              Apply Program
            </button>
          </form>

          <Link
            href="/sandbox"
            className="px-3 py-2 rounded-md border hover:bg-gray-50"
          >
            Sandbox
          </Link>
        </div>
      </div>

      {display.length === 0 ? (
        <div className="rounded-lg border p-6 text-gray-600 bg-gray-50">
          No sessions yet.
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Notes</th>
                <th className="text-right px-4 py-3">Sets</th>
              </tr>
            </thead>
            <tbody>
              {display.map((s) => {
                const href = `/sessions/${s.id}`;
                const nice =
                  s.date &&
                  new Date(s.date).toLocaleString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                const setsNum = Number.isFinite(s.setsCount) ? s.setsCount : 0;

                return (
                  <tr key={s.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 text-blue-600 underline">
                      <Link href={href}>{nice ?? "—"}</Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={href} className="hover:underline">
                        {s.notes ?? "—"}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={[
                          "inline-flex items-center justify-center min-w-8 px-2 py-1 rounded-full text-xs font-semibold border",
                          setsNum > 0
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-gray-50 text-gray-600 border-gray-200",
                        ].join(" ")}
                      >
                        {setsNum}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}