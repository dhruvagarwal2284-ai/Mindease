import { daysAgo, isoDay } from "./format";
import { DEFAULT_CONSENT } from "./privacy";
import type {
  Alert,
  Appointment,
  AppNotification,
  AppState,
  AuditEntry,
  CheckIn,
  CounsellingCase,
  JournalEntry,
  ModerationItem,
  Post,
  Reply,
} from "./types";

/**
 * Demo data.
 *
 * The prototype ships with a plausible campus around the signed-in student so
 * the counsellor screens are not empty tables, plus roughly four weeks of the
 * student's own check-ins — a longitudinal support indicator is not
 * demonstrable from a single data point. Settings offers a reset to a genuinely
 * empty account.
 */

function at(days: number, hour = 9, minute = 0): string {
  const d = daysAgo(days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

/* ----------------------------------------------------- the demo student's */

export function seedCheckIns(): CheckIn[] {
  const rows: [number, CheckIn["mood"], CheckIn["tags"]][] = [
    [24, 4, ["Academics"]],
    [22, 4, ["Career"]],
    [20, 3, ["Academics", "Sleep"]],
    [17, 4, ["Relationships"]],
    [15, 3, ["Academics"]],
    [14, 3, ["Exams"]],
    [13, 3, ["Exams", "Academics"]],
    [11, 3, ["Exams", "Sleep"]],
    [9, 2, ["Academics", "Exams"]],
    [6, 2, ["Loneliness", "Academics"]],
    [4, 2, ["Exams", "Academics"]],
    [2, 2, ["Academics"]],
  ];
  return rows.map(([d, mood, tags], i) => ({
    id: `seed_ci_${i}`,
    date: isoDay(daysAgo(d)),
    createdAt: at(d, 21, 10),
    mood,
    tags,
    note:
      d === 2
        ? "Third week of back-to-back submissions. I keep telling myself it will ease off."
        : undefined,
  }));
}

export function seedJournal(): JournalEntry[] {
  return [
    {
      id: "seed_j_1",
      createdAt: at(9, 23, 15),
      updatedAt: at(9, 23, 15),
      title: "Late again",
      body: "Stayed in the lab until two. I keep thinking that if I just push through this week it will be fine, but the week after already looks the same. Wrote this down mostly so it stops circling.",
      mood: 2,
      tags: ["Academics", "Sleep"],
      isDraft: false,
      sharedWithCounsellor: false,
    },
    {
      id: "seed_j_2",
      createdAt: at(5, 22, 40),
      updatedAt: at(5, 22, 40),
      title: "Small good thing",
      body: "Went for chai with the two people from my lab group instead of eating alone. It was an hour and it genuinely helped. Noting it because I forget that it does.",
      mood: 4,
      tags: ["Loneliness"],
      isDraft: false,
      sharedWithCounsellor: false,
    },
  ];
}

/* ------------------------------------------------------------- community  */

export function seedPosts(): Post[] {
  const rows: {
    id: string;
    handle: string;
    body: string;
    topic: Post["topic"];
    hours: number;
    cw?: string;
    mood?: Post["mood"];
    reactions: Post["reactions"];
    moderation?: Post["moderation"];
  }[] = [
    {
      id: "seed_p_1",
      handle: "MindMate #4C81B",
      body: "I'm really struggling with exams. Not the papers themselves — it's the two weeks before, where I can't start anything because I've convinced myself it's already too late. Anyone found a way out of that loop?",
      topic: "Academics",
      hours: 2,
      mood: 2,
      reactions: { here: 12, notalone: 9, keepgoing: 3 },
    },
    {
      id: "seed_p_2",
      handle: "MindMate #91E0D",
      body: "Second year and I still eat lunch alone most days. Everyone seems to have found their group in week one and I missed the window somehow. Not looking for pity, just wondering if anyone else is in the same boat.",
      topic: "Loneliness",
      hours: 6,
      mood: 2,
      reactions: { notalone: 24, here: 7, understand: 11 },
    },
    {
      id: "seed_p_3",
      handle: "MindMate #7BA33",
      body: "Update from me: I finally emailed my tutor about the extension instead of avoiding it for another week. She replied in twenty minutes and it was completely fine. Posting in case someone else is sitting on an email.",
      topic: "Academics",
      hours: 11,
      mood: 4,
      reactions: { keepgoing: 31, sending: 8 },
    },
    {
      id: "seed_p_4",
      handle: "MindMate #22F17",
      body: "My family calls every evening to ask about placements. I know they mean well. I don't know how to say that the questions are the reason I can't sleep.",
      topic: "Family",
      hours: 20,
      mood: 2,
      reactions: { understand: 18, here: 6, sending: 4 },
    },
    {
      id: "seed_p_5",
      handle: "MindMate #0D4A8",
      body: "Content note before you read: this is about a rough patch a few months ago and how it got better. I'm okay now. If that's not what you need today, scroll on, no hard feelings.",
      topic: "General",
      hours: 28,
      cw: "Mentions a difficult period with low mood",
      mood: 3,
      reactions: { sending: 14, keepgoing: 9 },
    },
    {
      id: "seed_p_6",
      handle: "MindMate #55C90",
      body: "Does anyone else find the hostel mess timings genuinely stressful? Between labs and the mess closing at 8:30 I've been skipping dinner three days a week and I think it's catching up with me.",
      topic: "Hostel life",
      hours: 34,
      mood: 3,
      reactions: { understand: 9, here: 3 },
    },
    {
      id: "seed_p_7",
      handle: "MindMate #A0B2C",
      body: "Fees went up and my part-time hours got cut in the same month. I've told nobody at home. Just needed to type it somewhere.",
      topic: "Financial stress",
      hours: 44,
      mood: 1,
      reactions: { here: 16, sending: 12, notalone: 5 },
    },
    {
      id: "seed_p_8",
      handle: "MindMate #E77D1",
      body: "Everyone says third year is when it clicks. It has not clicked. I keep waiting to feel like I chose the right course and I'm starting to think the waiting is the problem.",
      topic: "Career",
      hours: 52,
      mood: 2,
      reactions: { understand: 21, notalone: 6 },
    },
  ];

  return rows.map((r) => ({
    id: r.id,
    authorHandle: r.handle,
    authorIsSelf: false,
    body: r.body,
    topic: r.topic,
    mood: r.mood,
    createdAt: at(r.hours / 24, 12, 0),
    contentWarning: r.cw,
    moderation: r.moderation ?? "published",
    reactions: r.reactions,
    myReactions: [],
    saved: false,
    hidden: false,
    reported: false,
  }));
}

export function seedReplies(): Reply[] {
  const rows: [string, string, string, number][] = [
    [
      "seed_r_1",
      "seed_p_1",
      "The loop is real. What broke it for me was making the first task absurdly small — open the document, write the title, close it. Not advice, just what happened to work.",
      1.5,
    ],
    [
      "seed_r_2",
      "seed_p_1",
      "I'm in exactly this right now, so no wisdom, but you're not the only one sitting in it tonight.",
      1.2,
    ],
    [
      "seed_r_3",
      "seed_p_2",
      "Same, and I'm in final year. The window doesn't actually close, it just feels like it did. The lab group thing worked for me because it's a reason to be somewhere rather than a social ask.",
      5,
    ],
    [
      "seed_r_4",
      "seed_p_2",
      "Sitting with you on this one.",
      4.4,
    ],
    [
      "seed_r_5",
      "seed_p_4",
      "My version of this was placement questions at dinner every Sunday. What helped was answering once, properly, and then asking them to hold off until I had news. It didn't fix it but it bought quiet.",
      18,
    ],
    [
      "seed_r_6",
      "seed_p_7",
      "That's a lot to be carrying quietly. There's a hardship fund conversation worth having with the office — it isn't as formal as it sounds.",
      40,
    ],
    [
      "seed_r_7",
      "seed_p_8",
      "Third year did not click for me either and I'm fine now, in a way I did not expect. The waiting really is the worst part.",
      50,
    ],
  ];
  const handles = [
    "MindMate #3F2A9",
    "MindMate #B14E7",
    "MindMate #6C0D2",
    "MindMate #D93A1",
  ];
  return rows.map(([id, postId, body, hours], i) => ({
    id,
    postId,
    authorHandle: handles[i % handles.length],
    authorIsSelf: false,
    body,
    createdAt: at(hours / 24, 14, 0),
    moderation: "published" as const,
    reactions: { here: (i * 3) % 7 },
    myReactions: [],
  }));
}

/* ------------------------------------------------------------- moderation */

export function seedModeration(): ModerationItem[] {
  return [
    {
      id: "seed_m_1",
      targetType: "reply",
      targetId: "flagged_1",
      excerpt:
        "honestly just stop taking your meds for a week and see how you feel, worked for me",
      source: "ai_flag",
      reason: "harmful_content",
      detail: "Matched: advice to discontinue prescribed treatment.",
      createdAt: at(0.2, 10, 12),
      status: "new",
    },
    {
      id: "seed_m_2",
      targetType: "post",
      targetId: "flagged_2",
      excerpt:
        "this breathing app cures depression, guaranteed, therapy is a scam they sell you",
      source: "ai_flag",
      reason: "misinformation",
      detail: "Matched: unsupported curative claim plus dismissal of clinical care.",
      createdAt: at(0.5, 8, 40),
      status: "new",
    },
    {
      id: "seed_m_3",
      targetType: "reply",
      targetId: "flagged_3",
      excerpt: "get over it, people have real problems",
      source: "user_report",
      reason: "harassment",
      detail: "Reported by 2 students as dismissive toward the original poster.",
      createdAt: at(0.8, 19, 5),
      status: "new",
    },
    {
      id: "seed_m_4",
      targetType: "post",
      targetId: "flagged_4",
      excerpt:
        "i don't really see the point of any of this anymore, been like this for weeks",
      source: "ai_flag",
      reason: "crisis_concern",
      detail:
        "Matched: sustained hopelessness language. Routed for a supportive response, not removal.",
      createdAt: at(1.1, 23, 55),
      status: "under_review",
    },
    {
      id: "seed_m_5",
      targetType: "post",
      targetId: "flagged_5",
      excerpt: "my roll number is 21EC4471 if anyone from my batch wants to talk",
      source: "ai_flag",
      reason: "other",
      detail: "Matched: identifier that would de-anonymise the author.",
      createdAt: at(1.4, 16, 20),
      status: "under_review",
    },
    {
      id: "seed_m_6",
      targetType: "reply",
      targetId: "flagged_6",
      excerpt: "this whole app is pointless",
      source: "user_report",
      reason: "other",
      detail: "Reported once. Reviewed as ordinary criticism, not a policy breach.",
      createdAt: at(3, 11, 0),
      status: "resolved",
      decision: "false_positive",
      resolvedAt: at(2.8, 9, 30),
    },
    {
      id: "seed_m_7",
      targetType: "post",
      targetId: "flagged_7",
      excerpt: "selling last year's question papers, dm me",
      source: "user_report",
      reason: "other",
      detail: "Off-topic commercial post.",
      createdAt: at(4, 14, 0),
      status: "resolved",
      decision: "remove",
      resolvedAt: at(3.9, 15, 10),
    },
  ];
}

/* ----------------------------------------------------------------- alerts */

export function seedAlerts(): Alert[] {
  return [
    {
      id: "seed_a_1",
      caseId: "B29Q",
      level: "high",
      trend: "rising",
      confidence: 0.79,
      signals: [
        {
          key: "low_mood",
          label: "Sustained low mood",
          evidence: "6 of the last 9 check-ins were “Low” or “Struggling”.",
          weight: 3,
        },
        {
          key: "withdrawal",
          label: "Social withdrawal indicators",
          evidence:
            "“Loneliness” selected 4 times, with no community participation in two weeks.",
          weight: 1.4,
        },
        {
          key: "sleep",
          label: "Sleep disruption",
          evidence: "“Sleep” selected in 3 recent check-ins.",
          weight: 0.9,
        },
      ],
      weeklyMood: [
        { week: "Week 1", avg: 3.4, count: 4 },
        { week: "Week 2", avg: 3.0, count: 3 },
        { week: "Week 3", avg: 2.4, count: 5 },
        { week: "Week 4", avg: 1.8, count: 4 },
      ],
      recommendedAction: "Offer resources",
      createdAt: at(0.4, 7, 30),
      status: "new",
    },
    {
      id: "seed_a_2",
      caseId: "C14K",
      level: "moderate",
      trend: "steady",
      confidence: 0.64,
      signals: [
        {
          key: "academic",
          label: "Academic stress",
          evidence: "“Academics” or “Exams” selected in 5 recent check-ins.",
          weight: 1,
        },
        {
          key: "mood_trend",
          label: "Negative mood trend",
          evidence: "Average mood moved from 3.4 to 2.8 over the last two weeks.",
          weight: 1.6,
        },
      ],
      weeklyMood: [
        { week: "Week 1", avg: 3.5, count: 3 },
        { week: "Week 2", avg: 3.4, count: 4 },
        { week: "Week 3", avg: 2.9, count: 4 },
        { week: "Week 4", avg: 2.8, count: 3 },
      ],
      recommendedAction: "Monitor",
      createdAt: at(1.2, 9, 5),
      status: "new",
    },
    {
      id: "seed_a_3",
      caseId: "F60T",
      level: "moderate",
      trend: "easing",
      confidence: 0.58,
      signals: [
        {
          key: "finance",
          label: "Financial pressure",
          evidence: "“Finances” selected in 3 recent check-ins.",
          weight: 0.8,
        },
        {
          key: "low_mood",
          label: "Sustained low mood",
          evidence: "3 of the last 10 check-ins were “Low”.",
          weight: 2.2,
        },
      ],
      weeklyMood: [
        { week: "Week 1", avg: 2.2, count: 3 },
        { week: "Week 2", avg: 2.4, count: 4 },
        { week: "Week 3", avg: 2.9, count: 3 },
        { week: "Week 4", avg: 3.2, count: 4 },
      ],
      recommendedAction: "Monitor",
      createdAt: at(2.1, 13, 45),
      status: "under_review",
      reviewedAt: at(1.9, 10, 0),
    },
    {
      id: "seed_a_4",
      caseId: "G18W",
      level: "informational",
      trend: "steady",
      confidence: 0.51,
      signals: [
        {
          key: "academic",
          label: "Academic stress",
          evidence: "“Exams” selected in 2 recent check-ins.",
          weight: 1,
        },
      ],
      weeklyMood: [
        { week: "Week 1", avg: 3.6, count: 2 },
        { week: "Week 2", avg: 3.4, count: 3 },
        { week: "Week 3", avg: 3.5, count: 2 },
        { week: "Week 4", avg: 3.3, count: 3 },
      ],
      recommendedAction: "Monitor",
      createdAt: at(3.5, 8, 15),
      status: "resolved",
      reviewedAt: at(3.2, 11, 0),
      reviewedNote: "Exam-period variation. Resources offered, no further action.",
    },
    {
      id: "seed_a_5",
      caseId: "H04M",
      level: "moderate",
      trend: "steady",
      confidence: 0.55,
      signals: [
        {
          key: "journal_tone",
          label: "Low mood recorded while journalling",
          evidence:
            "2 private entries in two weeks were saved with a low mood. The text itself was not read.",
          weight: 1,
        },
      ],
      weeklyMood: [
        { week: "Week 1", avg: 3.1, count: 2 },
        { week: "Week 2", avg: 3.0, count: 2 },
        { week: "Week 3", avg: 2.9, count: 3 },
        { week: "Week 4", avg: 3.0, count: 2 },
      ],
      recommendedAction: "Monitor",
      createdAt: at(5, 10, 30),
      status: "false_positive",
      reviewedAt: at(4.8, 12, 0),
      reviewedNote:
        "Single weak signal, mood stable across four weeks. Marked false positive to tune the model.",
    },
  ];
}

/* ------------------------------------------------------------------ cases */

export function seedCases(): CounsellingCase[] {
  return [
    {
      id: "seed_c_1",
      caseId: "K72D",
      studentHandle: "MindMate #K72D1",
      concern: "Academic stress",
      mode: "In-person",
      sharedScope: {
        concern: true,
        preferredMode: true,
        moodTrend: true,
        checkInTags: true,
        journalEntries: false,
        contactHandle: true,
      },
      status: "active",
      createdAt: at(9, 11, 0),
      updatedAt: at(2, 16, 0),
      nextFollowUp: isoDay(daysAgo(-4)),
      counsellorNotes: [
        {
          id: "n1",
          at: at(6, 15, 30),
          body: "First session held. Student describes a submission backlog rather than a persistent low mood. Agreed a study-planning referral and a two-week review.",
        },
      ],
      offeredResourceIds: ["r_study_load"],
    },
    {
      id: "seed_c_2",
      caseId: "P31V",
      studentHandle: null,
      concern: "Loneliness",
      mode: "Chat",
      sharedScope: {
        concern: true,
        preferredMode: true,
        moodTrend: false,
        checkInTags: false,
        journalEntries: false,
        contactHandle: false,
      },
      status: "requested",
      createdAt: at(1, 20, 15),
      updatedAt: at(1, 20, 15),
      counsellorNotes: [],
      offeredResourceIds: [],
    },
    {
      id: "seed_c_3",
      caseId: "R55N",
      studentHandle: "MindMate #R55N8",
      concern: "Anxiety & stress",
      mode: "Video",
      sharedScope: {
        concern: true,
        preferredMode: true,
        moodTrend: true,
        checkInTags: false,
        journalEntries: false,
        contactHandle: true,
      },
      status: "scheduled",
      createdAt: at(4, 9, 0),
      updatedAt: at(1, 10, 0),
      nextFollowUp: isoDay(daysAgo(-2)),
      counsellorNotes: [
        {
          id: "n2",
          at: at(3, 12, 0),
          body: "Student requested video rather than in-person. Booked for Thursday afternoon.",
        },
      ],
      offeredResourceIds: ["r_panic"],
    },
    {
      id: "seed_c_4",
      caseId: "T09H",
      studentHandle: "MindMate #T09H4",
      concern: "Family",
      mode: "Phone",
      sharedScope: {
        concern: true,
        preferredMode: true,
        moodTrend: false,
        checkInTags: true,
        journalEntries: false,
        contactHandle: true,
      },
      status: "closed",
      createdAt: at(26, 10, 0),
      updatedAt: at(12, 14, 0),
      counsellorNotes: [
        {
          id: "n3",
          at: at(12, 14, 0),
          body: "Three sessions completed. Student reports the situation at home has settled. Closed with an open door to re-request.",
        },
      ],
      offeredResourceIds: ["r_family"],
    },
  ];
}

export function seedAppointments(): Appointment[] {
  return [
    {
      id: "seed_ap_1",
      caseId: "K72D",
      at: at(-1, 16, 30),
      mode: "In-person",
      concern: "Academic stress",
      status: "upcoming",
      identityVisible: true,
    },
    {
      id: "seed_ap_2",
      caseId: "R55N",
      at: at(-2, 14, 0),
      mode: "Video",
      concern: "Anxiety & stress",
      status: "upcoming",
      identityVisible: true,
    },
    {
      id: "seed_ap_3",
      caseId: "P31V",
      at: at(-3, 11, 15),
      mode: "Chat",
      concern: "Loneliness",
      status: "upcoming",
      identityVisible: false,
    },
    {
      id: "seed_ap_4",
      caseId: "K72D",
      at: at(6, 16, 30),
      mode: "In-person",
      concern: "Academic stress",
      status: "completed",
      identityVisible: true,
    },
    {
      id: "seed_ap_5",
      caseId: "T09H",
      at: at(13, 10, 0),
      mode: "Phone",
      concern: "Family",
      status: "completed",
      identityVisible: true,
    },
  ];
}

export function seedNotifications(): AppNotification[] {
  return [
    {
      id: "seed_n_1",
      audience: "counsellor",
      preview: "New support alert requires review",
      body: "Anonymous case B29Q moved to High. Recommended action: offer resources.",
      at: at(0.4, 7, 31),
      read: false,
      href: "/counsellor/alerts",
    },
    {
      id: "seed_n_2",
      audience: "counsellor",
      preview: "New student request",
      body: "A student has requested chat support for loneliness. Identity is not shared.",
      at: at(1, 20, 16),
      read: false,
      href: "/counsellor/cases",
    },
    {
      id: "seed_n_3",
      audience: "counsellor",
      preview: "3 items in the moderation queue",
      body: "Two AI flags and one student report are waiting for a human decision.",
      at: at(0.6, 9, 0),
      read: true,
      href: "/counsellor/moderation",
    },
    {
      id: "seed_n_4",
      audience: "student",
      preview: "You have a new MindEase update",
      body: "Someone replied to a post you saved.",
      at: at(0.3, 15, 20),
      read: false,
      href: "/student/community",
    },
  ];
}

export function seedAudit(): AuditEntry[] {
  return [
    {
      id: "seed_au_1",
      at: at(2.8, 9, 30),
      actor: "counsellor",
      action: "Moderation decision — false positive",
      detail: "Reply flagged as “other” restored. Model feedback recorded.",
    },
    {
      id: "seed_au_2",
      at: at(3.9, 15, 10),
      actor: "counsellor",
      action: "Moderation decision — remove",
      detail: "Commercial post removed under the community policy.",
    },
    {
      id: "seed_au_3",
      at: at(3.2, 11, 0),
      actor: "counsellor",
      action: "Alert resolved",
      detail: "Case G18W reviewed. Resources offered, no identity linkage.",
    },
    {
      id: "seed_au_4",
      at: at(4.8, 12, 0),
      actor: "counsellor",
      action: "Alert marked false positive",
      detail: "Case H04M closed as a model false positive.",
    },
  ];
}

/* --------------------------------------------------------- initial states */

/** A genuinely empty campus — no demo data, no personal data. */
export function emptyState(): AppState {
  return {
    onboarded: false,
    identity: null,
    supportMode: "seeking",
    consent: { ...DEFAULT_CONSENT },
    a11y: { highContrast: false, reducedMotion: false, largeText: false },
    checkIns: [],
    journal: [],
    posts: [],
    replies: [],
    moderation: [],
    audit: [],
    alerts: [],
    cases: [],
    appointments: [],
    notifications: [],
    blockedHandles: [],
    peerChat: null,
    peerQueue: [],
    customResources: [],
    simulate: { aiDown: false, offline: false },
  };
}

/** Demo install: a plausible campus, plus four weeks of the student's own history. */
export function seededState(): AppState {
  return {
    ...emptyState(),
    checkIns: seedCheckIns(),
    journal: seedJournal(),
    posts: seedPosts(),
    replies: seedReplies(),
    moderation: seedModeration(),
    audit: seedAudit(),
    alerts: seedAlerts(),
    cases: seedCases(),
    appointments: seedAppointments(),
    notifications: seedNotifications(),
  };
}

