"use client";

import { useMemo, useState } from "react";
import { HumanReviewBanner } from "@/components/support";
import {
  Badge,
  Button,
  Callout,
  Card,
  EmptyState,
  Field,
  Modal,
  SectionTitle,
  Select,
  SkeletonCard,
  Stat,
  Tabs,
  Textarea,
  Timeline,
} from "@/components/ui";
import { cx, formatDateTime, relativeTime } from "@/lib/format";
import { FLAG_REASON_COPY } from "@/lib/moderation";
import { RESOURCES, resourceById } from "@/lib/resources";
import { useStore } from "@/lib/store";
import type { ModerationDecision, ModerationItem } from "@/lib/types";

/* ------------------------------------------------------------------ copy */

type QueueTab = "new" | "under_review" | "resolved" | "all";

/** Decisions that need a written rationale before they are recorded. */
type RationaleDecision = "warn" | "restrict" | "escalate";

const DECISION_COPY: Record<ModerationDecision, string> = {
  approve: "Approved — kept in the feed",
  remove: "Removed or hidden",
  warn: "Author warned",
  restrict: "Participation restricted",
  escalate: "Escalated for safeguarding review",
  false_positive: "Marked a false positive",
};

const RATIONALE_COPY: Record<
  RationaleDecision,
  { title: string; description: string; confirm: string; hint: string }
> = {
  warn: {
    title: "Warn the author",
    description:
      "The author receives a private, non-punitive note explaining what needs to change. Write the reason in your own words — it is recorded in the audit trail.",
    confirm: "Send warning",
    hint: "Plain language. The author reads this, so keep it explanatory rather than disciplinary.",
  },
  restrict: {
    title: "Restrict participation",
    description:
      "Posting and replying are paused for this author while support continues to be available to them. Restriction is time-boxed and reversible.",
    confirm: "Apply restriction",
    hint: "Record what led to the restriction and roughly how long you intend it to last.",
  },
  escalate: {
    title: "Escalate for safeguarding review",
    description:
      "Hands the item to the institutional safeguarding lead under the campus protocol. Escalation is a request for a human decision, never an automatic action against the student.",
    confirm: "Escalate",
    hint: "Say what you saw and what you are asking the safeguarding lead to look at.",
  },
};

const FLOW_STEPS: { label: string; body: string; tone: string }[] = [
  {
    label: "1 · Post",
    body: "A post or reply enters the community feed.",
    tone: "border-navy-200 bg-navy-50 text-navy-900",
  },
  {
    label: "2 · Reason flagged",
    body: "Screened by the model or reported by a student, with the reason attached.",
    tone: "border-info-200 bg-info-50 text-info-900",
  },
  {
    label: "3 · Human action",
    body: "A counsellor claims the item and reviews the content in context.",
    tone: "border-pro-200 bg-pro-50 text-pro-900",
  },
  {
    label: "4 · Outcome",
    body: "Approve, remove, warn, restrict, escalate or mark a false positive — recorded.",
    tone: "border-mint-200 bg-mint-50 text-mint-900",
  },
];

/* --------------------------------------------------------------- helpers */

function sourceBadge(item: ModerationItem) {
  return item.source === "ai_flag" ? (
    <Badge tone="pro" icon={<span aria-hidden>🤖</span>}>
      AI flagged
    </Badge>
  ) : (
    <Badge tone="info" icon={<span aria-hidden>🙋</span>}>
      Student report
    </Badge>
  );
}

function statusBadge(item: ModerationItem) {
  if (item.status === "new") return <Badge tone="navy">New</Badge>;
  if (item.status === "under_review") return <Badge tone="amber">Under review</Badge>;
  return <Badge tone="mint">Resolved</Badge>;
}

/* ------------------------------------------------------------------ page */

export default function ModerationPage() {
  const { ready, state, resolveModeration, claimModeration, toast } = useStore();
  const [tab, setTab] = useState<QueueTab>("new");
  const [pending, setPending] = useState<{
    item: ModerationItem;
    decision: RationaleDecision;
  } | null>(null);
  const [rationale, setRationale] = useState("");
  const [resourceId, setResourceId] = useState("");

  const items = state.moderation;

  const counts = useMemo(
    () => ({
      newReports: items.filter((m) => m.source === "user_report" && m.status === "new")
        .length,
      aiFlagged: items.filter((m) => m.source === "ai_flag" && m.status === "new").length,
      underReview: items.filter((m) => m.status === "under_review").length,
      resolved: items.filter((m) => m.status === "resolved").length,
      newAll: items.filter((m) => m.status === "new").length,
    }),
    [items],
  );

  const visible = useMemo(() => {
    const rows = tab === "all" ? items : items.filter((m) => m.status === tab);
    return [...rows].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [items, tab]);

  const auditItems = useMemo(
    () =>
      [...state.audit]
        .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
        .slice(0, 25),
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

  /* ------------------------------------------------------------- actions */

  function act(item: ModerationItem, decision: ModerationDecision) {
    resolveModeration(item.id, decision);
    toast(DECISION_COPY[decision], decision === "remove" ? "warning" : "success", "Recorded in the audit trail.");
  }

  function openRationale(item: ModerationItem, decision: RationaleDecision) {
    setPending({ item, decision });
    setRationale("");
    setResourceId("");
  }

  function confirmRationale() {
    if (!pending || !rationale.trim()) return;
    resolveModeration(pending.item.id, pending.decision, resourceId || undefined);
    toast(
      DECISION_COPY[pending.decision],
      pending.decision === "escalate" ? "warning" : "info",
      resourceId
        ? "Rationale and a support resource were recorded."
        : "Rationale recorded in the audit trail.",
    );
    setPending(null);
    setRationale("");
    setResourceId("");
  }

  /* ---------------------------------------------------------------- view */

  const emptyForTab: Record<QueueTab, { icon: string; title: string; body: string }> = {
    new: {
      icon: "🌿",
      title: "Nothing new in the queue",
      body: "No posts or replies are waiting for a first look. The community is running quietly right now.",
    },
    under_review: {
      icon: "☕",
      title: "Nothing claimed for review",
      body: "Items you claim from the New tab appear here until you record a decision.",
    },
    resolved: {
      icon: "📁",
      title: "No decisions recorded yet",
      body: "Once you act on an item it moves here, with the decision and the audit entry attached.",
    },
    all: {
      icon: "🌿",
      title: "The queue is empty",
      body: "Nothing has been flagged by the model or reported by a student.",
    },
  };

  return (
    <div className="space-y-7">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-navy-900">
          Community safety
        </h1>
        <p className="muted mt-1 max-w-3xl text-sm">
          Every flag reaches a person before anything happens to a post or a student. The
          model can sort and explain the queue; it cannot remove, warn or contact anyone on
          its own.
        </p>
      </header>

      <HumanReviewBanner />

      {/* ------------------------------------------------------- counters */}

      <section aria-labelledby="queue-counters">
        <h2 id="queue-counters" className="sr-only">
          Queue counters
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Stat
            label="New reports"
            value={counts.newReports}
            hint="Reported by students, awaiting a first look"
            tone="info"
          />
          <Stat
            label="AI flagged"
            value={counts.aiFlagged}
            hint="Screened by the model, not yet reviewed"
            tone="pro"
          />
          <Stat
            label="Under review"
            value={counts.underReview}
            hint="Claimed by a counsellor"
            tone="amber"
          />
          <Stat
            label="Resolved"
            value={counts.resolved}
            hint="Decision recorded in the audit trail"
            tone="mint"
          />
        </div>
      </section>

      {/* ----------------------------------------------------- flow strip */}

      <section aria-labelledby="flow-strip">
        <SectionTitle
          title={<span id="flow-strip">How an item moves through the queue</span>}
          subtitle="The same four steps for every flag, whoever raised it."
        />
        <ol className="grid gap-3 md:grid-cols-4">
          {FLOW_STEPS.map((step) => (
            <li key={step.label} className={cx("rounded-xl border p-4", step.tone)}>
              <p className="text-xs font-semibold tracking-wide uppercase">{step.label}</p>
              <p className="mt-1.5 text-sm">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------------------------------------------------------- queue */}

      <section aria-labelledby="queue-heading" className="space-y-4">
        <SectionTitle
          title={<span id="queue-heading">Moderation queue</span>}
          subtitle="Newest first. Claim an item to show your colleagues it is being handled."
        />

        <Tabs<QueueTab>
          tone="pro"
          value={tab}
          onChange={setTab}
          tabs={[
            { value: "new", label: "New", count: counts.newAll },
            { value: "under_review", label: "Under review", count: counts.underReview },
            { value: "resolved", label: "Resolved", count: counts.resolved },
            { value: "all", label: "All", count: items.length },
          ]}
        />

        <p aria-live="polite" className="muted text-sm">
          Showing {visible.length} {visible.length === 1 ? "item" : "items"}.
        </p>

        {visible.length === 0 ? (
          <EmptyState
            icon={emptyForTab[tab].icon}
            title={emptyForTab[tab].title}
            body={emptyForTab[tab].body}
          />
        ) : (
          <ul className="space-y-4">
            {visible.map((item) => {
              const crisis = item.reason === "crisis_concern";
              const attached = item.attachedResourceId
                ? resourceById(item.attachedResourceId)
                : undefined;
              return (
                <li key={item.id}>
                  <Card
                    as="article"
                    className={cx(
                      crisis && "border-amber-200 bg-amber-50/40",
                      item.status === "resolved" && "opacity-95",
                    )}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      {sourceBadge(item)}
                      <Badge tone={crisis ? "amber" : "navy"}>
                        {FLAG_REASON_COPY[item.reason]}
                      </Badge>
                      {statusBadge(item)}
                      <Badge tone="neutral">
                        {item.targetType === "post" ? "Post" : "Reply"}
                      </Badge>
                      <span className="muted ml-auto text-xs">
                        Flagged {relativeTime(item.createdAt)}
                      </span>
                    </div>

                    <p className="mt-3 text-sm font-medium text-navy-800">
                      Why it surfaced
                    </p>
                    <p className="muted mt-0.5 text-sm">{item.detail}</p>

                    <blockquote className="mt-3 rounded-xl border border-navy-100 bg-navy-50/70 px-4 py-3">
                      <p className="text-sm text-navy-800 italic">“{item.excerpt}”</p>
                      <footer className="muted mt-1.5 text-xs not-italic">
                        Excerpt from an anonymous {item.targetType} · author identity is
                        not available to moderation.
                      </footer>
                    </blockquote>

                    {crisis ? (
                      <Callout
                        tone="amber"
                        className="mt-3"
                        icon={<span aria-hidden>🫶</span>}
                        title="A crisis flag routes to a supportive response, not a punishment."
                      >
                        Approve and offer support wherever you can. Removal here would take
                        away the one place this student chose to speak.
                      </Callout>
                    ) : null}

                    {item.status === "resolved" ? (
                      <div className="mt-4 rounded-xl border border-mint-200 bg-mint-50/70 px-4 py-3 text-sm text-mint-900">
                        <p className="font-medium">
                          {item.decision
                            ? DECISION_COPY[item.decision]
                            : "Resolved"}
                        </p>
                        <p className="mt-0.5 text-mint-900/80">
                          {item.resolvedAt
                            ? `Recorded ${formatDateTime(item.resolvedAt)}.`
                            : "Recorded."}
                          {attached
                            ? ` Support resource attached: “${attached.title}”.`
                            : ""}
                        </p>
                      </div>
                    ) : (
                      <div className="mt-4 border-t border-navy-100 pt-3.5">
                        <p className="muted mb-2 text-xs font-medium tracking-wide uppercase">
                          Human decision
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {item.status === "new" ? (
                            <Button
                              tone="pro"
                              size="sm"
                              onClick={() => {
                                claimModeration(item.id);
                                toast(
                                  "Claimed for review",
                                  "info",
                                  "Moved to Under review so nobody duplicates your work.",
                                );
                              }}
                            >
                              Claim for review
                            </Button>
                          ) : null}
                          <Button
                            tone="support"
                            size="sm"
                            onClick={() => act(item, "approve")}
                          >
                            Approve
                          </Button>
                          <Button size="sm" onClick={() => act(item, "remove")}>
                            Remove or hide
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => openRationale(item, "warn")}
                          >
                            Warn user
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => openRationale(item, "restrict")}
                          >
                            Restrict participation
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => openRationale(item, "escalate")}
                          >
                            Escalate
                          </Button>
                          <Button
                            size="sm"
                            tone="ghost"
                            onClick={() => act(item, "false_positive")}
                          >
                            Mark false positive
                          </Button>
                        </div>
                        <p className="muted mt-2.5 text-xs">
                          Approve and Remove act immediately. Warn, Restrict and Escalate
                          ask for a rationale first — and let you attach a support
                          resource alongside the decision.
                        </p>
                      </div>
                    )}
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* ---------------------------------------------------- audit trail */}

      <section aria-labelledby="audit-heading" id="audit" className="scroll-mt-24">
        <SectionTitle
          title={<span id="audit-heading">Audit trail</span>}
          subtitle="Every moderation and consent decision is recorded — who acted, when, and why."
        />
        <Card>
          <Callout
            tone="info"
            className="mb-4"
            icon={<span aria-hidden>🧾</span>}
            title="Recorded, reviewable, and not editable from this screen."
          >
            The trail exists so a student can ask why something happened to their post and
            get a real answer. In a deployment it is written server-side and retained under
            the institution&rsquo;s records policy.
          </Callout>
          {auditItems.length === 0 ? (
            <EmptyState
              icon="🧾"
              title="No decisions recorded yet"
              body="Moderation and consent decisions appear here as soon as they are made."
            />
          ) : (
            <Timeline
              items={auditItems.map((entry) => ({
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
          )}
          {state.audit.length > auditItems.length ? (
            <p className="muted mt-4 text-xs">
              Showing the {auditItems.length} most recent of {state.audit.length} entries.
            </p>
          ) : null}
        </Card>
      </section>

      {/* --------------------------------------------------------- modal */}

      <Modal
        open={pending !== null}
        onClose={() => setPending(null)}
        tone="pro"
        size="md"
        title={pending ? RATIONALE_COPY[pending.decision].title : "Record a decision"}
        description={pending ? RATIONALE_COPY[pending.decision].description : undefined}
        footer={
          <>
            <Button onClick={() => setPending(null)}>Cancel</Button>
            <Button
              tone="pro"
              disabled={!rationale.trim()}
              onClick={confirmRationale}
            >
              {pending ? RATIONALE_COPY[pending.decision].confirm : "Confirm"}
            </Button>
          </>
        }
      >
        {pending ? (
          <div className="space-y-4">
            <blockquote className="rounded-xl border border-navy-100 bg-navy-50/70 px-4 py-3 text-sm text-navy-800 italic">
              “{pending.item.excerpt}”
            </blockquote>

            <Field
              label="Rationale"
              required
              hint={RATIONALE_COPY[pending.decision].hint}
            >
              <Textarea
                rows={4}
                value={rationale}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setRationale(e.target.value)
                }
                placeholder="What you saw, and what you decided."
              />
            </Field>

            <Field
              label="Attach a support resource"
              hint="Optional. Sent to the author alongside the decision, so a moderation action still ends with an offer of help."
            >
              <Select
                value={resourceId}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setResourceId(e.target.value)
                }
              >
                <option value="">No resource attached</option>
                {[...(state.customResources ?? []), ...RESOURCES].map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title} · {r.category} · {r.minutes} min
                  </option>
                ))}
              </Select>
            </Field>

            <Callout tone="navy" icon={<span aria-hidden>🧾</span>}>
              Your name, the decision and this rationale are written to the audit trail.
            </Callout>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
