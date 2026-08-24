"use client";

import Link from "next/link";
import { useMemo } from "react";
import { DataTableView, MoodTimeline, WeeklyMoodBars } from "@/components/charts";
import { AiUnavailable, AnalysisOff } from "@/components/support";
import {
  Callout,
  Disclosure,
  EmptyState,
  LinkButton,
  SectionTitle,
  SkeletonCard,
} from "@/components/ui";
import { daysAgo, formatDayShort, isoDay, mood as moodDef, pluralize } from "@/lib/format";
import { useStore } from "@/lib/store";
import { shouldPromptStudent } from "@/lib/support-indicator";

export default function MoodTrendsPage() {
  const { ready, state, indicator } = useStore();

  const summary = useMemo(() => {
    const cutoff = isoDay(daysAgo(29));
    const recent = state.checkIns.filter((c) => c.date >= cutoff);
    const counts = new Map<string, number>();
    for (const c of recent) for (const t of c.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
    const avg = recent.length
      ? recent.reduce((s, c) => s + c.mood, 0) / recent.length
      : 0;
    return { recent, top, avg };
  }, [state.checkIns]);

  if (!ready) return <SkeletonCard />;

  const rows = [...state.checkIns]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 30)
    .map((c) => [
      formatDayShort(c.date),
      `${moodDef(c.mood).emoji} ${moodDef(c.mood).label}`,
      c.tags.join(", ") || "—",
    ]);

  const analysisOff = !state.consent.aiSupportAnalysis;

  return (
    <div className="space-y-5">
      <Link href="/student/journal" className="muted inline-block text-sm hover:underline">
        ← Journal
      </Link>

      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-navy-900">
          Your check-in history
        </h1>
        <p className="muted mt-1 text-sm">
          A record of what you told us, kept on this device. It is not a score and it is not
          an assessment of you.
        </p>
      </header>

      {state.checkIns.length === 0 ? (
        <EmptyState
          icon="🌤️"
          title="No check-ins yet"
          body="Once you have checked in a few times, your own pattern shows up here — and only here."
          action={
            <LinkButton href="/student/home" tone="primary">
              Check in today
            </LinkButton>
          }
        />
      ) : (
        <>
          <section className="card p-4 sm:p-5">
            <SectionTitle
              title="Your mood pattern"
              subtitle="Every dot is a check-in you made."
            />
            <MoodTimeline checkIns={state.checkIns} />
          </section>

          <section className="card p-4 sm:p-5">
            <SectionTitle title="Week by week" subtitle="Average of your own check-ins." />
            <WeeklyMoodBars weeks={indicator.weeklyMood} />
          </section>

          <section className="card p-4 sm:p-5">
            <SectionTitle title="What you have been noticing" />
            <div className="space-y-2 text-sm text-navy-800">
              <p>
                You checked in{" "}
                <strong>{pluralize(summary.recent.length, "time")}</strong> in the last
                month.
              </p>
              {summary.top.length ? (
                <p>
                  {summary.top[0][0]} came up most often
                  {summary.top.length > 1
                    ? `, then ${summary.top
                        .slice(1)
                        .map(([t]) => t)
                        .join(" and ")}`
                    : ""}
                  .
                </p>
              ) : null}
              {summary.avg > 0 ? (
                <p>
                  Your check-ins have averaged around{" "}
                  <strong>{moodDef(Math.round(summary.avg) as 1 | 2 | 3 | 4 | 5).label.toLowerCase()}</strong>{" "}
                  this month.
                </p>
              ) : null}
              <p className="muted">
                These are observations about what you reported — nothing here is a
                conclusion about you.
              </p>
            </div>

            <div className="mt-4">
              <Disclosure summary="Show as a table">
                <DataTableView head={["Date", "Mood", "What was affecting you"]} rows={rows} />
              </Disclosure>
            </div>
          </section>

          {/* -------------------------------------------- longitudinal support */}
          {state.simulate.aiDown ? (
            <AiUnavailable />
          ) : analysisOff ? (
            <AnalysisOff />
          ) : shouldPromptStudent(indicator) ? (
            <Callout tone="amber" icon="🫶" title="Something worth saying out loud">
              <p>
                You&rsquo;ve reported feeling stressed several times recently. Would you like
                to explore some support options?
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <LinkButton href="/student/support" tone="primary" size="sm">
                  Explore support
                </LinkButton>
                <LinkButton href="/student/support/request" size="sm">
                  Talk to someone
                </LinkButton>
              </div>
            </Callout>
          ) : (
            <Callout tone="info" icon="🔒" title="Private to you">
              This history has not been shared with anyone. It is used to offer you support
              options, never to label you.
            </Callout>
          )}
        </>
      )}
    </div>
  );
}
