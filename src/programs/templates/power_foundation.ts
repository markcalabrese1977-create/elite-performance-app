import { ProgramTemplate } from "../types";

export const powerFoundation: ProgramTemplate = {
  id: "power_foundation",
  name: "Power Foundation (8 weeks)",
  goal: "strength",
  durationWeeks: 8,
  daysPerWeek: 4,
  notes: "Upper/Lower ×2. Compounds first; accessories 2 RIR.",
  weeks: Array.from({ length: 8 }, () => ({
    sessions: [
      { title: "Upper 1", sets: [
        { exerciseCode: "bench_barbell_flat", setIndex: 1, reps: 5,  rir: 2, tempo: "2-0-1" },
        { exerciseCode: "seated_cable_row",   setIndex: 2, reps: 6,  rir: 2, tempo: "2-0-1" },
        { exerciseCode: "lateral_raise",      setIndex: 3, reps: 12, rir: 2, tempo: "2-1-2" },
      ]},
      { title: "Lower 1", sets: [
        { exerciseCode: "hack_squat",         setIndex: 1, reps: 5,  rir: 2, tempo: "2-0-1" },
        { exerciseCode: "rdl_barbell",        setIndex: 2, reps: 6,  rir: 2, tempo: "2-0-1" },
        { exerciseCode: "leg_extension",      setIndex: 3, reps: 10, rir: 2, tempo: "2-0-2" },
      ]},
      { title: "Upper 2", sets: [
        { exerciseCode: "db_press_incline",   setIndex: 1, reps: 6,  rir: 2, tempo: "2-0-1" },
        { exerciseCode: "pulldown_normal",    setIndex: 2, reps: 6,  rir: 2, tempo: "2-0-1" },
        { exerciseCode: "rear_delt_raise_inc",setIndex: 3, reps: 12, rir: 2, tempo: "2-1-2" },
      ]},
      { title: "Lower 2", sets: [
        { exerciseCode: "lying_leg_curl",     setIndex: 1, reps: 8,  rir: 2, tempo: "2-0-1" },
        { exerciseCode: "calf_smith",         setIndex: 2, reps: 12, rir: 2, tempo: "2-0-2" },
        { exerciseCode: "rope_crunch",        setIndex: 3, reps: 15, rir: 2, tempo: "2-1-2" },
      ]},
    ],
  })),
};