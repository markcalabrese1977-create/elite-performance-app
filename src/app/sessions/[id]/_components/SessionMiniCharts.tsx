"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
} from "recharts";

type Point = { name: string; volume: number; epley: number; rir?: number };

export default function SessionMiniCharts({ data }: { data: Point[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Volume per Set</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="w-full h-[280px] min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="volume" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Volume = Load × Reps. RIR shown in tooltip.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Estimated 1RM (Epley)</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="w-full h-[280px] min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="epley" dot />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Epley is a rough estimate, not a PR validator.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}