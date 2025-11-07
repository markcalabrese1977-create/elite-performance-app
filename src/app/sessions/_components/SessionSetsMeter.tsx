// src/app/sessions/_components/SessionSetsMeter.tsx
"use client";

import { useEffect, useState } from "react";

type Props = {
  sessionId: number;
  target?: number; // how many sets make a "complete" session
};

export default function SessionSetsMeter({ sessionId, target = 10 }: Props) {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    try {
      setLoading(true);
      const res = await fetch(`/api/journal/${sessionId}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const json = await res.json();
      const n = Array.isArray(json?.sets) ? json.sets.length : 0;
      setCount(n);
    } catch {
      setCount(null);
    } finally {
      setLoading(false);
    }
  }

  // initial fetch
  useEffect(() => {
    load();
    // listen for global event fired by AddSet after a successful add
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { sessionId: number } | undefined;
      if (detail?.sessionId === sessionId) load();
    };
    window.addEventListener("sets-updated", handler as EventListener);
    return () => window.removeEventListener("sets-updated", handler as EventListener);
  }, [sessionId]);

  const cur = count ?? 0;
  const pct = Math.max(0, Math.min(100, Math.round((cur / target) * 100)));

  return (
    <div className="flex min-w-[160px] items-center gap-3">
      <div className="w-full">
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-slate-800 transition-[width] duration-300"
            style={{ width: `${pct}%` }}
            aria-label={`Sets progress ${cur} of ${target}`}
          />
        </div>
      </div>
      <div className="w-[64px] text-right font-mono text-xs tabular-nums text-slate-700">
        {loading ? "…" : `${cur} / ${target}`}
      </div>
    </div>
  );
}