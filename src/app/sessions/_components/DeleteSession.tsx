"use client";

import { useState, useTransition } from "react";

type Props = { id: number };

export default function DeleteSession({ id }: Props) {
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const onDelete = () => {
    setErr(null);
    start(async () => {
      try {
        const res = await fetch(`/api/journal/${id}`, { method: "DELETE" });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j?.error || `Delete failed (${res.status})`);
        }
        // Force the /sessions page to refresh data
        // Works because this is a Client Component in the same route tree
        (window as any).location?.reload();
      } catch (e: any) {
        setErr(e?.message ?? "Delete failed");
      }
    });
  };

  return (
    <div className="inline-flex items-center gap-2">
      <button
        onClick={onDelete}
        disabled={pending}
        className={[
          "rounded px-2 py-1 text-sm",
          pending
            ? "bg-red-300 text-white cursor-not-allowed"
            : "bg-red-500 hover:bg-red-600 text-white",
        ].join(" ")}
        title={pending ? "Deleting…" : "Delete session"}
      >
        {pending ? "Deleting…" : "Delete"}
      </button>
      {err && <span className="text-xs text-red-600">{err}</span>}
    </div>
  );
}