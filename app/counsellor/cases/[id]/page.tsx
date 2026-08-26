"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { WeeklyMoodBars } from "@/components/charts";
import { HumanReviewBanner } from "@/components/support";
import {
  Badge,
  Button,
  Callout,
  EmptyState,
  Field,
  Input,
  Modal,
  SectionTitle,
  Select,
  SkeletonCard,
  Textarea,
  Timeline,
} from "@/components/ui";
import { cx, formatDateTime, formatDay, formatTime, isoDay } from "@/lib/format";
import { SCOPE_COPY } from "@/lib/privacy";
import { RESOURCES, resourceById } from "@/lib/resources";
import { useStore } from "@/lib/store";
import { SUPPORT_MODES } from "@/lib/types";
import type { CaseStatus, SharedDataScope, SupportMode } from "@/lib/types";

const STATUS_TONE: Record<CaseStatus, "info" | "amber" | "mint" | "neutral" | "pro"> = {
  requested: "info",
  awaiting_student: "amber",
  active: "mint",
  scheduled: "pro",
  closed: "neutral",
};

const STATUS_LABEL: Record<CaseStatus, string> = {
  requested: "Pending request",
  awaiting_student: "Awaiting student response",
  active: "Active",
  scheduled: "Scheduled",
  closed: "Closed",
};

export default function CaseDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const {
    ready,
    state,
    indicator,
    addCaseNote,
    offerResource,
    requestVoluntaryContact,
    scheduleAppointment,
    recordFollowUp,
    setCaseStatus,
    toast,
  } = useStore();

  const [note, setNote] = useState("");
  const [showResource, setShowResource] = useState(false);
  const [resourcePick, setResourcePick] = useState(RESOURCES[0].id);
  const [showSchedule, setShowSchedule] = useState(false);
  const [apptDate, setApptDate] = useState(isoDay(new Date()));
  const [apptTime, setApptTime] = useState("16:30");
  const [apptMode, setApptMode] = useState<SupportMode>("In-person");
  const [followUp, setFollowUp] = useState("");
  const [showContact, setShowContact] = useState(false);
  const [showClose, setShowClose] = useState(false);

  if (!ready) return <SkeletonCard />;

  const kase = state.cases.find((c) => c.id === id);

  if (!kase) {
    return (
      <EmptyState
        icon="🗂️"
        title="No such case"
        body="It may have been closed and archived, or the link may be stale."
        action={
          <Link
            href="/counsellor/cases"
            className="inline-flex min-h-11 items-center rounded-xl bg-pro-700 px-4 font-medium text-white hover:bg-pro-800"
          >
            Back to cases
          </Link>
        }
      />
    );
  }

  const scopeKeys = Object.keys(SCOPE_COPY) as (keyof SharedDataScope)[];
  const consented = scopeKeys.filter((k) => kase.sharedScope[k]);
  const withheld = scopeKeys.filter((k) => !kase.sharedScope[k]);

  const appts = state.appointments
    .filter((a) => a.caseId === kase.caseId)
    .sort((a, b) => (a.at < b.at ? 1 : -1));
  const upcoming = appts.filter((a) => a.status === "upcoming");
  const previous = appts.filter((a) => a.status !== "upcoming");

  const sharedJournal = kase.isDemoStudent
    ? state.journal.filter((j) => j.sharedWithCounsellor)
    : [];
  const recentTags = kase.isDemoStudent
    ? [...new Set(state.checkIns.slice(-10).flatMap((c) => c.tags))]
    : [];

  /** Render the actual value behind a consented scope item. */
  const scopeValue = (k: keyof SharedDataScope) => {
    if (k === "concern") return <p className="text-sm text-navy-800">{kase.concern}</p>;
    if (k === "preferredMode") return <p className="text-sm text-navy-800">{kase.mode}</p>;
    if (k === "contactHandle")
      return (
        <p className="font-mono text-sm text-navy-800">
          {kase.studentHandle ?? "Not attached"}
        </p>
      );
    if (k === "moodTrend")
      return kase.isDemoStudent ? (
        <WeeklyMoodBars weeks={indicator.weeklyMood} compact />
      ) : (
        <p className="muted text-sm">Weekly averages shared by the student.</p>
      );
    if (k === "checkInTags")
      return recentTags.length ? (
        <div className="flex flex-wrap gap-1.5">
          {recentTags.map((t) => (
            <Badge key={t} tone="neutral">
              {t}
            </Badge>
          ))}
        </div>
      ) : (
        <p className="muted text-sm">Topic chips only — no free text.</p>
      );
    if (k === "journalEntries")
      return sharedJournal.length ? (
        <ul className="space-y-2">
          {sharedJournal.map((j) => (
            <li key={j.id} className="rounded-lg border border-amber-200 bg-amber-50/60 p-3">
              <p className="text-xs font-medium text-amber-900">
                {formatDay(isoDay(new Date(j.createdAt)))}
                {j.title ? ` · ${j.title}` : ""}
              </p>
              <p className="mt-1 text-sm whitespace-pre-wrap text-navy-800">{j.body}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted text-sm">
          The student consented to journal sharing but has not attached any entry yet.
        </p>
      );
    return null;
  };

  return (
    <div className="space-y-5">
      <Link href="/counsellor/cases" className="muted inline-block text-sm hover:underline">
        ← Cases
      </Link>

      <HumanReviewBanner />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        {/* ------------------------------------------------------- main */}
        <div className="space-y-5">
          <header className="card p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="font-mono text-2xl font-semibold tracking-tight text-navy-900">
                  Case #{kase.caseId}
                </h1>
                <p className="muted mt-1 text-sm">
                  {kase.concern} · {kase.mode}
                </p>
              </div>
              <Badge tone={STATUS_TONE[kase.status]}>{STATUS_LABEL[kase.status]}</Badge>
            </div>

            {kase.studentHandle ? (
              <Callout tone="amber" icon="🤝" title="Identity linked by consent" className="mt-4">
                The student attached{" "}
                <span className="font-mono font-medium">{kase.studentHandle}</span> so you can
                reply directly. This is still a pseudonym — no name, email or roll number was
                shared.
              </Callout>
            ) : (
              <Callout tone="info" icon="🕶️" title="Anonymous until consent" className="mt-4">
                You cannot see who this student is, and there is no control on this screen
                that would reveal it. Identity linkage happens only when the student
                explicitly opts in from their own device.
              </Callout>
            )}
          </header>

          <section className="card p-4 sm:p-5">
            <SectionTitle title="Overview" />
            <dl className="grid gap-3 sm:grid-cols-2">
              {[
                ["Student-selected concern", kase.concern],
                ["Preferred support mode", kase.mode],
                ["Current status", STATUS_LABEL[kase.status]],
                ["Requested", formatDateTime(kase.createdAt)],
                ["Last updated", formatDateTime(kase.updatedAt)],
                ["Next follow-up", kase.nextFollowUp ? formatDay(kase.nextFollowUp) : "Not set"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-navy-100 p-3">
                  <dt className="muted text-xs tracking-wide uppercase">{label}</dt>
                  <dd className="mt-0.5 text-sm font-medium text-navy-900">{value}</dd>
                </div>
              ))}
            </dl>
            {kase.note ? (
              <div className="mt-3 rounded-xl border border-navy-100 bg-navy-50/60 p-3.5">
                <p className="muted text-xs tracking-wide uppercase">
                  What the student wrote
                </p>
                <p className="mt-1 text-sm whitespace-pre-wrap text-navy-800">{kase.note}</p>
              </div>
            ) : null}
          </section>

          {/* ------------------------------------- student-shared info */}
          <section className="card p-4 sm:p-5">
            <SectionTitle
              title="Student-shared information"
              subtitle="Only what they explicitly consented to. Nothing else was attached."
            />

            <div className="space-y-2.5">
              {consented.map((k) => (
                <div
                  key={k}
                  className="rounded-xl border border-mint-200 bg-mint-50/50 p-3.5"
                >
                  <p className="flex items-center gap-2 text-sm font-medium text-navy-900">
                    <span className="text-mint-600" aria-hidden>
                      ✓
                    </span>
                    {SCOPE_COPY[k].label}
                  </p>
                  <div className="mt-2">{scopeValue(k)}</div>
                </div>
              ))}
            </div>

            {withheld.length ? (
              <>
                <p className="mt-4 mb-2 text-sm font-semibold text-navy-900">
                  Withheld by the student
                </p>
                <div className="space-y-1.5">
                  {withheld.map((k) => (
                    <div
                      key={k}
                      className="flex items-center gap-2.5 rounded-xl border border-navy-100 bg-navy-50/70 px-3.5 py-3"
                    >
                      <span className="text-navy-400" aria-hidden>
                        🔒
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-navy-500">
                          {SCOPE_COPY[k].label}
                        </p>
                        <p className="text-xs text-navy-400">Not shared — not available here</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : null}
          </section>

          {/* --------------------------------------------- appointments */}
          <section className="card p-4 sm:p-5">
            <SectionTitle
              title="Appointments"
              action={
                <Button size="sm" tone="pro" onClick={() => setShowSchedule(true)}>
                  Schedule
                </Button>
              }
            />
            {appts.length === 0 ? (
              <p className="muted text-sm">Nothing booked for this case yet.</p>
            ) : (
              <div className="space-y-3">
                {upcoming.length ? (
                  <div>
                    <p className="muted mb-1.5 text-xs font-semibold tracking-wide uppercase">
                      Upcoming
                    </p>
                    <ul className="space-y-2">
                      {upcoming.map((a) => (
                        <li
                          key={a.id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-pro-200 bg-pro-50/50 p-3"
                        >
                          <span className="text-sm font-medium text-navy-900">
                            {formatDay(isoDay(new Date(a.at)))} · {formatTime(a.at)}
                          </span>
                          <span className="muted text-sm">
                            {a.mode} ·{" "}
                            {a.identityVisible ? kase.studentHandle : "Anonymous until consent"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {previous.length ? (
                  <div>
                    <p className="muted mb-1.5 text-xs font-semibold tracking-wide uppercase">
                      Previous
                    </p>
                    <ul className="space-y-2">
                      {previous.map((a) => (
                        <li
                          key={a.id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-navy-100 p-3"
                        >
                          <span className="text-sm text-navy-800">
                            {formatDay(isoDay(new Date(a.at)))} · {formatTime(a.at)}
                          </span>
                          <Badge tone={a.status === "completed" ? "mint" : "neutral"}>
                            {a.status}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            )}
          </section>

          {/* ---------------------------------------- counsellor notes */}
          <section className="card p-4 sm:p-5">
            <SectionTitle
              title="Counsellor notes"
              subtitle="Private professional notes. The student never sees these."
            />
            <Timeline
              items={kase.counsellorNotes.map((n) => ({
                id: n.id,
                at: formatDateTime(n.at),
                title: "Note recorded",
                body: n.body,
              }))}
            />
            <div className="mt-4">
              <Textarea
                rows={4}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Record a professional note for this case."
                aria-label="New counsellor note"
              />
              <Button
                tone="pro"
                className="mt-2"
                disabled={!note.trim()}
                onClick={() => {
                  addCaseNote(kase.id, note);
                  setNote("");
                  toast("Note recorded", "success");
                }}
              >
                Record note
              </Button>
            </div>
          </section>
        </div>

        {/* ---------------------------------------------------- sidebar */}
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <section className="card p-4">
            <h2 className="mb-3 text-sm font-semibold tracking-wide text-navy-700 uppercase">
              Case actions
            </h2>
            <div className="space-y-2">
              <Button full onClick={() => setShowResource(true)}>
                Offer a resource
              </Button>
              <Button
                full
                onClick={() => setShowContact(true)}
                disabled={kase.status === "closed"}
              >
                Request voluntary contact
              </Button>
              <Button full onClick={() => setShowSchedule(true)}>
                Schedule appointment
              </Button>
              <Button
                full
                tone="ghost"
                onClick={() => setShowClose(true)}
                disabled={kase.status === "closed"}
              >
                Close or archive
              </Button>
            </div>
          </section>

          <section className="card p-4">
            <h2 className="mb-2 text-sm font-semibold tracking-wide text-navy-700 uppercase">
              Follow-up
            </h2>
            <p className="text-sm text-navy-800">
              {kase.nextFollowUp ? formatDay(kase.nextFollowUp) : "No follow-up set"}
            </p>
            <p className="muted mt-0.5 text-xs">Status: {STATUS_LABEL[kase.status]}</p>
            <div className="mt-3 space-y-2">
              <Input
                type="date"
                value={followUp}
                onChange={(e) => setFollowUp(e.target.value)}
                aria-label="Follow-up date"
              />
              <Button
                full
                size="sm"
                disabled={!followUp}
                onClick={() => {
                  recordFollowUp(kase.id, followUp);
                  toast("Follow-up recorded", "success");
                }}
              >
                Record follow-up
              </Button>
            </div>
          </section>

          {kase.offeredResourceIds.length ? (
            <section className="card p-4">
              <h2 className="mb-2 text-sm font-semibold tracking-wide text-navy-700 uppercase">
                Resources offered
              </h2>
              <ul className="space-y-1.5">
                {kase.offeredResourceIds.map((rid) => (
                  <li key={rid} className="text-sm text-navy-800">
                    {resourceById(rid)?.title ?? rid}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="rounded-2xl border border-pro-200 bg-pro-50 p-4">
            <h2 className="text-sm font-semibold text-pro-900">Role boundary</h2>
            <p className="mt-1 text-sm text-pro-900/80">
              This screen mirrors the backend&rsquo;s consent boundary — it does not create
              it. There is no action here that can surface data the student did not share,
              because the data is not sent in the first place.
            </p>
          </section>
        </aside>
      </div>

      {/* --------------------------------------------------------- modals */}
      <Modal
        open={showResource}
        onClose={() => setShowResource(false)}
        title="Offer a resource"
        description="The student is notified that a resource is waiting. They choose whether to open it."
        footer={
          <>
            <Button onClick={() => setShowResource(false)}>Cancel</Button>
            <Button
              tone="pro"
              onClick={() => {
                offerResource(kase.id, resourcePick);
                setShowResource(false);
                toast("Resource offered", "success");
              }}
            >
              Offer this resource
            </Button>
          </>
        }
      >
        <Field label="Resource">
          <Select value={resourcePick} onChange={(e) => setResourcePick(e.target.value)}>
            {[...(state.customResources ?? []), ...RESOURCES].map((r) => (
              <option key={r.id} value={r.id}>
                {r.title} · {r.category}
              </option>
            ))}
          </Select>
        </Field>
        <p className="muted mt-3 text-sm">
          {resourceById(resourcePick, state.customResources)?.summary}
        </p>
      </Modal>

      <Modal
        open={showContact}
        onClose={() => setShowContact(false)}
        tone="pro"
        title="Request voluntary contact"
        description="An invitation, not a contact."
        footer={
          <>
            <Button onClick={() => setShowContact(false)}>Cancel</Button>
            <Button
              tone="pro"
              onClick={() => {
                requestVoluntaryContact(kase.id);
                setShowContact(false);
                toast("Invitation sent", "success", "The student decides whether to respond.");
              }}
            >
              Send the invitation
            </Button>
          </>
        }
      >
        <ul className="space-y-2 text-sm text-navy-800">
          <li className="flex gap-2">
            <span className="text-mint-600" aria-hidden>
              ✓
            </span>
            The student sees that a counsellor has offered to talk.
          </li>
          <li className="flex gap-2">
            <span className="text-mint-600" aria-hidden>
              ✓
            </span>
            Their identity stays withheld unless they choose to attach it.
          </li>
          <li className="flex gap-2">
            <span className="text-mint-600" aria-hidden>
              ✓
            </span>
            Ignoring it carries no consequence and is not recorded against them.
          </li>
        </ul>
      </Modal>

      <Modal
        open={showSchedule}
        onClose={() => setShowSchedule(false)}
        title="Schedule an appointment"
        footer={
          <>
            <Button onClick={() => setShowSchedule(false)}>Cancel</Button>
            <Button
              tone="pro"
              onClick={() => {
                const iso = new Date(`${apptDate}T${apptTime}`).toISOString();
                scheduleAppointment(kase.caseId, iso, apptMode, kase.concern);
                setShowSchedule(false);
                toast("Appointment scheduled", "success");
              }}
            >
              Schedule
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Field label="Date">
            <Input
              type="date"
              value={apptDate}
              onChange={(e) => setApptDate(e.target.value)}
            />
          </Field>
          <Field label="Time">
            <Input
              type="time"
              value={apptTime}
              onChange={(e) => setApptTime(e.target.value)}
            />
          </Field>
          <Field label="Mode">
            <Select
              value={apptMode}
              onChange={(e) => setApptMode(e.target.value as SupportMode)}
            >
              {SUPPORT_MODES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </Select>
          </Field>
          <p className={cx("muted text-sm")}>
            The student receives a reminder that says only &ldquo;You have a new MindEase
            update&rdquo;.
          </p>
        </div>
      </Modal>

      <Modal
        open={showClose}
        onClose={() => setShowClose(false)}
        size="sm"
        title="Close this case?"
        description="Closing archives it under institutional workflow. The student can always re-request support."
        footer={
          <>
            <Button onClick={() => setShowClose(false)}>Cancel</Button>
            <Button
              tone="pro"
              onClick={() => {
                setCaseStatus(kase.id, "closed");
                setShowClose(false);
                toast("Case closed", "info");
              }}
            >
              Close case
            </Button>
          </>
        }
      />
    </div>
  );
}
