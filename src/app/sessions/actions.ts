"use server";

import { revalidatePath } from "next/cache";

export async function applyProgramAction(formData: FormData) {
  const program = String(formData.get("program") ?? "").trim();
  const startDate = String(formData.get("startDate") ?? "").trim() || new Date().toISOString().slice(0,10);
  const userId = 1; // adjust when auth is added

  if (!program) throw new Error("Program is required");

  const res = await fetch(`/api/programs/${program}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ userId, startDate }),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`Apply failed: ${msg || res.statusText}`);
  }

  revalidatePath("/sessions");
}