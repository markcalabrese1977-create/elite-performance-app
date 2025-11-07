import Link from "next/link";
import { headers } from "next/headers";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import EditSetRow from "../_components/EditSetRow";
import SessionMiniCharts from "./_components/SessionMiniCharts";
import AddSetInline from "./_components/AddSetInline";

/* ---------- Types (match API shapes) ---------- */

type Session = {
  id: number;
  userId: number;
  date: string | null;
  dayIndex: number | null;
  fatigueScore: number | null;
  notes: string | null;
};

type SetRow = {
  id: number;
  sessionId: number;
  exerciseId: number;
  setIndex: number;
  load: number | null;
  reps: number | null;
  rir: number | null;
  tempo: string | null;
  isTestSet: boolean | null;
};

/* ---------- Helpers ---------- */

function fmtDate(d?: string | null) {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "—";
  return dt.toLocaleString();
}

/* ---------- Page (Server Component) ---------- */

export default async function SessionDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  // Next 15+ passes `params` as a Promise in RSCs
  const { id } = await props.params;

  // Build absolute URL for server-side fetch (works locally & in prod)
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const base = `${proto}://${host}`;

  const res = await fetch(`${base}/api/journal/${id}`, { cache: "no-store" });
  if (!res.ok) {
    return (
      <main className="mx-auto w-full max-w-6xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Session {id}</h1>
          <Link href="/sessions" className="text-blue-600 underline">
            ← Back to Sessions
          </Link>
        </div>
        <Card>
          <CardContent className="p-6 text-red-600">Failed to load session.</CardContent>
        </Card>
      </main>
    );
  }

  const data = (await res.json()) as {
    ok: boolean;
    session: Session;
    sets: SetRow[];
  };

  const { session, sets } = data;

  // Chart rows; make it null-safe and stable for recharts
  const chartData = sets
    .slice()
    .sort((a, b) => a.setIndex - b.setIndex)
    .map((s) => {
      const load = s.load ?? 0;
      const reps = s.reps ?? 0;
      const vol = load * reps;
      const est1rm = load > 0 ? Math.round(load * (1 + reps / 30)) : 0; // Epley
      return {
        name: `S${s.setIndex}`,
        volume: vol,
        epley: est1rm,
        rir: s.rir ?? undefined,
      };
    });

  return (
    <main className="mx-auto w-full max-w-6xl p-6 space-y-6">
      {/* Title / Back link */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Session #{session.id}</h1>
        <Link href="/sessions" className="text-blue-600 underline">
          ← Back to Sessions
        </Link>
      </div>

      {/* Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Overview</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2">
          <div>
            <span className="text-slate-500">Date:</span> {fmtDate(session.date)}
          </div>
          <div>
            <span className="text-slate-500">Day:</span> {session.dayIndex ?? "—"}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Fatigue:</span>
            {typeof session.fatigueScore === "number" ? (
              <Badge variant="secondary" className="font-mono">
                {session.fatigueScore}
              </Badge>
            ) : (
              "—"
            )}
          </div>
          <div className="truncate">
            <span className="text-slate-500">Notes:</span> {session.notes ?? "—"}
          </div>
        </CardContent>
      </Card>

      {/* Charts (client-rendered inside component) */}
      <SessionMiniCharts data={chartData} />

      {/* Sets table */}
      <Card>
        <CardHeader className="pb-3 flex items-center justify-between">
          <CardTitle className="text-lg">Sets</CardTitle>
          {/* Inline +Set button that inserts and calls router.refresh() */}
          <AddSetInline sessionId={session.id} />
        </CardHeader>

        <CardContent className="pt-0">
  {/* Give table container an id for AddSetInline scroll/focus logic */}
  <div id="sets-table" className="overflow-x-auto rounded-xl border">
    <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[70px]">#</TableHead>
                  <TableHead className="w-[110px]">Exercise ID</TableHead>
                  <TableHead className="w-[90px]">Set</TableHead>
                  <TableHead className="w-[110px]">Load</TableHead>
                  <TableHead className="w-[90px]">Reps</TableHead>
                  <TableHead className="w-[90px]">RIR</TableHead>
                  <TableHead className="w-[120px]">Tempo</TableHead>
                  <TableHead className="w-[90px]">Test?</TableHead>
                  <TableHead className="text-right w-[160px]">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {sets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="py-10 text-center text-slate-500">
                      No sets yet. Click “+ Set” to add your first one.
                    </TableCell>
                  </TableRow>
                ) : (
                  sets
                    .slice()
                    .sort((a, b) => a.setIndex - b.setIndex)
                    .map((set) => <EditSetRow key={set.id} set={set} />)
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}