import type { Resource } from "./types";

export const RESOURCES: Resource[] = [
  {
    id: "r_exam_reset",
    title: "A 10-minute reset before an exam",
    category: "Academics",
    minutes: 10,
    summary:
      "A short breathing and grounding sequence you can run in a corridor before you walk in.",
    matches: ["Academics", "Exams", "Academic stress", "Anxiety & stress"],
  },
  {
    id: "r_study_load",
    title: "When the workload stops feeling survivable",
    category: "Academics",
    minutes: 6,
    summary:
      "Breaking an overwhelming term into the next three things, and what to ask your department for.",
    matches: ["Academics", "Exams", "Academic stress", "Career"],
  },
  {
    id: "r_sleep",
    title: "Sleep that hostel life keeps interrupting",
    category: "Sleep",
    minutes: 8,
    summary:
      "Practical adjustments for shared rooms, late labs and a phone you cannot put down.",
    matches: ["Sleep", "Hostel", "Hostel life"],
  },
  {
    id: "r_lonely",
    title: "Feeling alone in a crowded campus",
    category: "Belonging",
    minutes: 7,
    summary:
      "Why loneliness spikes in the first and final year, and low-pressure ways back into company.",
    matches: ["Loneliness", "Relationships", "General"],
  },
  {
    id: "r_panic",
    title: "Riding out a panic wave",
    category: "Anxiety",
    minutes: 5,
    summary: "What is happening in your body, and what actually shortens it.",
    matches: ["Anxiety & stress", "Exams", "Academics"],
  },
  {
    id: "r_money",
    title: "Money stress and where campus help exists",
    category: "Finances",
    minutes: 9,
    summary:
      "Hardship funds, fee deferral and the conversations that are worth having early.",
    matches: ["Finances", "Financial stress", "Career"],
  },
  {
    id: "r_family",
    title: "Talking to family about how you are doing",
    category: "Family",
    minutes: 11,
    summary:
      "Scripts for when expectations at home and reality at college have drifted apart.",
    matches: ["Family", "Relationships", "Career"],
  },
  {
    id: "r_support_friend",
    title: "Supporting a friend without carrying it alone",
    category: "Peer support",
    minutes: 6,
    summary:
      "How to listen well, what not to promise, and when to bring in a counsellor.",
    matches: ["General", "Relationships", "Loneliness"],
  },
  {
    id: "r_first_session",
    title: "What a first counselling session is actually like",
    category: "Getting help",
    minutes: 4,
    summary:
      "Who is in the room, what gets written down, and what you are never obliged to say.",
    matches: ["Anxiety & stress", "Academic stress", "Something else", "General"],
  },
];

export function resourceById(id: string): Resource | undefined {
  return RESOURCES.find((r) => r.id === id);
}

/** Simple, explainable matching: tag overlap, then recency-neutral ordering. */
export function recommendResources(tags: string[], limit = 3): Resource[] {
  if (!tags.length) {
    return RESOURCES.filter((r) =>
      ["r_first_session", "r_lonely", "r_sleep"].includes(r.id),
    );
  }
  const scored = RESOURCES.map((r) => ({
    r,
    score: r.matches.filter((m) => tags.includes(m)).length,
  }));
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.r);
}

/* --------------------------------------------------------- crisis contacts */

export interface CrisisContact {
  id: string;
  label: string;
  detail: string;
  value: string;
  kind: "campus" | "national" | "personal";
  /** false until an administrator configures it from a verified source */
  configured: boolean;
}

/**
 * Deliberately unconfigured. A prototype must not ship invented helpline
 * numbers — the institution supplies verified contacts at deployment.
 */
export const CRISIS_CONTACTS: CrisisContact[] = [
  {
    id: "c_campus",
    label: "Campus counselling centre",
    detail: "Staffed during campus hours. Configured by your institution.",
    value: "Not configured in this prototype",
    kind: "campus",
    configured: false,
  },
  {
    id: "c_oncall",
    label: "Campus on-call warden",
    detail: "Out-of-hours first response for residential students.",
    value: "Not configured in this prototype",
    kind: "campus",
    configured: false,
  },
  {
    id: "c_national",
    label: "National crisis helpline",
    detail: "24/7 confidential support line for your region.",
    value: "Not configured in this prototype",
    kind: "national",
    configured: false,
  },
  {
    id: "c_emergency",
    label: "Emergency services",
    detail: "If someone is in immediate physical danger.",
    value: "Not configured in this prototype",
    kind: "national",
    configured: false,
  },
];
