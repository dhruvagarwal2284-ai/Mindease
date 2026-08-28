import type { FlagReason } from "./types";

/**
 * A deliberately transparent, rule-based stand-in for the moderation model.
 *
 * A real deployment would run a trained classifier server-side; the point of
 * the prototype is the *workflow* — pre-post screening, a review prompt the
 * author can act on, and a human queue — not the classifier itself. Every
 * decision here carries a plain-language reason so nothing feels like a
 * black box.
 */

export interface ScreenResult {
  ok: boolean;
  /** crisis takes precedence: the composer switches to a support response */
  crisis: boolean;
  reason?: FlagReason;
  /** shown to the author before publishing */
  message?: string;
  matched: string[];
}

const CRISIS_PATTERNS: RegExp[] = [
  /\bkill(ing)?\s+my\s?self\b/i,
  /\bend(ing)?\s+(it|my life)\b/i,
  /\bsuicid(e|al)\b/i,
  /\bself[-\s]?harm\b/i,
  /\bcut(ting)?\s+my\s?self\b/i,
  /\bdon'?t\s+want\s+to\s+(live|be here)\b/i,
  /\bno\s+reason\s+to\s+live\b/i,
  /\bbetter\s+off\s+(dead|without me)\b/i,
];

const HARMFUL_ADVICE_PATTERNS: RegExp[] = [
  /\b(stop|quit)\s+(taking\s+)?(your\s+)?(meds|medication|therapy|treatment)\b/i,
  /\byou\s+don'?t\s+need\s+(a\s+)?(doctor|therapist|counsell?or|help)\b/i,
  /\bjust\s+drink\b/i,
  /\b(alcohol|weed|pills)\s+(will|would)\s+(help|fix|solve)\b/i,
  /\bstarv(e|ing)\b/i,
];

const HARASSMENT_PATTERNS: RegExp[] = [
  // `an?` so "you're such an idiot" is caught as well as "such a loser".
  /\b(you'?re|ur)\s+(such\s+)?(an?\s+)?(idiot|stupid|pathetic|worthless|loser)\b/i,
  /\bshut\s+up\b/i,
  /\bnobody\s+cares\s+about\s+you\b/i,
  /\bget\s+over\s+it\b/i,
  /\bstop\s+being\s+(so\s+)?dramatic\b/i,
];

const MISINFO_PATTERNS: RegExp[] = [
  /\b(cures?|cured|curing)\s+(depression|anxiety|adhd)\b/i,
  /\bguaranteed\s+to\s+(cure|fix|work)\b/i,
  /\bdepression\s+is(n'?t| not)\s+real\b/i,
  /\bmental\s+illness\s+is\s+a\s+(myth|choice)\b/i,
];

/** Identifiers a student might paste in by accident — anonymity leakage. */
const IDENTIFIER_PATTERNS: RegExp[] = [
  /\b\d{10}\b/,
  /\b[\w.%-]+@[\w.-]+\.[a-z]{2,}\b/i,
  /\broll\s*(no|number)\s*[:#]?\s*\w+/i,
];

function firstMatch(text: string, patterns: RegExp[]): string[] {
  const hits: string[] = [];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) hits.push(m[0]);
  }
  return hits;
}

/**
 * The rule engine. Kept as a named export because it stays the fallback and
 * the shadow-mode baseline once a model backend is registered — it is never
 * deleted, only compared against.
 */
export function screenWithRules(text: string): ScreenResult {
  const body = text.trim();
  if (!body) return { ok: false, crisis: false, matched: [], message: "Write something first." };

  const crisis = firstMatch(body, CRISIS_PATTERNS);
  if (crisis.length) {
    return {
      ok: false,
      crisis: true,
      reason: "crisis_concern",
      matched: crisis,
      message:
        "It sounds like things are really heavy right now. You can still post this — and support is available to you straight away.",
    };
  }

  const harmful = firstMatch(body, HARMFUL_ADVICE_PATTERNS);
  if (harmful.length) {
    return {
      ok: false,
      crisis: false,
      reason: "harmful_content",
      matched: harmful,
      message:
        "This reads like medical advice. Sharing your own experience is safer than telling someone what to do about treatment.",
    };
  }

  const harassment = firstMatch(body, HARASSMENT_PATTERNS);
  if (harassment.length) {
    return {
      ok: false,
      crisis: false,
      reason: "harassment",
      matched: harassment,
      message:
        "That phrasing may land as dismissive. Would you like to rewrite it before posting?",
    };
  }

  const misinfo = firstMatch(body, MISINFO_PATTERNS);
  if (misinfo.length) {
    return {
      ok: false,
      crisis: false,
      reason: "misinformation",
      matched: misinfo,
      message:
        "This makes a strong claim about mental health. A counsellor will review it before it appears in the feed.",
    };
  }

  const identifiers = firstMatch(body, IDENTIFIER_PATTERNS);
  if (identifiers.length) {
    return {
      ok: false,
      crisis: false,
      reason: "other",
      matched: identifiers,
      message:
        "This looks like it contains contact details. Posting them would make you identifiable — remove them to stay anonymous.",
    };
  }

  return { ok: true, crisis: false, matched: [] };
}

/**
 * Synchronous screening. This is what every existing call site uses, and it
 * always runs the rules — no network, no await, safe to call inside a store
 * action. Model backends are reached through `screenContentAsync`.
 */
export function screenContent(text: string): ScreenResult {
  return screenWithRules(text);
}

/* ------------------------------------------------------- model backends */

/**
 * The contract a trained classifier implements. M1 (crisis), M2 (toxicity),
 * M3 (harmful advice) and M4 (PII) all reduce to this one shape, so the app
 * never learns which model produced a result.
 */
export interface ScreenBackend {
  readonly name: string;
  screen(text: string): Promise<ScreenResult>;
}

/**
 * `rules`  — rules decide, model never runs (default)
 * `shadow` — both run, rules still decide, disagreements are recorded
 * `model`  — model decides, rules are the fallback if it throws
 */
export type ScreenMode = "rules" | "shadow" | "model";

/**
 * Where the text came from. Private surfaces (peer chat, 1:1 support chat)
 * promise the message is never retained, so their disagreement records carry
 * the decision only and never the text.
 */
export type ScreenSurface = "community" | "private";

let backend: ScreenBackend | null = null;
let mode: ScreenMode = "rules";

export function configureScreening(opts: {
  backend?: ScreenBackend | null;
  mode?: ScreenMode;
}): void {
  if (opts.backend !== undefined) backend = opts.backend;
  if (opts.mode !== undefined) mode = opts.mode;
}

export function getScreeningConfig(): { backend: string | null; mode: ScreenMode } {
  return { backend: backend?.name ?? null, mode };
}

/* ---------------------------------------------------- disagreement log */

export interface ScreenDisagreement {
  at: string;
  backend: string;
  surface: ScreenSurface;
  /** community surfaces only — omitted entirely for private ones */
  excerpt?: string;
  rules: { crisis: boolean; reason?: FlagReason };
  model: { crisis: boolean; reason?: FlagReason };
}

const DISAGREEMENT_LIMIT = 200;
const disagreements: ScreenDisagreement[] = [];

export function getDisagreements(): readonly ScreenDisagreement[] {
  return disagreements;
}

export function clearDisagreements(): void {
  disagreements.length = 0;
}

function record(
  surface: ScreenSurface,
  text: string,
  rules: ScreenResult,
  model: ScreenResult,
): void {
  const entry: ScreenDisagreement = {
    at: new Date().toISOString(),
    backend: backend?.name ?? "unknown",
    surface,
    rules: { crisis: rules.crisis, reason: rules.reason },
    model: { crisis: model.crisis, reason: model.reason },
  };
  // Private surfaces record the decision only. Logging the text here would
  // undo the "nothing is saved" promise the chat screens make.
  if (surface === "community") entry.excerpt = text.slice(0, 140);
  disagreements.push(entry);
  if (disagreements.length > DISAGREEMENT_LIMIT) disagreements.shift();
}

function differs(a: ScreenResult, b: ScreenResult): boolean {
  return a.ok !== b.ok || a.crisis !== b.crisis || a.reason !== b.reason;
}

/**
 * The seam a model plugs into. Falls back to the rules whenever a backend is
 * absent or throws, so screening degrades to the current behaviour rather
 * than failing open.
 */
export async function screenContentAsync(
  text: string,
  surface: ScreenSurface = "community",
): Promise<ScreenResult> {
  const rules = screenWithRules(text);
  if (!backend || mode === "rules") return rules;

  let model: ScreenResult;
  try {
    model = await backend.screen(text);
  } catch {
    return rules;
  }

  if (differs(rules, model)) record(surface, text, rules, model);
  return mode === "model" ? model : rules;
}

export const FLAG_REASON_COPY: Record<FlagReason, string> = {
  misinformation: "Misinformation",
  harassment: "Harassment",
  harmful_content: "Harmful content",
  crisis_concern: "Crisis concern",
  other: "Other",
};

export const REPORT_REASONS: { value: FlagReason; label: string; detail: string }[] = [
  {
    value: "harassment",
    label: "Harassment or bullying",
    detail: "Targets or demeans someone.",
  },
  {
    value: "harmful_content",
    label: "Harmful advice",
    detail: "Encourages something unsafe, or presents medical advice as fact.",
  },
  {
    value: "misinformation",
    label: "Misinformation",
    detail: "Makes false claims about mental health.",
  },
  {
    value: "crisis_concern",
    label: "I'm worried about this person",
    detail: "Routed to a counsellor for a supportive response, not a punishment.",
  },
  { value: "other", label: "Something else", detail: "Anything that does not fit above." },
];
