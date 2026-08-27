"use client";

import Image from "next/image";
import Link from "next/link";
import { LandingFooter, LandingHeader } from "@/components/landing";
import { useStore } from "@/lib/store";

export default function LandingPage() {
  const { ready, state } = useStore();
  const studentDestination = ready && state.onboarded ? "/student/home" : "/onboarding";

  return (
    <div className="min-h-screen flex flex-col text-navy-950 font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* 1. Header (Sticky with crisis banner, logo, navigation links, Register CTA) */}
      <LandingHeader />

      {/* 2. Truly Fixed Viewport Background (Pinned sunny campus lawn) */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        <Image
          src="/images/hero-campus.jpg"
          alt="Campus Lawn and Students"
          fill
          priority
          quality={100}
          className="object-cover object-right md:object-[center_right]"
          sizes="100vw"
        />
        {/* Soft gradient wash on left for copy readability and contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/75 to-transparent sm:via-white/50 lg:from-white/90 lg:via-white/30 lg:to-transparent" />
      </div>

      {/* 3. Main Content Container (scrolls cleanly over fixed background) */}
      <div className="relative z-10 flex-1 w-full bg-transparent">
        {/* -------------------------------------------------- Hero Section */}
        <section id="main" className="w-full flex items-center pt-8 pb-10 sm:pt-12 sm:pb-14 lg:pt-16 lg:pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Headline, Subcopy, Action CTAs & Trust Badges */}
              <div className="lg:col-span-8 space-y-4 sm:space-y-5 animate-fade-up">
                {/* Top Pill Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-200 bg-white/85 backdrop-blur-md shadow-2xs text-xs font-bold text-teal-950">
                  <span className="h-2 w-2 rounded-full bg-teal-600 animate-pulse-soft" />
                  Anonymous Student Support
                </div>

                {/* Main Headline with Hand-Drawn Squiggle Underline Accent */}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-navy-950 leading-[1.12]">
                  Support you can reach{" "}
                  <span className="relative inline-block text-teal-800">
                    on your terms.
                    <svg
                      className="absolute -bottom-1.5 left-0 w-full h-2 text-teal-500/80"
                      viewBox="0 0 120 8"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      preserveAspectRatio="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M2 5C25 1.5 55 6.5 85 3C100 1.2 110 4.5 118 4"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </h1>

                {/* Honest & Factual Subcopy */}
                <p className="text-sm sm:text-base lg:text-lg text-navy-900 font-medium leading-relaxed bg-white/60 sm:bg-transparent backdrop-blur-xs sm:backdrop-blur-none p-3 sm:p-0 rounded-2xl max-w-2xl">
                  MindEase provides university students with anonymous peer chat, a private journal that stays on your device, and a consent-first counsellor pathway that only opens when you choose to open it.
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

                {/* Trust Indicators with Distinct SVG Icons */}
                <div className="pt-2 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-navy-950 font-bold">
                  {/* Shield / Client-Side */}
                  <span className="flex items-center gap-1.5 bg-white/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/80 shadow-2xs">
                    <svg
                      className="w-3.5 h-3.5 text-teal-700 shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    100% Client-Side Data
                  </span>

                  {/* Eye-Off / Anonymous */}
                  <span className="flex items-center gap-1.5 bg-white/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/80 shadow-2xs">
                    <svg
                      className="w-3.5 h-3.5 text-teal-700 shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                    Anonymous Pseudonyms
                  </span>

                  {/* Device / Zero Tracking */}
                  <span className="flex items-center gap-1.5 bg-white/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/80 shadow-2xs">
                    <svg
                      className="w-3.5 h-3.5 text-teal-700 shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
                      <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="3" />
                    </svg>
                    Zero Tracking
                  </span>
                </div>
              </div>

              {/* Right Column: Subtle Illustrative Feedback Card (Deliberate Asymmetric Touch) */}
              <div className="lg:col-span-4 hidden lg:flex justify-end">
                <div className="rounded-3xl border border-white/90 bg-white/75 backdrop-blur-xl p-5 shadow-xl shadow-navy-950/10 max-w-sm space-y-3 transform rotate-1 hover:rotate-0 transition-transform duration-300">
                  <div className="flex items-center gap-2 text-xs font-bold text-teal-900 tracking-wide uppercase">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                    Design Intent
                  </div>
                  <p className="text-sm font-medium text-navy-900 italic leading-relaxed">
                    &ldquo;When exam weeks got overwhelming, being able to chat without worrying about anyone finding out made all the difference.&rdquo;
                  </p>
                  <p className="text-[11px] font-semibold text-navy-600 border-t border-navy-100 pt-2">
                    The kind of student experience we are building for.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* -------------------------------------------------- Core Capabilities Section (Organic Pattern Layout) */}
        <section id="features" className="w-full pt-4 pb-14 sm:pt-6 sm:pb-20 bg-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            {/* Plain, Human, Non-Corporate Section Header */}
            <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
              <p className="text-xs font-extrabold uppercase tracking-wider text-teal-900 [text-shadow:_0_1px_1px_rgb(255_255_255_/_80%)]">
                How MindEase works
              </p>
              <h2 className="mt-1.5 text-2xl sm:text-3xl lg:text-3.5xl font-extrabold text-navy-950 tracking-tight [text-shadow:_0_1px_2px_rgb(255_255_255_/_60%)]">
                Care that respects your privacy from day one
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-navy-900 font-medium leading-relaxed [text-shadow:_0_1px_1px_rgb(255_255_255_/_80%)]">
                Every tool is designed to let you choose what to share, when to reach out, and who to connect with.
              </p>
            </div>

            {/* Asymmetric, Staggered Bento Cards with Hand-Crafted Personality */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 items-start">
              {/* Card 1: Anonymous Peer Chat (Col 7: Prominent, live feel) */}
              <div className="md:col-span-7 rounded-3xl border border-white/80 bg-white/70 backdrop-blur-xl p-6 sm:p-7 shadow-lg shadow-navy-950/5 transition-all duration-300 hover:bg-white/85 hover:shadow-xl hover:border-teal-200/90 group flex flex-col justify-between min-h-[260px] lg:min-h-[290px] relative overflow-hidden">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-[11px] font-bold text-teal-900 shadow-2xs">
                      <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse-soft" />
                      Live 1:1 · Ephemeral
                    </span>
                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0 transition-transform duration-300 group-hover:scale-105">
                      <Image
                        src="/images/features/peer-chat.png"
                        alt="Peer Chat Illustration"
                        fill
                        sizes="64px"
                        className="object-contain"
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-navy-950 tracking-tight">
                      Anonymous Peer Chat
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-navy-800 leading-relaxed font-normal max-w-lg">
                      Real-time 1:1 ephemeral conversations with fellow students. No real names, roll numbers, or chat histories are ever stored.
                    </p>
                  </div>
                </div>
                <div className="mt-5 pt-3.5 border-t border-navy-900/10">
                  <Link
                    href="/student/peer"
                    className="inline-flex items-center text-xs font-bold text-teal-800 hover:text-teal-950 hover:underline gap-1.5"
                  >
                    Try Peer Chat <span aria-hidden>→</span>
                  </Link>
                </div>
              </div>

              {/* Card 2: Private Local Journal (Col 5: Staggered taller offset) */}
              <div className="md:col-span-5 rounded-3xl border border-white/80 bg-white/70 backdrop-blur-xl p-6 sm:p-7 shadow-lg shadow-navy-950/5 transition-all duration-300 hover:bg-white/85 hover:shadow-xl hover:border-indigo-200/90 group flex flex-col justify-between min-h-[260px] lg:min-h-[290px] lg:translate-y-2 relative overflow-hidden">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-[11px] font-bold text-indigo-900 shadow-2xs">
                      🔒 Device-Only Storage
                    </span>
                    <div className="relative w-13 h-13 sm:w-15 sm:h-15 shrink-0 transition-transform duration-300 group-hover:scale-105">
                      <Image
                        src="/images/features/journal.png"
                        alt="Journal Illustration"
                        fill
                        sizes="60px"
                        className="object-contain"
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-navy-950 tracking-tight">
                      Private Local Journal
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-navy-800 leading-relaxed font-normal">
                      A safe place to write, reflect, and track mood trends. Your thoughts stay on your device and are never shared without permission.
                    </p>
                  </div>
                </div>
                <div className="mt-5 pt-3.5 border-t border-navy-900/10">
                  <Link
                    href="/student/journal"
                    className="inline-flex items-center text-xs font-bold text-teal-800 hover:text-teal-950 hover:underline gap-1.5"
                  >
                    Open Journal <span aria-hidden>→</span>
                  </Link>
                </div>
              </div>

              {/* Card 3: AI Support & Resources (Col 5: Grounding topics tags) */}
              <div className="md:col-span-5 rounded-3xl border border-white/80 bg-white/70 backdrop-blur-xl p-6 sm:p-7 shadow-lg shadow-navy-950/5 transition-all duration-300 hover:bg-white/85 hover:shadow-xl hover:border-amber-200/90 group flex flex-col justify-between min-h-[260px] lg:min-h-[290px] relative overflow-hidden">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-[11px] font-bold text-amber-900 shadow-2xs">
                      🌱 Self-Paced Guides
                    </span>
                    <div className="relative w-13 h-13 sm:w-15 sm:h-15 shrink-0 transition-transform duration-300 group-hover:scale-105">
                      <Image
                        src="/images/features/resources.png"
                        alt="Resources Illustration"
                        fill
                        sizes="60px"
                        className="object-contain"
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-navy-950 tracking-tight">
                      AI Support &amp; Resources
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-navy-800 leading-relaxed font-normal">
                      Self-check-in insights and tailored campus coping guides for exam stress, burnout, and sleep without automated diagnosis.
                    </p>
                  </div>
                </div>
                <div className="mt-5 pt-3.5 border-t border-navy-900/10">
                  <Link
                    href="/student/support"
                    className="inline-flex items-center text-xs font-bold text-teal-800 hover:text-teal-950 hover:underline gap-1.5"
                  >
                    Browse Library <span aria-hidden>→</span>
                  </Link>
                </div>
              </div>

              {/* Card 4: Consent-First Counselling (Col 7: Warm wide card) */}
              <div className="md:col-span-7 rounded-3xl border border-white/80 bg-white/70 backdrop-blur-xl p-6 sm:p-7 shadow-lg shadow-navy-950/5 transition-all duration-300 hover:bg-white/85 hover:shadow-xl hover:border-emerald-200/90 group flex flex-col justify-between min-h-[260px] lg:min-h-[290px] relative overflow-hidden">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-bold text-emerald-900 shadow-2xs">
                      🤝 Direct Campus Pathway
                    </span>
                    <div className="relative w-15 h-15 sm:w-18 sm:h-18 shrink-0 transition-transform duration-300 group-hover:scale-105">
                      <Image
                        src="/images/features/counselling.png"
                        alt="Counselling Illustration"
                        fill
                        sizes="72px"
                        className="object-contain"
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-navy-950 tracking-tight">
                      Consent-First Counselling
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-navy-800 leading-relaxed font-normal max-w-lg">
                      Connect with campus counsellors on your own terms. Choose exactly what information leaves your device item-by-item before booking.
                    </p>
                  </div>
                </div>
                <div className="mt-5 pt-3.5 border-t border-navy-900/10">
                  <Link
                    href="/student/support/request"
                    className="inline-flex items-center text-xs font-bold text-teal-800 hover:text-teal-950 hover:underline gap-1.5"
                  >
                    Book Support <span aria-hidden>→</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Wide Institutional Safety & Ethics Panel */}
            <div className="mt-8 sm:mt-10 rounded-3xl border border-white/80 bg-white/70 backdrop-blur-xl p-6 sm:p-8 shadow-lg shadow-navy-950/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-1.5">
                <span className="text-xs font-extrabold uppercase tracking-wider text-teal-900">
                  Institutional Safety &amp; Ethics
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold text-navy-950">
                  Your data stays yours. Period.
                </h3>
                <p className="text-xs sm:text-sm text-navy-800 max-w-2xl leading-relaxed font-normal">
                  Your pseudonym, device drafts, and check-in logs remain in local storage on your device. Nothing leaves without explicit, step-by-step consent.
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
