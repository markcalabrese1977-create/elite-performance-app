"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";

type SetRow = {
  id: number;
  sessionId: number;
  exerciseId: number;
  setIndex: number;
  load: number | null;
  reps: number | null;
  rir: number | null;
  tempo: string | null;
  isTestSet: boolean | null;
};

export default function EditSetRow({ set }: { set: SetRow }) {
  const router = useRouter();

  const [exerciseId, setExerciseId] = React.useState<number>(set.exerciseId);
  const [setIndex, setSetIndex] = React.useState<number>(set.setIndex);
  const [load, setLoad] = React.useState<number | "">(set.load ?? "");
  const [reps, setReps] = React.useState<number | "">(set.reps ?? "");
  const [rir, setRir] = React.useState<number | "">(set.rir ?? "");
  const [tempo, setTempo] = React.useState<string>(set.tempo ?? "2-0-2");
  const [isTest, setIsTest] = React.useState<boolean>(!!set.isTestSet);

  const [busy, setBusy] = React.useState<"idle" | "saving" | "deleting">("idle");

  const numberOrNull = (v: number | "" | null) =>
    v === "" || v === null || Number.isNaN(Number(v)) ? null : Number(v);

  async function onSave() {
    try {
      setBusy("saving");

      // Your update route
      const url = `/api/sets/${set.id}`;

      const body = {
        exerciseId: numberOrNull(exerciseId),
        setIndex: numberOrNull(setIndex),
        load: numberOrNull(load),
        reps: numberOrNull(reps),
        rir: numberOrNull(rir),
        tempo: tempo || null,
        isTestSet: !!isTest,
      };

const res = await fetch(`/api/sets/${set.id}`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || "Update failed");
      }

      // Force RSC + charts to refresh
      router.refresh();
    } catch (e) {
      console.error("Update failed", e);
      alert("Error: Update failed");
    } finally {
      setBusy("idle");
    }
  }

  async function onDelete() {
    if (!confirm("Delete this set?")) return;
    try {
      setBusy("deleting");

      // Your delete route that worked earlier
      const url = `/api/sessions/${set.sessionId}/sets/${set.id}`;

      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || "Delete failed");
      }

      // Force RSC + charts to refresh
      router.refresh();
    } catch (e) {
      console.error("Delete failed", e);
      alert("Error: Delete failed");
    } finally {
      setBusy("idle");
    }
  }

return (
  <TableRow data-row-id={set.id}>
      <TableCell className="font-mono">{set.id}</TableCell>

      <TableCell>
        <input
          type="number"
          className="w-24 rounded-md border px-2 py-1"
          value={exerciseId}
          onChange={(e) => setExerciseId(Number(e.target.value))}
        />
      </TableCell>

      <TableCell>
        <input
          type="number"
          className="w-20 rounded-md border px-2 py-1"
          value={setIndex}
          onChange={(e) => setSetIndex(Number(e.target.value))}
        />
      </TableCell>

      <TableCell>
        <input
          type="number"
          className="w-24 rounded-md border px-2 py-1"
          value={load}
          onChange={(e) => setLoad(e.target.value === "" ? "" : Number(e.target.value))}
        />
      </TableCell>

      <TableCell>
        <input
          type="number"
          className="w-20 rounded-md border px-2 py-1"
          value={reps}
          onChange={(e) => setReps(e.target.value === "" ? "" : Number(e.target.value))}
        />
      </TableCell>

      <TableCell>
        <input
          type="number"
          className="w-20 rounded-md border px-2 py-1"
          value={rir}
          onChange={(e) => setRir(e.target.value === "" ? "" : Number(e.target.value))}
        />
      </TableCell>

      <TableCell>
        <input
          type="text"
          className="w-24 rounded-md border px-2 py-1"
          value={tempo}
          onChange={(e) => setTempo(e.target.value)}
        />
      </TableCell>

      <TableCell className="text-center">
        <input
          type="checkbox"
          checked={isTest}
          onChange={(e) => setIsTest(e.target.checked)}
        />
      </TableCell>

      <TableCell className="text-right space-x-2">
        <Button size="sm" disabled={busy !== "idle"} onClick={onSave}>
          {busy === "saving" ? "Saving…" : "Save"}
        </Button>
        <Button
          size="sm"
          variant="destructive"
          disabled={busy !== "idle"}
          onClick={onDelete}
        >
          {busy === "deleting" ? "Deleting…" : "Delete"}
        </Button>
      </TableCell>
    </TableRow>
  );
}