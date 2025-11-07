// src/programs/builders/maintenance_builder.ts
import type { ProgramTemplate } from "../types";

/**
 * Minimal placeholder program we can apply end-to-end.
 * You can flesh out sessions/sets later.
 */
export const maintenanceBuilder: ProgramTemplate = {
  id: "maintenance_builder",
  name: "Maintenance Builder (4 weeks)",
  goal: "maintenance",
  durationWeeks: 4,
  daysPerWeek: 3,
  notes: "Light full-body maintenance. Keep RIR ~2.",
  weeks: Array.from({ length: 4 }, () => ({
    sessions: [
      { title: "Full Body A", sets: [] },
      { title: "Full Body B", sets: [] },
      { title: "Full Body C", sets: [] },
    ],
  })),
};