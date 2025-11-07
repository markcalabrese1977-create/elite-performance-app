"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddSetInline({ sessionId }: { sessionId: number }) {
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const onAdd = async () => {
    try {
      setSaving(true);
      const res = await fetch(`/api/sessions/${sessionId}/sets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Add failed");
      // Re-fetch the server component and re-render charts/table
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Add set failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <button
      onClick={onAdd}
      disabled={saving}
      className="rounded-md bg-slate-900 px-3 py-1 text-white disabled:opacity-50"
    >
      {saving ? "Adding…" : "+ Set"}
    </button>
  );
}