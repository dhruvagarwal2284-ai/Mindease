"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { PrivacyBadge } from "@/components/privacy";
import {
  HumanReviewBanner,
  IndicatorPanel,
  SupportLevelBadge,
  TrendBadge,
} from "@/components/support";
import {
  Badge,
  Button,
  Callout,
  Card,
  EmptyState,
  Field,
  LinkButton,
  Modal,
  SectionTitle,
  SkeletonCard,
  Textarea,
  Timeline,
} from "@/components/ui";
import { cx, formatDateTime, relativeTime } from "@/lib/format";
import { RESOURCES, resourceById } from "@/lib/resources";
import { useStore } from "@/lib/store";
import { LEVEL_COPY } from "@/lib/support-indicator";
import type { AlertStatus } from "@/lib/types";

/* ------------------------------------------------------------------ meta */

const STATUS_COPY: Record<
  AlertStatus,
  { label: string; tone: "navy" | "amber" | "mint" | "info" }
> = {
  new: { label: "New — awaiting review", tone: "amber" },
  under_review: { label: "Under review by you", tone: "info" },
  resolved: { label: "Reviewed and resolved", tone: "mint" },
  false_positive: { label: "Marked false positive", tone: "navy" },
};

const NOT_CONTAINED = [
  "No name, roll number, email address or phone number.",
  "No department, year, hostel block or timetable.",
  "No journal text. Entries are never read — only the mood the student attached to one.",
  "No community post bodies, replies or private message content.",
  "No location, device fingerprint or browsing activity.",
];

const FLOW_STEPS = [
  {
    key: "signal",
    title: "AI signal",
    body: "A pattern is noticed in the student’s own check-ins.",
    className: "border-pro-200 bg-pro-50 text-pro-900",
  },
  {
    key: "alert",
    title: "Alert",
    body: "Queued anonymously. Nobody is contacted, identified or penalised.",
    className: "border-amber-200 bg-amber-50 text-amber-900",
  },
  {
    key: "review",
    title: "Counsellor review",
    body: "A qualified human reads the evidence behind every signal.",
    className: "border-navy-300 bg-navy-900 text-white",
  },
  {
    key: "decision",
    title: "Human decision",
    body: "You decide: monitor, offer, invite, escalate — or dismiss.",
    className: "border-navy-200 bg-white text-navy-900",
  },
  {
    key: "action",
    title: "Support action",
    body: "Only a human-approved offer ever reaches the student.",
    className: "border-mint-200 bg-mint-50 text-mint-900",
  },
];

type Dialog = null | "reviewed" | "false_positive" | "escalate" | "offer" | "contact";

const FALSE_POSITIVE_DEFAULT =
  "The signals do not reflect this student’s situation. Recorded as a false positive so the model can be tuned.";

/* ------------------------------------------------------------------ page */

export default function AlertDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const {
    ready,
    state,
    setAlertStatus,
    offerResource,
    requestVoluntaryContact,
    toast,
  } = useStore();

  const [dialog, setDialog] = useState<Dialog>(null);
  const [note, setNote] = useState("");

  const alert = useMemo(
    () => state.alerts.find((a) => a.id === id),
    [state.alerts, id],
  );
  const linkedCase = useMemo(
    () => (alert ? state.cases.find((c) => c.caseId === alert.caseId) : undefined),
    [state.cases, alert],
  );

  if (!ready) {
    return (
      <div className="space-y-3">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (!alert) {
    return (
      <div className="space-y-5">
        <HumanReviewBanner />
        <EmptyState
          icon="🔎"
          title="This alert is no longer in the queue"
          body="It may have been resolved by a colleague, or the student may have turned AI support analysis off — which removes their alert entirely. Nothing was retained."
          action={
            <LinkButton href="/counsellor/alerts" tone="pro">
              Back to the alert queue
            </LinkButton>
          }
        />
      </div>
    );
  }

  const status = STATUS_COPY[alert.status];

  /* ------------------------------------------------------------- actions */

  const openDialog = (next: Exclude<Dialog, null>) => {
    setNote(next === "false_positive" ? FALSE_POSITIVE_DEFAULT : "");
    setDialog(next);
  };

  const closeDialog = () => {
    setDialog(null);
    setNote("");
  };

  const handleReview = () => {
    setAlertStatus(alert.id, "under_review");
    toast(
      `Case #${alert.caseId} marked under review`,
      "info",
      "Visible to colleagues so two people do not review the same alert.",
    );
  };

  const handleMarkReviewed = () => {
    setAlertStatus(
      alert.id,
      "resolved",
      note.trim() || "Reviewed — no further action required.",
    );
    toast(`Case #${alert.caseId} reviewed`, "success", "Your note is in the audit trail.");
    closeDialog();
  };

  const handleFalsePositive = () => {
    setAlertStatus(
      alert.id,
      "false_positive",
      `${note.trim() || FALSE_POSITIVE_DEFAULT} This decision is fed back into model tuning.`,
    );
    toast(
      "Marked false positive",
      "info",
      "Fed back into model tuning. The student is never told and never contacted.",
    );
    closeDialog();
  };

  const handleEscalate = () => {
    if (!note.trim()) return;
    setAlertStatus(alert.id, "resolved", `Escalated: ${note.trim()}`);
    toast(
      "Escalated under the institutional safety protocol",
      "warning",
      "Your justification has been written to the audit trail.",
    );
    closeDialog();
  };

  const handleOfferResource = (resourceId: string) => {
    if (!linkedCase) return;
    offerResource(linkedCase.id, resourceId);
    toast(
      "Resource offered",
      "success",
      "The student sees an optional recommendation. They can ignore it.",
    );
    closeDialog();
  };

  const handleVoluntaryContact = () => {
    if (linkedCase) {
      requestVoluntaryContact(linkedCase.id);
      toast(
        "Invitation sent",
        "success",
        "Identity stays withheld unless the student accepts.",
      );
    } else {
      setAlertStatus(
        alert.id,
        "under_review",
        "Voluntary contact intent recorded. No case exists yet, so the invitation is queued for the student’s next session.",
      );
      toast(
        "Invitation queued",
        "info",
        "It will be offered the next time the student opens MindEase. Nothing was sent to anyone else.",
      );
    }
    closeDialog();
  };

  const historyItems = [
    {
      id: "detected",
      at: formatDateTime(alert.createdAt),
      title: "Signals detected",
      body: `${LEVEL_COPY[alert.level].label} support indicator raised from the student’s own check-ins. No human had seen it yet.`,
    },
    ...(alert.reviewedAt
      ? [
          {
            id: "reviewed",
            at: formatDateTime(alert.reviewedAt),
            title: `Status set to “${status.label}”`,
            body: alert.reviewedNote ?? "No note was recorded with this decision.",
          },
        ]
      : []),
  ];

  /* --------------------------------------------------------------- render */

  return (
    <div className="space-y-5">
      <HumanReviewBanner />

      <nav aria-label="Breadcrumb">
        <LinkButton href="/counsellor/alerts" tone="ghost" size="sm">
          <span aria-hidden>←</span> Alert queue
        </LinkButton>
      </nav>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-mono text-2xl font-semibold tracking-tight text-navy-900">
            Anonymous Case #{alert.caseId}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <SupportLevelBadge level={alert.level} />
            <TrendBadge trend={alert.trend} />
            <Badge tone={status.tone}>{status.label}</Badge>
            {alert.isDemoStudent ? (
              <Badge
                tone="teal"
                icon={
                  <span
                    aria-hidden
                    className="inline-block h-1.5 w-1.5 rounded-full bg-teal-600"
                  />
                }
              >
                live from this browser
              </Badge>
            ) : null}
          </div>
          <p className="muted mt-2 text-sm">
            Detected {formatDateTime(alert.createdAt)} · {relativeTime(alert.createdAt)}
          </p>
        </div>
        <PrivacyBadge status="identity-withheld" />
      </header>

      {/* --------------------------------------------------------- actions */}

      <Card as="section" aria-label="Human review actions">
        <SectionTitle
          title="Your decision"
          subtitle="Nothing below happens automatically. Each action is yours, and each one is written to the audit trail."
        />
        <div className="flex flex-wrap gap-2">
          <Button
            tone="pro"
            onClick={handleReview}
            disabled={alert.status === "under_review"}
          >
            Review
          </Button>
          <Button onClick={() => openDialog("offer")}>Offer support</Button>
          <Button onClick={() => openDialog("contact")}>Request voluntary contact</Button>
          <Button tone="support" onClick={() => openDialog("reviewed")}>
            Mark reviewed
          </Button>
          <Button onClick={() => openDialog("false_positive")}>False positive</Button>
          <Button tone="urgent" onClick={() => openDialog("escalate")}>
            Escalate
          </Button>
        </div>
        <p className="muted mt-3 text-xs">
          Recommended next step for a{" "}
          <strong>{LEVEL_COPY[alert.level].label.toLowerCase()}</strong> indicator:{" "}
          {LEVEL_COPY[alert.level].action}. It is a suggestion, not an instruction.
        </p>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        {/* ------------------------------------------------- explainability */}
        <div className="space-y-5">
          <Card as="section" aria-labelledby="explainability">
            <SectionTitle
              title={<span id="explainability">Why this alert exists</span>}
              subtitle="Every signal carries the plain-language evidence that produced it."
            />
            <p className="mb-4 rounded-xl border border-pro-200 bg-pro-50 px-4 py-3 text-sm font-semibold text-pro-900">
              These are model-detected signals, not a diagnosis.
            </p>
            <IndicatorPanel indicator={alert} caseId={alert.caseId} />
          </Card>

          <Card as="section" aria-labelledby="hitl">
            <SectionTitle
              title={<span id="hitl">Human-in-the-loop</span>}
              subtitle="The model prioritises. A person decides. There is no path from a signal to a student that does not pass through you."
            />
            <ol className="flex flex-wrap items-stretch gap-x-1 gap-y-2">
              {FLOW_STEPS.map((step, i) => (
                <li key={step.key} className="flex items-stretch gap-1">
                  <div
                    className={cx(
                      "w-44 rounded-xl border px-3 py-2.5",
                      step.className,
                    )}
                  >
                    <p className="text-sm font-semibold">{step.title}</p>
                    <p
                      className={cx(
                        "mt-0.5 text-xs",
                        step.key === "review" ? "text-white/80" : "opacity-80",
                      )}
                    >
                      {step.body}
                    </p>
                    {step.key === "review" ? (
                      <p className="mt-1.5 text-[0.68rem] font-semibold tracking-wide text-mint-200 uppercase">
                        You are here
                      </p>
                    ) : null}
                  </div>
                  {i < FLOW_STEPS.length - 1 ? (
                    <span
                      aria-hidden
                      className="self-center px-0.5 text-lg text-navy-300"
                    >
                      →
                    </span>
                  ) : null}
                </li>
              ))}
            </ol>

            <div className="mt-3 flex items-start gap-2">
              <span aria-hidden className="pl-2 text-lg leading-6 text-navy-300">
                ↳
              </span>
              <div className="rounded-xl border border-dashed border-navy-200 bg-navy-50 px-3 py-2.5">
                <p className="text-sm font-semibold text-navy-800">
                  False positive — branches off <em>Counsellor review</em>
                </p>
                <p className="muted mt-0.5 text-xs">
                  If the evidence does not reflect what is actually happening for this
                  student, the branch ends here. The decision is recorded, fed back into
                  model tuning, and the student is neither told nor contacted.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* ------------------------------------------------------- privacy */}
        <div className="space-y-5">
          <Card as="section" aria-labelledby="not-contained">
            <SectionTitle
              title={<span id="not-contained">What this alert does NOT contain</span>}
              subtitle="Data minimisation is enforced before the alert is created, not after you promise not to look."
            />
            <ul className="space-y-2">
              {NOT_CONTAINED.map((line) => (
                <li key={line} className="flex items-start gap-2.5 text-sm text-navy-700">
                  <span
                    aria-hidden
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-navy-100 text-xs text-navy-500"
                  >
                    ✕
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            <Callout tone="info" icon="🧭" title="What it does contain" className="mt-4">
              Patterns derived from the student&rsquo;s own check-ins — and only because the
              student left <strong>AI support analysis</strong> on. If they turn it off, the
              alert stops existing and nothing is retained.
            </Callout>
          </Card>

          <Card as="section" aria-labelledby="linkage">
            <SectionTitle
              title={<span id="linkage">Identity linkage</span>}
              subtitle="Anonymous until the student opts in."
            />
            {linkedCase ? (
              <div className="space-y-3">
                <p className="text-sm text-navy-700">
                  This case identifier matches an <strong>opt-in counselling case</strong>{" "}
                  the student opened themselves. Only the items they explicitly ticked are
                  attached to it.
                </p>
                <p className="text-sm text-navy-700">
                  Identity:{" "}
                  <strong>
                    {linkedCase.studentHandle ?? "Anonymous until the student consents"}
                  </strong>
                </p>
                <LinkButton href={`/counsellor/cases/${linkedCase.id}`} tone="pro">
                  Open case #{linkedCase.caseId}
                </LinkButton>
              </div>
            ) : (
              <p className="text-sm text-navy-700">
                There is <strong>no case</strong> for this identifier. The student has not
                asked to talk to anyone, so no identity, concern or preferred mode exists
                for you to see. You can still invite them — the invitation travels to them,
                nothing travels back until they accept.
              </p>
            )}
          </Card>

          <Card as="section" aria-labelledby="history">
            <SectionTitle
              title={<span id="history">Review history</span>}
              subtitle="Every status change is logged."
            />
            <Timeline items={historyItems} />
            {alert.reviewedNote ? (
              <blockquote className="mt-4 rounded-xl border-l-4 border-pro-300 bg-pro-50 px-4 py-3 text-sm text-pro-900">
                {alert.reviewedNote}
              </blockquote>
            ) : null}
          </Card>
        </div>
      </div>

      {/* --------------------------------------------------------- dialogs */}

      <Modal
        open={dialog === "reviewed"}
        onClose={closeDialog}
        tone="pro"
        title="Mark this alert reviewed"
        description="Record what you decided and why. The note is professional documentation — it is not shown to the student."
        footer={
          <>
            <Button tone="ghost" onClick={closeDialog}>
              Cancel
            </Button>
            <Button tone="support" onClick={handleMarkReviewed}>
              Save review note
            </Button>
          </>
        }
      >
        <Field
          label="Review note"
          hint="If you leave this blank we record “Reviewed — no further action required.”"
        >
          <Textarea
            rows={4}
            value={note}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setNote(e.target.value)
            }
            placeholder="e.g. Exam-period variation. Resources offered, no further action."
          />
        </Field>
      </Modal>

      <Modal
        open={dialog === "false_positive"}
        onClose={closeDialog}
        tone="pro"
        title="Mark as a false positive"
        description="Say what the model got wrong. This is the feedback loop that keeps the queue trustworthy."
        footer={
          <>
            <Button tone="ghost" onClick={closeDialog}>
              Cancel
            </Button>
            <Button tone="pro" onClick={handleFalsePositive}>
              Record false positive
            </Button>
          </>
        }
      >
        <Callout tone="info" icon="🧪">
          This decision is fed back into model tuning so the same pattern is weighted more
          carefully next time. The student is never told, never contacted and never
          penalised.
        </Callout>
        <Field label="Why was this not a genuine support indicator?" className="mt-4">
          <Textarea
            rows={4}
            value={note}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setNote(e.target.value)
            }
          />
        </Field>
      </Modal>

      <Modal
        open={dialog === "escalate"}
        onClose={closeDialog}
        tone="urgent"
        title="Escalate under the institutional safety protocol"
        description="Escalation moves this beyond your own caseload. A written justification is required."
        footer={
          <>
            <Button tone="ghost" onClick={closeDialog}>
              Cancel
            </Button>
            <Button tone="urgent" onClick={handleEscalate} disabled={!note.trim()}>
              Escalate
            </Button>
          </>
        }
      >
        <Callout tone="urgent" icon="🛡️" title="This follows your institution’s safety protocol">
          Escalation is a human decision with consequences. It is logged in the audit trail
          with your justification, the case identifier and the time — and it is reviewable
          afterwards.
        </Callout>
        <Field
          label="Justification"
          required
          hint="Written to the audit trail exactly as you type it."
          className="mt-4"
        >
          <Textarea
            rows={4}
            value={note}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setNote(e.target.value)
            }
            placeholder="Describe the concern and the protocol step you are invoking."
          />
        </Field>
        {!note.trim() ? (
          <p className="muted mt-2 text-xs" aria-live="polite">
            Add a justification to enable escalation.
          </p>
        ) : null}
      </Modal>

      <Modal
        open={dialog === "offer"}
        onClose={closeDialog}
        size="lg"
        tone="pro"
        title="Offer support"
        description="Pick one resource. It arrives as an optional recommendation the student is free to ignore."
        footer={
          <Button tone="ghost" onClick={closeDialog}>
            Close
          </Button>
        }
      >
        {linkedCase ? (
          <>
            <Callout tone="mint" icon="🤝">
              Delivered to the student&rsquo;s opt-in case{" "}
              <strong>#{linkedCase.caseId}</strong>. They see a recommendation, not a
              warning, and no level or score travels with it.
            </Callout>
            <ul className="mt-4 space-y-2">
              {RESOURCES.map((r) => {
                const already = linkedCase.offeredResourceIds.includes(r.id);
                return (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => handleOfferResource(r.id)}
                      disabled={already}
                      className={cx(
                        "min-h-11 w-full rounded-xl border p-3.5 text-left transition-colors",
                        already
                          ? "cursor-not-allowed border-mint-200 bg-mint-50"
                          : "border-navy-100 bg-white hover:border-teal-300 hover:bg-teal-50",
                      )}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-navy-900">
                          {r.title}
                        </span>
                        <Badge tone="neutral">{r.category}</Badge>
                        <Badge tone="neutral">{r.minutes} min</Badge>
                        {already ? <Badge tone="mint">Already offered</Badge> : null}
                      </div>
                      <p className="muted mt-1 text-sm">{r.summary}</p>
                    </button>
                  </li>
                );
              })}
            </ul>
            {linkedCase.offeredResourceIds.length ? (
              <p className="muted mt-3 text-xs">
                Already shared:{" "}
                {linkedCase.offeredResourceIds
                  .map((rid) => resourceById(rid)?.title ?? rid)
                  .join(" · ")}
              </p>
            ) : null}
          </>
        ) : (
          <>
            <Callout tone="amber" icon="📭" title="There is nowhere to deliver this yet">
              A resource can only be delivered once a case exists — that is, once the
              student has chosen to talk to someone. Without a case there is no consented
              channel to this person, and the platform will not invent one.
            </Callout>
            <p className="mt-3 text-sm text-navy-700">
              If you think this student would benefit from support, the honest step is to
              invite them and let them decide.
            </p>
            <div className="mt-4">
              <Button tone="pro" onClick={() => openDialog("contact")}>
                Request voluntary contact instead
              </Button>
            </div>
          </>
        )}
      </Modal>

      <Modal
        open={dialog === "contact"}
        onClose={closeDialog}
        tone="pro"
        title="Request voluntary contact"
        description="An invitation, not an intervention."
        footer={
          <>
            <Button tone="ghost" onClick={closeDialog}>
              Cancel
            </Button>
            <Button tone="pro" onClick={handleVoluntaryContact}>
              Send invitation
            </Button>
          </>
        }
      >
        <ul className="space-y-2.5 text-sm text-navy-800">
          <li className="flex items-start gap-2.5">
            <span aria-hidden>✉️</span>
            <span>
              The student is <strong>invited, not contacted</strong>. Nothing is sent to
              their family, their department or anyone else.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <span aria-hidden>🕶️</span>
            <span>
              Their <strong>identity stays withheld</strong> until they accept. You will
              keep seeing an anonymous case identifier until then.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <span aria-hidden>🤍</span>
            <span>
              They may <strong>ignore it with no consequence</strong>. There is no reminder
              chain, no escalation for silence, and no record held against them.
            </span>
          </li>
        </ul>
        {linkedCase ? (
          <Callout tone="info" icon="🤝" className="mt-4">
            This will be attached to their existing case{" "}
            <strong>#{linkedCase.caseId}</strong> and its status becomes “awaiting
            student”.
          </Callout>
        ) : (
          <Callout tone="amber" icon="⏳" className="mt-4">
            This student has no case yet, so there is no live channel to them. The
            invitation is <strong>queued for their next session</strong> and offered the
            next time they open MindEase. Your intent is recorded now and the alert moves
            to <strong>under review</strong>.
          </Callout>
        )}
      </Modal>

      <div className="no-print">
        <Button tone="ghost" onClick={() => router.push("/counsellor/alerts")}>
          <span aria-hidden>←</span> Back to the alert queue
        </Button>
      </div>
    </div>
  );
}
