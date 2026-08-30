import type { Post, Reply } from "./types";

/**
 * Peer-supporter standings, derived from what already exists in the store.
 *
 * WHAT IS SCORED, AND WHY IT MATTERS
 * ----------------------------------
 * The previous screen promised points for "accepting chat requests". Scoring
 * activity in a mental-health product incentivises the wrong thing: taking on
 * as many distressed students as possible, fast, to move up a table. Nobody is
 * helped better by being someone's forty-second conversation of the week.
 *
 * So nothing here counts what a supporter *did*. It counts what other students
 * said afterwards:
 *
 *   gratitude   one point per support reaction another student left on a reply
 *               you wrote. Someone had to press it.
 *   answering   three points for being the FIRST reply on a post. An unanswered
 *               post is a student who reached out and got silence, and turning
 *               that around is the single most valuable act on the feed.
 *   presence    distinct days you replied on. Rewards showing up regularly
 *               rather than binge-replying for a week and vanishing.
 *
 * Your own reactions on your own replies are excluded — see `myReactions` in
 * the caller. Self-reacting must not be a scoring strategy.
 */

export interface Standing {
  handle: string;
  score: number;
  /** support reactions received from other students */
  thanks: number;
  /** posts where this handle got there first */
  firstReplies: number;
  /** distinct days with at least one reply */
  daysPresent: number;
  replies: number;
}

export const POINTS_PER_THANK = 1;
export const POINTS_PER_FIRST_REPLY = 3;

function countReactions(reply: Reply): number {
  return Object.values(reply.reactions ?? {}).reduce<number>((n, v) => n + (v ?? 0), 0);
}

/** Reply ids that were the earliest reply on their post. */
export function firstReplyIds(replies: Reply[]): Set<string> {
  const earliest = new Map<string, Reply>();
  for (const r of replies) {
    const held = earliest.get(r.postId);
    if (!held || r.createdAt < held.createdAt) earliest.set(r.postId, r);
  }
  return new Set([...earliest.values()].map((r) => r.id));
}

/**
 * @param since ISO timestamp — only replies at or after this count. Omit for all time.
 */
export function standings(replies: Reply[], since?: string): Standing[] {
  const inWindow = since ? replies.filter((r) => r.createdAt >= since) : replies;
  // Firsts are judged against the whole history: a reply is not "first" just
  // because earlier replies fell outside the window.
  const firsts = firstReplyIds(replies);

  const byHandle = new Map<string, Standing & { days: Set<string> }>();

  for (const r of inWindow) {
    if (r.moderation === "removed") continue;
    const key = r.authorHandle;
    let s = byHandle.get(key);
    if (!s) {
      s = {
        handle: key, score: 0, thanks: 0, firstReplies: 0,
        daysPresent: 0, replies: 0, days: new Set<string>(),
      };
      byHandle.set(key, s);
    }
    s.replies += 1;
    s.thanks += countReactions(r);
    if (firsts.has(r.id)) s.firstReplies += 1;
    s.days.add(r.createdAt.slice(0, 10));
  }

  return [...byHandle.values()]
    .map(({ days, ...s }) => ({
      ...s,
      daysPresent: days.size,
      score: s.thanks * POINTS_PER_THANK + s.firstReplies * POINTS_PER_FIRST_REPLY,
    }))
    .sort((a, b) =>
      b.score - a.score ||
      b.firstReplies - a.firstReplies ||
      a.handle.localeCompare(b.handle),
    );
}

/** 1-based rank, or null if the handle has no standing in this window. */
export function rankOf(rows: Standing[], handle: string): number | null {
  const i = rows.findIndex((r) => r.handle === handle);
  return i === -1 ? null : i + 1;
}

export type AwardWinner = { handle: string; value: number };

/**
 * Who currently holds each award. Returns null for an award nobody has earned
 * yet — an unearned award must render as locked, never as awarded to nobody.
 */
export function awards(rows: Standing[]) {
  const best = (pick: (s: Standing) => number): AwardWinner | null => {
    const top = [...rows].sort((a, b) => pick(b) - pick(a))[0];
    return top && pick(top) > 0 ? { handle: top.handle, value: pick(top) } : null;
  };
  return {
    "most-thanked": best((s) => s.thanks),
    "first-response": best((s) => s.firstReplies),
    "steady-presence": best((s) => s.daysPresent),
  };
}

/** ISO timestamp for midnight `days` ago — the leaderboard window. */
export function windowStart(days: number, now = new Date()): string {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

/**
 * Posts with no replies yet — the thing the board is trying to get to zero.
 *
 * ponytail: scored against the local store only. The community feed now reads
 * posts from Firestore, but support reactions — the entire scoring input —
 * still live in the local store, so that is the only complete source. Expect
 * this count to disagree with the feed until replies and reactions move too.
 */
export function unansweredPosts(posts: Post[], replies: Reply[]): Post[] {
  const answered = new Set(replies.map((r) => r.postId));
  return posts.filter((p) => p.moderation !== "removed" && !answered.has(p.id));
}
