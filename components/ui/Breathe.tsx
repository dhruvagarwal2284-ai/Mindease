"use client";

import { useEffect, useRef, useState } from "react";
import { cx } from "@/lib/format";

/**
 * A 4-7-8 breathing pacer.
 *
 * The app already teaches this pattern in two resources (`r_exam_reset`,
 * `r_panic`) as prose. Reading "inhale for 4, hold for 7, exhale for 8" while
 * you are panicking is work; following a shape that is already doing it is
 * not. This turns the instruction into something you can borrow a rhythm from.
 *
 * It is deliberately not a tracked activity — no streak, no completion state,
 * nothing written to the store. Anything that scores you here would turn a
 * calming exercise into one more thing to be failing at.
 */

type Phase = { label: string; seconds: number; scale: number };

/** 4 in, 7 hold, 8 out. `scale` is where the orb should have arrived by the
 *  END of the phase; the orb interpolates toward it. */
const CYCLE: Phase[] = [
  { label: "Breathe in", seconds: 4, scale: 1 },
  { label: "Hold", seconds: 7, scale: 1 },
  { label: "Breathe out", seconds: 8, scale: 0.62 },
];

export const CYCLE_SECONDS = CYCLE.reduce((n, p) => n + p.seconds, 0);

const REST_SCALE = 0.62;

export type BreathState = {
  label: string;
  /** 0..1 through the current phase */
  progress: number;
  index: number;
  /** orb scale at this instant, already interpolated */
  scale: number;
  /** completed full cycles */
  breaths: number;
};

/**
 * Pure — where in the 4-7-8 cycle `elapsed` seconds lands.
 * Exported so `scripts/check-breathing.mjs` can assert the boundaries.
 */
export function breathAt(elapsed: number): BreathState {
  const e = Math.max(0, elapsed);
  const t = e % CYCLE_SECONDS;

  let start = 0;
  for (let i = 0; i < CYCLE.length; i++) {
    const phase = CYCLE[i];
    if (t < start + phase.seconds) {
      const progress = (t - start) / phase.seconds;
      const from = i === 0 ? REST_SCALE : CYCLE[i - 1].scale;
      return {
        label: phase.label,
        progress,
        index: i,
        scale: from + (phase.scale - from) * progress,
        breaths: Math.floor(e / CYCLE_SECONDS),
      };
    }
    start += phase.seconds;
  }

  // Only reachable on a floating-point edge exactly at the cycle boundary.
  const last = CYCLE[CYCLE.length - 1];
  return {
    label: last.label,
    progress: 1,
    index: CYCLE.length - 1,
    scale: last.scale,
    breaths: Math.floor(e / CYCLE_SECONDS),
  };
}

export function Breathe({ className }: { className?: string }) {
  const [running, setRunning] = useState(false);
  const [breath, setBreath] = useState<BreathState>(() => breathAt(0));
  const startedAt = useRef(0);
  const frame = useRef(0);

  useEffect(() => {
    if (!running) return;
    startedAt.current = performance.now();

    const tick = (now: number) => {
      setBreath(breathAt((now - startedAt.current) / 1000));
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [running]);

  const scale = running ? breath.scale : REST_SCALE;

  return (
    <div
      className={cx(
        "flex flex-col items-center gap-6 text-center sm:flex-row sm:gap-8 sm:text-left",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setRunning((r) => !r)}
        aria-pressed={running}
        aria-label={running ? "Stop the breathing pacer" : "Start a breathing pacer"}
        className="relative grid h-40 w-40 shrink-0 place-items-center rounded-full focus-visible:outline-3"
      >
        {/* Outer halo — one step behind the orb, so the motion has depth. */}
        <span
          aria-hidden
          className="absolute inset-0 rounded-full bg-teal-300/25 blur-xl"
          style={{
            transform: `scale(${scale * 1.06})`,
            transition: "transform 120ms linear",
          }}
        />
        <span
          aria-hidden
          className="absolute inset-0 rounded-full border border-teal-300/50 bg-gradient-to-br from-teal-100/80 to-info-100/60"
          style={{
            transform: `scale(${scale})`,
            transition: "transform 120ms linear",
          }}
        />
        <span className="relative text-center">
          <span className="block text-sm font-semibold text-navy-900">
            {running ? breath.label : "Breathe with me"}
          </span>
          <span className="muted mt-0.5 block text-xs">
            {running ? `${breath.breaths} breath${breath.breaths === 1 ? "" : "s"}` : "4 in · 7 hold · 8 out"}
          </span>
        </span>
      </button>

      <div className="min-w-0">
        <h3 className="text-base font-semibold text-navy-900">Take a minute</h3>
        <p className="muted mt-1 max-w-sm text-sm">
          {running
            ? "Follow the circle. Stop whenever you want — nothing here is being recorded."
            : "A slow pattern to borrow when your own breathing has gone short. Nothing is saved, and there is no streak to keep."}
        </p>

        {/* Screen readers get the phase changes; the orb is decorative to them. */}
        <p aria-live="polite" className="sr-only">
          {running ? breath.label : ""}
        </p>
      </div>
    </div>
  );
}
