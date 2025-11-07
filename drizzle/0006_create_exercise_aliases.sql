// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Tailwind-aware className combiner.
 * Usage: className={cn("p-4", cond && "hidden", className)}
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}