"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ConcernBars } from "@/components/charts";
import { HumanReviewBanner, SupportLevelBadge, TrendBadge } from "@/components/support";
import {
  Badge,
  Callout,
  Card,
  DataTable,
  EmptyState,
  LinkButton,
  SectionTitle,
  SkeletonCard,
  Stat,
  type Column,
} from "@/components/ui";
import { AGGREGATION_NOTE, CAMPUS_CONCERNS } from "@/lib/analytics";
import { formatDayShort, formatTime, isoDay, pluralize, relativeTime } from "@/lib/format";
import { useStore } from "@/lib/store";
import { LEVEL_RANK } from "@/lib/support-indicator";
import type { Alert, Appointment, CaseStatus } from "@/lib/types";

/* --------------------------------------------------------------- helpers */

function greetingFor(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function longDate(d: Date): string {
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

const OPEN_ALERT_STATUSES: Alert["status"][] = ["new", "under_review"];
const ACTIVE_CASE_STATUSES: CaseStatus[] = ["active", "scheduled", "awaiting_student"];

/** Highest support level first, then the most recent signal first. */
function byPriority(a: Alert, b: Alert): number {
  const rank = LEVEL_RANK[b.level] - LEVEL_RANK[a.level];
  if (rank !== 0) return rank;
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

type CountTone = "amber" | "pro" | "info" | "mint";

const COUNT_TONES: Record<CountTone, string> = {
  amber: "border-amber-200 bg-amber-50 text-amber-900",
  pro: "border-pro-200 bg-pro-50 text-pro-900",
  info: "border-info-200 bg-info-50 text-info-900",
  mint: "border-mint-200 bg-mint-50 text-mint-900",
};

function ModerationCount({
  label,
  count,
  tone,
}: {
  label: string;
  count: number;
  tone: CountTone;
}) {
  return (
    <div className={`rounded-xl border px-3.5 py-3 ${COUNT_TONES[tone]}`}>
      <p className="text-2xl font-semibold tabular-nums">{count}</p>
      <p className="mt-0.5 text-xs font-medium">{label}</p>
    </div>
  );
}

function AppointmentRow({
  appointment,
  today,
}: {
  appointment: Appointment;
  today: string;
}) {
  const when = new Date(appointment.at);
  const isToday = isoDay(when) === today;
  return (
    <li className="flex items-start gap-3 rounded-xl border border-navy-100 bg-white p-3">
      <div className="w-16 shrink-0">
        <p className="text-sm font-semibold text-navy-900 tabular-nums">
          {formatTime(appointment.at)}
        </p>
        <p className="muted text-xs">{isToday ? "Today" : formatDayShort(isoDay(when))}</p>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-navy-900">{appointment.concern}</p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <Badge tone="pro">{appointment.mode}</Badge>
          {appointment.identityVisible ? (
            <Badge tone="neutral">Case #{appointment.caseId}</Badge>
          ) : (
            <Badge tone="info" icon={<span aria-hidden>🕶️</span>}>
              Anonymous until consent
            </Badge>
          )}
        </div>
      </div>
    </li>
  );
}

/* ------------------------------------------------------------------ page */

export default function CounsellorDashboardPage() {
  const { ready, state } = useStore();
  const router = useRouter();

  if (!ready) {
    return (
      <div className="space-y-4">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  const now = new Date();
  const today = isoDay(now);

  /* ------------------------------------------------------ today's numbers */

  const openAlerts = state.alerts.filter((a) => OPEN_ALERT_STATUSES.includes(a.status));
  const newAlerts = state.alerts.filter((a) => a.status === "new");
  const activeCases = state.cases.filter((c) => ACTIVE_CASE_STATUSES.includes(c.status));
  const requestedCases = state.cases.filter((c) => c.status === "requested");
  const openModeration = state.moderation.filter((m) => m.status !== "resolved");
  const appointmentsToday = state.appointments.filter(
    (ap) => ap.status !== "cancelled" && isoDay(new Date(ap.at)) === today,
  );

  const tiles: {
    key: string;
    label: string;
    value: number;
    hint: string;
    tone: "pro" | "amber" | "teal" | "info" | "mint";
    href: string;
  }[] = [
    {
      key: "active",
      label: "Active support",
      value: activeCases.length,
      hint: "Cases you are working with",
      tone: "pro",
      href: "/counsellor/cases",
    },
    {
      key: "alerts",
      label: "New alerts",
      value: newAlerts.length,
      hint: "Awaiting a first human look",
      tone: "amber",
      href: "/counsellor/alerts",
    },
    {
      key: "seeking",
      label: "Students seeking help",
      value: requestedCases.length,
      hint: "Requests students opened themselves",
      tone: "teal",
      href: "/counsellor/cases",
    },
    {
      key: "moderation",
      label: "Moderation queue",
      value: openModeration.length,
      hint: "Items needing a decision",
      tone: "info",
      href: "/counsellor/moderation",
    },
    {
      key: "appointments",
      label: "Appointments today",
      value: appointmentsToday.length,
      hint: appointmentsToday.length ? "In the calendar today" : "Nothing booked today",
      tone: "mint",
      href: "/counsellor/appointments",
    },
  ];

  /* ------------------------------------------------------- priority queue */

  const priority = [...openAlerts].sort(byPriority).slice(0, 5);

  const alertColumns: Column<Alert>[] = [
    {
      key: "id",
      header: "ID",
      className: "w-44",
      render: (row: Alert) => (
        <span className="flex flex-wrap items-center gap-1.5">
          <Link
            href={`/counsellor/alerts/${row.id}`}
            className="font-semibold text-navy-900 underline-offset-2 hover:underline"
          >
            #{row.caseId}
          </Link>
          {row.isDemoStudent ? <Badge tone="teal">Live demo</Badge> : null}
        </span>
      ),
    },
    {
      key: "level",
      header: "Level",
      className: "w-32",
      render: (row: Alert) => <SupportLevelBadge level={row.level} />,
    },
    {
      key: "trend",
      header: "Trend",
      className: "w-48",
      render: (row: Alert) => <TrendBadge trend={row.trend} />,
    },
    {
      key: "action",
      header: "Recommended action",
      render: (row: Alert) => (
        <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-navy-800">{row.recommendedAction}</span>
          <span className="muted text-xs">
            {row.status === "under_review" ? "under review · " : ""}
            flagged {relativeTime(row.createdAt)}
          </span>
        </span>
      ),
    },
  ];

  /* ---------------------------------------------------------- appointments */

  const upcoming = state.appointments
    .filter((ap) => ap.status === "upcoming")
    .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())
    .slice(0, 4);

  /* ------------------------------------------------------------ moderation */

  const modNewReports = state.moderation.filter(
    (m) => m.status === "new" && m.source === "user_report",
  ).length;
  const modAiFlagged = state.moderation.filter(
    (m) => m.status === "new" && m.source === "ai_flag",
  ).length;
  const modUnderReview = state.moderation.filter((m) => m.status === "under_review").length;
  const modResolved = state.moderation.filter((m) => m.status === "resolved").length;

  /* ------------------------------------------------------------------ view */

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold tracking-tight text-navy-900">
          {greetingFor(now.getHours())}, Counsellor
        </h2>
        <p className="muted mt-1 text-sm">
          {longDate(now)} · {pluralize(openAlerts.length, "open alert")} ·{" "}
          {pluralize(requestedCases.length, "new request")}
        </p>
      </header>

      <HumanReviewBanner />

      {/* ---------------------------------------------------- today's tiles */}
      <section aria-labelledby="overview-heading">
        <h3 id="overview-heading" className="sr-only">
          Today&rsquo;s overview
        </h3>
        <div
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
          aria-live="polite"
        >
          {tiles.map((t) => (
            <Link
              key={t.key}
              href={t.href}
              className="block rounded-2xl transition-shadow hover:shadow-raised"
            >
              <Stat label={t.label} value={t.value} hint={t.hint} tone={t.tone} />
            </Link>
          ))}
        </div>
      </section>

      {/* -------------------------------------------- queue + appointments */}
      <div className="grid gap-5 lg:grid-cols-3">
        <section aria-labelledby="queue-heading" className="lg:col-span-2">
          <SectionTitle
            title={<span id="queue-heading">Priority queue</span>}
            subtitle="Ordered by support level, then by how recently the signal appeared."
            action={
              <LinkButton href="/counsellor/alerts" size="sm">
                All alerts
              </LinkButton>
            }
          />
          <DataTable
            columns={alertColumns}
            rows={priority}
            rowKey={(row: Alert) => row.id}
            onRowClick={(row: Alert) => router.push(`/counsellor/alerts/${row.id}`)}
            caption="Anonymised support alerts awaiting review, highest level first"
            empty={
              <EmptyState
                icon="🌤️"
                title="No support alerts requiring review."
                body="Nothing is waiting on you right now. New model-detected signals appear here for a human to review."
                action={
                  <LinkButton href="/counsellor/alerts" size="sm">
                    Open the alert history
                  </LinkButton>
                }
              />
            }
          />
          <p className="muted mt-2 text-xs">
            <span aria-hidden>🕶️ </span>
            This view shows anonymous case IDs only. A student&rsquo;s identity never
            appears in the queue — it becomes available on a case only after they
            explicitly opt in.
          </p>
        </section>

        <section aria-labelledby="appts-heading">
          <SectionTitle
            title={<span id="appts-heading">Today&rsquo;s appointments</span>}
            subtitle={
              appointmentsToday.length
                ? `${pluralize(appointmentsToday.length, "session")} in the calendar today`
                : "Nothing today — here is what is coming up next."
            }
          />
          {upcoming.length ? (
            <Card className="p-3 sm:p-3">
              <ul className="space-y-2">
                {upcoming.map((ap) => (
                  <AppointmentRow key={ap.id} appointment={ap} today={today} />
                ))}
              </ul>
              <div className="mt-3">
                <LinkButton href="/counsellor/appointments" size="sm" full>
                  Open the calendar
                </LinkButton>
              </div>
            </Card>
          ) : (
            <EmptyState
              icon="📅"
              title="No appointments scheduled."
              body="When a student accepts an offer of support, the session will show up here."
              action={
                <LinkButton href="/counsellor/appointments" size="sm">
                  Open the calendar
                </LinkButton>
              }
            />
          )}
        </section>
      </div>

      {/* ----------------------------------------- decisions + campus trend */}
      <div className="grid gap-5 lg:grid-cols-3">
        <section aria-labelledby="decision-heading">
          <SectionTitle
            title={<span id="decision-heading">Needs a decision</span>}
            subtitle="Community safety items waiting on a human."
          />
          <Card>
            <div className="grid grid-cols-2 gap-2.5">
              <ModerationCount label="New reports" count={modNewReports} tone="amber" />
              <ModerationCount label="AI flagged" count={modAiFlagged} tone="pro" />
              <ModerationCount label="Under review" count={modUnderReview} tone="info" />
              <ModerationCount label="Resolved" count={modResolved} tone="mint" />
            </div>
            <p className="muted mt-3 text-xs">
              {openModeration.length
                ? `${pluralize(openModeration.length, "item")} still open. Every decision is recorded in the audit trail.`
                : "The queue is clear — nothing is waiting on a moderation decision."}
            </p>
            <div className="mt-3">
              <LinkButton href="/counsellor/moderation" tone="pro" size="sm" full>
                Open the moderation queue
              </LinkButton>
            </div>
          </Card>
        </section>

        <section aria-labelledby="trends-heading" className="lg:col-span-2">
          <SectionTitle
            title={<span id="trends-heading">Campus trends</span>}
            subtitle="Most reported concerns across the campus, aggregated."
            action={
              <LinkButton href="/counsellor/analytics" size="sm">
                Full analytics
              </LinkButton>
            }
          />
          <Card>
            <ConcernBars rows={CAMPUS_CONCERNS.slice(0, 5)} />
            <Callout tone="info" icon="📊" className="mt-4">
              {AGGREGATION_NOTE}
            </Callout>
          </Card>
        </section>
      </div>

      <p className="muted text-xs">
        MindEase gives you decision support, not surveillance. The model prioritises what
        to look at; the review, the decision and the contact are always yours.
      </p>
    </div>
  );
}
