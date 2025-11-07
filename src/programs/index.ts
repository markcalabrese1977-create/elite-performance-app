// src/programs/index.ts
import { fatLossPrimer } from "./templates/fat_loss_primer";
import { powerFoundation } from "./templates/power_foundation";
import { hypertrophyBase } from "./templates/hypertrophy_base";
import { maintenanceBuilder } from "./builders/maintenance_builder"; // ✅ one import

import type { ProgramTemplate } from "./types";

export const PROGRAMS: ProgramTemplate[] = [
  fatLossPrimer,
  powerFoundation,
  hypertrophyBase,
  maintenanceBuilder, // ✅ listed once
];

export const PROGRAM_BY_ID = Object.fromEntries(
  PROGRAMS.map(p => [p.id, p])
);