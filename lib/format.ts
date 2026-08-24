import type { MoodDef, MoodValue } from "./types";

/* ------------------------------------------------------------------ moods */

export const MOODS: MoodDef[] = [
  { value: 5, label: "Great", emoji: "😄", tone: "positive" },
  { value: 4, label: "Good", emoji: "🙂", tone: "support" },
  { value: 3, label: "Okay", emoji: "😐", tone: "neutral" },
  { value: 2, label: "Low", emoji: "😔", tone: "attention" },
  { value: 1, label: "Struggling", emoji: "😢", tone: "urgent" },
];

export function mood(value: MoodValue | undefined): MoodDef {
  return MOODS.find((m) => m.value === value) ?? MOODS[2];
}

export function moodEmoji(value: number): string {
  const rounded = Math.max(1, Math.min(5, Math.round(value))) as MoodValue;
  return mood(rounded).emoji;
}

/* ------------------------------------------------------------------ dates */

/** Local (not UTC) yyyy-mm-dd, so "today" matches the student's calendar. */
export function isoDay(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function daysAgo(n: number, from: Date = new Date()): Date {
  const d = new Date(from);
  d.setDate(d.getDate() - n);
  return d;
}

export function parseDay(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function formatDay(iso: string): string {
  return parseDay(iso).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
  });
}

export function formatDayShort(iso: string): string {
  return parseDay(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function relativeTime(iso: string, now: number = Date.now()): string {
  const diff = now - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.round(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  return formatDayShort(isoDay(new Date(iso)));
}

/* ------------------------------------------------------------------- misc */

let idCounter = 0;

/** Collision-resistant enough for a prototype, and SSR-safe (client-only use). */
export function uid(prefix = "id"): string {
  idCounter += 1;
  return `${prefix}_${Date.now().toString(36)}_${idCounter.toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

export function pluralize(n: number, one: string, many = `${one}s`): string {
  return `${n} ${n === 1 ? one : many}`;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export function cx(...parts: unknown[]): string {
  return parts.filter((p): p is string => typeof p === "string" && p.length > 0).join(" ");
}

export function excerpt(text: string, max = 120): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1)}…`;
}
