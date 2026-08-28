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

      {/* 2. Truly Fixed Viewport Background (Pinned sunny campus lawn with reduced right-side fade) */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        <Image
          src="/images/hero-campus.jpg"
          alt="Campus Sunrise Pathway"
          fill
          priority
          quality={100}
          className="object-cover object-center md:object-[center_right]"
          sizes="100vw"
        />
        {/* Horizontal contrast wash focused cleanly on left side (right side fade reduced by 10%) */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/55 to-transparent sm:via-white/35 sm:to-transparent lg:from-white/85 lg:via-white/20 lg:to-transparent" />
        {/* Soft bottom diffusion */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-white/60" />
      </div>

      {/* 3. Main Content Container (scrolls cleanly over fixed background) */}
      <div className="relative z-10 flex-1 w-full bg-transparent">
        {/* -------------------------------------------------- Hero Section */}
        <section id="main" className="w-full flex items-center pt-8 pb-10 sm:pt-12 sm:pb-14 lg:pt-16 lg:pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Headline, Subcopy, Action CTAs & Trust Badges */}
              <div className="lg:col-span-8 space-y-5 animate-fade-up">
                {/* Top Pill Badge */}
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-teal-200/90 bg-white/85 backdrop-blur-xl shadow-2xs text-xs sm:text-sm font-bold text-navy-950">
                  <span className="h-2.5 w-2.5 rounded-full bg-teal-600 shrink-0" />
                  Anonymous Student Support
                </div>

                {/* Main Headline with Hand-Drawn Rough/Human Underline */}
                <h1 className="text-4xl sm:text-5xl lg:text-[4.2rem] font-black tracking-tight text-navy-950 leading-[1.04] sm:leading-[1.02]">
                  Support you can<br />
                  reach<br />
                  <span className="relative inline-block text-[#0e5043] pb-3">
                    on your terms.
                    <svg
                      className="absolute -bottom-1 left-0 w-full h-3.5 text-[#0e5043] overflow-visible"
                      viewBox="0 0 250 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      preserveAspectRatio="none"
                      aria-hidden="true"
                    >
                      {/* Main hand-drawn rough stroke with organic taper */}
                      <path
                        d="M3 8.5C38 3.5 95 11.5 152 5C188 1.5 224 8 247 6.5C215 9.5 145 12 78 10C38 8.8 12 7 4 9.5"
                        fill="currentColor"
                      />
                      {/* Secondary rough sketchy undertone */}
                      <path
                        d="M18 11.5C65 7 140 12.5 210 8.5C232 7.2 244 8.5 248 9"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        opacity="0.85"
                      />
                    </svg>
                  </span>
                </h1>

                {/* Subcopy */}
                <p className="text-sm sm:text-base lg:text-lg text-navy-900 font-medium leading-relaxed max-w-2xl bg-white/40 sm:bg-transparent backdrop-blur-xs sm:backdrop-blur-none p-2 sm:p-0 rounded-xl">
                  MindEase provides university students with anonymous peer chat, a private journal that stays on your device, and a consent-first counsellor pathway that only opens when you choose to open it.
                </p>

                {/* Action Buttons Group */}
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <Link
                    href={studentDestination}
                    className="inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-[#0f4b40] hover:bg-[#0b3b32] text-white font-bold text-base sm:text-lg shadow-sm transition-all text-center active:scale-98"
                  >
                    {ready && state.onboarded ? "Continue as Student →" : "Enter as Student →"}
                  </Link>
                  <Link
                    href="/counsellor/dashboard"
                    className="inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-white/90 hover:bg-white text-navy-950 font-bold text-base sm:text-lg border border-navy-200/90 shadow-sm transition-all text-center active:scale-98 backdrop-blur-md"
                  >
                    Counsellor Platform
                  </Link>
                </div>

                {/* Trust Indicators: Rounded Pill Badges */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center px-5 py-2.5 rounded-full bg-white/85 backdrop-blur-xl border border-white/90 shadow-2xs text-xs sm:text-sm font-bold text-navy-950">
                    100% Client-Side Data
                  </span>
                  <span className="inline-flex items-center px-5 py-2.5 rounded-full bg-white/85 backdrop-blur-xl border border-white/90 shadow-2xs text-xs sm:text-sm font-bold text-navy-950">
                    Anonymous Pseudonyms
                  </span>
                  <span className="inline-flex items-center px-5 py-2.5 rounded-full bg-white/85 backdrop-blur-xl border border-white/90 shadow-2xs text-xs sm:text-sm font-bold text-navy-950">
                    Zero Tracking
                  </span>
                </div>
              </div>

              {/* Right Column: Subtle Illustrative Feedback Card */}
              <div className="lg:col-span-4 hidden lg:flex justify-end">
                <div className="rounded-3xl border border-white/90 bg-white/70 backdrop-blur-2xl p-5 sm:p-6 shadow-xl shadow-navy-950/10 max-w-sm space-y-3 transform rotate-1 hover:rotate-0 transition-transform duration-300">
                  <div className="flex items-center gap-2 text-xs font-bold text-teal-900 tracking-wide uppercase">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                    Design Intent
                  </div>
                  <p className="text-sm font-medium text-navy-900 italic leading-relaxed">
                    &ldquo;When exam weeks got overwhelming, being able to chat without worrying about anyone finding out made all the difference.&rdquo;
                  </p>
                  <p className="text-[11px] font-semibold tracking-wide text-navy-600 uppercase border-t border-navy-100/80 pt-2">
                    The kind of student experience we are building for
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* -------------------------------------------------- Core Capabilities Section */}
        <section id="features" className="w-full pt-6 pb-14 sm:pt-10 sm:pb-20 bg-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            {/* Section Header: Pure Floating Typography */}
            <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
              <p className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#0e5043] drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]">
                How MindEase works
              </p>
              <h2 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-black text-navy-950 tracking-tight leading-tight drop-shadow-[0_1px_4px_rgba(255,255,255,0.85)]">
                Care that respects your privacy from day one
              </h2>
              <p className="mt-3 text-sm sm:text-base lg:text-lg text-navy-800/95 font-medium leading-relaxed max-w-2xl mx-auto drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]">
                Every tool is designed to let you choose what to share, when to reach out, and who to connect with.
              </p>
            </div>

            {/* Rich Glassmorphic Bento Cards over Background */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 items-start">
              {/* Card 1: Anonymous Peer Chat (Col 7) */}
              <div className="md:col-span-7 rounded-3xl border border-white/80 bg-white/60 backdrop-blur-2xl backdrop-saturate-150 p-6 sm:p-7 shadow-xl shadow-navy-950/5 transition-all duration-300 hover:bg-white/75 hover:shadow-2xl hover:border-white group flex flex-col justify-between min-h-[260px] lg:min-h-[290px] relative overflow-hidden">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/80 border border-teal-200/90 text-xs font-bold text-teal-950 shadow-2xs backdrop-blur-md">
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
                    <h3 className="text-lg sm:text-xl font-bold text-navy-950 tracking-tight">
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
                    className="inline-flex items-center text-xs sm:text-sm font-bold text-teal-800 hover:text-teal-950 hover:underline gap-1.5"
                  >
                    Try Peer Chat <span aria-hidden>→</span>
                  </Link>
                </div>
              </div>

              {/* Card 2: Private Local Journal (Col 5) */}
              <div className="md:col-span-5 rounded-3xl border border-white/80 bg-white/60 backdrop-blur-2xl backdrop-saturate-150 p-6 sm:p-7 shadow-xl shadow-navy-950/5 transition-all duration-300 hover:bg-white/75 hover:shadow-2xl hover:border-white group flex flex-col justify-between min-h-[260px] lg:min-h-[290px] lg:translate-y-2 relative overflow-hidden">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-white/80 border border-indigo-200/90 text-xs font-bold text-indigo-950 shadow-2xs backdrop-blur-md">
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
                    <h3 className="text-lg sm:text-xl font-bold text-navy-950 tracking-tight">
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
                    className="inline-flex items-center text-xs sm:text-sm font-bold text-teal-800 hover:text-teal-950 hover:underline gap-1.5"
                  >
                    Open Journal <span aria-hidden>→</span>
                  </Link>
                </div>
              </div>

              {/* Card 3: AI Support & Resources (Col 5) */}
              <div className="md:col-span-5 rounded-3xl border border-white/80 bg-white/60 backdrop-blur-2xl backdrop-saturate-150 p-6 sm:p-7 shadow-xl shadow-navy-950/5 transition-all duration-300 hover:bg-white/75 hover:shadow-2xl hover:border-white group flex flex-col justify-between min-h-[260px] lg:min-h-[290px] relative overflow-hidden">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-white/80 border border-amber-200/90 text-xs font-bold text-amber-950 shadow-2xs backdrop-blur-md">
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
                    <h3 className="text-lg sm:text-xl font-bold text-navy-950 tracking-tight">
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
                    className="inline-flex items-center text-xs sm:text-sm font-bold text-teal-800 hover:text-teal-950 hover:underline gap-1.5"
                  >
                    Browse Library <span aria-hidden>→</span>
                  </Link>
                </div>
              </div>

              {/* Card 4: Consent-First Counselling (Col 7) */}
              <div className="md:col-span-7 rounded-3xl border border-white/80 bg-white/60 backdrop-blur-2xl backdrop-saturate-150 p-6 sm:p-7 shadow-xl shadow-navy-950/5 transition-all duration-300 hover:bg-white/75 hover:shadow-2xl hover:border-white group flex flex-col justify-between min-h-[260px] lg:min-h-[290px] relative overflow-hidden">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-white/80 border border-emerald-200/90 text-xs font-bold text-emerald-950 shadow-2xs backdrop-blur-md">
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
                    <h3 className="text-lg sm:text-xl font-bold text-navy-950 tracking-tight">
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
                    className="inline-flex items-center text-xs sm:text-sm font-bold text-teal-800 hover:text-teal-950 hover:underline gap-1.5"
                  >
                    Book Support <span aria-hidden>→</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Wide Institutional Safety & Ethics Panel */}
            <div className="mt-8 sm:mt-10 rounded-3xl border border-white/80 bg-white/60 backdrop-blur-2xl backdrop-saturate-150 p-6 sm:p-8 shadow-xl shadow-navy-950/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all duration-300 hover:bg-white/75 hover:border-white">
              <div className="space-y-1.5">
                <span className="text-xs font-black uppercase tracking-widest text-[#0e5043]">
                  Institutional Safety &amp; Ethics
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-navy-950 tracking-tight">
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

        {/* -------------------------------------------------- Pre-Footer Quote Bridge */}
        <section className="w-full bg-slate-900 py-3.5 sm:py-4.5 text-slate-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <hr className="border-slate-800/60 mb-3 sm:mb-3.5" />
            <div className="max-w-xl mx-auto text-center space-y-1">
              <p className="text-xs sm:text-sm font-medium text-teal-200/90 italic leading-normal">
                &ldquo;You don’t have to carry everything all at once. Sometimes taking a moment to pause, reflect, and reach out is the strongest thing you can do.&rdquo;
              </p>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                — A safe space, whenever you need it
              </p>
            </div>
            <hr className="border-slate-800/60 mt-3 sm:mt-3.5" />
          </div>
        </section>
      </div>

      {/* 4. Footer sits in normal document flow and anchors the page */}
      <LandingFooter />
    </div>
  );
}
