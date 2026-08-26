"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DataPermissionCard } from "@/components/privacy";
import { Button, Chip, SkeletonCard } from "@/components/ui";
import { cx } from "@/lib/format";
import { CONSENT_COPY, DEFAULT_CONSENT, generateIdentity } from "@/lib/privacy";
import { useStore } from "@/lib/store";
import { CONCERN_TAGS } from "@/lib/types";
import type { AnonymousIdentity, ConcernTag, ConsentKey, ConsentSettings, SupportRoleMode } from "@/lib/types";

const STEPS = [
  "Welcome",
  "Why MindEase",
  "Your privacy",
  "Your identity",
  "Preferences",
  "Consent",
  "Your role",
] as const;

const PRIVACY_CARDS = [
  {
    icon: "🕶️",
    title: "Anonymous by default",
    body: "Your identity is not shown to other students. You take part as a pseudonym, or an anonymous identity the app generates for you.",
    className: "border-mint-200 bg-mint-50",
  },
  {
    icon: "🔒",
    title: "Private journal",
    body: "Journal content stays private, held in the platform's protected storage model on your device.",
    className: "border-info-200 bg-info-50",
  },
  {
    icon: "🤖",
    title: "AI support",
    body: "AI can identify support indicators. It does not diagnose mental illness, and it never contacts anyone on your behalf.",
    className: "border-pro-200 bg-pro-50",
  },
  {
    icon: "🤝",
    title: "Counsellor pathway",
    body: "Direct help can be requested through an explicit, clearly explained consent pathway — one you open yourself.",
    className: "border-amber-200 bg-amber-50",
  },
];

const REASONS = [
  {
    icon: "💬",
    title: "Someone who actually gets it",
    body: "Other students on your campus, writing about the same term, the same hostel, the same placement season — without anyone knowing who said what.",
  },
  {
    icon: "📓",
    title: "A private place to think",
    body: "Somewhere to put the thought that has been circling since 2am, that nobody else ever reads.",
  },
  {
    icon: "🚪",
    title: "Help that waits until you want it",
    body: "A counsellor is one tap away when you decide you want one. Until then, nothing about you is sent anywhere.",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { ready, state, completeOnboarding } = useStore();

  const [step, setStep] = useState(0);
  const [identity, setIdentity] = useState<AnonymousIdentity | null>(null);
  const [interests, setInterests] = useState<ConcernTag[]>([]);
  const [consent, setConsent] = useState<ConsentSettings>({ ...DEFAULT_CONSENT });
  const [supportMode, setSupportMode] = useState<SupportRoleMode>("seeking");

  if (!ready) {
    return (
      <main id="main" className="mx-auto max-w-xl px-5 py-16">
        <SkeletonCard />
      </main>
    );
  }

  const ensureIdentity = () => {
    if (!identity) setIdentity(generateIdentity());
  };

  const next = () => {
    if (step === 2) ensureIdentity();
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };
  const back = () => setStep((s) => Math.max(0, s - 1));

  const finish = () => {
    const id = identity ?? generateIdentity();
    completeOnboarding(id, consent, supportMode);
    router.replace("/student/home");
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <main id="main" className="mx-auto max-w-xl px-5 pt-8 pb-16">
      {state.onboarded ? (
        <p className="muted mb-6 rounded-xl border border-navy-100 bg-white px-4 py-2.5 text-sm">
          You have already set MindEase up on this device.{" "}
          <Link
            href="/student/home"
            className="font-medium text-teal-800 underline underline-offset-2"
          >
            Continue to Home
          </Link>
          , or walk through it again below.
        </p>
      ) : null}

      {/* step indicator */}
      <div className="mb-8">
        <div className="mb-2 flex items-baseline justify-between">
          <p className="text-xs font-medium tracking-wide text-navy-500 uppercase">
            Step {step + 1} of {STEPS.length}
          </p>
          <p className="text-xs font-medium text-navy-700">{STEPS[step]}</p>
        </div>
        <div
          className="h-1.5 overflow-hidden rounded-full bg-navy-100"
          role="progressbar"
          aria-valuenow={step + 1}
          aria-valuemin={1}
          aria-valuemax={STEPS.length}
          aria-label="Onboarding progress"
        >
          <div
            className="h-full rounded-full bg-teal-600 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div key={step} className="animate-fade-up">
        {/* ---------------------------------------------------- 1 welcome */}
        {step === 0 ? (
          <section aria-labelledby="s0">
            <span
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-900 text-lg font-bold text-white"
              aria-hidden
            >
              M
            </span>
            <h1 id="s0" className="mt-6 text-3xl font-semibold tracking-tight text-navy-900">
              Welcome to MindEase
            </h1>
            <p className="mt-3 text-base text-navy-700">
              A quieter corner of campus: anonymous peer support, a private place to
              think, and a counsellor when you decide you want one.
            </p>
            <p className="muted mt-4 text-sm">
              We are not going to ask for your name, your email or your roll number.
              Before anything else, here is exactly how this works.
            </p>
          </section>
        ) : null}

        {/* ------------------------------------------------ 2 why mindease */}
        {step === 1 ? (
          <section aria-labelledby="s1">
            <h1 id="s1" className="text-2xl font-semibold tracking-tight text-navy-900">
              Why students use MindEase
            </h1>
            <div className="mt-6 space-y-3">
              {REASONS.map((r) => (
                <div
                  key={r.title}
                  className="card flex gap-4 p-4"
                >
                  <span className="text-2xl" aria-hidden>
                    {r.icon}
                  </span>
                  <div>
                    <h2 className="font-semibold text-navy-900">{r.title}</h2>
                    <p className="muted mt-0.5 text-sm">{r.body}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="muted mt-5 text-sm">
              Feeling stretched during a hard term is an ordinary human response to a
              hard term. Using this does not mean anything is wrong with you.
            </p>
          </section>
        ) : null}

        {/* --------------------------------------------------- 3 privacy */}
        {step === 2 ? (
          <section aria-labelledby="s2">
            <h1 id="s2" className="text-2xl font-semibold tracking-tight text-navy-900">
              Your privacy, in plain language
            </h1>
            <p className="muted mt-2 text-sm">
              Four promises. Each one is a setting you control, not a policy you have to
              trust.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {PRIVACY_CARDS.map((c) => (
                <div key={c.title} className={cx("rounded-2xl border p-4", c.className)}>
                  <p className="text-xl" aria-hidden>
                    {c.icon}
                  </p>
                  <h2 className="mt-1.5 font-semibold text-navy-900">{c.title}</h2>
                  <p className="mt-1 text-sm text-navy-700">{c.body}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* -------------------------------------------------- 4 identity */}
        {step === 3 ? (
          <section aria-labelledby="s3">
            <h1 id="s3" className="text-2xl font-semibold tracking-tight text-navy-900">
              This is who you are here
            </h1>
            <p className="muted mt-2 text-sm">
              Generated on this device a moment ago. It is not derived from anything about
              you, and nothing links it back to your name, email or roll number.
            </p>

            <div className="mt-6 rounded-2xl border border-teal-200 bg-teal-50 px-6 py-8 text-center">
              <p className="text-xs font-medium tracking-wide text-teal-800 uppercase">
                Your anonymous identity
              </p>
              <p className="mt-2 font-mono text-2xl font-semibold tracking-tight text-navy-900">
                {identity?.handle ?? "…"}
              </p>
              <p className="muted mt-2 text-xs">
                Counsellors see only the case id{" "}
                <span className="font-mono">{identity?.caseId ?? "…"}</span>, never a name.
              </p>
              <Button
                size="sm"
                className="mt-4"
                onClick={() => setIdentity(generateIdentity())}
              >
                Generate a different one
              </Button>
            </div>

            <div className="mt-5 rounded-xl border border-navy-100 bg-white p-4">
              <p className="text-sm font-medium text-navy-900">
                There is no profile to fill in — on purpose.
              </p>
              <p className="muted mt-1 text-sm">
                No photo, no bio, no course, no year. A profile is the thing that makes
                someone identifiable, so MindEase does not have one.
              </p>
            </div>
          </section>
        ) : null}

        {/* ----------------------------------------------- 5 preferences */}
        {step === 4 ? (
          <section aria-labelledby="s4">
            <h1 id="s4" className="text-2xl font-semibold tracking-tight text-navy-900">
              Anything on your mind lately?
            </h1>
            <p className="muted mt-2 text-sm">
              Entirely optional, and only used so the app can suggest relevant resources.
              You can change this any time, or skip it and lose nothing.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {CONCERN_TAGS.map((t) => (
                <Chip
                  key={t}
                  selected={interests.includes(t)}
                  onClick={() =>
                    setInterests((prev) =>
                      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
                    )
                  }
                >
                  {t}
                </Chip>
              ))}
            </div>
            <p className="muted mt-5 text-sm" aria-live="polite">
              {interests.length
                ? `${interests.length} selected. Stored on this device only.`
                : "Nothing selected — that is a perfectly good answer."}
            </p>
          </section>
        ) : null}

        {/* --------------------------------------------------- 6 consent */}
        {step === 5 ? (
          <section aria-labelledby="s5">
            <h1 id="s5" className="text-2xl font-semibold tracking-tight text-navy-900">
              What you are switching on
            </h1>
            <p className="muted mt-2 text-sm">
              Sharing with a counsellor and sharing your journal both start OFF. Nothing
              turns them on but you.
            </p>
            <div className="mt-5 space-y-2.5">
              {(Object.keys(CONSENT_COPY) as ConsentKey[]).map((key) => (
                 <DataPermissionCard
                   key={key}
                   label={CONSENT_COPY[key].label}
                   why={CONSENT_COPY[key].why}
                   sensitive={CONSENT_COPY[key].sensitive}
                   checked={consent[key]}
                   onChange={(v) => setConsent((c) => ({ ...c, [key]: v }))}
                 />
              ))}
            </div>
          </section>
        ) : null}

        {/* ------------------------------------------------ 7 your role */}
        {step === 6 ? (
          <section aria-labelledby="s6">
            <h1 id="s6" className="text-2xl font-semibold tracking-tight text-navy-900">
              How would you like to start?
            </h1>
            <p className="muted mt-2 text-sm">
              Choose your initial focus. This is purely a role mode — your anonymous identity stays
              identical either way, and you can switch roles anytime.
            </p>

            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={() => setSupportMode("seeking")}
                className={cx(
                  "w-full text-left rounded-2xl border-2 p-5 transition-all cursor-pointer flex items-start gap-4",
                  supportMode === "seeking"
                    ? "border-teal-600 bg-teal-50/70 shadow-sm"
                    : "border-navy-100 bg-white hover:border-navy-200",
                )}
              >
                <span className="text-3xl" aria-hidden>
                  🌱
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-navy-900">Get support</h2>
                    {supportMode === "seeking" ? (
                      <span className="text-xs font-semibold text-teal-800 bg-teal-100 px-2.5 py-0.5 rounded-full">
                        Selected
                      </span>
                    ) : null}
                  </div>
                  <p className="muted mt-1 text-sm">
                    Access private journaling, daily check-ins, campus resources, and peer or counsellor support when you need it.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSupportMode("supporting")}
                className={cx(
                  "w-full text-left rounded-2xl border-2 p-5 transition-all cursor-pointer flex items-start gap-4",
                  supportMode === "supporting"
                    ? "border-teal-600 bg-teal-50/70 shadow-sm"
                    : "border-navy-100 bg-white hover:border-navy-200",
                )}
              >
                <span className="text-3xl" aria-hidden>
                  🤝
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-navy-900">Support someone as a peer</h2>
                    {supportMode === "supporting" ? (
                      <span className="text-xs font-semibold text-teal-800 bg-teal-100 px-2.5 py-0.5 rounded-full">
                        Selected
                      </span>
                    ) : null}
                  </div>
                  <p className="muted mt-1 text-sm">
                    Opt in to be available for 1:1 anonymous chat with peers on campus. No obligations, no identity exposure.
                  </p>
                </div>
              </button>
            </div>

            <div className="mt-6 rounded-xl border border-navy-100 bg-navy-50/60 p-4 text-xs text-navy-700">
              <p>
                💡 <strong>Remember:</strong> There are no separate accounts or forms. You can toggle between seeking and supporting at any time from your sidebar or settings.
              </p>
            </div>
          </section>
        ) : null}
      </div>

      {/* ------------------------------------------------------- controls */}
      <div className="mt-8 flex items-center gap-3">
        {step > 0 ? (
          <Button onClick={back}>Back</Button>
        ) : (
          <Link href="/" className="muted text-sm hover:underline">
            Not now
          </Link>
        )}

        <div className="ml-auto flex items-center gap-3">
          {step === 4 ? (
            <Button tone="ghost" onClick={next}>
              Skip
            </Button>
          ) : null}
          {step < STEPS.length - 1 ? (
            <Button tone="primary" size="lg" onClick={next}>
              {step === 0 ? "Get started" : "Continue"}
            </Button>
          ) : (
            <Button tone="primary" size="lg" onClick={finish}>
              Enter MindEase
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}
