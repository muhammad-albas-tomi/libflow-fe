// Penjelasan:
// Utility umum FE: cn (gabung class), delay, randomDelay, buildZodErrors.
import type * as z from 'zod';

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Menunda eksekusi selama `ms` milidetik.
 */
export function delay(ms = 1000): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Menunda dengan durasi acak antara `min` dan `max` (inklusif).
 */
export function randomDelay(min = 500, max = 1500): Promise<void> {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return delay(ms);
}

/**
 * Ubah daftar issue Zod menjadi format error standar { attr, detail, code }.
 */
export function buildZodErrors(issues: z.core.$ZodIssue[]) {
  return issues.map((issue) => ({
    attr: issue.path.join('.'),
    detail: issue.message,
    code: issue.code,
  }));
}
