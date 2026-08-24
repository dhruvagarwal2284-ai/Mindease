"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Badge,
  Callout,
  Card,
  DataTable,
  EmptyState,
  LinkButton,
  SectionTitle,
  SkeletonCard,
  Toggle,
  Timeline,
} from "@/components/ui";
import type { Column } from "@/components/ui";
import { formatDateTime } from "@/lib/format";
import { safePreview } from "@/lib/privacy";
import { useStore } from "@/lib/store";

/* ------------------------------------------------------------- profile */

const PROFILE = {
  name: "Dr. A. Rao",
  role: "Counsellor",
  team: "Campus counselling",
  staffRef: "CC-0142",
  hours: "Mon–Fri, 09:30–17:00",
  cover: "Out-of-hours flags route to the institutional safeguarding rota.",
};

/* -------------------------------------------------------- notifications */

interface NotificationType {
  key: string;
  label: string;
  why: string;
  defaultOn: boolean;
}

const NOTIFICATION_TYPES: NotificationType[] = [
  {
    key: "support_alert",
    label: "New support alert",
    why: "An anonymised alert enters the queue with an elevated support indicator.",
    defaultOn: true,
  },
  {
    key: "student_request",
    label: "New student request",
    why: "A student has asked to talk to someone and chosen what to share.",
    defaultOn: true,
  },
  {
    key: "appointment",
    label: "Appointment reminder",
    why: "A session you are hosting is starting soon, or was rescheduled.",
    defaultOn: true,
  },
  {
    key: "follow_up",
    label: "Follow-up due",
    why: "A follow-up date you recorded on a case has arrived.",
    defaultOn: true,
  },
  {
    key: "moderation",
    label: "Moderation queue item",
    why: "A post or reply is waiting for a human decision in Community safety.",
    defaultOn: false,
  },
];

/* --------------------------------------------------- capability matrix  */

interface CapabilityRow {
  key: string;
  item: string;
  allowed: boolean;
  why: string;
}

const CAPABILITIES: CapabilityRow[] = [
  {
    key: "alerts",
    item: "Anonymised support alerts",
    allowed: true,
    why: "Case IDs, support indicators and the evidence behind them — no identity attached.",
  },
  {
    key: "case_data",
    item: "Consented case data",
    allowed: true,
    why: "Only the items a student explicitly ticked on their consent screen travel into a case.",
  },
  {
    key: "analytics",
    item: "Aggregate campus analytics",
    allowed: true,
    why: "Counts and trends above the aggregation threshold, so no group is small enough to identify.",
  },
  {
    key: "moderation",
    item: "Moderation queue and audit trail",
    allowed: true,
    why: "Flagged excerpts plus the reason and every decision recorded against them.",
  },
  {
    key: "own_notes",
    item: "Your own private case notes",
    allowed: true,
    why: "Professional notes you authored, on cases assigned to you.",
  },
  {
    key: "identity",
    item: "Student identity without consent",
    allowed: false,
    why: "Identity linkage happens only when the student opts in. Until then a case is a pseudonymous ID.",
  },
  {
    key: "journal",
    item: "Private journal entries",
    allowed: false,
    why: "The journal is private to the student. Individual entries appear only if that student shares them.",
  },
  {
    key: "checkins",
    item: "Raw check-in text of unconsented students",
    allowed: false,
    why: "Free-text check-ins feed the student's own history and the support indicator, not this workspace.",
  },
  {
    key: "other_notes",
    item: "Private notes written by other staff",
    allowed: false,
    why: "Notes belong to their author and the case they were written on.",
  },
  {
    key: "deanon",
    item: "De-anonymised analytics",
    allowed: false,
    why: "There is no drill-down from an aggregate to a student. Suppressed groups stay suppressed.",
  },
];

/* ------------------------------------------------------------------ page */

export default function CounsellorSettingsPage() {
  const { ready, state } = useStore();
  const [notifications, setNotifications] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(NOTIFICATION_TYPES.map((n) => [n.key, n.defaultOn])),
  );

  const recentAudit = useMemo(
    () =>
      [...state.audit]
        .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
        .slice(0, 6),
    [state.audit],
  );

  if (!ready) {
    return (
      <div className="space-y-3">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  const capabilityColumns: Column<CapabilityRow>[] = [
    {
      key: "item",
      header: "Data or surface",
      className: "font-medium text-navy-900",
      render: (row: CapabilityRow) => row.item,
    },
    {
      key: "allowed",
      header: "This role",
      className: "w-40",
      render: (row: CapabilityRow) =>
        row.allowed ? (
          <Badge tone="mint" icon={<span aria-hidden>✓</span>}>
            Can see
          </Badge>
        ) : (
          <Badge tone="navy" icon={<span aria-hidden>✕</span>}>
            Cannot see
          </Badge>
        ),
    },
    {
      key: "why",
      header: "Why",
      className: "text-navy-700",
      render: (row: CapabilityRow) => row.why,
    },
  ];

  const enabledCount = NOTIFICATION_TYPES.filter((n) => notifications[n.key]).length;

  return (
    <div className="max-w-5xl space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-navy-900">Settings</h1>
        <p className="muted mt-1 max-w-3xl text-sm">
          Your profile, what reaches you as a notification, and the exact boundary of what
          this role can and cannot see.
        </p>
      </header>

      {/* --------------------------------------------------------- profile */}

      <section aria-labelledby="profile-heading">
        <SectionTitle
          title={<span id="profile-heading">Profile</span>}
          subtitle="Read-only in this prototype."
        />
        <Card>
          <div className="flex flex-wrap items-start gap-4">
            <span
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-pro-100 text-lg font-semibold text-pro-800"
              aria-hidden
            >
              AR
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-semibold text-navy-900">{PROFILE.name}</p>
              <p className="muted text-sm">
                {PROFILE.role} · {PROFILE.team}
              </p>
              <dl className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                <div>
                  <dt className="muted text-xs font-medium tracking-wide uppercase">
                    Staff reference
                  </dt>
                  <dd className="text-sm text-navy-900">{PROFILE.staffRef}</dd>
                </div>
                <div>
                  <dt className="muted text-xs font-medium tracking-wide uppercase">
                    Role
                  </dt>
                  <dd className="text-sm text-navy-900">
                    <Badge tone="pro">Counsellor</Badge>
                  </dd>
                </div>
                <div>
                  <dt className="muted text-xs font-medium tracking-wide uppercase">
                    Working hours
                  </dt>
                  <dd className="text-sm text-navy-900">{PROFILE.hours}</dd>
                </div>
                <div>
                  <dt className="muted text-xs font-medium tracking-wide uppercase">
                    Out of hours
                  </dt>
                  <dd className="text-sm text-navy-900">{PROFILE.cover}</dd>
                </div>
              </dl>
            </div>
          </div>

          <Callout
            tone="info"
            className="mt-4"
            icon={<span aria-hidden>🏛️</span>}
            title="This profile is illustrative."
          >
            In a deployment the name, role and permissions come from the institutional
            directory over SSO. Staff cannot grant themselves a role from inside MindEase,
            and this screen would not offer an edit control.
          </Callout>
        </Card>
      </section>

      {/* --------------------------------------------------- notifications */}

      <section aria-labelledby="notifications-heading">
        <SectionTitle
          title={<span id="notifications-heading">Notifications</span>}
          subtitle={`${enabledCount} of ${NOTIFICATION_TYPES.length} notification types enabled.`}
        />
        <Card className="space-y-3">
          <ul className="space-y-3">
            {NOTIFICATION_TYPES.map((n) => {
              const on = notifications[n.key];
              return (
                <li
                  key={n.key}
                  className="flex items-start justify-between gap-4 rounded-xl border border-navy-100 bg-white p-4"
                >
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 font-medium text-navy-900">
                      {n.label}
                      <Badge tone={on ? "mint" : "neutral"}>{on ? "ON" : "OFF"}</Badge>
                    </p>
                    <p className="muted mt-1 text-sm">{n.why}</p>
                  </div>
                  <Toggle
                    checked={on}
                    label={n.label}
                    onChange={(next: boolean) =>
                      setNotifications((prev) => ({ ...prev, [n.key]: next }))
                    }
                  />
                </li>
              );
            })}
          </ul>

          <Callout
            tone="navy"
            icon={<span aria-hidden>🔔</span>}
            title="Previews never carry student content."
          >
            <p>
              Whatever is switched on, the notification that reaches a lock screen or an
              email subject line reads:
            </p>
            <p className="mt-2 rounded-lg border border-navy-200 bg-white px-3 py-2 font-medium text-navy-900">
              “{safePreview()}”
            </p>
            <p className="mt-2">
              The alert level, the case ID and anything a student wrote stay behind the
              session — visible only once you are signed in and looking at the case.
            </p>
          </Callout>

          <p className="muted text-xs">
            These switches are local to this prototype session and are not persisted. In a
            deployment they would be stored against your staff account.
          </p>
        </Card>
      </section>

      {/* ------------------------------------------- privacy & access ctrl */}

      <section aria-labelledby="access-heading">
        <SectionTitle
          title={<span id="access-heading">Privacy &amp; access control</span>}
          subtitle="What the counsellor role can reach, and what it cannot — read-only."
        />

        <div className="space-y-4">
          <DataTable<CapabilityRow>
            columns={capabilityColumns}
            rows={CAPABILITIES}
            rowKey={(row: CapabilityRow) => row.key}
            caption="Capability matrix for the counsellor role"
          />

          <Callout
            tone="amber"
            icon={<span aria-hidden>🛡️</span>}
            title="Hiding navigation is not a security control."
          >
            <p>
              This table is the frontend mirroring a boundary that is enforced elsewhere.
              The backend applies role-based authorization and consent checks on every
              request, so data this role is not entitled to is never sent to the browser —
              whatever the interface chooses to show or hide.
            </p>
            <p className="mt-2">
              A hidden menu item, a disabled button and an omitted table column are
              usability decisions. They are not the reason a student&rsquo;s journal is
              safe.
            </p>
          </Callout>

          <Callout tone="info" icon={<span aria-hidden>🤝</span>} title="Consent is the bridge.">
            Identity linkage and counselling data move only when a student opts in, and
            only for the items they ticked. Withdrawal is honoured the same way — the case
            returns to a pseudonymous ID.
          </Callout>
        </div>
      </section>

      {/* ------------------------------------------------------ audit logs */}

      <section aria-labelledby="audit-heading">
        <SectionTitle
          title={<span id="audit-heading">Audit logs</span>}
          subtitle="Every moderation and consent decision is recorded, with the actor and the reason."
          action={
            <LinkButton href="/counsellor/moderation#audit" tone="pro" size="sm">
              Open the full audit trail
            </LinkButton>
          }
        />
        <Card>
          {recentAudit.length === 0 ? (
            <EmptyState
              icon="🧾"
              title="No entries yet"
              body="Decisions you record — moderation outcomes, consent changes, case actions — will appear here."
            />
          ) : (
            <>
              <Timeline
                items={recentAudit.map((entry) => ({
                  id: entry.id,
                  at: formatDateTime(entry.at),
                  title: (
                    <span className="flex flex-wrap items-center gap-2">
                      {entry.action}
                      <Badge
                        tone={
                          entry.actor === "counsellor"
                            ? "pro"
                            : entry.actor === "student"
                              ? "teal"
                              : "neutral"
                        }
                      >
                        {entry.actor}
                      </Badge>
                    </span>
                  ),
                  body: entry.detail,
                }))}
              />
              <p className="muted mt-4 text-xs">
                Showing the {recentAudit.length} most recent of {state.audit.length}{" "}
                entries.{" "}
                <Link
                  href="/counsellor/moderation#audit"
                  className="font-medium text-teal-800 hover:underline"
                >
                  See the whole trail in Community safety →
                </Link>
              </p>
            </>
          )}
        </Card>
      </section>
    </div>
  );
}
