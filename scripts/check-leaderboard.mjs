/**
 * Checks for the leaderboard scoring in lib/leaderboard.ts.
 *
 * Run: node scripts/check-leaderboard.mjs
 *
 * Scoring drives what people compete for, so the rules are asserted rather
 * than trusted: removed replies must not score, first-reply detection must
 * use the whole history (not just the window), and ties must break the same
 * way every render or ranks would jump around between page loads.
 * Logic is inlined because the source is TypeScript.
 */
import assert from "node:assert/strict";

const POINTS_PER_THANK = 1;
const POINTS_PER_FIRST_REPLY = 3;

const countReactions = (r) =>
  Object.values(r.reactions ?? {}).reduce((n, v) => n + (v ?? 0), 0);

function firstReplyIds(replies) {
  const earliest = new Map();
  for (const r of replies) {
    const held = earliest.get(r.postId);
    if (!held || r.createdAt < held.createdAt) earliest.set(r.postId, r);
  }
  return new Set([...earliest.values()].map((r) => r.id));
}

function standings(replies, since) {
  const inWindow = since ? replies.filter((r) => r.createdAt >= since) : replies;
  const firsts = firstReplyIds(replies);
  const byHandle = new Map();
  for (const r of inWindow) {
    if (r.moderation === "removed") continue;
    let s = byHandle.get(r.authorHandle);
    if (!s) {
      s = { handle: r.authorHandle, score: 0, thanks: 0, firstReplies: 0, replies: 0, days: new Set() };
      byHandle.set(r.authorHandle, s);
    }
    s.replies += 1;
    s.thanks += countReactions(r);
    if (firsts.has(r.id)) s.firstReplies += 1;
    s.days.add(r.createdAt.slice(0, 10));
  }
  return [...byHandle.values()]
    .map(({ days, ...s }) => ({
      ...s, daysPresent: days.size,
      score: s.thanks * POINTS_PER_THANK + s.firstReplies * POINTS_PER_FIRST_REPLY,
    }))
    .sort((a, b) => b.score - a.score || b.firstReplies - a.firstReplies || a.handle.localeCompare(b.handle));
}

const reply = (id, handle, postId, createdAt, reactions = {}, moderation = "published") =>
  ({ id, authorHandle: handle, postId, createdAt, reactions, moderation });

// --- gratitude and first-reply scoring -----------------------------------
{
  const rows = standings([
    reply("r1", "A", "p1", "2026-08-01T10:00:00Z", { here: 2, sending: 1 }), // first on p1: 3 + 3 thanks
    reply("r2", "B", "p1", "2026-08-01T11:00:00Z", { here: 1 }),            // not first: 1
  ]);
  assert.equal(rows[0].handle, "A");
  assert.equal(rows[0].thanks, 3);
  assert.equal(rows[0].firstReplies, 1);
  assert.equal(rows[0].score, 6);
  assert.equal(rows[1].score, 1);
}

// --- a removed reply scores nothing --------------------------------------
{
  const rows = standings([
    reply("r1", "A", "p1", "2026-08-01T10:00:00Z", { here: 9 }, "removed"),
    reply("r2", "B", "p2", "2026-08-01T10:00:00Z", { here: 1 }),
  ]);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].handle, "B");
}

// --- "first reply" is judged on all history, not just the window ---------
// B replied inside the window but A had already answered p1 last month, so B
// must NOT be credited with rescuing an unanswered post.
{
  const all = [
    reply("r1", "A", "p1", "2026-07-01T10:00:00Z"),
    reply("r2", "B", "p1", "2026-08-10T10:00:00Z", { here: 1 }),
  ];
  const rows = standings(all, "2026-08-01T00:00:00Z");
  assert.equal(rows.length, 1);
  assert.equal(rows[0].handle, "B");
  assert.equal(rows[0].firstReplies, 0);
  assert.equal(rows[0].score, 1);
}

// --- presence counts distinct days, not replies --------------------------
{
  const rows = standings([
    reply("r1", "A", "p1", "2026-08-01T09:00:00Z"),
    reply("r2", "A", "p2", "2026-08-01T18:00:00Z"),
    reply("r3", "A", "p3", "2026-08-02T09:00:00Z"),
  ]);
  assert.equal(rows[0].replies, 3);
  assert.equal(rows[0].daysPresent, 2);
}

// --- ties break deterministically ---------------------------------------
// Equal score: more first-replies wins; then handle, so order never wobbles.
{
  const rows = standings([
    reply("r1", "Z", "p1", "2026-08-01T10:00:00Z", { here: 3 }), // first: 3+3 = 6
    reply("r2", "Y", "p2", "2026-08-01T10:00:00Z", { here: 6 }), // first: 6+3 = 9
    reply("r3", "X", "p3", "2026-08-01T10:00:00Z", { here: 6 }), // first: 6+3 = 9
  ]);
  assert.deepEqual(rows.map((r) => r.handle), ["X", "Y", "Z"]);
  const again = standings([
    reply("r2", "Y", "p2", "2026-08-01T10:00:00Z", { here: 6 }),
    reply("r3", "X", "p3", "2026-08-01T10:00:00Z", { here: 6 }),
    reply("r1", "Z", "p1", "2026-08-01T10:00:00Z", { here: 3 }),
  ]);
  assert.deepEqual(again.map((r) => r.handle), ["X", "Y", "Z"], "input order must not change ranks");
}

// --- empty input is a normal case, not a crash ---------------------------
assert.deepEqual(standings([]), []);
assert.deepEqual(standings([], "2026-08-01T00:00:00Z"), []);

console.log("leaderboard scoring: all checks passed");
