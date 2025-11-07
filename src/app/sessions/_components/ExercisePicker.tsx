"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Simple, dependency-free autocomplete that:
 *  - fetches /api/exercises?q=... (debounced)
 *  - displays names
 *  - returns numeric exerciseId to parent
 *
 * Props:
 *   value: number (current exerciseId)
 *   onChange: (id: number) => void
 *   inputClassName: optional tailwind for the input
 *   rowKey: string | number (unique per row to scope datalist id)
 */
type Exercise = { id: number; name: string };
type PickerProps = {
  value: number;
  onChange: (id: number) => void;
  inputClassName?: string;
  rowKey: string | number;
};

const cache = new Map<string, Exercise[]>();
const idNameCache = new Map<number, string>();

export default function ExercisePicker({
  value,
  onChange,
  inputClassName,
  rowKey,
}: PickerProps) {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<Exercise[]>([]);
  const [display, setDisplay] = useState<string>("");

  const listId = useMemo(() => `exercise-options-${rowKey}`, [rowKey]);
  const lastFetch = useRef<number>(0);
  const debounceMs = 200;

  // Show the current exercise name on mount/change
  useEffect(() => {
    let ignore = false;

    async function ensureName() {
      // If we already know this id's name, use it.
      if (idNameCache.has(value)) {
        const name = idNameCache.get(value)!;
        if (!ignore) setDisplay(name);
        return;
      }
      // Try to find it with an empty search (endpoint usually returns all)
      const key = "__all__";
      if (!cache.has(key)) {
        const res = await fetch(`/api/exercises`, { cache: "no-store" });
        const data = await res.json();
        cache.set(key, data.exercises ?? []);
        for (const e of data.exercises ?? []) idNameCache.set(e.id, e.name);
      }
      const name =
        idNameCache.get(value) ||
        cache
          .get("__all__")!
          .find((e) => e.id === value)?.name ||
        "";
      if (!ignore) setDisplay(name);
    }

    ensureName();
    return () => {
      ignore = true;
    };
  }, [value]);

  // Debounced search when the user types
  useEffect(() => {
    let timer = window.setTimeout(async () => {
      const now = Date.now();
      if (now - lastFetch.current < debounceMs - 5) return;

      const q = query.trim();
      const key = q.length ? q.toLowerCase() : "__all__";
      if (cache.has(key)) {
        setResults(cache.get(key)!);
        return;
      }

      const url = q.length ? `/api/exercises?q=${encodeURIComponent(q)}` : `/api/exercises`;
      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();
      const list: Exercise[] = data.exercises ?? [];
      cache.set(key, list);
      // populate id→name cache
      for (const e of list) idNameCache.set(e.id, e.name);
      setResults(list);
      lastFetch.current = now;
    }, debounceMs);

    return () => window.clearTimeout(timer);
  }, [query]);

  // When the user picks an option (by clicking or pressing Enter),
  // resolve the typed string to an exercise id (exact match by name).
  function commitSelection(next: string) {
    setQuery(next);
    setDisplay(next);
    const fromResults =
      results.find((e) => e.name.toLowerCase() === next.trim().toLowerCase()) ??
      cache.get("__all__")?.find((e) => e.name.toLowerCase() === next.trim().toLowerCase());

    if (fromResults) {
      onChange(fromResults.id);
      idNameCache.set(fromResults.id, fromResults.name);
    }
  }

  return (
    <div className="relative">
      <input
        list={listId}
        className={inputClassName ?? "w-24 rounded-md border px-2 py-1"}
        value={query.length ? query : display}
        onChange={(e) => setQuery(e.target.value)}
        onBlur={(e) => commitSelection(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.currentTarget.blur(); // triggers onBlur → commitSelection
          }
        }}
        placeholder="Search…"
        aria-label="Exercise"
      />
      <datalist id={listId}>
        {results.map((e) => (
          <option key={e.id} value={e.name} />
        ))}
      </datalist>
    </div>
  );
}