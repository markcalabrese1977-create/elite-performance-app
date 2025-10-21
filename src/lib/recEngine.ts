import { ExerciseSession, Rec, ContextFlags } from "@/types/training";

/**
 * Implements:
 * - Global: Three to Grow / One to Know
 * - Late-meso bias: 1 RIR on compounds, 1–2 on accessories; optional 0RIR diagnostic set
 * - Progression: +2–5% when all sets hit top range cleanly; else progress density (reps) before load
 * - Recovery guardrails: If fatigue ≥7/10 or multiple sets <1 RIR, deload flag via reduce_load
 */
export function recommendNext(session: ExerciseSession, ctx: ContextFlags): Rec {
  const [low, high] = session.targetRepRange;
  const sets = session.sets;
  const lastSet = sets[sets.length - 1];

  const avgRIR = sets.reduce((s, x) => s + x.rir, 0) / Math.max(1, sets.length);
  const minRIR = Math.min(...sets.map(s => s.rir));
  const allAtTop = sets.every(s => s.reps >= high && s.rir >= (ctx.lateMeso ? 1 : 2));
  const topSetLoad = Math.max(...sets.map(s => s.load));
  const baseLoad = topSetLoad; // assume constant load per exercise for now

  // Fatigue / deload checks
  if ((ctx.fatigueScore ?? 0) >= 7 || (minRIR < 1 && sets.length >= 2)) {
    const newLoad = roundToPlate(baseLoad * 0.95);
    return {
      decision: "reduce_load",
      nextLoad: newLoad,
      nextRIR: session.kind === "compound" ? 1 : 2,
      notes: "Deload flag: high fatigue or sub-1 RIR detected. Drop ~5% and bias RIR up."
    };
  }

  // Late meso target RIRs
  const targetRIR = ctx.lateMeso
    ? (session.kind === "compound" ? 1 : 2)
    : (session.kind === "compound" ? 2 : 2);

  // If all sets hit the top of range cleanly at/above target RIR → increase load 2–5%
  if (allAtTop) {
    const pct = session.kind === "compound" ? 0.03 : 0.02; // conservative default inside your 2–5% rule
    const newLoad = roundToPlate(baseLoad * (1 + pct));
    return {
      decision: "increase_load",
      nextLoad: newLoad,
      nextRIR: targetRIR,
      notes: "All sets at top of range with clean RIR—nudging load upward."
    };
  }

  // If average RIR is above target and average reps are near top → push reps (density) first
  const avgReps = sets.reduce((s, x) => s + x.reps, 0) / Math.max(1, sets.length);
  if (avgRIR > targetRIR && avgReps >= high - 1) {
    return {
      decision: "increase_reps",
      nextLoad: baseLoad,
      nextRIR: targetRIR,
      notes: "Biasing density: hold load, push for +1 rep per working set."
    };
  }

  // If reps dipped well below the range or RIR was lower than intended → hold load and clean execution
  if (avgReps < low || avgRIR < targetRIR) {
    return {
      decision: "hold",
      nextLoad: baseLoad,
      nextRIR: targetRIR,
      notes: "Hold load; focus on tempo/rest to hit target RIR within rep range."
    };
  }

  // Default: hold and aim for upper half of the range
  return {
    decision: "hold",
    nextLoad: baseLoad,
    nextRIR: targetRIR,
    notes: "Maintain load; aim for upper half of the rep range before adding weight."
  };
}

function roundToPlate(x: number): number {
  // Round to nearest 2.5 lb increment (common home/US plates);
  // we can make this user-pref later (kg mode, microplates, etc.)
  return Math.round(x / 2.5) * 2.5;
}
