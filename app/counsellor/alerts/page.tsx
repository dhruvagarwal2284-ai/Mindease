"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { PrivacyBadge } from "@/components/privacy";
import { HumanReviewBanner, SupportLevelBadge, TrendBadge } from "@/components/support";
import {
  Badge,
  Callout,
  type Column,
  DataTable,
  EmptyState,
  SectionTitle,
  SkeletonCard,
  Tabs,
} from "@/components/ui";
import { pluralize, relativeTime } from "@/lib/format";
import { useStore } from "@/lib/store";
import { LEVEL_RANK } from "@/lib/support-indicator";
import type { Alert, AlertStatus } from "@/lib/types";

const TAB_COPY: Record<
  AlertStatus,
  { label: string; emptyTitle: string; emptyBody: string; icon: string }
> = {
  new: {
    label: "New",
    emptyTitle: "No support alerts requiring review.",
    emptyBody:
      "Nothing is waiting on you right now. New alerts appear here the moment the model notices a sustained pattern in a student's own check-ins.",
    icon: "🌤️",
  },
  under_review: {
    label: "Under review",
    emptyTitle: "No support alerts requiring review.",
    emptyBody:
      "You have not picked anything up for review. Opening an alert and choosing Review moves it here so colleagues can see it is being looked at.",
    icon: "👀",
  },
  resolved: {
    label: "Resolved",
    emptyTitle: "No support alerts requiring review.",
    emptyBody:
      "Alerts you have marked reviewed — with the note you recorded — are kept here as the audit trail of human decisions.",
    icon: "✅",
  },
  false_positive: {
    label: "False positives",
    emptyTitle: "No support alerts requiring review.",
    emptyBody:
      "When a signal does not reflect what is actually happening for a student, marking it a false positive records that here and feeds back into model tuning.",
    icon: "🧪",
  },
};

const TAB_ORDER: AlertStatus[] = ["new", "under_review", "resolved", "false_positive"];

export default function AlertQueuePage() {
  const { ready, state } = useStore();
  const router = useRouter();
  const [tab, setTab] = useState<AlertStatus>("new");

  const byTab = useMemo(() => {
    const sorted = [...state.alerts].sort((a, b) => {
      const rank = LEVEL_RANK[b.level] - LEVEL_RANK[a.level];
      if (rank !== 0) return rank;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    const groups: Record<AlertStatus, Alert[]> = {
      new: [],
      under_review: [],
      resolved: [],
      false_positive: [],
    };
    for (const alert of sorted) groups[alert.status].push(alert);
    return groups;
  }, [state.alerts]);

  const rows = byTab[tab];
  const hasLive = state.alerts.some((a) => a.isDemoStudent);

  const open = (alert: Alert) => router.push(`/counsellor/alerts/${alert.id}`);

  const columns: Column<Alert>[] = [
    {
      key: "id",
      header: "ID",
      className: "w-44",
      render: (a) => (
        <div className="flex flex-wrap items-center gap-1.5">
          <Link
            href={`/counsellor/alerts/${a.id}`}
            onClick={(e) => e.stopPropagation()}
            className="font-mono text-sm font-semibold text-navy-900 underline decoration-navy-200 underline-offset-4 hover:decoration-teal-600"
          >
            #{a.caseId}
          </Link>
          {a.isDemoStudent ? (
            <Badge
              tone="teal"
              icon={
                <span
                  aria-hidden
                  className="inline-block h-1.5 w-1.5 rounded-full bg-teal-600"
                />
              }
            >
              live
            </Badge>
          ) : null}
        </div>
      ),
    },
    {
      key: "level",
      header: "Level",
      className: "w-32",
      render: (a) => <SupportLevelBadge level={a.level} />,
    },
    {
      key: "trend",
      header: "Trend",
      className: "w-48",
      render: (a) => <TrendBadge trend={a.trend} />,
    },
    {
      key: "signals",
      header: "Signals",
      render: (a) => (
        <div className="min-w-0">
          <p className="font-medium text-navy-900">
            {pluralize(a.signals.length, "signal")}
          </p>
          <p className="muted truncate text-xs">
            {a.signals[0]?.label ?? "No individual signal recorded"}
          </p>
        </div>
      ),
    },
    {
      key: "detected",
      header: "Detected",
      className: "w-32",
      render: (a) => (
        <span className="text-navy-700 whitespace-nowrap">
          {relativeTime(a.createdAt)}
        </span>
      ),
    },
    {
      key: "action",
      header: "Recommended action",
      className: "w-52",
      render: (a) => (
        <div className="flex items-center gap-2">
          <span className="text-navy-800">{a.recommendedAction}</span>
          <span aria-hidden className="muted text-xs">
            →
          </span>
        </div>
      ),
    },
  ];

  if (!ready) {
    return (
      <div className="space-y-3">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <HumanReviewBanner />

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-navy-900">
            Anonymized support alerts
          </h1>
          <p className="muted mt-1 max-w-2xl text-sm">
            A prioritised queue of patterns worth a human look — ordered by level, then by
            how recently they were detected. Nothing here has been actioned by the model.
          </p>
        </div>
        <PrivacyBadge status="identity-withheld" />
      </header>

      <Callout tone="info" icon="🕶️" title="This queue never shows you who a student is">
        <p>
          Each row is an <strong>anonymous case identifier</strong> derived on the
          student&rsquo;s own device. There is no name, no roll number, no email and no
          department attached to it. The identifier stays anonymous until the student
          explicitly opts into direct support and the institutional workflow authorises
          identity linkage — at which point the linkage appears on the case, not here.
        </p>
        <p className="mt-2">
          You can review, decide and offer support against the case identifier alone. If
          you never need to know who the student is, you never will.
        </p>
      </Callout>

      <div className="space-y-3">
        <Tabs
          tone="pro"
          value={tab}
          onChange={setTab}
          tabs={TAB_ORDER.map((value) => ({
            value,
            label: TAB_COPY[value].label,
            count: byTab[value].length,
          }))}
        />

        <p className="muted text-sm" aria-live="polite">
          {rows.length
            ? `Showing ${pluralize(rows.length, "alert")} in “${TAB_COPY[tab].label}”, highest level first.`
            : `No alerts in “${TAB_COPY[tab].label}”.`}
        </p>

        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(a) => a.id}
          onRowClick={open}
          caption={`Support alerts — ${TAB_COPY[tab].label}. Each row opens the explainable alert detail.`}
          empty={
            <EmptyState
              icon={TAB_COPY[tab].icon}
              title={TAB_COPY[tab].emptyTitle}
              body={TAB_COPY[tab].emptyBody}
            />
          }
        />
      </div>

      {hasLive ? (
        <Callout tone="pro" icon="🔴" title="About the “live” marker">
          An alert marked <strong>live</strong> is being generated right now from the
          student session running in this same browser. It is honest about what it is: a
          demonstration loop, so you can add a check-in on the student side and watch the
          signals, level and trend change here. It is not a real person, and no other
          student&rsquo;s alert behaves this way.
        </Callout>
      ) : null}

      <section aria-labelledby="queue-notes">
        <SectionTitle
          title={<span id="queue-notes">How to read this queue</span>}
          subtitle="Levels describe how much support to consider offering — never how unwell someone is."
        />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {(
            [
              {
                level: "critical" as const,
                body: "Immediate review according to your institution's safety protocol.",
              },
              {
                level: "high" as const,
                body: "An elevated support indicator across several weeks. Worth a decision today.",
              },
              {
                level: "moderate" as const,
                body: "Monitor, or offer resources the student can take or ignore freely.",
              },
              {
                level: "informational" as const,
                body: "Context only. Often ordinary emotional variation around an exam period.",
              },
            ] as const
          ).map((item) => (
            <div
              key={item.level}
              className="rounded-xl border border-navy-100 bg-white p-4"
            >
              <SupportLevelBadge level={item.level} />
              <p className="muted mt-2 text-sm">{item.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
