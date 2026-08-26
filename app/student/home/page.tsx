"use client";

import Link from "next/link";
import { useMemo } from "react";
import { MoodTimeline } from "@/components/charts";
import { DailyCheckIn } from "@/components/checkin";
import { AnonymousModeBar } from "@/components/privacy";
import { AiUnavailable, StudentSupportPrompt } from "@/components/support";
import { Badge, LinkButton, SkeletonCard } from "@/components/ui";
import { cx, isoDay, pluralize } from "@/lib/format";
import { CONSENT_COPY } from "@/lib/privacy";
import { recommendResources } from "@/lib/resources";
import { useStore } from "@/lib/store";
import { shouldPromptStudent } from "@/lib/support-indicator";
import type { ConsentKey } from "@/lib/types";

/* --------------------------------------------------------------- greeting */

function greetingFor(date: Date): string {
  const h = date.getHours();
  if (h < 5) return "You're up late";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 22) return "Good evening";
  return "Winding down";
}

/* ---------------------------------------------------------- quick actions */

const QUICK_ACTIONS: {
  href: string;
  label: string;
  body: string;
  icon: string;
  className: string;
}[] = [
  {
    href: "/student/support/connect",
    label: "Talk to someone",
    body: "Chat anonymously with a peer who gets it.",
    icon: "🤝",
    className:
      "border-teal-200 bg-teal-50 text-teal-900 hover:border-teal-300 hover:bg-teal-100/70",
  },
  {
    href: "/student/journal/new",
    label: "Write privately",
    body: "A page only you can read. Nothing leaves this device.",
    icon: "📓",
    className:
      "border-info-200 bg-info-50 text-info-900 hover:border-info-300 hover:bg-info-100/70",
  },
  {
    href: "/student/support",
    label: "Explore resources",
    body: "Short, practical reads for the thing that is heaviest today.",
    icon: "🧭",
    className:
      "border-mint-200 bg-mint-50 text-mint-900 hover:border-mint-300 hover:bg-mint-100/70",
  },
  {
    href: "/student/help",
    label: "Get help now",
    body: "If things feel urgent, this is the fastest way through.",
    icon: "🆘",
    className:
      "border-urgent-200 bg-urgent-50 text-urgent-900 hover:border-urgent-300 hover:bg-urgent-100/70",
  },
];

const CONSENT_ORDER: ConsentKey[] = [
  "anonymousCommunity",
  "moodTracking",
  "aiSupportAnalysis",
  "counsellorSharing",
  "journalSharing",
  "notifications",
];

/* ------------------------------------------------------------------- page */

export default function StudentHomePage() {
  const { ready, state, indicator, dismissSupportPrompt } = useStore();

  const recentTags = useMemo(() => {
    const recent = [...state.checkIns]
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .slice(0, 5);
    return Array.from(new Set(recent.flatMap((c) => c.tags as string[])));
  }, [state.checkIns]);

  const recommended = useMemo(() => recommendResources(recentTags, 3), [recentTags]);

  if (!ready) {
    return (
      <div className="space-y-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  const analysisOn = state.consent.aiSupportAnalysis;
  const promptDismissedToday = state.dismissedPromptOn === isoDay();
  const showPrompt =
    analysisOn &&
    !state.simulate.aiDown &&
    shouldPromptStudent(indicator) &&
    !promptDismissedToday;
  const showAiDown = analysisOn && state.simulate.aiDown;

  const checkInCount = state.checkIns.length;

  return (
    <div className="space-y-5 pb-2">
      {/* ------------------------------------------------------- greeting */}
      <header className="animate-fade-up">
        <p className="muted text-sm">{greetingFor(new Date())},</p>
        <h1 className="text-2xl font-semibold tracking-tight text-navy-900">
          {state.identity?.handle ?? "MindMate"}
        </h1>
        <AnonymousModeBar className="mt-3" />
      </header>

      {/* ------------------------------------------------------- check-in */}
      <DailyCheckIn />

      {/* -------------------------------------------------- support offer */}
      <div aria-live="polite">
        {showAiDown ? <AiUnavailable /> : null}
        {showPrompt ? (
          <StudentSupportPrompt
            indicator={indicator}
            onDismiss={dismissSupportPrompt}
            className="animate-fade-up"
          />
        ) : null}
      </div>

      {/* -------------------------------------------------- quick actions */}
      <section aria-labelledby="quick-actions-heading">
        <h2
          id="quick-actions-heading"
          className="mb-3 text-lg font-semibold tracking-tight text-navy-900"
        >
          What would help right now?
        </h2>
        <ul className="grid grid-cols-2 gap-3">
          {QUICK_ACTIONS.map((a) => (
            <li key={a.href}>
              <Link
                href={a.href}
                className={cx(
                  "flex h-full min-h-[7.5rem] flex-col justify-between rounded-2xl border p-4 transition-colors",
                  a.className,
                )}
              >
                <span className="text-2xl leading-none" aria-hidden>
                  {a.icon}
                </span>
                <span className="mt-3 block">
                  <span className="block font-semibold">{a.label}</span>
                  <span className="mt-0.5 block text-xs opacity-80">{a.body}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* --------------------------------------------------- mood pattern */}
      <section className="card p-4 sm:p-5" aria-labelledby="mood-pattern-heading">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2
              id="mood-pattern-heading"
              className="text-lg font-semibold tracking-tight text-navy-900"
            >
              Your mood pattern
            </h2>
            <p className="muted mt-0.5 text-sm">
              Private to this device.
            </p>
          </div>
          <Link
            href="/student/journal/trends"
            className="min-h-11 self-center text-sm font-medium text-teal-800 hover:underline"
          >
            See your history →
          </Link>
        </div>

        {checkInCount < 2 ? (
          <div className="rounded-xl border border-dashed border-navy-200 bg-navy-50/50 px-5 py-8 text-center">
            <p className="text-2xl" aria-hidden>
              🌱
            </p>
            <p className="mt-1 font-medium text-navy-900">Nothing to show yet</p>
            <p className="muted mx-auto mt-1 max-w-sm text-sm">
              Complete two check-ins to see a pattern here.
            </p>
          </div>
        ) : (
          <>
            <MoodTimeline checkIns={state.checkIns} />
            <p className="muted mt-2 text-xs">
              {pluralize(checkInCount, "check-in")} recorded. Only you can see this.
            </p>
          </>
        )}
      </section>

      {/* ----------------------------------------------------- recommended */}
      <section aria-labelledby="recommended-heading">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2
              id="recommended-heading"
              className="text-lg font-semibold tracking-tight text-navy-900"
            >
              {analysisOn ? "Recommended for you" : "Reading that might help"}
            </h2>
            <p className="muted mt-0.5 text-sm">
              {analysisOn
                ? recentTags.length
                  ? "Based on your recent check-ins."
                  : null
                : "General resources — analysis is off."}
            </p>
          </div>
        </div>

        {analysisOn ? (
          <ul className="space-y-2.5">
            {recommended.map((r) => (
              <li key={r.id}>
                <Link
                  href="/student/support"
                  className="card flex min-h-11 items-start gap-3 p-4 transition-colors hover:border-teal-200 hover:bg-teal-50/40"
                >
                  <span className="text-xl leading-none" aria-hidden>
                    📄
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-navy-900">{r.title}</span>
                    <span className="muted mt-0.5 block text-sm">{r.summary}</span>
                    <span className="mt-2 flex flex-wrap items-center gap-1.5">
                      <Badge tone="teal">{r.category}</Badge>
                      <span className="muted text-xs">{r.minutes} min read</span>
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="card p-4">
            <p className="text-sm text-navy-700">
              MindEase is not looking at your check-ins, so nothing is picked out for
              you. The full library is still open to browse whenever you want it.
            </p>
            <LinkButton href="/student/support" className="mt-3">
              Browse resources
            </LinkButton>
          </div>
        )}
      </section>

      {/* -------------------------------------------------- privacy status */}
      <section
        className="rounded-2xl border border-info-200 bg-info-50/70 p-4"
        aria-labelledby="privacy-status-heading"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2
            id="privacy-status-heading"
            className="flex items-center gap-2 text-sm font-semibold text-info-900"
          >
            <span aria-hidden>🛡️</span> Privacy status
          </h2>
          <Link
            href="/student/settings"
            className="text-sm font-medium text-info-900 underline underline-offset-2"
          >
            Change these
          </Link>
        </div>
        <ul className="mt-2.5 flex flex-wrap gap-1.5">
          {CONSENT_ORDER.map((key) => {
            const on = state.consent[key];
            return (
              <li key={key}>
                <Badge tone={on ? "mint" : "neutral"}>
                  {CONSENT_COPY[key].label}
                  <span className="sr-only">: </span>
                  <span className="font-semibold">{on ? "ON" : "OFF"}</span>
                </Badge>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
