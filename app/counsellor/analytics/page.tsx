"use client";

import { useMemo, useState } from "react";
import {
  ConcernBars,
  DataTableView,
  MoodDistribution,
  TrendLine,
} from "@/components/charts";
import { PrivacyBadge } from "@/components/privacy";
import {
  Badge,
  Callout,
  Card,
  DataTable,
  Disclosure,
  SectionTitle,
  SkeletonCard,
  Stat,
} from "@/components/ui";
import type { Column } from "@/components/ui";
import {
  AGGREGATION_NOTE,
  applyThreshold,
  CAMPUS_CONCERNS,
  CONCERN_TREND,
  DEPARTMENT_ROWS,
  MIN_AGGREGATION,
  MOOD_DISTRIBUTION,
  SUPPORT_DEMAND,
} from "@/lib/analytics";
import type { GroupRow } from "@/lib/analytics";
import { pluralize } from "@/lib/format";
import { useStore } from "@/lib/store";

const CANNOT_DO = [
  "Drill from a bar into the students who make it up",
  "Join any of these figures back to an identity or a case",
  "Export a list of students to contact",
  "Filter down to a group small enough to single someone out",
  "Show a student's own check-ins to anyone but that student",
];

export default function AnalyticsPage() {
  const { ready } = useStore();
  const [threshold, setThreshold] = useState(MIN_AGGREGATION);

  const result = useMemo(
    () => applyThreshold(DEPARTMENT_ROWS, threshold),
    [threshold],
  );
  const hidden = useMemo(
    () => DEPARTMENT_ROWS.filter((r) => r.students < threshold),
    [threshold],
  );

  if (!ready) return <SkeletonCard />;

  const columns: Column<GroupRow>[] = [
    {
      key: "group",
      header: "Group",
      render: (r) => <span className="font-medium text-navy-900">{r.group}</span>,
    },
    {
      key: "students",
      header: "Students",
      render: (r) => <span className="tabular-nums">{r.students}</span>,
    },
    { key: "top", header: "Most reported concern", render: (r) => r.topConcern },
    {
      key: "requests",
      header: "Support requests",
      render: (r) => <span className="tabular-nums">{r.supportRequests}</span>,
    },
  ];

  const totalReports = CAMPUS_CONCERNS.reduce((s, c) => s + c.count, 0);
  const totalRequests = SUPPORT_DEMAND.reduce((s, w) => s + w.requests, 0);
  const totalSessions = SUPPORT_DEMAND.reduce((s, w) => s + w.sessions, 0);

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-navy-900">
            Aggregated analytics
          </h1>
          <p className="muted mt-1 text-sm">
            Campus-level support demand. Nothing here describes an individual.
          </p>
        </div>
        <PrivacyBadge status="aggregate" />
      </header>

      <Callout tone="info" icon="📊" title="Measure support, not surveillance">
        These figures exist to answer &ldquo;where is support demand going, and do we have
        the capacity for it?&rdquo; — never &ldquo;which students are struggling?&rdquo;
        Every view is aggregated, and groups below the threshold are suppressed rather than
        shown.
      </Callout>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Concerns reported"
          value={totalReports}
          hint="Last six weeks, all topics"
          tone="navy"
        />
        <Stat
          label="Support requests"
          value={totalRequests}
          hint="Student-initiated, six weeks"
          tone="teal"
        />
        <Stat
          label="Sessions delivered"
          value={totalSessions}
          hint="Completed counselling sessions"
          tone="mint"
        />
        <Stat
          label="Aggregation floor"
          value={threshold}
          hint="Groups smaller than this are suppressed"
          tone="pro"
        />
      </div>

      {/* --------------------------------------------- reported concerns */}
      <Card className="p-4 sm:p-5">
        <SectionTitle
          title="Reported concerns"
          subtitle="What students select in their own check-ins, counted campus-wide."
        />
        <ConcernBars rows={CAMPUS_CONCERNS} />
        <div className="mt-4">
          <Disclosure summary="Show as a table">
            <DataTableView
              head={["Concern", "Reports", "Change"]}
              rows={CAMPUS_CONCERNS.map((c) => [
                c.concern,
                c.count,
                `${c.deltaPct > 0 ? "+" : ""}${c.deltaPct}%`,
              ])}
            />
          </Disclosure>
        </div>
      </Card>

      {/* ------------------------------------------------------ trends */}
      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="p-4 sm:p-5">
          <SectionTitle title="Academic stress over time" />
          <TrendLine
            points={CONCERN_TREND}
            label="Students reporting academic stress, by week"
          />
          <div className="mt-3">
            <Disclosure summary="Show as a table">
              <DataTableView
                head={["Week", "Students"]}
                rows={CONCERN_TREND.map((p) => [p.week, p.value])}
              />
            </Disclosure>
          </div>
        </Card>

        <Card className="p-4 sm:p-5">
          <SectionTitle title="Campus mood distribution" subtitle="Share of all check-ins." />
          <MoodDistribution rows={MOOD_DISTRIBUTION} />
          <div className="mt-4">
            <Disclosure summary="Show as a table">
              <DataTableView
                head={["Mood", "Share"]}
                rows={MOOD_DISTRIBUTION.map((m) => [m.label, `${m.share}%`])}
              />
            </Disclosure>
          </div>
        </Card>
      </div>

      {/* ----------------------------------------------- support demand */}
      <Card className="p-4 sm:p-5">
        <SectionTitle
          title="Support demand and capacity"
          subtitle="Two separate measures, two separate charts — never stacked on one axis."
        />
        <div className="grid gap-5 xl:grid-cols-2">
          <TrendLine
            points={SUPPORT_DEMAND.map((w) => ({ week: w.week, value: w.requests }))}
            label="Support requests received, by week"
            color="#2b5178"
          />
          <TrendLine
            points={SUPPORT_DEMAND.map((w) => ({ week: w.week, value: w.sessions }))}
            label="Counselling sessions delivered, by week"
            color="#0b8f55"
          />
        </div>
        <div className="mt-4">
          <Disclosure summary="Show as a table">
            <DataTableView
              head={["Week", "Requests", "Sessions", "Gap"]}
              rows={SUPPORT_DEMAND.map((w) => [
                w.week,
                w.requests,
                w.sessions,
                w.requests - w.sessions,
              ])}
            />
          </Disclosure>
        </div>
        <p className="muted mt-3 text-xs">
          The gap between the two is the operational point of this screen: it tells the
          institution where to add counselling hours, not which students to look at.
        </p>
      </Card>

      {/* --------------------------------------------- group breakdown */}
      <Card className="p-4 sm:p-5">
        <SectionTitle
          title="Group breakdown"
          subtitle="The privacy-by-design safeguard: small groups are suppressed, not shown."
        />

        <div className="mb-4 rounded-xl border-2 border-dashed border-navy-300 bg-navy-50/60 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone="navy">Demonstration control</Badge>
            <label
              htmlFor="threshold"
              className="text-sm font-medium text-navy-800"
            >
              Minimum group size
            </label>
            <input
              id="threshold"
              type="range"
              min={2}
              max={10}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="h-2 flex-1 min-w-40 accent-navy-700"
            />
            <span className="w-8 text-center text-sm font-semibold text-navy-900 tabular-nums">
              {threshold}
            </span>
          </div>
          <p className="muted mt-2 text-xs">
            Drag it up and watch rows drop out. In production this is a fixed policy value,
            not a slider — it is exposed here so the safeguard is visible rather than
            claimed.
          </p>
        </div>

        <DataTable
          columns={columns}
          rows={result.visible}
          rowKey={(r) => r.group}
          caption="Department groups above the aggregation threshold"
          empty={
            <Callout tone="amber" icon="🛡️" title="Everything suppressed">
              At this threshold no group is large enough to display. That is the safeguard
              behaving correctly.
            </Callout>
          }
        />

        {hidden.length ? (
          <div className="mt-4">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="font-medium text-amber-900">
                <span aria-hidden>🛡️</span> {pluralize(result.suppressedCount, "group")}{" "}
                suppressed, covering {pluralize(result.suppressedStudents, "student")}
              </p>
              <p className="mt-1 text-sm text-amber-900/80">{AGGREGATION_NOTE}</p>
            </div>

            <div className="mt-3 overflow-hidden rounded-xl border border-navy-100">
              {hidden.map((r) => (
                <div
                  key={r.group}
                  className="flex items-center gap-3 border-b border-navy-50 bg-navy-50/70 px-4 py-3 last:border-0"
                >
                  <span className="text-navy-400" aria-hidden>
                    🔒
                  </span>
                  <span className="text-sm font-medium text-navy-400 italic">
                    Suppressed — group below threshold
                  </span>
                  <span className="muted ml-auto text-xs">values withheld</span>
                </div>
              ))}
            </div>
            <p className="muted mt-2 text-xs">
              The suppressed rows deliberately show no group name and no counts. Naming them
              while withholding the numbers would still narrow the field.
            </p>
          </div>
        ) : null}
      </Card>

      {/* ----------------------------------------------- what it cannot do */}
      <Card className="border-pro-200 bg-pro-50/50 p-4 sm:p-5">
        <SectionTitle title="What this screen deliberately cannot do" />
        <ul className="space-y-2">
          {CANNOT_DO.map((c) => (
            <li key={c} className="flex gap-2.5 text-sm text-navy-800">
              <span className="text-urgent-600" aria-hidden>
                ✕
              </span>
              {c}
            </li>
          ))}
        </ul>
        <p className="muted mt-3 text-sm">
          These are not missing features. An analytics screen that could do any of them
          would make MindEase a monitoring tool, which is the thing the product exists to
          not be.
        </p>
      </Card>
    </div>
  );
}
