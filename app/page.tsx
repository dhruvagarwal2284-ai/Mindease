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
    badgeTone: "bg-teal-50 text-teal-800 border-teal-200",
  },
  {
    icon: "🔒",
    title: "Private Local Journal",
    description:
      "A safe place to write, reflect, and track mood trends. Your thoughts remain encrypted on your device and are never shared without permission.",
    link: "/student/journal",
    linkText: "Open Journal",
    badgeTone: "bg-indigo-50 text-indigo-800 border-indigo-200",
  },
  {
    icon: "🤖",
    title: "AI Support & Resources",
    description:
      "Intelligent self-check-in insights and tailored campus coping guides for exam stress, burnout, and sleep without automated diagnosis.",
    link: "/student/support",
    linkText: "Browse Library",
    badgeTone: "bg-purple-50 text-purple-800 border-purple-200",
  },
  {
    icon: "🤝",
    title: "Consent-First Counselling",
    description:
      "Connect with campus counsellors on your own terms. Choose exactly what information leaves your device item-by-item before booking.",
    link: "/student/support/request",
    linkText: "Book Support",
    badgeTone: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
];

export default function LandingPage() {
  const { ready, state } = useStore();
  const studentDestination = ready && state.onboarded ? "/student/home" : "/onboarding";

  return (
    <div className="min-h-screen flex flex-col text-navy-900 font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* 1. Header (Sticky, with emergency banner, logo, affirmative tagline, Register button) */}
      <LandingHeader microTagline="Support, at your own pace." />

      {/* 2. Main Wrapper with Continuous Sticky Background (wraps everything before footer) */}
      <div className="relative flex-1 w-full overflow-hidden">
        {/* Sticky Pinned Background Layer (visible continuously through hero, features, and safety) */}
        <div
          aria-hidden="true"
          className="pointer-events-none sticky top-0 h-screen w-full -mb-[100vh] z-0 overflow-hidden"
        >
          <Image
            src="/images/hero-campus-watercolor.png"
            alt="MindEase Campus Illustration"
            fill
            priority
            quality={95}
            className="object-cover object-right md:object-[center_right]"
            sizes="100vw"
          />
          {/* Subtle soft gradient wash on left side to guarantee WCAG AA text contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent sm:via-white/60 lg:from-white/90 lg:via-white/30 lg:to-transparent" />
        </div>

        {/* -------------------------------------------------- Hero Section */}
        <section id="main" className="relative z-10 w-full min-h-[calc(100vh-5rem)] flex items-center py-14 sm:py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
            <div className="max-w-xl lg:max-w-2xl space-y-6 animate-fade-up">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-teal-200 bg-white/90 backdrop-blur shadow-2xs text-xs font-semibold text-teal-900">
                <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse-soft" />
                Zero-Knowledge · Anonymous Student Support
              </div>

              <h1 className="text-3.5xl sm:text-4.5xl lg:text-5.5xl font-extrabold tracking-tight text-navy-900 leading-[1.12]">
                Support you can reach without giving up your privacy.
              </h1>

              <p className="text-base sm:text-lg text-navy-800 leading-relaxed font-normal bg-white/70 sm:bg-transparent backdrop-blur-xs sm:backdrop-blur-none p-3 sm:p-0 rounded-xl">
                MindEase provides university students with anonymous peer chat, an encrypted on-device journal, and a consent-first counsellor pathway that only opens when you choose to open it.
              </p>

              {/* Action Buttons Group */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href={studentDestination}
                  className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm sm:text-base shadow-2xs transition-all text-center active:scale-98"
                >
                  {ready && state.onboarded ? "Continue as Student →" : "Enter as Student →"}
                </Link>
                <Link
                  href="/counsellor/dashboard"
                  className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-white/90 backdrop-blur hover:bg-white text-navy-900 font-semibold text-sm sm:text-base border border-navy-200 shadow-2xs transition-all text-center active:scale-98"
                >
                  Counsellor Platform
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-navy-700 font-medium">
                <span className="flex items-center gap-1.5 bg-white/85 backdrop-blur px-2.5 py-1 rounded-md border border-gray-200/60 shadow-2xs">
                  <span className="text-teal-600 font-bold" aria-hidden>✓</span> 100% Client-Side Data
                </span>
                <span className="flex items-center gap-1.5 bg-white/85 backdrop-blur px-2.5 py-1 rounded-md border border-gray-200/60 shadow-2xs">
                  <span className="text-teal-600 font-bold" aria-hidden>✓</span> Anonymous Pseudonyms
                </span>
                <span className="flex items-center gap-1.5 bg-white/85 backdrop-blur px-2.5 py-1 rounded-md border border-gray-200/60 shadow-2xs">
                  <span className="text-teal-600 font-bold" aria-hidden>✓</span> Zero Tracking
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* -------------------------------------------------- Core Capabilities Section (Continuous Background with Frosted Content Blocks) */}
        <section id="features" className="relative z-10 w-full py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            {/* Header Block in Soft Frosted Glass */}
            <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 p-6 sm:p-8 rounded-3xl bg-white/80 backdrop-blur-md border border-white/80 shadow-2xs">
              <p className="text-xs font-bold uppercase tracking-wider text-teal-800">
                Core Capabilities
              </p>
              <h2 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-extrabold text-navy-900 tracking-tight">
                Designed around student trust &amp; safety
              </h2>
              <p className="mt-3 text-sm sm:text-base text-navy-700 leading-relaxed font-normal">
                Every feature eliminates social stigma and removes technical barriers to seeking timely mental health support.
              </p>
            </div>

            {/* 4 Feature Cards (Frosted Glass on individual cards, open background shows between) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {FEATURES.map((feat) => (
                <div
                  key={feat.title}
                  className="rounded-2xl border border-white/80 bg-white/80 backdrop-blur-md p-6 shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:bg-white/90 hover:shadow-xs hover:border-teal-200 flex flex-col justify-between group"
                >
                  <div>
                    <div
                      className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border text-xl mb-3.5 shadow-2xs ${feat.badgeTone}`}
                      aria-hidden
                    >
                      {feat.icon}
                    </div>
                    <h3 className="text-base font-bold text-navy-900 tracking-tight">
                      {feat.title}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-navy-700 leading-relaxed font-normal">
                      {feat.description}
                    </p>
                  </div>
                  <div className="mt-5 pt-3.5 border-t border-navy-100/60">
                    <Link
                      href={feat.link}
                      className="inline-flex items-center text-xs font-bold text-teal-800 hover:text-teal-900 hover:underline gap-1"
                    >
                      {feat.linkText} <span aria-hidden>→</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Institutional Privacy Guarantee Box (Frosted Glass Block) */}
            <div className="mt-10 sm:mt-12 rounded-2xl border border-white/80 bg-white/80 backdrop-blur-md p-6 sm:p-8 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
                  Institutional Safety &amp; Ethics
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-navy-900">
                  Never shared, whatever happens.
                </h3>
                <p className="text-xs sm:text-sm text-navy-700 max-w-2xl leading-relaxed font-normal">
                  Your real name, roll number, device identifiers, private journal thoughts, and browsing history stay on your device unless you explicitly choose to disclose them.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <Link
                  href="/register-as-peer"
                  className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs sm:text-sm font-semibold shadow-2xs transition-colors"
                >
                  Join as Peer Supporter
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* 3. Footer sits OUTSIDE the sticky background wrapper */}
      <LandingFooter />
    </div>
  );
}
