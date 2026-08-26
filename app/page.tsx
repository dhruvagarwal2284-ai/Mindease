"use client";

import Image from "next/image";
import Link from "next/link";
import { LandingFooter, LandingHeader } from "@/components/landing";
import { useStore } from "@/lib/store";

const FEATURES = [
  {
    icon: "🕶️",
    title: "Anonymous Peer Chat",
    description:
      "Real-time 1:1 ephemeral conversations with fellow students. No real names, roll numbers, or chat histories are ever stored.",
    link: "/student/peer",
    linkText: "Try Peer Chat",
    badgeTone: "bg-teal-50/90 border-teal-200/80 text-teal-900",
  },
  {
    icon: "🔒",
    title: "Private Local Journal",
    description:
      "A safe place to write, reflect, and track mood trends. Your thoughts remain encrypted on your device and are never shared without permission.",
    link: "/student/journal",
    linkText: "Open Journal",
    badgeTone: "bg-indigo-50/90 border-indigo-200/80 text-indigo-950",
  },
  {
    icon: "🤖",
    title: "AI Support & Resources",
    description:
      "Intelligent self-check-in insights and tailored campus coping guides for exam stress, burnout, and sleep without automated diagnosis.",
    link: "/student/support",
    linkText: "Browse Library",
    badgeTone: "bg-purple-50/90 border-purple-200/80 text-purple-950",
  },
  {
    icon: "🤝",
    title: "Consent-First Counselling",
    description:
      "Connect with campus counsellors on your own terms. Choose exactly what information leaves your device item-by-item before booking.",
    link: "/student/support/request",
    linkText: "Book Support",
    badgeTone: "bg-emerald-50/90 border-emerald-200/80 text-emerald-950",
  },
];

export default function LandingPage() {
  const { ready, state } = useStore();
  const studentDestination = ready && state.onboarded ? "/student/home" : "/onboarding";

  return (
    <div className="min-h-screen flex flex-col text-navy-950 font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* 1. Header (Sticky, with emergency banner, logo, affirmative tagline, Register button) */}
      <LandingHeader microTagline="Support, at your own pace." />

      {/* 2. Truly Fixed Viewport Background (Stays 100% pinned behind all pre-footer content) */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        <Image
          src="/images/hero-campus-watercolor.png"
          alt="MindEase Campus Illustration"
          fill
          priority
          quality={100}
          className="object-cover object-right md:object-[center_right]"
          sizes="100vw"
        />
        {/* Soft wash on far left for copy contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/40 to-transparent sm:via-white/20 lg:from-white/80 lg:via-transparent" />
      </div>

      {/* 3. Main Content Container (scrolls over fixed background) */}
      <div className="relative z-10 flex-1 w-full bg-transparent">
        {/* -------------------------------------------------- Hero Section (Higher Spacing, Less Wasted Gap) */}
        <section id="main" className="w-full flex items-center pt-6 pb-8 sm:pt-10 sm:pb-12 lg:pt-14 lg:pb-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
            <div className="max-w-xl lg:max-w-2xl space-y-4 sm:space-y-5 animate-fade-up">
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full border border-teal-200 bg-white/80 backdrop-blur shadow-2xs text-xs font-bold text-teal-950">
                <span className="h-2 w-2 rounded-full bg-teal-600 animate-pulse-soft" />
                Zero-Knowledge · Anonymous Student Support
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-navy-950 leading-[1.12]">
                Support you can reach without giving up your privacy.
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-navy-900 font-medium leading-relaxed bg-white/50 sm:bg-transparent backdrop-blur-xs sm:backdrop-blur-none p-2.5 sm:p-0 rounded-xl">
                MindEase provides university students with anonymous peer chat, an encrypted on-device journal, and a consent-first counsellor pathway that only opens when you choose to open it.
              </p>

              {/* Action Buttons Group */}
              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <Link
                  href={studentDestination}
                  className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-sm sm:text-base shadow-xs transition-all text-center active:scale-98"
                >
                  {ready && state.onboarded ? "Continue as Student →" : "Enter as Student →"}
                </Link>
                <Link
                  href="/counsellor/dashboard"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white/80 hover:bg-white backdrop-blur-sm text-navy-950 font-bold text-sm sm:text-base border border-navy-200 shadow-2xs transition-all text-center active:scale-98"
                >
                  Counsellor Platform
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-2 flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-navy-950 font-bold">
                <span className="flex items-center gap-1.5 bg-white/60 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-white/60 shadow-2xs">
                  <span className="text-teal-700 font-extrabold" aria-hidden>✓</span> 100% Client-Side Data
                </span>
                <span className="flex items-center gap-1.5 bg-white/60 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-white/60 shadow-2xs">
                  <span className="text-teal-700 font-extrabold" aria-hidden>✓</span> Anonymous Pseudonyms
                </span>
                <span className="flex items-center gap-1.5 bg-white/60 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-white/60 shadow-2xs">
                  <span className="text-teal-700 font-extrabold" aria-hidden>✓</span> Zero Tracking
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* -------------------------------------------------- Core Capabilities Section (Glassmorphic Cards Over Image) */}
        <section id="features" className="w-full pt-2 pb-14 sm:pt-4 sm:pb-18 bg-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
              <p className="text-xs font-extrabold uppercase tracking-wider text-teal-900 [text-shadow:_0_1px_1px_rgb(255_255_255_/_80%)]">
                Core Capabilities
              </p>
              <h2 className="mt-1.5 text-2xl sm:text-3xl lg:text-3.5xl font-extrabold text-navy-950 tracking-tight [text-shadow:_0_1px_2px_rgb(255_255_255_/_60%)]">
                Designed around student trust &amp; safety
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-navy-900 font-medium leading-relaxed [text-shadow:_0_1px_1px_rgb(255_255_255_/_80%)]">
                Every feature eliminates social stigma and removes technical barriers to seeking timely mental health support.
              </p>
            </div>

            {/* 4 Feature Cards (Glassmorphic Frosted Glass Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {FEATURES.map((feat) => (
                <div
                  key={feat.title}
                  className="rounded-3xl border border-white/80 bg-white/65 backdrop-blur-xl p-5 sm:p-6 shadow-lg shadow-navy-950/5 transition-all duration-300 hover:-translate-y-1.5 hover:bg-white/80 hover:shadow-xl hover:border-white flex flex-col justify-between group"
                >
                  <div>
                    <div
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border text-lg mb-3 shadow-2xs ${feat.badgeTone}`}
                      aria-hidden
                    >
                      {feat.icon}
                    </div>
                    <h3 className="text-base font-extrabold text-navy-950 tracking-tight">
                      {feat.title}
                    </h3>
                    <p className="mt-1.5 text-xs sm:text-sm text-navy-800 leading-relaxed font-normal">
                      {feat.description}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-navy-900/10">
                    <Link
                      href={feat.link}
                      className="inline-flex items-center text-xs font-bold text-teal-800 hover:text-teal-950 hover:underline gap-1"
                    >
                      {feat.linkText} <span aria-hidden>→</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Wide Institutional Safety & Ethics Panel (Glassmorphic Frosted Glass Block) */}
            <div className="mt-8 sm:mt-10 rounded-3xl border border-white/80 bg-white/65 backdrop-blur-xl p-5 sm:p-7 shadow-lg shadow-navy-950/5 flex flex-col md:flex-row items-center justify-between gap-5">
              <div className="space-y-1">
                <span className="text-xs font-extrabold uppercase tracking-wider text-teal-900">
                  Institutional Safety &amp; Ethics
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold text-navy-950">
                  Never shared, whatever happens.
                </h3>
                <p className="text-xs sm:text-sm text-navy-800 max-w-2xl leading-relaxed font-normal">
                  Your real name, roll number, device identifiers, private journal thoughts, and browsing history stay on your device unless you explicitly choose to disclose them.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <Link
                  href="/register-as-peer"
                  className="px-5 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs sm:text-sm font-bold shadow-2xs transition-colors"
                >
                  Join as Peer Supporter
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* 4. Footer sits in normal document flow and covers the fixed background */}
      <LandingFooter />
    </div>
  );
}
