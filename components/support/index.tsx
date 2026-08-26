"use client";

import { WeeklyMoodBars } from "@/components/charts";
import { Badge, Callout, LinkButton, Button } from "@/components/ui";
import { cx } from "@/lib/format";
import { LEVEL_COPY, TREND_GLYPH, trendLabel, studentPromptCopy } from "@/lib/support-indicator";
import type { SupportIndicator as Indicator, SupportLevel } from "@/lib/types";

/* ------------------------------------------------------- SupportLevelBadge */

const LEVEL_TONE: Record<SupportLevel, "urgent" | "amber" | "info" | "mint"> = {
  critical: "urgent",
  high: "amber",
  moderate: "info",
  informational: "mint",
};

export function SupportLevelBadge({
  level,
  className,
}: {
  level: SupportLevel;
  className?: string;
}) {
  return (
    <Badge tone={LEVEL_TONE[level]} className={className}>
      {LEVEL_COPY[level].label}
    </Badge>
  );
}

export function TrendBadge({ trend }: { trend: Indicator["trend"] }) {
  const tone = trend === "rising" ? "amber" : trend === "easing" ? "mint" : "neutral";
  return (
    <Badge tone={tone}>
      <span aria-hidden>{TREND_GLYPH[trend]}</span>
      <span className="sr-only">Trend: </span>
      {trendLabel(trend)}
    </Badge>
  );
}

/* ------------------------------------------------------ HumanReviewBanner  */

/**
 * Shown on every counsellor surface that displays model output. The banner is
 * not decorative: it is the standing reminder that the model prioritises, and
 * the counsellor decides.
 */
export function HumanReviewBanner({ className }: { className?: string }) {
  return (
    <div
      className={cx(
        "flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-pro-200 bg-pro-50 px-4 py-2.5 text-sm text-pro-900",
        className,
      )}
    >
      <span aria-hidden>👤</span>
      <p className="font-medium">These are model-detected signals, not a diagnosis.</p>
      <p className="text-pro-800/80">
        AI flags · you review · you decide. Nothing is actioned automatically.
      </p>
    </div>
  );
}

/* ---------------------------------------------------- Student-facing prompt */

/**
 * The student never sees a level, a score or a confidence figure. They see an
 * offer and two doors, either of which they can ignore.
 */
export function StudentSupportPrompt({
  indicator,
  onDismiss,
  className,
}: {
  indicator: Indicator;
  onDismiss?: () => void;
  className?: string;
}) {
  const copy = studentPromptCopy(indicator);
  return (
    <section
      className={cx(
        "rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-card",
        className,
      )}
      aria-labelledby="support-prompt-title"
    >
      <p className="text-2xl" aria-hidden>
        🫶
      </p>
      <h2
        id="support-prompt-title"
        className="mt-2 text-lg font-semibold text-navy-900"
      >
        {copy.title}
      </h2>
      <p className="mt-1.5 text-sm text-navy-700">{copy.body}</p>
      <p className="mt-1.5 text-sm font-medium text-navy-800">
        You don&rsquo;t have to handle it alone.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <LinkButton href="/student/support" tone="primary">
          Explore support
        </LinkButton>
        <LinkButton href="/student/peer">Talk to someone</LinkButton>
        {onDismiss ? (
          <Button tone="ghost" onClick={onDismiss}>
            Not now
          </Button>
        ) : null}
      </div>
      <p className="muted mt-3 text-xs">
        This suggestion came from your own check-ins on this device. No one has been told.
      </p>
    </section>
  );
}

/* ------------------------------------------------ Explainable signal list  */

export function SignalList({
  signals,
  className,
}: {
  signals: Indicator["signals"];
  className?: string;
}) {
  if (!signals.length) {
    return <p className="muted text-sm">No support indicators are currently present.</p>;
  }
  return (
    <ul className={cx("space-y-2.5", className)}>
      {signals.map((s) => (
        <li key={s.key} className="rounded-xl border border-navy-100 bg-white p-3">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-medium text-navy-900">{s.label}</p>
            <span
              className="muted shrink-0 text-xs tabular-nums"
              title="Relative contribution to the overall indicator"
            >
              weight {s.weight.toFixed(1)}
            </span>
          </div>
          <p className="muted mt-0.5 text-sm">{s.evidence}</p>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------- Counsellor-facing panel */

export function IndicatorPanel({
  indicator,
  caseId,
  className,
}: {
  indicator: Pick<
    Indicator,
    "level" | "confidence" | "signals" | "trend" | "weeklyMood"
  >;
  caseId: string;
  className?: string;
}) {
  return (
    <div className={cx("space-y-4", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <SupportLevelBadge level={indicator.level} />
        <TrendBadge trend={indicator.trend} />
        <Badge tone="neutral">Anonymous Case #{caseId}</Badge>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold tracking-wide text-navy-700 uppercase">
          Support indicators
        </h3>
        <SignalList signals={indicator.signals} />
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold tracking-wide text-navy-700 uppercase">
          Four-week trend
        </h3>
        <WeeklyMoodBars weeks={indicator.weeklyMood} />
      </div>

      <div>
        <div className="mb-1 flex items-baseline justify-between text-sm">
          <span className="font-medium text-navy-800">Model confidence</span>
          <span className="text-navy-900 tabular-nums">
            {Math.round(indicator.confidence * 100)}%
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-navy-100">
          <div
            className="h-full rounded-full bg-pro-500"
            style={{ width: `${Math.round(indicator.confidence * 100)}%` }}
          />
        </div>
        <p className="muted mt-1 text-xs">
          Confidence describes how much evidence the signals rest on — not a probability
          of illness.
        </p>
      </div>

      <Callout tone="pro" icon="⚖️">
        {LEVEL_COPY[indicator.level].blurb} Recommended next step:{" "}
        <strong>{LEVEL_COPY[indicator.level].action}</strong>.
      </Callout>
    </div>
  );
}

/* --------------------------------------------------------- AI unavailable  */

export function AiUnavailable({ className }: { className?: string }) {
  return (
    <Callout tone="amber" icon="🛠️" title="Support analysis is temporarily unavailable" className={className}>
      Your private journal and check-ins remain available and nothing you saved has been
      lost. We will pick the analysis back up when the service returns.
    </Callout>
  );
}

export function AnalysisOff({ className }: { className?: string }) {
  return (
    <Callout tone="info" icon="🔕" title="AI support analysis is off" className={className}>
      You turned this off, so MindEase is not looking for support indicators in your
      check-ins. You can still reach a counsellor whenever you want, and turn analysis
      back on in Settings.
    </Callout>
  );
}
