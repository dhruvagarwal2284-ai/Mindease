"use client";

import Link from "next/link";
import { useState } from "react";
import { ConsentDialog } from "@/components/privacy";
import { Button, Callout, LinkButton, SkeletonCard, Textarea, Toggle } from "@/components/ui";
import { cx } from "@/lib/format";
import { EMPTY_SCOPE, SCOPE_COPY, scopeSummary, withheldSummary } from "@/lib/privacy";
import { useStore } from "@/lib/store";
import { CONCERN_OPTIONS, SUPPORT_MODES } from "@/lib/types";
import type { ConcernOption, SharedDataScope, SupportMode } from "@/lib/types";

const STEP_LABELS = ["Concern", "How to talk", "Anything else", "What is shared", "Confirm"];

const MODE_BLURB: Record<SupportMode, string> = {
  Chat: "Text, in your own time. Good if speaking out loud feels like too much today.",
  "In-person": "On campus, face to face, in a private room.",
  Video: "A call from wherever you are. You choose whether the camera is on.",
  Phone: "A voice call. No video, no room to walk into.",
};

const NEVER_SHARED = [
  "Your real name",
  "Your email address or roll number",
  "Your device or browser identifiers",
  "Your journal, unless you tick specific entries afterwards",
  "Anything you wrote in the community",
];

export default function RequestCounsellingPage() {
  const { ready, requestCounselling, toast } = useStore();

  const [step, setStep] = useState(0);
  const [concern, setConcern] = useState<ConcernOption | null>(null);
  const [mode, setMode] = useState<SupportMode | null>(null);
  const [note, setNote] = useState("");
  const [scope, setScope] = useState<SharedDataScope>({ ...EMPTY_SCOPE });
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);

  if (!ready) return <SkeletonCard />;

  const scopeKeys = Object.keys(SCOPE_COPY) as (keyof SharedDataScope)[];
  const sharedCount = scopeSummary(scope).length;
  const withheldCount = withheldSummary(scope).length;

  const submit = () => {
    if (!concern || !mode) return;
    requestCounselling({ concern, mode, note, scope });
    setConfirming(false);
    setDone(true);
    toast("Request sent", "success", "A human reads it — nothing is automated.");
  };

  /* ------------------------------------------------------------- done */
  if (done) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-mint-200 bg-mint-50 p-6 text-center">
          <p className="text-3xl" aria-hidden>
            🌿
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-navy-900">
            That took something. Well done.
          </h1>
          <p className="mt-2 text-sm text-navy-700">
            Your request is with the campus counselling team. Only the items you ticked
            went with it.
          </p>
        </div>

        <section className="card p-4 sm:p-5">
          <h2 className="font-semibold text-navy-900">What happens next</h2>
          <ol className="mt-3 space-y-2.5 text-sm text-navy-800">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy-100 text-xs font-semibold">
                1
              </span>
              A counsellor — a person, not a system — reads your request.
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy-100 text-xs font-semibold">
                2
              </span>
              They reply through MindEase, or offer you an appointment in the way you asked
              for.
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy-100 text-xs font-semibold">
                3
              </span>
              You stay anonymous unless you separately choose to attach your pseudonym.
            </li>
          </ol>
        </section>

        <Callout tone="info" icon="↩️" title="You can change your mind">
          Withdrawing the request detaches everything you shared. There is no note on your
          record, because there is no record.
        </Callout>

        <div className="flex flex-wrap gap-2">
          <LinkButton href="/student/support" tone="primary">
            Back to support
          </LinkButton>
          <LinkButton href="/student/home">Home</LinkButton>
        </div>
      </div>
    );
  }

  const canContinue =
    (step === 0 && concern !== null) ||
    (step === 1 && mode !== null) ||
    step === 2 ||
    step === 3;

  return (
    <div className="space-y-5">
      <Link href="/student/support" className="muted inline-block text-sm hover:underline">
        ← Support
      </Link>

      <div>
        <div className="mb-2 flex items-baseline justify-between">
          <p className="text-xs font-medium tracking-wide text-navy-500 uppercase">
            Step {step + 1} of {STEP_LABELS.length}
          </p>
          <p className="text-xs font-medium text-navy-700">{STEP_LABELS[step]}</p>
        </div>
        <div
          className="h-1.5 overflow-hidden rounded-full bg-navy-100"
          role="progressbar"
          aria-valuenow={step + 1}
          aria-valuemin={1}
          aria-valuemax={STEP_LABELS.length}
          aria-label="Request progress"
        >
          <div
            className="h-full rounded-full bg-teal-600 transition-all"
            style={{ width: `${((step + 1) / STEP_LABELS.length) * 100}%` }}
          />
        </div>
      </div>

      <div key={step} className="animate-fade-up">
        {/* ------------------------------------------------ 1 concern */}
        {step === 0 ? (
          <section aria-labelledby="q1">
            <h1 id="q1" className="text-2xl font-semibold tracking-tight text-navy-900">
              What would you like help with?
            </h1>
            <p className="muted mt-1 text-sm">
              Pick the closest one. You are not committing to a subject — it just helps
              route you to the right person.
            </p>
            <div className="mt-4 space-y-2">
              {CONCERN_OPTIONS.map((c) => (
                <button
                  key={c}
                  onClick={() => setConcern(c)}
                  aria-pressed={concern === c}
                  className={cx(
                    "flex min-h-14 w-full items-center gap-3 rounded-2xl border px-4 text-left font-medium transition-colors",
                    concern === c
                      ? "border-teal-600 bg-teal-50 text-teal-900"
                      : "border-navy-200 bg-white text-navy-800 hover:border-navy-300 hover:bg-navy-50",
                  )}
                >
                  <span
                    className={cx(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                      concern === c ? "border-teal-600 bg-teal-600" : "border-navy-300",
                    )}
                    aria-hidden
                  >
                    {concern === c ? <span className="text-[0.6rem] text-white">✓</span> : null}
                  </span>
                  {c}
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {/* --------------------------------------------------- 2 mode */}
        {step === 1 ? (
          <section aria-labelledby="q2">
            <h1 id="q2" className="text-2xl font-semibold tracking-tight text-navy-900">
              How would you prefer to talk?
            </h1>
            <p className="muted mt-1 text-sm">
              Whatever costs you the least energy. You can change this later.
            </p>
            <div className="mt-4 space-y-2">
              {SUPPORT_MODES.map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  aria-pressed={mode === m}
                  className={cx(
                    "block w-full rounded-2xl border p-4 text-left transition-colors",
                    mode === m
                      ? "border-teal-600 bg-teal-50"
                      : "border-navy-200 bg-white hover:border-navy-300 hover:bg-navy-50",
                  )}
                >
                  <p className="font-medium text-navy-900">{m}</p>
                  <p className="muted mt-0.5 text-sm">{MODE_BLURB[m]}</p>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {/* --------------------------------------------------- 3 note */}
        {step === 2 ? (
          <section aria-labelledby="q3">
            <h1 id="q3" className="text-2xl font-semibold tracking-tight text-navy-900">
              Anything you&rsquo;d like them to know first?
            </h1>
            <p className="muted mt-1 text-sm">
              Completely optional. Some people find it easier to write the hardest sentence
              once, here, than to say it out loud later.
            </p>
            <Textarea
              rows={6}
              className="mt-4"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Leave this blank if you would rather just talk."
              aria-label="Optional note to the counsellor"
            />
            <Callout tone="amber" icon="👀" className="mt-3">
              If you write something here, the counsellor will read it. Nothing else you
              have written in MindEase travels with it.
            </Callout>
          </section>
        ) : null}

        {/* --------------------------------------------------- 4 scope */}
        {step === 3 ? (
          <section aria-labelledby="q4">
            <h1 id="q4" className="text-2xl font-semibold tracking-tight text-navy-900">
              What will be shared?
            </h1>
            <p className="muted mt-1 text-sm">
              Everything below starts OFF except the two things a counsellor cannot work
              without. You decide the rest, item by item.
            </p>

            <p
              className="mt-4 rounded-xl border border-navy-100 bg-navy-50 px-4 py-2.5 text-sm font-medium text-navy-800"
              aria-live="polite"
            >
              {sharedCount} {sharedCount === 1 ? "thing" : "things"} will be shared ·{" "}
              {withheldCount} withheld
            </p>

            <div className="mt-4 space-y-2">
              {scopeKeys.map((k) => {
                const copy = SCOPE_COPY[k];
                const on = scope[k];
                return (
                  <div
                    key={k}
                    className={cx(
                      "flex items-start justify-between gap-4 rounded-xl border p-4",
                      on ? "border-mint-200 bg-mint-50/60" : "border-navy-100 bg-white",
                    )}
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-navy-900">{copy.label}</p>
                      <p className="muted mt-0.5 text-sm">{copy.detail}</p>
                      {copy.required ? (
                        <p className="mt-1 text-xs text-navy-500 italic">
                          Needed to route your request to the right person.
                        </p>
                      ) : null}
                    </div>
                    <Toggle
                      checked={on}
                      disabled={copy.required}
                      onChange={(v) => setScope((s) => ({ ...s, [k]: v }))}
                      label={copy.label}
                    />
                  </div>
                );
              })}
            </div>

            <div className="mt-4 rounded-2xl border border-navy-200 bg-white p-4">
              <p className="text-sm font-semibold text-navy-900">
                Never shared, whatever you tick
              </p>
              <ul className="mt-2 space-y-1.5">
                {NEVER_SHARED.map((n) => (
                  <li key={n} className="flex gap-2 text-sm text-navy-500">
                    <span aria-hidden>✕</span>
                    {n}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}

        {/* ------------------------------------------------- 5 confirm */}
        {step === 4 ? (
          <section aria-labelledby="q5">
            <h1 id="q5" className="text-2xl font-semibold tracking-tight text-navy-900">
              Ready to send?
            </h1>
            <p className="muted mt-1 text-sm">
              One last look at exactly what leaves this device.
            </p>

            <dl className="mt-4 card divide-y divide-navy-50 p-0">
              <div className="flex justify-between gap-4 px-4 py-3">
                <dt className="muted text-sm">Concern</dt>
                <dd className="text-sm font-medium text-navy-900">{concern}</dd>
              </div>
              <div className="flex justify-between gap-4 px-4 py-3">
                <dt className="muted text-sm">Preferred mode</dt>
                <dd className="text-sm font-medium text-navy-900">{mode}</dd>
              </div>
              <div className="flex justify-between gap-4 px-4 py-3">
                <dt className="muted text-sm">Your note</dt>
                <dd className="text-sm font-medium text-navy-900">
                  {note.trim() ? "Included" : "None"}
                </dd>
              </div>
              <div className="flex justify-between gap-4 px-4 py-3">
                <dt className="muted text-sm">Data shared</dt>
                <dd className="text-sm font-medium text-navy-900">
                  {sharedCount} of {scopeKeys.length}
                </dd>
              </div>
            </dl>

            <Button
              tone="primary"
              size="lg"
              full
              className="mt-4"
              onClick={() => setConfirming(true)}
            >
              Review consent &amp; send
            </Button>
          </section>
        ) : null}
      </div>

      {/* ---------------------------------------------------- controls */}
      <div className="flex items-center gap-3">
        {step > 0 ? (
          <Button onClick={() => setStep((s) => s - 1)}>Back</Button>
        ) : (
          <Link href="/student/support" className="muted text-sm hover:underline">
            Cancel
          </Link>
        )}
        {step < 4 ? (
          <Button
            tone="primary"
            size="lg"
            className="ml-auto"
            disabled={!canContinue}
            onClick={() => setStep((s) => s + 1)}
          >
            {step === 2 && !note.trim() ? "Skip" : "Continue"}
          </Button>
        ) : null}
      </div>

      <ConsentDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={submit}
        scope={scope}
        purpose={`So a campus counsellor can respond to your request about ${
          concern?.toLowerCase() ?? "support"
        }.`}
      />
    </div>
  );
}
