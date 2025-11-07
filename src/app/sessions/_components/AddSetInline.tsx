"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

/**
 * AddSetInline
 *  - Calls POST /api/sessions/[sessionId]/sets
 *  - Toasts on success/failure
 *  - router.refresh() to re-render server components & charts
 *  - Smooth-scrolls the sets table
 *  - Auto-focuses the new row's first input/select
 *
 * Wiring notes:
 * 1) Give your sets table scroll container id="sets-table"
 *    (e.g., <div id="sets-table" className="overflow-x-auto ...">...</div>)
 * 2) (Optional but recommended) In EditSetRow, add data-row-id={set.id} on the <tr>.
 *    That makes the autofocus target exact. Otherwise we fallback to the last row.
 */
export default function AddSetInline({ sessionId }: { sessionId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // tiny helper: wait for a selector to exist after a refresh
  function waitForElement<T extends Element>(
    selector: string,
    timeoutMs = 4000
  ): Promise<T | null> {
    const start = performance.now();
    return new Promise((resolve) => {
      const check = () => {
        const el = document.querySelector(selector) as T | null;
        if (el) return resolve(el);
        if (performance.now() - start > timeoutMs) return resolve(null);
        requestAnimationFrame(check);
      };
      check();
    });
  }

  async function handleAddSet() {
    try {
      setLoading(true);

      const res = await fetch(`/api/sessions/${sessionId}/sets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}), // empty body; server picks defaults
      });

      // Attempt to parse JSON even on non-2xx to show server error
      let data: any = null;
      try {
        data = await res.json();
      } catch {
        // ignore parse errors, we'll still surface a generic message below
      }

      if (!res.ok || !data?.ok) {
        console.error("Add set failed:", data ?? res.statusText);
        toast.error(
          data?.error
            ? `Add set failed: ${data.error}`
            : "Add set failed. Check console for details."
        );
        return;
      }

      const added = data.set as {
        id: number;
        set_index: number;
      };

      toast.success(`Set #${added.set_index} added.`);

      // Refresh server components so charts/table re-render
      router.refresh();

      // Give Next a tiny beat to commit the refreshed DOM, then scroll/focus
      // 1) Smooth scroll the table container
      setTimeout(async () => {
        const table = document.querySelector("#sets-table") as HTMLElement | null;
        if (table) {
          table.scrollTo({ top: table.scrollHeight, behavior: "smooth" });
        }

        // 2) Try to focus the NEW row's first input/select if we have the id
        let focusTarget: HTMLInputElement | HTMLSelectElement | null = null;

        if (added?.id) {
          // exact row (requires <tr data-row-id={set.id}> in EditSetRow)
          const exactRow = await waitForElement<HTMLTableRowElement>(
            `tr[data-row-id="${added.id}"]`,
            3000
          );
          if (exactRow) {
            focusTarget =
              (exactRow.querySelector("input, select") as
                | HTMLInputElement
                | HTMLSelectElement
                | null) ?? null;
          }
        }

        // 3) Fallback: focus the last row's first input/select
        if (!focusTarget) {
          const lastRow = document.querySelector(
            '#sets-table table tbody tr:last-of-type'
          );
          focusTarget =
            (lastRow?.querySelector("input, select") as
              | HTMLInputElement
              | HTMLSelectElement
              | null) ?? null;
        }

        focusTarget?.focus();
        if (focusTarget instanceof HTMLInputElement) {
          // place cursor at end for quick editing
          const len = focusTarget.value?.length ?? 0;
          try {
            focusTarget.setSelectionRange?.(len, len);
          } catch {
            /* ignore */
          }
        }
      }, 250);
    } catch (err) {
      console.error(err);
      toast.error("Unexpected error while adding set.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleAddSet}
      disabled={loading}
      className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
      aria-busy={loading}
      aria-live="polite"
    >
      {loading ? "Adding…" : "+ Set"}
    </button>
  );
}