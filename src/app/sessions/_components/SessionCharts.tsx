// src/app/sessions/_components/SessionCharts.tsx
"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SetRow = {
  id: number;
  setIndex: number;
  load: number | null;
  reps: number | null;
  rir: number | null;
  isTestSet: boolean | null;
};

function epley1RM(load: number, reps: number) {
  // Simple estimate; fine for a quick visual
  return load * (1 + reps / 30);
}

function fmt(n?: number | null) {
  if (n == null || Number.isNaN(n)) return "—";
  return String(n);
}

type Props = {
  sets: SetRow[];
};

export default function SessionCharts({ sets }: Props) {
  if (!sets || sets.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Charts</CardTitle>
        </CardHeader>
        <CardContent className="text-slate-500">
          No sets yet — add a set to see charts.
        </CardContent>
      </Card>
    );
  }

  const volumeData = sets.map((s) => {
    const load = s.load ?? 0;
    const reps = s.reps ?? 0;
    return {
      name: `S${s.setIndex}`,
      volume: load * reps, // Load × Reps
      load,
      reps,
      rir: s.rir ?? null,
      isTestSet: !!s.isTestSet,
    };
  });

  const oneRmData = sets.map((s) => {
    const load = s.load ?? 0;
    const reps = s.reps ?? 0;
    return {
      name: `S${s.setIndex}`,
      est1RM: load > 0 && reps > 0 ? epley1RM(load, reps) : 0,
      isTestSet: !!s.isTestSet,
    };
  });

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Volume per set */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Volume per Set</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={volumeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value: number, key: string, _p) => {
                  if (key === "volume") return [value, "Volume (lb·reps)"];
                  return [value, key];
                }}
                labelFormatter={(label) => `Set ${label}`}
              />
              <Bar dataKey="volume" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-2 text-xs text-slate-500">
            Volume = Load × Reps. RIR shown in tooltip.
          </div>
        </CardContent>
      </Card>

      {/* Estimated 1RM trend */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Estimated 1RM (Epley)</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={oneRmData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value: number) => [fmt(value), "Est. 1RM"]}
                labelFormatter={(label) => `Set ${label}`}
              />
              <Line type="monotone" dataKey="est1RM" dot />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-2 text-xs text-slate-500">
            Epley formula; treat as a rough trend, not a PR validator.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}