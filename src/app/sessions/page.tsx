// src/app/sessions/page.tsx
import { headers } from "next/headers";
import Link from "next/link";

export const dynamic = "force-dynamic"; // no caching — always hit API
export const revalidate = 0;

type ApiSession = {
  id: number;
  userId: number;
  date: string | null;
  dayIndex: number | null;
  fatigueScore: number | null;
  notes: string | null;
  // API may send this as a string from SQL COUNT(); normalize to number
  setsCount: number | string;
};

async function loadSessions(): Promise<ApiSession[]> {
  const h = await headers();
  // Build absolute URL so this also works in server context
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto =
    (h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https"));

  const res = await fetch(`${proto}://${host}/api/sessions`, {
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (!data?.ok || !Array.isArray(data.sessions)) {
    throw new Error("Bad payload");
  }
  return data.sessions as ApiSession[];
}

export default async function SessionsPage() {
  let sessions: ApiSession[] = [];
  try {
    sessions = await loadSessions();
  } catch {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Sessions</h1>
        <div className="rounded-lg border p-6 text-red-600 bg-red-50">
          Failed to load sessions.
        </div>
      </div>
    );
  }

  // Normalize and sort newest → oldest
  const rows = sessions
    .map((s) => ({
      ...s,
      date: s.date ?? null,
      setsCount: typeof s.setsCount === "string" ? Number(s.setsCount) : (s.setsCount ?? 0),
      notes: s.notes ?? "",
    }))
    .sort((a, b) => {
      const da = a.date ? new Date(a.date).getTime() : 0;
      const db = b.date ? new Date(b.date).getTime() : 0;
      return db - da;
    });

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Sessions</h1>
        <div className="flex gap-2">
          <Link
            href="/sandbox"
            className="px-3 py-2 rounded-md border hover:bg-gray-50"
          >
            Sandbox
          </Link>
        </div>
      </div>

      {rows.length === 0 ? (
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
              {rows.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="px-4 py-3">
                    {s.date ? new Date(s.date).toLocaleString() : "—"}
                  </td>
                  <td className="px-4 py-3">{s.notes || "—"}</td>
                  <td className="px-4 py-3 text-right">{s.setsCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}