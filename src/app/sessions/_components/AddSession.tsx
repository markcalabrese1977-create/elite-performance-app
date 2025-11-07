"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AddSession() {
  const r = useRouter();

  const [day, setDay] = useState(3);
  const [fatigue, setFatigue] = useState(4);
  const [notes, setNotes] = useState("Lower body focus (no sets)");

  const [pending, setPending] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onAdd() {
    setErr(null);
    setPending(true);
    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: 1,
          dayIndex: day,
          fatigueScore: fatigue,
          notes,
          items: [],
        }),
      });
      const j = await res.json().catch(() => ({} as any));
      if (!res.ok || !j?.ok) {
        throw new Error(j?.error || `Create failed (${res.status})`);
      }

      // success → toast + refresh
      setToast(`Session #${j.sessionId} added`);
      r.refresh();
      setTimeout(() => setToast(null), 2200);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to add session");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2">
          <span className="text-sm text-slate-600">Day</span>
          <select
            className="rounded border border-slate-300 px-2 py-1"
            value={day}
            onChange={(e) => setDay(Number(e.target.value))}
          >
            {[1, 2, 3, 4, 5, 6, 7].map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2">
          <span className="text-sm text-slate-600">Fatigue</span>
          <select
            className="rounded border border-slate-300 px-2 py-1"
            value={fatigue}
            onChange={(e) => setFatigue(Number(e.target.value))}
          >
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </label>

        <input
          className="min-w-[280px] flex-1 rounded border border-slate-300 px-3 py-1"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes"
        />

        <button
          onClick={onAdd}
          disabled={pending}
          className={[
            "rounded px-3 py-1 text-sm",
            pending
              ? "bg-slate-300 text-white cursor-not-allowed"
              : "bg-slate-900 text-white hover:bg-slate-800",
          ].join(" ")}
          title={pending ? "Adding…" : "Add session"}
        >
          {pending ? "Adding…" : "Add"}
        </button>
      </div>

      {/* inline error */}
      {err && <p className="mt-2 text-sm text-red-600">{err}</p>}

      {/* success toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-green-600 px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}
    </>
  );
}