import { ProgramTemplate } from "../types";

export const fatLossPrimer: ProgramTemplate = {
  id: "fat_loss_primer",
  name: "Fat-Loss Primer (4 weeks)",
  goal: "fatloss",
  durationWeeks: 4,
  daysPerWeek: 3,
  notes: "Full-body 3x/week. Moderate volume, keep 1–2 RIR.",
  weeks: Array.from({ length: 4 }, () => ({
    sessions: [
      { title: "Full Body A", sets: [
        { exerciseCode: "squat_smith_seated_press", setIndex: 1, reps: 10, rir: 2, tempo: "2-0-2" }, // placeholder combo code → map to actuals
        { exerciseCode: "pulldown_neutral",         setIndex: 2, reps: 10, rir: 2, tempo: "2-0-2" },
        { exerciseCode: "db_press_incline",         setIndex: 3, reps: 10, rir: 2, tempo: "2-0-2" },
      ]},
      { title: "Full Body B", sets: [
        { exerciseCode: "rdl_barbell",              setIndex: 1, reps: 8,  rir: 2, tempo: "2-0-2" },
        { exerciseCode: "seated_cable_row",         setIndex: 2, reps: 12, rir: 2, tempo: "2-1-2" },
        { exerciseCode: "lateral_raise",            setIndex: 3, reps: 15, rir: 2, tempo: "2-1-2" },
      ]},
      { title: "Full Body C", sets: [
        { exerciseCode: "hack_squat",               setIndex: 1, reps: 10, rir: 2, tempo: "2-0-2" },
        { exerciseCode: "bench_barbell_flat",       setIndex: 2, reps: 10, rir: 2, tempo: "2-0-2" },
        { exerciseCode: "ez_bar_curl",              setIndex: 3, reps: 12, rir: 2, tempo: "2-0-2" },
      ]},
    ],
  })),
};