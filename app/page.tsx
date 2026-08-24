"use client";

import Link from "next/link";
import { LinkButton } from "@/components/ui";
import { useStore } from "@/lib/store";

const PROMISES = [
  {
    icon: "🕶️",
    title: "Anonymous by default",
    body: "Your identity is not shown to other students. You take part as a pseudonym generated on your device.",
    tone: "border-mint-200 bg-mint-50",
  },
  {
    icon: "🔒",
    title: "Private journal",
    body: "Your journal stays on your device. Counsellors cannot read it unless you explicitly share an entry.",
    tone: "border-info-200 bg-info-50",
  },
  {
    icon: "🤖",
    title: "AI support, not diagnosis",
    body: "The model can notice support indicators in your own check-ins. It never labels you and never contacts anyone by itself.",
    tone: "border-pro-200 bg-pro-50",
  },
  {
    icon: "🤝",
    title: "Counsellor pathway",
    body: "Direct help is opt-in. You see the exact list of what will be shared before anything is sent.",
    tone: "border-amber-200 bg-amber-50",
  },
];

export default function LandingPage() {
  const { ready, state } = useStore();

  return (
    <main id="main" className="mx-auto max-w-4xl px-5 py-12 sm:py-16">
      <div className="flex items-center gap-2.5">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 font-bold text-white"
          aria-hidden
        >
          M
        </span>
        <div>
          <p className="font-semibold tracking-tight text-navy-900">MindEase Campus</p>
          <p className="muted text-xs">Digital psychological support for students</p>
        </div>
      </div>

      <h1 className="mt-9 text-3xl leading-tight font-semibold tracking-tight text-navy-900 sm:text-4xl">
        Support you can reach without
        <br className="hidden sm:block" /> giving up your privacy.
      </h1>
      <p className="muted mt-3 max-w-2xl text-base">
        Anonymous peer support, a private place to think, and a counsellor pathway that
        only opens when you choose to open it. Here is the promise, before you tell us
        anything at all.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {PROMISES.map((p) => (
          <div key={p.title} className={`rounded-2xl border p-5 ${p.tone}`}>
            <p className="text-xl" aria-hidden>
              {p.icon}
            </p>
            <h2 className="mt-2 font-semibold text-navy-900">{p.title}</h2>
            <p className="mt-1 text-sm text-navy-700">{p.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-9 flex flex-col gap-3 sm:flex-row">
        <LinkButton
          href={ready && state.onboarded ? "/student/home" : "/onboarding"}
          tone="primary"
          size="lg"
          className="sm:flex-1"
        >
          {ready && state.onboarded ? "Continue as a student" : "Enter as a student"}
        </LinkButton>
        <LinkButton href="/counsellor/dashboard" tone="pro" size="lg" className="sm:flex-1">
          Counsellor platform
        </LinkButton>
      </div>

      <Link
        href="/student/help"
        className="mt-4 flex min-h-14 items-center gap-3 rounded-2xl border border-urgent-200 bg-urgent-50 px-4 transition-colors hover:bg-urgent-100"
      >
        <span className="text-xl" aria-hidden>
          🆘
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold text-urgent-900">
            Need support right now?
          </span>
          <span className="block text-sm text-urgent-900/80">
            Go straight to help — no setup, no account, nothing to fill in first.
          </span>
        </span>
        <span className="muted shrink-0 text-sm" aria-hidden>
          ›
        </span>
      </Link>

      <p className="muted mt-4 text-sm">
        Both roles run in this browser so the whole journey can be demonstrated end to
        end. Nothing is uploaded anywhere.{" "}
        <Link href="/demo" className="font-medium text-teal-800 hover:underline">
          Open the demo script →
        </Link>
      </p>

      <footer className="muted mt-12 border-t border-navy-100 pt-5 text-xs">
        <p>
          Prototype for SIH problem statement SW-55. Crisis and helpline contacts are
          intentionally left unconfigured — a deployment supplies verified institutional
          numbers.
        </p>
      </footer>
    </main>
  );
}
