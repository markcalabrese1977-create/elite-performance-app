// src/seed/seed-exercises.ts
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { pgTable, serial, text, integer } from 'drizzle-orm/pg-core';

// --- SCHEMA (copy-paste directly into this file) ---
const exercises = pgTable('exercises', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
});

const exerciseAliases = pgTable('exercise_aliases', {
  id: serial('id').primaryKey(),
  exerciseId: integer('exercise_id').references(() => exercises.id),
  alias: text('alias').notNull(),
});

// --- DB CONNECTION ---
const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

// --- DATA ---
const exerciseCatalog = [
  {
    code: 'bench_barbell_flat',
    name: 'Flat Barbell Bench Press',
    aliases: ['bench press', 'barbell bench', 'flat bench'],
  },
  {
    code: 'squat_barbell_back',
    name: 'Barbell Back Squat',
    aliases: ['squat', 'back squat', 'barbell squat'],
  },
  {
    code: 'lateral_raise',
    name: 'DB Lateral Raise',
    aliases: ['side laterals', 'dumbbell lateral raise', 'laterals'],
  },
] as const;

// --- SEED ---
async function seed() {
  console.log('Starting exercise seeding...');

  for (const ex of exerciseCatalog) {
    const [exercise] = await db
      .insert(exercises)
      .values({ code: ex.code, name: ex.name })
      .onConflictDoNothing({ target: exercises.code })
      .returning();

    if (!exercise) {
      console.log(`Skipped: ${ex.code} (already exists)`);
      continue;
    }

    const aliasData = ex.aliases.map(alias => ({
      exerciseId: exercise.id,
      alias: alias.toLowerCase().trim(),
    }));

    await db.insert(exerciseAliases).values(aliasData).onConflictDoNothing();
    console.log(`Seeded: ${ex.name} (${ex.aliases.length} aliases)`);
  }

  console.log('Seeding complete!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});