import { daysAgo, isoDay } from "./format";
import type {
  CheckIn,
  JournalEntry,
  ModerationItem,
  Post,
  Reply,
  SupportIndicator,
  SupportLevel,
  SupportSignal,
} from "./types";

/**
 * Explainable support-indicator model.
 *
 * Every signal carries the plain-language evidence that produced it, because
 * the counsellor UI is required to answer "why does this alert exist?".
 * Nothing here is a diagnosis: the output is a prioritisation hint for a human.
 */

const MIN_CHECKINS = 3;

/** Weekly buckets, most recent last. */
export function weeklyMood(
  checkIns: CheckIn[],
  weeks = 4,
  now: Date = new Date(),
): { week: string; avg: number; count: number }[] {
  const out: { week: string; avg: number; count: number }[] = [];
  for (let w = weeks - 1; w >= 0; w -= 1) {
    const end = daysAgo(w * 7, now);
    const start = daysAgo(w * 7 + 6, now);
    const startIso = isoDay(start);
    const endIso = isoDay(end);
    const inWeek = checkIns.filter((c) => c.date >= startIso && c.date <= endIso);
    const avg = inWeek.length
      ? inWeek.reduce((s, c) => s + c.mood, 0) / inWeek.length
      : 0;
    out.push({
      week: `Week ${weeks - w}`,
      avg: Number(avg.toFixed(2)),
      count: inWeek.length,
    });
  }
  return out;
}

function tagCount(checkIns: CheckIn[], tag: string): number {
  return checkIns.filter((c) => c.tags.includes(tag as never)).length;
}

function lowStreak(checkIns: CheckIn[]): number {
  const sorted = [...checkIns].sort((a, b) => (a.date < b.date ? 1 : -1));
  let streak = 0;
  for (const c of sorted) {
    if (c.mood <= 2) streak += 1;
    else break;
  }
  return streak;
}

export function computeSupportIndicator(input: {
  checkIns: CheckIn[];
  journal: JournalEntry[];
  posts: Post[];
  /** the student's own replies, used to attribute crisis flags */
  replies?: Reply[];
  /** moderation queue — the only source of an acute signal */
  moderation?: ModerationItem[];
  now?: Date;
}): SupportIndicator {
  const now = input.now ?? new Date();
  const recentCutoff = isoDay(daysAgo(27, now));
  const checkIns = input.checkIns.filter((c) => c.date >= recentCutoff);
  const buckets = weeklyMood(checkIns, 4, now);
  const signals: SupportSignal[] = [];

  const hasEnoughData = checkIns.length >= MIN_CHECKINS;

  const last14 = checkIns.filter((c) => c.date >= isoDay(daysAgo(13, now)));
  const prior14 = checkIns.filter(
    (c) => c.date < isoDay(daysAgo(13, now)) && c.date >= isoDay(daysAgo(27, now)),
  );

  const avg = (list: CheckIn[]) =>
    list.length ? list.reduce((s, c) => s + c.mood, 0) / list.length : 0;

  const recentAvg = avg(last14);
  const priorAvg = avg(prior14);

  /* ---- signal: sustained low mood ---- */
  const lowCount = last14.filter((c) => c.mood <= 2).length;
  if (lowCount >= 3) {
    signals.push({
      key: "low_mood",
      label: "Sustained low mood",
      evidence: `${lowCount} of the last ${last14.length} check-ins were “Low” or “Struggling”.`,
      weight: Math.min(3, 1 + lowCount * 0.4),
    });
  }

  /* ---- signal: negative mood trend ---- */
  if (prior14.length >= 2 && last14.length >= 2 && recentAvg < priorAvg - 0.4) {
    signals.push({
      key: "mood_trend",
      label: "Negative mood trend",
      evidence: `Average mood moved from ${priorAvg.toFixed(1)} to ${recentAvg.toFixed(
        1,
      )} over the last two weeks.`,
      weight: 1.6,
    });
  }

  /* ---- signal: consecutive low days ---- */
  const streak = lowStreak(checkIns);
  if (streak >= 3) {
    signals.push({
      key: "streak",
      label: "Consecutive difficult days",
      evidence: `${streak} check-ins in a row reported a low mood.`,
      weight: 1.2 + streak * 0.2,
    });
  }

  /* ---- signal: academic stress ---- */
  const academic = tagCount(last14, "Academics") + tagCount(last14, "Exams");
  if (academic >= 2) {
    signals.push({
      key: "academic",
      label: "Academic stress",
      evidence: `“Academics” or “Exams” selected in ${academic} recent check-ins.`,
      weight: 1,
    });
  }

  /* ---- signal: social withdrawal ---- */
  const lonely = tagCount(last14, "Loneliness") + tagCount(last14, "Relationships");
  const postedRecently = input.posts.some(
    (p) => p.authorIsSelf && new Date(p.createdAt) >= daysAgo(13, now),
  );
  if (lonely >= 2) {
    signals.push({
      key: "withdrawal",
      label: "Social withdrawal indicators",
      evidence: `“Loneliness” or “Relationships” selected ${lonely} times${
        postedRecently ? "" : ", with no community participation in two weeks"
      }.`,
      weight: postedRecently ? 1 : 1.4,
    });
  }

  /* ---- signal: sleep disruption ---- */
  const sleep = tagCount(last14, "Sleep");
  if (sleep >= 2) {
    signals.push({
      key: "sleep",
      label: "Sleep disruption",
      evidence: `“Sleep” selected in ${sleep} recent check-ins.`,
      weight: 0.9,
    });
  }

  /* ---- signal: financial pressure ---- */
  const finance = tagCount(last14, "Finances");
  if (finance >= 2) {
    signals.push({
      key: "finance",
      label: "Financial pressure",
      evidence: `“Finances” selected in ${finance} recent check-ins.`,
      weight: 0.8,
    });
  }

  /* ---- signal: reflective writing tone ---- */
  const heavyJournal = input.journal.filter(
    (j) => !j.isDraft && j.mood <= 2 && new Date(j.createdAt) >= daysAgo(13, now),
  ).length;
  if (heavyJournal >= 2) {
    signals.push({
      key: "journal_tone",
      label: "Low mood recorded while journalling",
      evidence: `${heavyJournal} private entries in two weeks were saved with a low mood. The text itself was not read.`,
      weight: 1,
    });
  }

  /* ---- signal: acute — recent crisis-related language ---- */
  const ownContentIds = new Set<string>([
    ...input.posts.filter((p) => p.authorIsSelf).map((p) => p.id),
    ...(input.replies ?? []).filter((r) => r.authorIsSelf).map((r) => r.id),
  ]);
  const acuteFlags = (input.moderation ?? []).filter(
    (m) =>
      m.reason === "crisis_concern" &&
      ownContentIds.has(m.targetId) &&
      new Date(m.createdAt) >= daysAgo(13, now),
  );
  if (acuteFlags.length) {
    signals.push({
      key: "acute",
      label: "Recent crisis-related language",
      evidence: `${acuteFlags.length} piece${
        acuteFlags.length === 1 ? "" : "s"
      } of the student's own content was flagged for crisis-related language in the last two weeks.`,
      weight: 4,
    });
  }

  /* ---- level ----
   *
   * Longitudinal mood evidence alone tops out at "high". "Critical" carries a
   * specific operational meaning — immediate review under the institutional
   * safety protocol — and this model has no way to see acute risk except
   * through a crisis flag on the student's own content. Letting a run of low
   * check-ins reach "critical" would tell a counsellor something the evidence
   * does not support, and would blunt the level that should mean the most.
   */
  const total = signals.reduce((s, x) => s + x.weight, 0);
  let level: SupportLevel = "informational";
  if (total >= 4) level = "high";
  else if (total >= 2) level = "moderate";

  if (acuteFlags.length && total >= 4) level = "critical";

  if (!hasEnoughData) level = acuteFlags.length ? "high" : "informational";

  /* ---- trend ---- */
  let trend: SupportIndicator["trend"] = "steady";
  const w = buckets.filter((b) => b.count > 0);
  if (w.length >= 2) {
    const delta = w[w.length - 1].avg - w[w.length - 2].avg;
    if (delta <= -0.35) trend = "rising";
    else if (delta >= 0.35) trend = "easing";
  }

  /* ---- confidence: volume of evidence, never a probability of illness ---- */
  const volume = Math.min(1, checkIns.length / 14);
  const agreement = Math.min(1, signals.length / 4);
  const confidence = hasEnoughData
    ? Number((0.45 + volume * 0.3 + agreement * 0.25).toFixed(2))
    : acuteFlags.length
      ? 0.5
      : 0;

  return {
    level,
    confidence,
    signals: signals.sort((a, b) => b.weight - a.weight),
    trend,
    weeklyMood: buckets,
    hasEnoughData,
  };
}

export const LEVEL_COPY: Record<
  SupportLevel,
  { label: string; blurb: string; action: string; tone: string }
> = {
  critical: {
    label: "Critical",
    blurb: "Immediate review according to institutional safety protocol.",
    action: "Review now",
    tone: "urgent",
  },
  high: {
    label: "High",
    blurb: "Elevated support indicator.",
    action: "Review",
    tone: "amber",
  },
  moderate: {
    label: "Moderate",
    blurb: "Monitor or offer resources.",
    action: "Offer resources",
    tone: "info",
  },
  informational: {
    label: "Informational",
    blurb: "Useful aggregate or support context.",
    action: "Monitor",
    tone: "mint",
  },
};

export const TREND_GLYPH: Record<SupportIndicator["trend"], string> = {
  rising: "↑↑",
  steady: "→",
  easing: "↓",
};

export function trendLabel(trend: SupportIndicator["trend"]): string {
  if (trend === "rising") return "Support need rising";
  if (trend === "easing") return "Easing";
  return "Steady";
}

/** Rank used by the counsellor priority queue. */
export const LEVEL_RANK: Record<SupportLevel, number> = {
  critical: 4,
  high: 3,
  moderate: 2,
  informational: 1,
};

export function levelFromAlertSort(a: { level: SupportLevel }, b: { level: SupportLevel }) {
  return LEVEL_RANK[b.level] - LEVEL_RANK[a.level];
}

/** The student-facing threshold: below this we say nothing at all. */
export function shouldPromptStudent(ind: SupportIndicator): boolean {
  return ind.hasEnoughData && (ind.level === "high" || ind.level === "critical");
}

export function studentPromptCopy(ind: SupportIndicator): {
  title: string;
  body: string;
} {
  const top = ind.signals[0];
  const topic = top?.key === "academic" ? "academics" : top?.key === "sleep" ? "sleep" : "things";
  return {
    title: "You may benefit from some extra support right now",
    body:
      ind.trend === "rising"
        ? `You’ve checked in feeling low several times recently, often around ${topic}. You don’t have to handle it alone.`
        : "You’ve reported feeling stressed several times recently. Would you like to explore some support options?",
  };
}
