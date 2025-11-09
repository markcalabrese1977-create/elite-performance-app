// src/app/coach/page.tsx
import { db } from '../lib/db';
import { sets, exercises, sessions } from '../drizzle/schema';
import { sql } from 'drizzle-orm';
import { subDays, format } from 'date-fns';
import { Bot, TrendingUp, AlertCircle, Flame } from 'lucide-react';

export default async function CoachPage() {
  const thirtyDaysAgo = subDays(new Date(), 30).toISOString();

  const recentSets = await db
    .select({
      exerciseId: sets.exerciseId,
      exerciseName: exercises.name,
      weight: sets.weight,
      reps: sets.reps,
      createdAt: sets.createdAt,
    })
    .from(sets)
    .innerJoin(exercises, sql`${sets.exerciseId} = ${exercises.id}`)
    .where(sql`${sets.createdAt} >= ${thirtyDaysAgo} AND ${sets.createdAt} IS NOT NULL`)
    .orderBy(sets.createdAt);

  // Calculate 1RM progression per exercise
  const exerciseProgress = recentSets.reduce((acc, set) => {
    const oneRM = set.weight * (1 + set.reps / 30);
    const dateStr = format(new Date(set.createdAt!), 'MMM d'); // ← FIXED: use new Date() directly

    if (!acc[set.exerciseName]) {
      acc[set.exerciseName] = { values: [], best: 0 };
    }
    acc[set.exerciseName].values.push({
      date: dateStr,
      oneRM: Math.round(oneRM),
    });
    acc[set.exerciseName].best = Math.max(acc[set.exerciseName].best, oneRM);
    return acc;
  }, {} as Record<string, { values: { date: string; oneRM: number }[]; best: number }>);

  // Find best lifts
  const bestLifts = Object.entries(exerciseProgress)
    .map(([name, data]) => ({ name, oneRM: Math.round(data.best) }))
    .sort((a, b) => b.oneRM - a.oneRM)
    .slice(0, 3);

  // Detect plateaus
  const plateaus = Object.entries(exerciseProgress)
    .filter(([_, data]) => {
      const recent = data.values.slice(-3);
      if (recent.length < 2) return false;
      const maxRecent = Math.max(...recent.map(r => r.oneRM));
      return maxRecent < data.best * 0.95;
    })
    .map(([name]) => name);

  // Count workouts
  const workoutCount = await db
    .select({ count: sql<number>`count(distinct ${sessions.id})` })
    .from(sessions)
    .where(sql`${sessions.createdAt} >= ${thirtyDaysAgo} AND ${sessions.createdAt} IS NOT NULL`);

  const advice = (() => {
    if (workoutCount[0].count === 0) {
      return {
        icon: <Bot className="h-12 w-12 text-primary" />,
        title: "Welcome to Your AI Coach!",
        message: "Start logging workouts to get personalized advice. I'm here to help you crush your goals.",
        color: "text-primary",
      };
    }

    if (plateaus.length > 0) {
      return {
        icon: <AlertCircle className="h-12 w-12 text-orange-500" />,
        title: "Plateau Alert!",
        message: `You're stuck on ${plateaus.join(', ')}. Try deloading 10% for a week or switch exercises. Your body needs a new stimulus!`,
        color: "text-orange-500",
      };
    }

    if (bestLifts.length > 0) {
      return {
        icon: <Flame className="h-12 w-12 text-red-500" />,
        title: "ABSOLUTE BEAST!",
        message: `Your ${bestLifts[0].name} 1RM is ${bestLifts[0].oneRM} lbs — that's elite level! Keep pushing. The iron is bending to your will.`,
        color: "text-red-500",
      };
    }

    return {
      icon: <TrendingUp className="h-12 w-12 text-green-500" />,
      title: "Strong & Steady!",
      message: "You're building real strength. Consistency is your superpower. Keep logging — the gains are compounding.",
      color: "text-green-500",
    };
  })();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12">Your AI Coach</h1>

        {/* Main Advice Card */}
        <div className="bg-card rounded-2xl shadow-2xl p-8 mb-12 border-2 border-primary/20">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6">{advice.icon}</div>
            <h2 className={`text-3xl font-bold mb-4 ${advice.color}`}>{advice.title}</h2>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">{advice.message}</p>
          </div>
        </div>

        {/* Best Lifts */}
        {bestLifts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {bestLifts.map((lift, i) => (
              <div key={i} className="bg-card rounded-xl p-6 text-center shadow-lg border border-primary/10">
                <div className="text-5xl font-bold text-primary">{lift.oneRM}</div>
                <div className="text-lg text-muted-foreground">lbs 1RM</div>
                <div className="mt-2 text-xl font-semibold">{lift.name}</div>
              </div>
            ))}
          </div>
        )}

        {/* Workout Streak */}
        <div className="bg-card rounded-xl p-8 text-center shadow-lg">
          <div className="text-6xl font-bold text-primary">{workoutCount[0].count}</div>
          <div className="text-2xl text-muted-foreground mt-2">Workouts This Month</div>
          <div className="mt-6 text-2xl font-medium">
            {workoutCount[0].count >= 12 ? "You're an absolute machine!" : "Keep showing up — greatness takes time!"}
          </div>
        </div>
      </div>
    </div>
  );
}