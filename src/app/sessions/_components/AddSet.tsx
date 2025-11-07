"use client";

import { useState } from "react";

type Props = {
  sessionId: number;
  onAdded: (setRow: any) => void; // parent will push into state + refresh charts
};

export default function AddSet({ sessionId, onAdded }: Props) {
  const [saving, setSaving] = useState(false);

  const add = async () => {
    try {
      setSaving(true);
      const res = await fetch(`/api/sessions/${sessionId}/sets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Add failed");
      onAdded(data.set); // hand new row to parent
    } catch (err) {
      alert("Add failed");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <button
      onClick={add}
      disabled={saving}
      className="rounded-md bg-slate-900 px-3 py-1 text-white disabled:opacity-50"
      aria-label="Add set"
    >
      {saving ? "Adding…" : "+ Set"}
    </button>
  );
}