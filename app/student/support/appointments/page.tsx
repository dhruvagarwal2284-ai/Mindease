"use client";

import Link from "next/link";
import { Badge, Callout, EmptyState, LinkButton, SkeletonCard } from "@/components/ui";
import { formatDay, formatTime, isoDay } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Appointment } from "@/lib/types";

function AppointmentCard({ appt, past }: { appt: Appointment; past?: boolean }) {
  const when = new Date(appt.at);
  return (
    <article
      className={
        past
          ? "rounded-2xl border border-navy-100 bg-navy-50/50 p-4"
          : "rounded-2xl border border-teal-200 bg-white p-4"
      }
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-navy-900">
            {formatDay(isoDay(when))} · {formatTime(appt.at)}
          </p>
          <p className="muted mt-0.5 text-sm">
            {appt.mode} · {appt.concern}
          </p>
        </div>
        <Badge
          tone={
            appt.status === "upcoming" ? "teal" : appt.status === "completed" ? "mint" : "neutral"
          }
        >
          {appt.status === "upcoming"
            ? "Upcoming"
            : appt.status === "completed"
              ? "Completed"
              : "Cancelled"}
        </Badge>
      </div>

      <p className="muted mt-3 text-xs">
        <span aria-hidden>🔒</span>{" "}
        {appt.identityVisible
          ? "Your counsellor can see your pseudonym for this appointment, because you attached it."
          : "Your counsellor sees an anonymous case id for this appointment, not your pseudonym."}
      </p>
    </article>
  );
}

export default function StudentAppointmentsPage() {
  const { ready, state } = useStore();

  if (!ready) return <SkeletonCard />;

  const myCaseIds = new Set(
    state.cases.filter((c) => c.isDemoStudent).map((c) => c.caseId),
  );
  const mine = state.appointments.filter((a) => myCaseIds.has(a.caseId));
  const now = Date.now();
  const upcoming = mine
    .filter((a) => a.status === "upcoming" && new Date(a.at).getTime() >= now)
    .sort((a, b) => (a.at < b.at ? -1 : 1));
  const past = mine
    .filter((a) => !(a.status === "upcoming" && new Date(a.at).getTime() >= now))
    .sort((a, b) => (a.at < b.at ? 1 : -1));

  return (
    <div className="space-y-5">
      <Link href="/student/support" className="muted inline-block text-sm hover:underline">
        ← Support
      </Link>

      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-navy-900">
          Your appointments
        </h1>
        <p className="muted mt-1 text-sm">
          Times you agreed to. Missing one is not held against you — you can rebook.
        </p>
      </header>

      {mine.length === 0 ? (
        <EmptyState
          icon="📅"
          title="No appointments yet"
          body="When a counsellor offers a time and you accept, it will show up here with a reminder."
          action={
            <LinkButton href="/student/support/request" tone="primary">
              Talk to someone
            </LinkButton>
          }
        />
      ) : (
        <>
          <section aria-labelledby="upcoming" className="space-y-2.5">
            <h2
              id="upcoming"
              className="text-xs font-semibold tracking-wide text-navy-500 uppercase"
            >
              Upcoming
            </h2>
            {upcoming.length === 0 ? (
              <p className="muted rounded-xl border border-navy-100 bg-white px-4 py-4 text-sm">
                Nothing booked at the moment.
              </p>
            ) : (
              upcoming.map((a) => <AppointmentCard key={a.id} appt={a} />)
            )}
          </section>

          {past.length > 0 ? (
            <section aria-labelledby="past" className="space-y-2.5">
              <h2
                id="past"
                className="text-xs font-semibold tracking-wide text-navy-500 uppercase"
              >
                Previous
              </h2>
              {past.map((a) => (
                <AppointmentCard key={a.id} appt={a} past />
              ))}
            </section>
          ) : null}
        </>
      )}

      <Callout tone="info" icon="🔔" title="About reminders">
        Appointment reminders never say what the appointment is about. The notification
        reads &ldquo;You have a new MindEase update&rdquo; so nothing sensitive appears on
        a lock screen someone else might see.
      </Callout>
    </div>
  );
}
