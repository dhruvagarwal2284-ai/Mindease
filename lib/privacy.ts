import type { AnonymousIdentity, ConsentSettings, SharedDataScope } from "./types";

const HEX = "0123456789ABCDEF";

function randomHex(len: number): string {
  let out = "";
  if (typeof globalThis.crypto?.getRandomValues === "function") {
    const buf = new Uint8Array(len);
    globalThis.crypto.getRandomValues(buf);
    for (let i = 0; i < len; i += 1) out += HEX[buf[i] % 16];
    return out;
  }
  for (let i = 0; i < len; i += 1) {
    out += HEX[Math.floor(Math.random() * 16)];
  }
  return out;
}

/**
 * A pseudonym is generated on the device and never derived from anything the
 * student typed. There is deliberately no display name, avatar or bio: the
 * product should not invite students to build an identifiable public profile.
 */
export function generateIdentity(): AnonymousIdentity {
  const suffix = randomHex(5);
  return {
    handle: `MindMate #${suffix}`,
    caseId: `${suffix.slice(0, 3)}${suffix.slice(4)}`,
    createdAt: new Date().toISOString(),
  };
}

export const DEFAULT_CONSENT: ConsentSettings = {
  anonymousCommunity: true,
  moodTracking: true,
  aiSupportAnalysis: true,
  counsellorSharing: false,
  journalSharing: false,
  notifications: true,
};

export const CONSENT_COPY: Record<
  keyof ConsentSettings,
  { label: string; why: string; sensitive?: boolean }
> = {
  anonymousCommunity: {
    label: "Anonymous community participation",
    why: "Lets you post and reply under your pseudonym. Other students never see who you are.",
  },
  moodTracking: {
    label: "Mood tracking",
    why: "Stores your daily check-ins on this device so you can see your own pattern over time.",
  },
  aiSupportAnalysis: {
    label: "AI support analysis",
    why: "Looks for support indicators in your check-in pattern so the app can offer help sooner. It does not diagnose you.",
  },
  counsellorSharing: {
    label: "Counsellor sharing",
    why: "Off until you ask to talk to someone. When you do, you choose item by item what is shared.",
    sensitive: true,
  },
  journalSharing: {
    label: "Journal sharing",
    why: "Your journal stays private unless you turn this on and pick specific entries.",
    sensitive: true,
  },
  notifications: {
    label: "Notifications",
    why: "Replies, appointment reminders and follow-ups. Previews never show sensitive content.",
  },
};

/* --------------------------------------------------- shared-scope helpers */

export const EMPTY_SCOPE: SharedDataScope = {
  concern: true,
  preferredMode: true,
  moodTrend: false,
  checkInTags: false,
  journalEntries: false,
  contactHandle: false,
};

export const SCOPE_COPY: Record<
  keyof SharedDataScope,
  { label: string; detail: string; required?: boolean }
> = {
  concern: {
    label: "What you'd like help with",
    detail: "The topic you picked, e.g. “Academic stress”.",
    required: true,
  },
  preferredMode: {
    label: "Your preferred way to talk",
    detail: "Chat, in-person, video or phone.",
    required: true,
  },
  moodTrend: {
    label: "Your recent mood pattern",
    detail: "A weekly average only — not the notes you wrote.",
  },
  checkInTags: {
    label: "Your check-in topics",
    detail: "The chips you tapped, e.g. “Exams”, “Sleep”. No free text.",
  },
  journalEntries: {
    label: "Journal entries you pick",
    detail: "Nothing is attached unless you tick specific entries afterwards.",
  },
  contactHandle: {
    label: "Your pseudonym",
    detail:
      "Lets a counsellor reply to you directly. Your real name is still never shared.",
  },
};

export function scopeSummary(scope: SharedDataScope): string[] {
  return (Object.keys(SCOPE_COPY) as (keyof SharedDataScope)[])
    .filter((k) => scope[k])
    .map((k) => SCOPE_COPY[k].label);
}

export function withheldSummary(scope: SharedDataScope): string[] {
  return (Object.keys(SCOPE_COPY) as (keyof SharedDataScope)[])
    .filter((k) => !scope[k])
    .map((k) => SCOPE_COPY[k].label);
}

/**
 * Notification previews are intentionally vague. The full body is only ever
 * shown inside the app, behind the session.
 */
export function safePreview(): string {
  return "You have a new MindEase update";
}
