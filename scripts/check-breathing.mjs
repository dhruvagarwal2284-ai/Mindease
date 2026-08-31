/**
 * Boundary check for the 4-7-8 pacer's phase maths.
 *
 * Run: node scripts/check-breathing.mjs
 *
 * The cumulative-threshold scan in `breathAt` is the kind of thing that goes
 * subtly wrong (off-by-one at a phase edge, wrong scale origin) and still
 * looks plausible on screen, so the boundaries are asserted rather than eyeballed.
 * Inlined rather than imported because the source is .tsx.
 */
import assert from "node:assert/strict";

const CYCLE = [
  { label: "Breathe in", seconds: 4, scale: 1 },
  { label: "Hold", seconds: 7, scale: 1 },
  { label: "Breathe out", seconds: 8, scale: 0.62 },
];
const CYCLE_SECONDS = 19;
const REST_SCALE = 0.62;

function breathAt(elapsed) {
  const e = Math.max(0, elapsed);
  const t = e % CYCLE_SECONDS;
  let start = 0;
  for (let i = 0; i < CYCLE.length; i++) {
    const phase = CYCLE[i];
    if (t < start + phase.seconds) {
      const progress = (t - start) / phase.seconds;
      const from = i === 0 ? REST_SCALE : CYCLE[i - 1].scale;
      return {
        label: phase.label, progress, index: i,
        scale: from + (phase.scale - from) * progress,
        breaths: Math.floor(e / CYCLE_SECONDS),
      };
    }
    start += phase.seconds;
  }
  const last = CYCLE[CYCLE.length - 1];
  return { label: last.label, progress: 1, index: CYCLE.length - 1, scale: last.scale, breaths: Math.floor(e / CYCLE_SECONDS) };
}

// Phase boundaries: 0-4 in, 4-11 hold, 11-19 out.
assert.equal(breathAt(0).label, "Breathe in");
assert.equal(breathAt(3.99).label, "Breathe in");
assert.equal(breathAt(4).label, "Hold");
assert.equal(breathAt(10.99).label, "Hold");
assert.equal(breathAt(11).label, "Breathe out");
assert.equal(breathAt(18.99).label, "Breathe out");

// Wraps cleanly into the next cycle.
assert.equal(breathAt(19).label, "Breathe in");
assert.equal(breathAt(19).breaths, 1);
assert.equal(breathAt(38).breaths, 2);
assert.equal(breathAt(18.99).breaths, 0);

// Negative / zero elapsed must not throw or go NaN.
assert.equal(breathAt(-5).label, "Breathe in");
assert.ok(Number.isFinite(breathAt(-5).scale));

// Scale travels rest -> 1 on the inhale, holds, then returns to rest.
assert.equal(breathAt(0).scale, REST_SCALE);
assert.ok(Math.abs(breathAt(3.999).scale - 1) < 0.001);
assert.equal(breathAt(4).scale, 1);      // hold starts at full
assert.equal(breathAt(10.999).scale, 1); // and stays there
assert.equal(breathAt(11).scale, 1);     // exhale starts from full
assert.ok(Math.abs(breathAt(18.999).scale - REST_SCALE) < 0.001);

// Scale never leaves the drawn range.
for (let t = 0; t < CYCLE_SECONDS * 3; t += 0.05) {
  const { scale } = breathAt(t);
  assert.ok(scale >= REST_SCALE - 1e-9 && scale <= 1 + 1e-9, `scale ${scale} out of range at ${t}s`);
}

console.log("breathing pacer: all boundary checks passed");
