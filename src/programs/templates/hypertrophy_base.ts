import { ProgramTemplate } from "../types";

export const hypertrophyBase: ProgramTemplate = {
  id: "hypertrophy_base",
  name: "Hypertrophy Base (6 weeks)",
  goal: "hypertrophy",
  durationWeeks: 6,
  daysPerWeek: 6,
  notes: "Push/Pull/Legs x2. RIR ≈ 2; last set can be 1RIR.",
  weeks: Array.from({ length: 6 }, () => ({
    sessions: [
      { title: "Push A", sets: [
        { exerciseCode: "bench_barbell_flat", setIndex: 1, reps: 10, rir: 2, tempo: "2-0-2" },
        { exerciseCode: "bench_barbell_flat", setIndex: 2, reps: 10, rir: 2, tempo: "2-0-2" },
        { exerciseCode: "cable_fly",           setIndex: 3, reps: 12, rir: 2, tempo: "2-1-2" },
        { exerciseCode: "triceps_pushdown",    setIndex: 4, reps: 12, rir: 2, tempo: "2-0-2" },
      ]},
      { title: "Pull A", sets: [
        { exerciseCode: "pulldown_neutral",    setIndex: 1, reps: 10, rir: 2, tempo: "2-0-2" },
        { exerciseCode: "db_row_supported",    setIndex: 2, reps: 12, rir: 2, tempo: "2-1-2" },
        { exerciseCode: "rear_delt_raise_inc", setIndex: 3, reps: 15, rir: 2, tempo: "2-1-2" },
        { exerciseCode: "ez_bar_curl",         setIndex: 4, reps: 12, rir: 2, tempo: "2-0-2" },
      ]},
      { title: "Legs A", sets: [
        { exerciseCode: "hack_squat",          setIndex: 1, reps: 10, rir: 2, tempo: "2-0-2" },
        { exerciseCode: "leg_extension",       setIndex: 2, reps: 12, rir: 2, tempo: "2-0-2" },
        { exerciseCode: "hip_thrust_machine",  setIndex: 3, reps: 12, rir: 2, tempo: "2-1-2" },
        { exerciseCode: "leg_press_calf",      setIndex: 4, reps: 12, rir: 2, tempo: "2-0-2" },
      ]},
      { title: "Push B", sets: [
        { exerciseCode: "db_press_incline",    setIndex: 1, reps: 10, rir: 2, tempo: "2-0-2" },
        { exerciseCode: "db_press_incline",    setIndex: 2, reps: 10, rir: 2, tempo: "2-0-2" },
        { exerciseCode: "lateral_raise",       setIndex: 3, reps: 15, rir: 2, tempo: "2-1-2" },
        { exerciseCode: "triceps_pushdown",    setIndex: 4, reps: 12, rir: 2, tempo: "2-0-2" },
      ]},
      { title: "Pull B", sets: [
        { exerciseCode: "pulldown_normal",     setIndex: 1, reps: 10, rir: 2, tempo: "2-0-2" },
        { exerciseCode: "seated_cable_row",    setIndex: 2, reps: 12, rir: 2, tempo: "2-1-2" },
        { exerciseCode: "hammer_curl",         setIndex: 3, reps: 12, rir: 2, tempo: "2-0-2" },
        { exerciseCode: "reverse_curl_ez",     setIndex: 4, reps: 12, rir: 2, tempo: "2-0-2" },
      ]},
      { title: "Legs B", sets: [
        { exerciseCode: "rdl_barbell",         setIndex: 1, reps: 8,  rir: 2, tempo: "2-0-2" },
        { exerciseCode: "lying_leg_curl",      setIndex: 2, reps: 12, rir: 2, tempo: "2-0-2" },
        { exerciseCode: "calf_smith",          setIndex: 3, reps: 12, rir: 2, tempo: "2-0-2" },
        { exerciseCode: "rope_crunch",         setIndex: 4, reps: 15, rir: 2, tempo: "2-1-2", isTestSet: false },
      ]},
    ],
  })),
};