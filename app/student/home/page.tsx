"use client";

import { ThemeSelector } from "@/components/ThemeSelector";
import Link from "next/link";
import { useMemo } from "react";
import { DailyCheckIn } from "@/components/checkin";
import { AnonymousModeBar } from "@/components/privacy";
import {
  AiUnavailable,
  StudentSupportPrompt,
} from "@/components/support";
import {
  Badge,
  LinkButton,
  SkeletonCard,
} from "@/components/ui";
import { cx, isoDay } from "@/lib/format";
import { recommendResources } from "@/lib/resources";
import { useStore } from "@/lib/store";
import { shouldPromptStudent } from "@/lib/support-indicator";

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

// const QUICK_ACTIONS: {
//   href: string;
//   label: string;
//   body: string;
//   icon: string;
//   className: string;
// }[] = [
//   {
//     href: "/student/peer",
//     label: "Talk to someone",
//     body: "Chat anonymously with a peer, one-to-one, right now.",
//     icon: "💬",
//     className:
//       "border-teal-200 bg-teal-50 text-teal-900 hover:border-teal-300 hover:bg-teal-100/70",
//   },
//   {
//     href: "/student/journal/new",
//     label: "Write privately",
//     body: "A page only you can read. Nothing leaves this device.",
//     icon: "📓",
//     className:
//       "border-info-200 bg-info-50 text-info-900 hover:border-info-300 hover:bg-info-100/70",
//   },
//   {
//     href: "/student/support",
//     label: "Explore resources",
//     body: "Short, practical reads for the thing that is heaviest today.",
//     icon: "🧭",
//     className:
//       "border-mint-200 bg-mint-50 text-mint-900 hover:border-mint-300 hover:bg-mint-100/70",
//   },
//   {
//     href: "/student/support/request",
//     label: "Book a counsellor",
//     body: "Schedule a formal appointment with campus counselling.",
//     icon: "🤝",
//     className:
//       "border-pro-200 bg-pro-50 text-pro-900 hover:border-pro-300 hover:bg-pro-100/70",
//   },
//   {
//     href: "/student/help",
//     label: "Get help now",
//     body: "If things feel urgent, this is the fastest way through.",
//     icon: "🆘",
//     className:
//       "border-urgent-200 bg-urgent-50 text-urgent-900 hover:border-urgent-300 hover:bg-urgent-100/70",
//   },
// ];

/* ------------------------------------------------------------------- page */
/* ---------------------------------------------------------- quick actions */

const QUICK_ACTIONS: {
  href: string;
  label: string;
  body: string;
  icon: string;
  className: string;
}[] = [
  {
    href: "/student/journal/new",
    label: "Write privately",
    body: "A page only you can read. Nothing leaves this device.",
    icon: "📓",
    className:
      "border-info-200 bg-info-50 text-info-900 hover:border-info-300 hover:bg-info-100/70",
  },
  {
    href: "/student/support/request",
    label: "Book a counsellor",
    body: "Schedule a formal appointment with campus counselling.",
    icon: "🤝",
    className:
      "border-pro-200 bg-pro-50 text-pro-900 hover:border-pro-300 hover:bg-pro-100/70",
  },
];
export default function StudentHomePage() {
  const {
    ready,
    state,
    indicator,
    dismissSupportPrompt,
  } = useStore();

  const recentTags = useMemo(() => {
    const recent = [...state.checkIns]
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .slice(0, 5);

    return Array.from(
      new Set(recent.flatMap((c) => c.tags as string[])),
    );
  }, [state.checkIns]);

  const recommended = useMemo(
    () => recommendResources(recentTags, 3),
    [recentTags],
  );

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

  const promptDismissedToday =
    state.dismissedPromptOn === isoDay();

  const showPrompt =
    analysisOn &&
    !state.simulate.aiDown &&
    shouldPromptStudent(indicator) &&
    !promptDismissedToday;

  const showAiDown =
    analysisOn && state.simulate.aiDown;

  return (
    <div className="space-y-5 pb-0">

      {/* ------------------------------------------------------ theme */}

      <ThemeSelector />

      {/* ------------------------------------------------------- greeting */}

      <header className="animate-fade-up">
        <p className="muted text-sm">
          {greetingFor(new Date())},
        </p>

        <h1 className="text-2xl font-semibold tracking-tight text-navy-900">
          {state.identity?.handle ?? "MindMate"}
        </h1>

        <p className="muted mt-1 text-sm">
          What support could you use right now? Nothing here is compulsory.
        </p>

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
                <span
                  className="text-2xl leading-none"
                  aria-hidden
                >
                  {a.icon}
                </span>

                <span className="mt-3 block">
                  <span className="block font-semibold">
                    {a.label}
                  </span>

                  <span className="mt-0.5 block text-xs opacity-80">
                    {a.body}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ----------------------------------------------------- recommended */}

      <section aria-labelledby="recommended-heading">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2
              id="recommended-heading"
              className="text-lg font-semibold tracking-tight text-navy-900"
            >
              {analysisOn
                ? "Recommended for you"
                : "Reading that might help"}
            </h2>

            <p className="muted mt-0.5 text-sm">
              {analysisOn
                ? recentTags.length
                  ? `Picked from the topics you tapped recently: ${recentTags
                      .slice(0, 3)
                      .join(", ")}.`
                  : "A place to start until you tell us more."
                : "Support analysis is off, so this is just the general shelf."}
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
                  <span
                    className="text-xl leading-none"
                    aria-hidden
                  >
                    📄
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-navy-900">
                      {r.title}
                    </span>

                    <span className="muted mt-0.5 block text-sm">
                      {r.summary}
                    </span>

                    <span className="mt-2 flex flex-wrap items-center gap-1.5">
                      <Badge tone="teal">
                        {r.category}
                      </Badge>

                      <span className="muted text-xs">
                        {r.minutes} min read
                      </span>
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="card p-4">
            <p className="text-sm text-navy-700">
              MindEase is not looking at your check-ins, so nothing
              is picked out for you. The full library is still open
              to browse whenever you want it.
            </p>

            <LinkButton
              href="/student/support"
              className="mt-3"
            >
              Browse resources
            </LinkButton>
          </div>
        )}
      </section>

    </div>
  );
}