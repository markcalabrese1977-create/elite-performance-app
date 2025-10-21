CREATE TABLE "exercises" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"muscle_group" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
