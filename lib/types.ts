/**
 * MindEase Campus — shared domain types.
 *
 * The whole prototype runs client-side on top of these types; the store in
 * lib/store.tsx persists them to localStorage, which doubles as the product's
 * "on-device storage" privacy story.
 */

/* ------------------------------------------------------------------ moods */

export type MoodValue = 1 | 2 | 3 | 4 | 5;

export interface MoodDef {
  value: MoodValue;
  label: string;
  emoji: string;
  /** token family from design-system/tokens.css */
  tone: "urgent" | "attention" | "neutral" | "support" | "positive";
}

/* ------------------------------------------------------------- identities */

export interface AnonymousIdentity {
  /** e.g. "MindMate #A7F29" */
  handle: string;
  /** short case id used by counsellors, e.g. "A71X" */
  caseId: string;
  createdAt: string;
}

/* --------------------------------------------------------------- consent  */

export interface ConsentSettings {
  anonymousCommunity: boolean;
  moodTracking: boolean;
  aiSupportAnalysis: boolean;
  counsellorSharing: boolean;
  journalSharing: boolean;
  notifications: boolean;
}

export type ConsentKey = keyof ConsentSettings;

/* -------------------------------------------------------------- check-ins */

export const CONCERN_TAGS = [
  "Academics",
  "Exams",
  "Relationships",
  "Family",
  "Finances",
  "Sleep",
  "Loneliness",
  "Career",
  "Hostel",
  "Other",
] as const;

export type ConcernTag = (typeof CONCERN_TAGS)[number];

export interface CheckIn {
  id: string;
  /** ISO date (yyyy-mm-dd) — the intent is one check-in per day */
  date: string;
  createdAt: string;
  mood: MoodValue;
  tags: ConcernTag[];
  note?: string;
}

/* ---------------------------------------------------------------- journal */

export interface JournalEntry {
  id: string;
  createdAt: string;
  updatedAt: string;
  title?: string;
  body: string;
  mood: MoodValue;
  tags: string[];
  isDraft: boolean;
  /** explicit, revocable share with a counsellor — off by default */
  sharedWithCounsellor: boolean;
}

/* -------------------------------------------------------------- community */

export const TOPICS = [
  "Academics",
  "Relationships",
  "Family",
  "Loneliness",
  "Career",
  "Financial stress",
  "Hostel life",
  "General",
] as const;

export type Topic = (typeof TOPICS)[number];

export const SUPPORT_REACTIONS = [
  { key: "here", label: "I’m here for you", emoji: "\u{1F91D}" },
  { key: "sending", label: "Sending support", emoji: "\u{1F49B}" },
  { key: "notalone", label: "You’re not alone", emoji: "\u{1F331}" },
  { key: "understand", label: "I understand", emoji: "\u{1F64A}" },
  { key: "keepgoing", label: "Keep going", emoji: "✨" },
] as const;

export type ReactionKey = (typeof SUPPORT_REACTIONS)[number]["key"];

export type ModerationState =
  | "published"
  | "pending_review"
  | "removed"
  | "hidden";

export interface Reply {
  id: string;
  postId: string;
  authorHandle: string;
  authorIsSelf: boolean;
  body: string;
  createdAt: string;
  moderation: ModerationState;
  reactions: Partial<Record<ReactionKey, number>>;
  myReactions: ReactionKey[];
}

export interface Post {
  id: string;
  authorHandle: string;
  authorIsSelf: boolean;
  body: string;
  topic: Topic;
  mood?: MoodValue;
  createdAt: string;
  /** author-set content warning shown before the body is revealed */
  contentWarning?: string;
  moderation: ModerationState;
  reactions: Partial<Record<ReactionKey, number>>;
  myReactions: ReactionKey[];
  saved: boolean;
  hidden: boolean;
  reported: boolean;
}

/* ------------------------------------------------------------- moderation */

export type FlagReason =
  | "misinformation"
  | "harassment"
  | "harmful_content"
  | "crisis_concern"
  | "other";

export type ModerationSource = "ai_flag" | "user_report";

export type ModerationDecision =
  | "approve"
  | "remove"
  | "warn"
  | "restrict"
  | "escalate"
  | "false_positive";

export interface ModerationItem {
  id: string;
  targetType: "post" | "reply";
  targetId: string;
  excerpt: string;
  source: ModerationSource;
  reason: FlagReason;
  detail: string;
  createdAt: string;
  status: "new" | "under_review" | "resolved";
  decision?: ModerationDecision;
  resolvedAt?: string;
  /** support resource attached alongside the decision */
  attachedResourceId?: string;
}

export interface AuditEntry {
  id: string;
  at: string;
  actor: "student" | "counsellor" | "system";
  action: string;
  detail: string;
}

/* ------------------------------------------------- support indicator / AI */

export type SupportLevel = "informational" | "moderate" | "high" | "critical";

export interface SupportSignal {
  key: string;
  label: string;
  /** plain-language reason the signal fired — this is the explainability */
  evidence: string;
  weight: number;
}

export interface SupportIndicator {
  level: SupportLevel;
  /** 0..1 — shown to counsellors as "model confidence", never to students */
  confidence: number;
  signals: SupportSignal[];
  trend: "rising" | "steady" | "easing";
  weeklyMood: { week: string; avg: number; count: number }[];
  /** true once the student has enough history for the model to say anything */
  hasEnoughData: boolean;
}

/* ----------------------------------------------------------------- alerts */

export type AlertStatus = "new" | "under_review" | "resolved" | "false_positive";

export interface Alert {
  id: string;
  caseId: string;
  level: SupportLevel;
  trend: "rising" | "steady" | "easing";
  confidence: number;
  signals: SupportSignal[];
  weeklyMood: { week: string; avg: number; count: number }[];
  recommendedAction: string;
  createdAt: string;
  status: AlertStatus;
  reviewedAt?: string;
  reviewedNote?: string;
  /** true for the signed-in demo student, so the demo loop is visible */
  isDemoStudent?: boolean;
}

/* --------------------------------------------------- counselling requests */

export const CONCERN_OPTIONS = [
  "General support",
  "Academic stress",
  "Anxiety & stress",
  "Relationships",
  "Loneliness",
  "Family",
  "Career",
  "Something else",
] as const;

export type ConcernOption = (typeof CONCERN_OPTIONS)[number];

export const SUPPORT_MODES = ["Chat", "In-person", "Video", "Phone"] as const;
export type SupportMode = (typeof SUPPORT_MODES)[number];

/** exactly what the student ticked to share — nothing else travels */
export interface SharedDataScope {
  concern: boolean;
  preferredMode: boolean;
  moodTrend: boolean;
  checkInTags: boolean;
  journalEntries: boolean;
  contactHandle: boolean;
}

export type CaseStatus =
  | "requested"
  | "awaiting_student"
  | "active"
  | "scheduled"
  | "closed";

export interface CounsellingCase {
  id: string;
  caseId: string;
  /** null until the student consents to identity linkage */
  studentHandle: string | null;
  concern: ConcernOption;
  mode: SupportMode;
  note?: string;
  sharedScope: SharedDataScope;
  status: CaseStatus;
  createdAt: string;
  updatedAt: string;
  nextFollowUp?: string;
  counsellorNotes: { id: string; at: string; body: string }[];
  offeredResourceIds: string[];
  isDemoStudent?: boolean;
}

export interface Appointment {
  id: string;
  caseId: string;
  /** ISO datetime */
  at: string;
  mode: SupportMode;
  concern: string;
  status: "upcoming" | "completed" | "cancelled";
  identityVisible: boolean;
}

/* -------------------------------------------------------------- resources */

export interface Resource {
  id: string;
  title: string;
  category: string;
  minutes: number;
  summary: string;
  content?: string;
  /** concern tags used to recommend it */
  matches: string[];
  /** author attribution if created by a counsellor */
  author?: string;
  createdAt?: string;
}

/* ---------------------------------------------------------- notifications */

export interface AppNotification {
  id: string;
  audience: "student" | "counsellor";
  /** deliberately non-revealing preview text */
  preview: string;
  body: string;
  at: string;
  read: boolean;
  href?: string;
}

/* ------------------------------------------------------- accessibility    */

export interface A11ySettings {
  highContrast: boolean;
  reducedMotion: boolean;
  largeText: boolean;
}

/* ----------------------------------------------------------- peer chat */

export type SupportRoleMode = "seeking" | "supporting";

export interface PeerChatMessage {
  id: string;
  sender: "self" | "peer";
  body: string;
  createdAt: string;
}

export interface PeerChatSession {
  id: string;
  peerHandle: string;
  startedAt: string;
  messages: PeerChatMessage[];
}

export interface PeerQueueItem {
  handle: string;
  tabId: string;
  at: string;
}

export type PeerP2PSignal =
  | { type: "seeking"; handle: string; tabId: string; at: string }
  | { type: "supporting"; handle: string; tabId: string; at: string }
  | { type: "match"; seekerTabId: string; seekerHandle: string; supporterTabId: string; supporterHandle: string; matchId: string }
  | { type: "message"; matchId: string; id: string; senderTabId: string; senderHandle: string; body: string; at: string }
  | { type: "leave"; matchId: string; senderTabId: string; senderHandle: string };

/* -------------------------------------------------------------- app state */

export interface AppState {
  onboarded: boolean;
  identity: AnonymousIdentity | null;
  /** Role mode: seeking support (default) or supporting other students as a peer */
  supportMode: SupportRoleMode;
  consent: ConsentSettings;
  a11y: A11ySettings;
  checkIns: CheckIn[];
  journal: JournalEntry[];
  posts: Post[];
  replies: Reply[];
  moderation: ModerationItem[];
  audit: AuditEntry[];
  alerts: Alert[];
  cases: CounsellingCase[];
  appointments: Appointment[];
  notifications: AppNotification[];
  blockedHandles: string[];
  /** the day on which the student last dismissed the support prompt */
  dismissedPromptOn?: string;
  /** in-memory peer chat session, not persisted to localStorage */
  peerChat: PeerChatSession | null;
  /** live queue of students waiting for peer support */
  peerQueue: PeerQueueItem[];
  /** custom articles authored by counsellors */
  customResources: Resource[];
  /** simulated failure switches for the Security UX / failure-state demo */
  simulate: { aiDown: boolean; offline: boolean };
}
