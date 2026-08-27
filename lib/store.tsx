"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { isoDay, uid } from "./format";
import { screenContent } from "./moderation";
import { generateIdentity, safePreview } from "./privacy";
import { emptyState, seededState } from "./seed";
import { computeSupportIndicator } from "./support-indicator";
import type {
  A11ySettings,
  Alert,
  Appointment,
  AppNotification,
  AppState,
  AnonymousIdentity,
  CheckIn,
  ConcernOption,
  ConcernTag,
  ConsentKey,
  ConsentSettings,
  CounsellingCase,
  FlagReason,
  JournalEntry,
  ModerationDecision,
  MoodValue,
  PeerChatMessage,
  PeerChatSession,
  PeerQueueItem,
  Post,
  ReactionKey,
  Reply,
  Resource,
  SharedDataScope,
  SupportIndicator,
  SupportMode,
  SupportRoleMode,
  Topic,
} from "./types";

const STORAGE_KEY = "mindease.campus.v1";
const IDLE_LOCK_MS = 15 * 60 * 1000;
const LIVE_ALERT_ID = "live_demo_student";

export type ToastTone = "info" | "success" | "warning" | "urgent";

export interface Toast {
  id: string;
  message: string;
  tone: ToastTone;
  detail?: string;
}

interface StoreValue {
  /** false during the first client render — gate on this to avoid hydration drift */
  ready: boolean;
  state: AppState;
  indicator: SupportIndicator;
  locked: boolean;
  lock: () => void;
  unlock: () => void;

  /* onboarding & identity */
  completeOnboarding: (
    identity: AnonymousIdentity,
    consent: ConsentSettings,
    supportMode?: SupportRoleMode,
  ) => void;
  regenerateIdentity: () => AnonymousIdentity;
  // 🔥 FIX: setIdentity yahan define kar diya
  setIdentity: (identity: AnonymousIdentity) => void;
  setConsent: (key: ConsentKey, value: boolean) => void;
  setA11y: (key: keyof A11ySettings, value: boolean) => void;
  setSupportMode: (mode: SupportRoleMode) => void;

  /* check-ins */
  saveCheckIn: (input: { mood: MoodValue; tags: ConcernTag[]; note?: string }) => void;
  todaysCheckIn: () => CheckIn | undefined;
  dismissSupportPrompt: () => void;

  /* journal */
  saveJournal: (
    input: Partial<JournalEntry> & { body: string; mood: MoodValue },
  ) => JournalEntry;
  deleteJournal: (id: string) => void;
  toggleJournalShare: (id: string) => void;

  /* community */
  createPost: (input: {
    body: string;
    topic: Topic;
    mood?: MoodValue;
    contentWarning?: string;
    forceReview?: boolean;
  }) => { post: Post; heldForReview: boolean };
  createReply: (postId: string, body: string, forceReview?: boolean) => Reply;
  toggleReaction: (kind: "post" | "reply", id: string, key: ReactionKey) => void;
  toggleSavePost: (id: string) => void;
  hidePost: (id: string) => void;
  reportPost: (id: string, reason: FlagReason, note?: string) => void;
  blockHandle: (handle: string) => void;
  repliesFor: (postId: string) => Reply[];

  /* support & counselling */
  requestCounselling: (input: {
    concern: ConcernOption;
    mode: SupportMode;
    note?: string;
    scope: SharedDataScope;
  }) => CounsellingCase;
  linkIdentity: (caseId: string) => void;
  withdrawCase: (caseId: string) => void;

  /* counsellor actions */
  setAlertStatus: (id: string, status: Alert["status"], note?: string) => void;
  addCaseNote: (caseId: string, body: string) => void;
  offerResource: (caseId: string, resourceId: string) => void;
  requestVoluntaryContact: (caseId: string) => void;
  scheduleAppointment: (
    caseId: string,
    at: string,
    mode: SupportMode,
    concern: string,
  ) => void;
  setAppointmentStatus: (id: string, status: Appointment["status"]) => void;
  recordFollowUp: (caseId: string, date: string) => void;
  setCaseStatus: (caseId: string, status: CounsellingCase["status"]) => void;
  resolveModeration: (
    id: string,
    decision: ModerationDecision,
    resourceId?: string,
  ) => void;
  claimModeration: (id: string) => void;

  /* peer chat & queue */
  startPeerChat: () => PeerChatSession;
  sendPeerMessage: (body: string, sender?: "self" | "peer") => void;
  endPeerChat: () => void;
  setPeerQueue: (queue: PeerQueueItem[] | ((prev: PeerQueueItem[]) => PeerQueueItem[])) => void;
  addToPeerQueue: (item: PeerQueueItem) => void;
  removeFromPeerQueue: (tabId: string) => void;
  clearPeerQueue: () => void;

  /* resources */
  postResource: (resource: Resource) => void;
  removeResource: (id: string) => void;

  /* notifications */
  markNotificationRead: (id: string) => void;
  markAllRead: (audience: AppNotification["audience"]) => void;

  /* demo plumbing */
  setSimulate: (key: "aiDown" | "offline", value: boolean) => void;
  resetAll: (mode: "seeded" | "empty") => void;
  exportData: () => string;
  deleteMyData: () => void;

  /* toasts */
  toasts: Toast[];
  toast: (message: string, tone?: ToastTone, detail?: string) => void;
  dismissToast: (id: string) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

function migrate(raw: unknown): AppState {
  const base = emptyState();
  if (!raw || typeof raw !== "object") return base;
  const merged = { ...base, ...(raw as Partial<AppState>) };
  merged.consent = { ...base.consent, ...(merged.consent ?? {}) };
  merged.a11y = { ...base.a11y, ...(merged.a11y ?? {}) };
  merged.simulate = { ...base.simulate, ...(merged.simulate ?? {}) };
  merged.supportMode = merged.supportMode === "supporting" ? "supporting" : "seeking";
  for (const key of [
    "checkIns",
    "journal",
    "posts",
    "replies",
    "moderation",
    "audit",
    "alerts",
    "cases",
    "appointments",
    "notifications",
    "blockedHandles",
    "customResources",
  ] as const) {
    if (!Array.isArray(merged[key])) {
      (merged as Record<string, unknown>)[key] = base[key];
    }
  }
  return merged;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => emptyState());
  const [ready, setReady] = useState(false);
  const [locked, setLocked] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const lastActivity = useRef(Date.now());

  /* ------------------------------------------------------------- hydrate */

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setState(migrate(JSON.parse(raw)));
    } catch {
      /* corrupt or unavailable storage — fall back to the empty state */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      // peerChat is session-scoped — strip it from persistence
      const { peerChat: _, ...persistable } = state;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persistable));
    } catch {
      /* quota or private mode — the session still works, it just will not persist */
    }
  }, [state, ready]);

  /* ------------------------------------------- accessibility side effects */

  useEffect(() => {
    if (!ready) return;
    const el = document.documentElement;
    el.dataset.contrast = state.a11y.highContrast ? "high" : "normal";
    el.dataset.motion = state.a11y.reducedMotion ? "reduced" : "full";
    el.dataset.text = state.a11y.largeText ? "large" : "normal";
  }, [ready, state.a11y]);

  /* ------------------------------------------------- idle session locking */

  useEffect(() => {
    if (!ready || !state.onboarded) return;
    const bump = () => {
      lastActivity.current = Date.now();
    };
    const events = ["pointerdown", "keydown", "scroll", "visibilitychange"];
    events.forEach((e) => window.addEventListener(e, bump, { passive: true }));
    const timer = window.setInterval(() => {
      if (Date.now() - lastActivity.current > IDLE_LOCK_MS) setLocked(true);
    }, 30_000);
    return () => {
      events.forEach((e) => window.removeEventListener(e, bump));
      window.clearInterval(timer);
    };
  }, [ready, state.onboarded]);

  /* --------------------------------------------------- support indicator */

  const indicator = useMemo(
    () =>
      computeSupportIndicator({
        checkIns: state.checkIns,
        journal: state.journal,
        posts: state.posts,
        replies: state.replies,
        moderation: state.moderation,
      }),
    [state.checkIns, state.journal, state.posts, state.replies, state.moderation],
  );

  /**
   * Keep the demo student's alert in the counsellor queue in step with their
   * live data, without discarding a review decision a counsellor already made.
   */
  const signature = `${indicator.level}|${indicator.confidence}|${indicator.trend}|${indicator.signals
    .map((s) => s.key)
    .join(",")}`;

  useEffect(() => {
    if (!ready || !state.onboarded) return;
    const shouldExist =
      state.consent.aiSupportAnalysis &&
      indicator.hasEnoughData &&
      indicator.level !== "informational";

    setState((prev) => {
      const existing = prev.alerts.find((a) => a.id === LIVE_ALERT_ID);
      if (!shouldExist) {
        if (!existing) return prev;
        return { ...prev, alerts: prev.alerts.filter((a) => a.id !== LIVE_ALERT_ID) };
      }
      const next: Alert = {
        id: LIVE_ALERT_ID,
        caseId: prev.identity?.caseId ?? "A71X",
        level: indicator.level,
        trend: indicator.trend,
        confidence: indicator.confidence,
        signals: indicator.signals,
        weeklyMood: indicator.weeklyMood,
        recommendedAction:
          indicator.level === "critical"
            ? "Review now"
            : indicator.level === "high"
              ? "Review"
              : "Offer resources",
        createdAt: existing?.createdAt ?? new Date().toISOString(),
        status: existing?.status ?? "new",
        reviewedAt: existing?.reviewedAt,
        reviewedNote: existing?.reviewedNote,
        isDemoStudent: true,
      };
      if (existing && JSON.stringify(existing) === JSON.stringify(next)) return prev;
      return {
        ...prev,
        alerts: existing
          ? prev.alerts.map((a) => (a.id === LIVE_ALERT_ID ? next : a))
          : [next, ...prev.alerts],
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, state.onboarded, state.consent.aiSupportAnalysis, signature]);

  /* ---------------------------------------------------------------- utils */

  const toast = useCallback(
    (message: string, tone: ToastTone = "info", detail?: string) => {
      const id = uid("toast");
      setToasts((t) => [...t, { id, message, tone, detail }]);
      window.setTimeout(() => {
        setToasts((t) => t.filter((x) => x.id !== id));
      }, 5000);
    },
    [],
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const audit = useCallback(
    (actor: "student" | "counsellor" | "system", action: string, detail: string) => ({
      id: uid("au"),
      at: new Date().toISOString(),
      actor,
      action,
      detail,
    }),
    [],
  );

  const notify = useCallback(
    (
      audience: AppNotification["audience"],
      preview: string,
      body: string,
      href?: string,
    ): AppNotification => ({
      id: uid("n"),
      audience,
      preview: audience === "student" ? safePreview() : preview,
      body,
      at: new Date().toISOString(),
      read: false,
      href,
    }),
    [],
  );

  /* ------------------------------------------------------------- actions */

  const completeOnboarding = useCallback(
    (
      identity: AnonymousIdentity,
      consent: ConsentSettings,
      supportMode: SupportRoleMode = "seeking",
    ) => {
      setState((p) => ({
        ...p,
        onboarded: true,
        identity,
        consent,
        supportMode,
        audit: [
          audit(
            "student",
            "Onboarding completed",
            `Pseudonymous identity generated on device. Role: ${
              supportMode === "supporting" ? "Peer supporter" : "Seeking support"
            }. Consent recorded: ${Object.entries(consent)
              .filter(([, v]) => v)
              .map(([k]) => k)
              .join(", ")}.`,
          ),
          ...p.audit,
        ],
      }));
    },
    [audit],
  );

  // 🔥 FIX: setIdentity ka actual function logic yahan likh diya
  const setIdentity = useCallback((identity: AnonymousIdentity) => {
    setState((p) => ({ ...p, identity }));
  }, []);

  const setSupportMode = useCallback((mode: SupportRoleMode) => {
    setState((p) => ({ ...p, supportMode: mode }));
  }, []);

  const regenerateIdentity = useCallback(() => {
    const identity = generateIdentity();
    setState((p) => ({ ...p, identity }));
    return identity;
  }, []);

  const setConsent = useCallback(
    (key: ConsentKey, value: boolean) => {
      setState((p) => ({
        ...p,
        consent: { ...p.consent, [key]: value },
        audit: [
          audit(
            "student",
            `Consent ${value ? "granted" : "withdrawn"}`,
            `${key} set to ${value ? "ON" : "OFF"} by the student.`,
          ),
          ...p.audit,
        ],
      }));
    },
    [audit],
  );

  const setA11y = useCallback((key: keyof A11ySettings, value: boolean) => {
    setState((p) => ({ ...p, a11y: { ...p.a11y, [key]: value } }));
  }, []);

  const saveCheckIn = useCallback<StoreValue["saveCheckIn"]>((input) => {
    const date = isoDay();
    setState((p) => {
      const entry: CheckIn = {
        id: uid("ci"),
        date,
        createdAt: new Date().toISOString(),
        mood: input.mood,
        tags: input.tags,
        note: input.note?.trim() || undefined,
      };
      return {
        ...p,
        checkIns: [...p.checkIns.filter((c) => c.date !== date), entry],
        dismissedPromptOn: undefined,
      };
    });
  }, []);

  const todaysCheckIn = useCallback(() => {
    const date = isoDay();
    return state.checkIns.find((c) => c.date === date);
  }, [state.checkIns]);

  const dismissSupportPrompt = useCallback(() => {
    setState((p) => ({ ...p, dismissedPromptOn: isoDay() }));
  }, []);

  const saveJournal = useCallback<StoreValue["saveJournal"]>((input) => {
    const now = new Date().toISOString();
    let saved!: JournalEntry;
    setState((p) => {
      const existing = input.id ? p.journal.find((j) => j.id === input.id) : undefined;
      saved = {
        id: existing?.id ?? uid("j"),
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
        title: input.title?.trim() || undefined,
        body: input.body,
        mood: input.mood,
        tags: input.tags ?? existing?.tags ?? [],
        isDraft: input.isDraft ?? false,
        sharedWithCounsellor:
          input.sharedWithCounsellor ?? existing?.sharedWithCounsellor ?? false,
      };
      return {
        ...p,
        journal: existing
          ? p.journal.map((j) => (j.id === saved.id ? saved : j))
          : [saved, ...p.journal],
      };
    });
    return saved;
  }, []);

  const deleteJournal = useCallback((id: string) => {
    setState((p) => ({ ...p, journal: p.journal.filter((j) => j.id !== id) }));
  }, []);

  const toggleJournalShare = useCallback(
    (id: string) => {
      setState((p) => {
        const entry = p.journal.find((j) => j.id === id);
        if (!entry) return p;
        const next = !entry.sharedWithCounsellor;
        return {
          ...p,
          journal: p.journal.map((j) =>
            j.id === id ? { ...j, sharedWithCounsellor: next } : j,
          ),
          audit: [
            audit(
              "student",
              next ? "Journal entry shared" : "Journal share revoked",
              `Entry from ${new Date(entry.createdAt).toLocaleDateString()} ${
                next ? "attached to" : "removed from"
              } the counselling case by the student.`,
            ),
            ...p.audit,
          ],
        };
      });
    },
    [audit],
  );

  /* ---------------------------------------------------------- community  */

  const createPost = useCallback<StoreValue["createPost"]>(
    (input) => {
      const screen = screenContent(input.body);
      const heldForReview = input.forceReview === true || (!screen.ok && !screen.crisis);
      let post!: Post;
      setState((p) => {
        post = {
          id: uid("p"),
          authorHandle: p.identity?.handle ?? "Anonymous Student",
          authorIsSelf: true,
          body: input.body.trim(),
          topic: input.topic,
          mood: input.mood,
          createdAt: new Date().toISOString(),
          contentWarning: input.contentWarning?.trim() || undefined,
          moderation: heldForReview ? "pending_review" : "published",
          reactions: {},
          myReactions: [],
          saved: false,
          hidden: false,
          reported: false,
        };
        /* A crisis flag never blocks the post — it is routed to a counsellor
           for a supportive response, which is a different thing from review. */
        const flagged = heldForReview || screen.crisis;
        const queue = flagged
          ? [
              {
                id: uid("m"),
                targetType: "post" as const,
                targetId: post.id,
                excerpt: post.body.slice(0, 140),
                source: "ai_flag" as const,
                reason: (screen.reason ?? "other") as FlagReason,
                detail: screen.crisis
                  ? `Matched: ${screen.matched.join(", ")}. Published as normal — routed for a supportive response, not removal.`
                  : screen.matched.length
                    ? `Matched: ${screen.matched.join(", ")}`
                    : "Held for review at the author's request.",
                createdAt: new Date().toISOString(),
                status: "new" as const,
              },
              ...p.moderation,
            ]
          : p.moderation;
        return {
          ...p,
          posts: [post, ...p.posts],
          moderation: queue,
          notifications: flagged
            ? [
                notify(
                  "counsellor",
                  screen.crisis ? "Crisis concern flagged" : "Moderation queue item",
                  screen.crisis
                    ? "A post was flagged for crisis-related language. It is live; a supportive response is the expected action."
                    : "A new post is held for review before it appears in the feed.",
                  "/counsellor/moderation",
                ),
                ...p.notifications,
              ]
            : p.notifications,
        };
      });
      return { post, heldForReview };
    },
    [notify],
  );

  const createReply = useCallback<StoreValue["createReply"]>(
    (postId, body, forceReview) => {
      const screen = screenContent(body);
      const held = forceReview === true || (!screen.ok && !screen.crisis);
      let reply!: Reply;
      setState((p) => {
        reply = {
          id: uid("rp"),
          postId,
          authorHandle: p.identity?.handle ?? "Anonymous Student",
          authorIsSelf: true,
          body: body.trim(),
          createdAt: new Date().toISOString(),
          moderation: held ? "pending_review" : "published",
          reactions: {},
          myReactions: [],
        };
        const flagged = held || screen.crisis;
        return {
          ...p,
          replies: [...p.replies, reply],
          moderation: flagged
            ? [
                {
                  id: uid("m"),
                  targetType: "reply" as const,
                  targetId: reply.id,
                  excerpt: reply.body.slice(0, 140),
                  source: "ai_flag" as const,
                  reason: (screen.reason ?? "other") as FlagReason,
                  detail: screen.crisis
                    ? `Matched: ${screen.matched.join(", ")}. Published as normal — routed for a supportive response, not removal.`
                    : screen.matched.length
                      ? `Matched: ${screen.matched.join(", ")}`
                      : "Held for review.",
                  createdAt: new Date().toISOString(),
                  status: "new" as const,
                },
                ...p.moderation,
              ]
            : p.moderation,
        };
      });
      return reply;
    },
    [],
  );

  const toggleReaction = useCallback<StoreValue["toggleReaction"]>((kind, id, key) => {
    setState((p) => {
      const apply = <T extends Post | Reply>(item: T): T => {
        const has = item.myReactions.includes(key);
        const count = item.reactions[key] ?? 0;
        return {
          ...item,
          myReactions: has
            ? item.myReactions.filter((k) => k !== key)
            : [...item.myReactions, key],
          reactions: { ...item.reactions, [key]: Math.max(0, count + (has ? -1 : 1)) },
        };
      };
      return kind === "post"
        ? { ...p, posts: p.posts.map((x) => (x.id === id ? apply(x) : x)) }
        : { ...p, replies: p.replies.map((x) => (x.id === id ? apply(x) : x)) };
    });
  }, []);

  const toggleSavePost = useCallback((id: string) => {
    setState((p) => ({
      ...p,
      posts: p.posts.map((x) => (x.id === id ? { ...x, saved: !x.saved } : x)),
    }));
  }, []);

  const hidePost = useCallback((id: string) => {
    setState((p) => ({
      ...p,
      posts: p.posts.map((x) => (x.id === id ? { ...x, hidden: !x.hidden } : x)),
    }));
  }, []);

  const reportPost = useCallback<StoreValue["reportPost"]>(
    (id, reason, note) => {
      setState((p) => {
        const post = p.posts.find((x) => x.id === id);
        if (!post) return p;
        return {
          ...p,
          posts: p.posts.map((x) => (x.id === id ? { ...x, reported: true } : x)),
          moderation: [
            {
              id: uid("m"),
              targetType: "post" as const,
              targetId: id,
              excerpt: post.body.slice(0, 140),
              source: "user_report" as const,
              reason,
              detail: note?.trim()
                ? `Student note: ${note.trim()}`
                : "Reported by a student.",
              createdAt: new Date().toISOString(),
              status: "new" as const,
            },
            ...p.moderation,
          ],
          notifications: [
            notify(
              "counsellor",
              "Moderation queue item",
              "A student reported a post for review.",
              "/counsellor/moderation",
            ),
            ...p.notifications,
          ],
        };
      });
    },
    [notify],
  );

  const blockHandle = useCallback((handle: string) => {
    setState((p) => ({
      ...p,
      blockedHandles: p.blockedHandles.includes(handle)
        ? p.blockedHandles.filter((h) => h !== handle)
        : [...p.blockedHandles, handle],
    }));
  }, []);

  const repliesFor = useCallback(
    (postId: string) =>
      state.replies
        .filter((r) => r.postId === postId && r.moderation !== "removed")
        .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1)),
    [state.replies],
  );

  /* -------------------------------------------------------- counselling  */

  const requestCounselling = useCallback<StoreValue["requestCounselling"]>(
    (input) => {
      let created!: CounsellingCase;
      setState((p) => {
        created = {
          id: uid("case"),
          caseId: p.identity?.caseId ?? "A71X",
          studentHandle: input.scope.contactHandle ? (p.identity?.handle ?? null) : null,
          concern: input.concern,
          mode: input.mode,
          note: input.note?.trim() || undefined,
          sharedScope: input.scope,
          status: "requested",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          counsellorNotes: [],
          offeredResourceIds: [],
          isDemoStudent: true,
        };
        return {
          ...p,
          cases: [created, ...p.cases],
          consent: { ...p.consent, counsellorSharing: true },
          notifications: [
            notify(
              "counsellor",
              "New student request",
              `A student requested ${input.mode.toLowerCase()} support for ${input.concern.toLowerCase()}.`,
              "/counsellor/cases",
            ),
            ...p.notifications,
          ],
          audit: [
            audit(
              "student",
              "Counselling requested with explicit consent",
              `Shared: ${Object.entries(input.scope)
                .filter(([, v]) => v)
                .map(([k]) => k)
                .join(", ")}. Everything else withheld.`,
            ),
            ...p.audit,
          ],
        };
      });
      return created;
    },
    [audit, notify],
  );

  const linkIdentity = useCallback(
    (caseId: string) => {
      setState((p) => ({
        ...p,
        cases: p.cases.map((c) =>
          c.id === caseId
            ? {
                ...c,
                studentHandle: p.identity?.handle ?? c.studentHandle,
                sharedScope: { ...c.sharedScope, contactHandle: true },
                updatedAt: new Date().toISOString(),
              }
            : c,
        ),
        audit: [
          audit(
            "student",
            "Identity linkage consented",
            "Pseudonym attached to the case so a counsellor can reply directly.",
          ),
          ...p.audit,
        ],
      }));
    },
    [audit],
  );

  const withdrawCase = useCallback(
    (caseId: string) => {
      setState((p) => ({
        ...p,
        cases: p.cases.map((c) =>
          c.id === caseId
            ? { ...c, status: "closed" as const, updatedAt: new Date().toISOString() }
            : c,
        ),
        audit: [
          audit(
            "student",
            "Support request withdrawn",
            "The student closed their own case. Shared data is detached.",
          ),
          ...p.audit,
        ],
      }));
    },
    [audit],
  );

  /* --------------------------------------------------- counsellor actions */

  const setAlertStatus = useCallback<StoreValue["setAlertStatus"]>(
    (id, status, note) => {
      setState((p) => {
        const alert = p.alerts.find((a) => a.id === id);
        return {
          ...p,
          alerts: p.alerts.map((a) =>
            a.id === id
              ? {
                  ...a,
                  status,
                  reviewedAt: new Date().toISOString(),
                  reviewedNote: note ?? a.reviewedNote,
                }
              : a,
          ),
          audit: [
            audit(
              "counsellor",
              `Alert ${status.replace("_", " ")}`,
              `Case ${alert?.caseId ?? id}${note ? ` — ${note}` : ""}. No identity was accessed.`,
            ),
            ...p.audit,
          ],
        };
      });
    },
    [audit],
  );

  const addCaseNote = useCallback(
    (caseId: string, body: string) => {
      setState((p) => ({
        ...p,
        cases: p.cases.map((c) =>
          c.id === caseId
            ? {
                ...c,
                counsellorNotes: [
                  ...c.counsellorNotes,
                  { id: uid("note"), at: new Date().toISOString(), body: body.trim() },
                ],
                updatedAt: new Date().toISOString(),
              }
            : c,
        ),
        audit: [
          audit("counsellor", "Case note recorded", `Private professional note added.`),
          ...p.audit,
        ],
      }));
    },
    [audit],
  );

  const offerResource = useCallback(
    (caseId: string, resourceId: string) => {
      setState((p) => ({
        ...p,
        cases: p.cases.map((c) =>
          c.id === caseId && !c.offeredResourceIds.includes(resourceId)
            ? {
                ...c,
                offeredResourceIds: [...c.offeredResourceIds, resourceId],
                updatedAt: new Date().toISOString(),
              }
            : c,
        ),
        notifications: [
          notify(
            "student",
            "Resource recommendation",
            "A counsellor shared a resource with you.",
            "/student/support",
          ),
          ...p.notifications,
        ],
      }));
    },
    [notify],
  );

  const requestVoluntaryContact = useCallback(
    (caseId: string) => {
      setState((p) => ({
        ...p,
        cases: p.cases.map((c) =>
          c.id === caseId
            ? {
                ...c,
                status: "awaiting_student" as const,
                updatedAt: new Date().toISOString(),
              }
            : c,
        ),
        notifications: [
          notify(
            "student",
            "Counsellor response",
            "A counsellor has offered to talk. Accepting is entirely your choice.",
            "/student/support",
          ),
          ...p.notifications,
        ],
        audit: [
          audit(
            "counsellor",
            "Voluntary contact requested",
            "Invitation sent. The student is under no obligation to respond and identity remains withheld until they accept.",
          ),
          ...p.audit,
        ],
      }));
    },
    [audit, notify],
  );

  const scheduleAppointment = useCallback<StoreValue["scheduleAppointment"]>(
    (caseId, when, mode, concern) => {
      setState((p) => {
        const kase = p.cases.find((c) => c.caseId === caseId || c.id === caseId);
        return {
          ...p,
          appointments: [
            {
              id: uid("ap"),
              caseId: kase?.caseId ?? caseId,
              at: when,
              mode,
              concern,
              status: "upcoming" as const,
              identityVisible: Boolean(kase?.studentHandle),
            },
            ...p.appointments,
          ],
          cases: p.cases.map((c) =>
            c.id === kase?.id
              ? { ...c, status: "scheduled" as const, updatedAt: new Date().toISOString() }
              : c,
          ),
          notifications: [
            notify(
              "student",
              "Appointment reminder",
              "Your support appointment is confirmed.",
              "/student/support/appointments",
            ),
            ...p.notifications,
          ],
        };
      });
    },
    [notify],
  );

  const setAppointmentStatus = useCallback(
    (id: string, status: Appointment["status"]) => {
      setState((p) => ({
        ...p,
        appointments: p.appointments.map((a) => (a.id === id ? { ...a, status } : a)),
      }));
    },
    [],
  );

  const recordFollowUp = useCallback((caseId: string, date: string) => {
    setState((p) => ({
      ...p,
      cases: p.cases.map((c) =>
        c.id === caseId
          ? { ...c, nextFollowUp: date, updatedAt: new Date().toISOString() }
          : c,
      ),
    }));
  }, []);

  const setCaseStatus = useCallback((caseId: string, status: CounsellingCase["status"]) => {
    setState((p) => ({
      ...p,
      cases: p.cases.map((c) =>
        c.id === caseId ? { ...c, status, updatedAt: new Date().toISOString() } : c,
      ),
    }));
  }, []);

  const resolveModeration = useCallback<StoreValue["resolveModeration"]>(
    (id, decision, resourceId) => {
      setState((p) => {
        const item = p.moderation.find((m) => m.id === id);
        if (!item) return p;
        const publish = decision === "approve" || decision === "false_positive";
        const remove = decision === "remove";
        return {
          ...p,
          moderation: p.moderation.map((m) =>
            m.id === id
              ? {
                  ...m,
                  status: "resolved" as const,
                  decision,
                  resolvedAt: new Date().toISOString(),
                  attachedResourceId: resourceId ?? m.attachedResourceId,
                }
              : m,
          ),
          posts: p.posts.map((x) =>
            x.id === item.targetId
              ? {
                  ...x,
                  moderation: publish ? "published" : remove ? "removed" : x.moderation,
                }
              : x,
          ),
          replies: p.replies.map((x) =>
            x.id === item.targetId
              ? {
                  ...x,
                  moderation: publish ? "published" : remove ? "removed" : x.moderation,
                }
              : x,
          ),
          audit: [
            audit(
              "counsellor",
              `Moderation decision — ${decision.replace("_", " ")}`,
              `${item.reason.replace("_", " ")} item resolved${
                resourceId ? " with a support resource attached" : ""
              }.`,
            ),
            ...p.audit,
          ],
        };
      });
    },
    [audit],
  );

  const claimModeration = useCallback((id: string) => {
    setState((p) => ({
      ...p,
      moderation: p.moderation.map((m) =>
        m.id === id ? { ...m, status: "under_review" as const } : m,
      ),
    }));
  }, []);

  /* ------------------------------------------------------- notifications */

  const markNotificationRead = useCallback((id: string) => {
    setState((p) => ({
      ...p,
      notifications: p.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  }, []);

  const markAllRead = useCallback((audience: AppNotification["audience"]) => {
    setState((p) => ({
      ...p,
      notifications: p.notifications.map((n) =>
        n.audience === audience ? { ...n, read: true } : n,
      ),
    }));
  }, []);

  /* ----------------------------------------------------------- peer chat */

  const startPeerChat = useCallback(() => {
    const hex = Math.random().toString(16).slice(2, 7).toUpperCase();
    const session: PeerChatSession = {
      id: uid("pc"),
      peerHandle: `MindMate #${hex}`,
      startedAt: new Date().toISOString(),
      messages: [],
    };
    setState((p) => ({ ...p, peerChat: session }));
    return session;
  }, []);

  const sendPeerMessage = useCallback(
    (body: string, sender: "self" | "peer" = "self") => {
      const msg: PeerChatMessage = {
        id: uid("pm"),
        sender,
        body,
        createdAt: new Date().toISOString(),
      };
      setState((p) => {
        if (!p.peerChat) return p;
        return {
          ...p,
          peerChat: { ...p.peerChat, messages: [...p.peerChat.messages, msg] },
        };
      });
    },
    [],
  );

  const endPeerChat = useCallback(() => {
    setState((p) => ({ ...p, peerChat: null }));
  }, []);

  /* ----------------------------------------------------------- peer queue */

  const setPeerQueue = useCallback<StoreValue["setPeerQueue"]>((queue) => {
    setState((p) => ({
      ...p,
      peerQueue: typeof queue === "function" ? queue(p.peerQueue ?? []) : queue,
    }));
  }, []);

  const addToPeerQueue = useCallback<StoreValue["addToPeerQueue"]>((item) => {
    setState((p) => {
      const existing = p.peerQueue ?? [];
      if (existing.some((x) => x.tabId === item.tabId)) return p;
      return {
        ...p,
        peerQueue: [item, ...existing],
      };
    });
  }, []);

  const removeFromPeerQueue = useCallback<StoreValue["removeFromPeerQueue"]>((tabId) => {
    setState((p) => ({
      ...p,
      peerQueue: (p.peerQueue ?? []).filter((x) => x.tabId !== tabId),
    }));
  }, []);

  const clearPeerQueue = useCallback<StoreValue["clearPeerQueue"]>(() => {
    setState((p) => ({ ...p, peerQueue: [] }));
  }, []);

  /* ------------------------------------------------------------ resources */

  const postResource = useCallback<StoreValue["postResource"]>(
    (resource) => {
      setState((p) => ({
        ...p,
        customResources: [resource, ...(p.customResources ?? [])],
      }));
      toast("Resource posted", "success", "Students can now view and read this article in the library.");
    },
    [toast],
  );

  const removeResource = useCallback<StoreValue["removeResource"]>(
    (id) => {
      setState((p) => ({
        ...p,
        customResources: (p.customResources ?? []).filter((r) => r.id !== id),
      }));
      toast("Resource removed", "info", "Removed from the library.");
    },
    [toast],
  );

  /* -------------------------------------------------------- demo plumbing */

  const setSimulate = useCallback((key: "aiDown" | "offline", value: boolean) => {
    setState((p) => ({ ...p, simulate: { ...p.simulate, [key]: value } }));
  }, []);

  const resetAll = useCallback((mode: "seeded" | "empty") => {
    setState(mode === "seeded" ? seededState() : emptyState());
    setLocked(false);
  }, []);

  const exportData = useCallback(() => {
    const mine = {
      exportedAt: new Date().toISOString(),
      identity: state.identity,
      consent: state.consent,
      checkIns: state.checkIns,
      journal: state.journal,
      posts: state.posts.filter((p) => p.authorIsSelf),
      replies: state.replies.filter((r) => r.authorIsSelf),
      cases: state.cases.filter((c) => c.isDemoStudent),
    };
    return JSON.stringify(mine, null, 2);
  }, [state]);

  const deleteMyData = useCallback(() => {
    setState((p) => ({
      ...emptyState(),
      onboarded: false,
      identity: null,
      audit: [
        audit(
          "student",
          "Account data deleted",
          "Check-ins, journal, posts and support requests erased from this device.",
        ),
        ...p.audit,
      ],
    }));
  }, [audit]);

  const value: StoreValue = {
    ready,
    state,
    indicator,
    locked,
    lock: () => setLocked(true),
    unlock: () => {
      lastActivity.current = Date.now();
      setLocked(false);
    },
    completeOnboarding,
    regenerateIdentity,
    setIdentity, // 🔥 FIX: setIdentity yahan expose kar diya
    setConsent,
    setA11y,
    setSupportMode,
    saveCheckIn,
    todaysCheckIn,
    dismissSupportPrompt,
    saveJournal,
    deleteJournal,
    toggleJournalShare,
    createPost,
    createReply,
    toggleReaction,
    toggleSavePost,
    hidePost,
    reportPost,
    blockHandle,
    repliesFor,
    requestCounselling,
    linkIdentity,
    withdrawCase,
    setAlertStatus,
    addCaseNote,
    offerResource,
    requestVoluntaryContact,
    scheduleAppointment,
    setAppointmentStatus,
    recordFollowUp,
    setCaseStatus,
    resolveModeration,
    claimModeration,
    startPeerChat,
    sendPeerMessage,
    endPeerChat,
    setPeerQueue,
    addToPeerQueue,
    removeFromPeerQueue,
    clearPeerQueue,
    postResource,
    removeResource,
    markNotificationRead,
    markAllRead,
    setSimulate,
    resetAll,
    exportData,
    deleteMyData,
    toasts,
    toast,
    dismissToast,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}