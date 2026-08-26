"use client";

import Image from "next/image";
import Link from "next/link";
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
    <div className="min-h-screen flex flex-col bg-white text-navy-900 font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* ==================================================== 1. Emergency Banner */}
      <div className="w-full bg-red-50 border-b border-red-200 text-red-900 py-2.5 px-4 text-xs sm:text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-base" aria-hidden>
              🆘
            </span>
            <span className="font-semibold">Need urgent mental health support?</span>
            <span className="hidden md:inline text-red-800">
              Access confidential 24/7 crisis hotlines and on-campus emergency response immediately.
            </span>
          </div>
          <Link
            href="/student/help"
            className="font-bold text-red-700 hover:text-red-900 hover:underline flex items-center gap-1 shrink-0"
          >
            Get Help Now <span aria-hidden>→</span>
          </Link>
        </div>
      </div>

      {/* ==================================================== 2. Header */}
      <header className="w-full bg-white border-b border-gray-100 sticky top-0 z-40 backdrop-blur-md bg-white/95 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 font-bold text-white shadow-sm transition-transform group-hover:scale-105"
              aria-hidden
            >
              M
            </span>
            <div>
              <span className="block text-lg font-bold tracking-tight text-navy-900 leading-tight">
                MindEase Campus
              </span>
              <span className="block text-[11px] font-medium text-teal-800 uppercase tracking-wider">
                Student Wellbeing
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-7 text-sm font-medium text-navy-700">
            <a href="#features" className="hover:text-teal-800 transition-colors">
              Features
            </a>
            <Link href="/demo" className="hover:text-teal-800 transition-colors">
              Demo Script
            </Link>
            <Link href="/counsellor/dashboard" className="hover:text-teal-800 transition-colors">
              Counsellor Portal
            </Link>
          </nav>

          {/* Action Button */}
          <div className="flex items-center gap-3">
            <Link
              href={studentDestination}
              className="inline-flex items-center justify-center px-4.5 py-2.5 rounded-xl bg-navy-900 text-white text-sm font-semibold hover:bg-navy-800 transition-all shadow-sm active:scale-95"
            >
              Student Login
            </Link>
          </div>
        </div>
      </header>

      {/* ==================================================== 3. Hero Section */}
      <section id="main" className="w-full bg-gray-50 py-14 sm:py-20 lg:py-24 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column: Copy & Actions */}
            <div className="space-y-6 animate-fade-up">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-200 bg-teal-50 text-xs font-semibold text-teal-900">
                <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse-soft" />
                Zero-Knowledge · Anonymous Student Support
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-navy-900 leading-[1.15]">
                Support you can reach without giving up your privacy.
              </h1>

              <p className="text-base sm:text-lg text-navy-700 leading-relaxed max-w-xl">
                MindEase provides university students with anonymous peer chat, an encrypted on-device journal, and a consent-first counsellor pathway that only opens when you choose to open it.
              </p>

              {/* Action Buttons Group */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href={studentDestination}
                  className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm sm:text-base shadow-sm transition-all text-center active:scale-98"
                >
                  {ready && state.onboarded ? "Continue as Student →" : "Enter as Student →"}
                </Link>
                <Link
                  href="/counsellor/dashboard"
                  className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-white hover:bg-navy-50 text-navy-900 font-semibold text-sm sm:text-base border border-navy-200 shadow-2xs transition-all text-center active:scale-98"
                >
                  Counsellor Platform
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 border-t border-gray-200/80 flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-navy-600 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="text-teal-600 font-bold" aria-hidden>✓</span> 100% Client-Side Data
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-teal-600 font-bold" aria-hidden>✓</span> Anonymous Pseudonyms
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-teal-600 font-bold" aria-hidden>✓</span> Zero Tracking
                </span>
              </div>
            </div>

            {/* Right Column: Photograph with rounded corners & shadow */}
            <div className="relative animate-fade-up">
              <div className="relative mx-auto max-w-md lg:max-w-none overflow-hidden rounded-2xl shadow-xl border border-gray-200 bg-white">
                <Image
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format&fit=crop"
                  alt="Students collaborating and studying comfortably on campus"
                  width={640}
                  height={440}
                  priority
                  className="w-full h-80 sm:h-96 lg:h-[420px] object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/60 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-xl bg-white/95 backdrop-blur border border-white/40 shadow-lg flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-100 text-teal-800 text-lg" aria-hidden>
                      🤝
                    </span>
                    <div>
                      <p className="text-xs font-bold text-navy-900">Safe Campus Community</p>
                      <p className="text-[11px] text-navy-600">Connect with peers or counsellors on your terms</p>
                    </div>
                  </div>
                  <Link
                    href="/demo"
                    className="text-xs font-semibold text-teal-800 hover:underline shrink-0"
                  >
                    View Demo →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================== 4. Features Section */}
      <section id="features" className="w-full bg-white py-16 sm:py-24 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <p className="text-xs font-bold uppercase tracking-wider text-teal-800">
              Core Capabilities
            </p>
            <h2 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-extrabold text-navy-900 tracking-tight">
              Designed around student trust &amp; safety
            </h2>
            <p className="mt-3 text-sm sm:text-base text-navy-600 leading-relaxed">
              Every feature eliminates social stigma and removes technical barriers to seeking timely mental health support.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feat) => (
              <div
                key={feat.title}
                className="rounded-2xl border border-gray-200/90 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-xl border text-2xl mb-4 ${feat.badgeTone}`}
                    aria-hidden
                  >
                    {feat.icon}
                  </div>
                  <h3 className="text-lg font-bold text-navy-900 tracking-tight">
                    {feat.title}
                  </h3>
                  <p className="mt-2 text-sm text-navy-600 leading-relaxed">
                    {feat.description}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100">
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
        </div>
      </section>

      {/* ==================================================== 5. Privacy & Architecture Promise */}
      <section className="w-full bg-navy-50/60 py-12 sm:py-16 border-b border-gray-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="rounded-2xl border border-navy-200 bg-white p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
                Institutional Safety &amp; Ethics
              </span>
              <h3 className="text-xl font-bold text-navy-900">
                Never shared, whatever happens.
              </h3>
              <p className="text-sm text-navy-600 max-w-2xl leading-relaxed">
                Your real name, roll number, device identifiers, private journal thoughts, and browsing history stay on your device unless you explicitly choose to disclose them.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              <Link
                href="/demo"
                className="px-4 py-2.5 rounded-xl border border-navy-200 bg-navy-50 text-navy-800 text-xs font-semibold hover:bg-navy-100 transition-colors"
              >
                Inspect Data Architecture
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================== 6. Footer */}
      <footer className="w-full bg-slate-900 text-slate-200 pt-14 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 sm:gap-12">
            {/* Column 1: Brand & Description */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500 font-bold text-slate-900"
                  aria-hidden
                >
                  M
                </span>
                <span className="text-lg font-bold text-white tracking-tight">
                  MindEase Campus
                </span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Privacy-first mental health support system for higher education institutions. Providing students with secure peer support and consent-driven professional counselling.
              </p>
              <div className="pt-1">
                <span className="inline-block rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300 border border-slate-700">
                  SIH Problem Statement SW-55
                </span>
              </div>
            </div>

            {/* Column 2: Student Links */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                Student Features
              </h4>
              <ul className="space-y-2.5 text-sm text-slate-300">
                <li>
                  <Link href={studentDestination} className="hover:text-teal-400 transition-colors">
                    Student Home Portal
                  </Link>
                </li>
                <li>
                  <Link href="/student/peer" className="hover:text-teal-400 transition-colors">
                    Anonymous Peer Chat (P2P)
                  </Link>
                </li>
                <li>
                  <Link href="/student/journal" className="hover:text-teal-400 transition-colors">
                    Private Mood &amp; Journal
                  </Link>
                </li>
                <li>
                  <Link href="/student/support" className="hover:text-teal-400 transition-colors">
                    Campus Resource Library
                  </Link>
                </li>
                <li>
                  <Link href="/student/help" className="hover:text-urgent-400 text-urgent-400 font-semibold transition-colors">
                    Crisis &amp; Emergency Support
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Platform & Administration Links */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                Platform &amp; Staff
              </h4>
              <ul className="space-y-2.5 text-sm text-slate-300">
                <li>
                  <Link href="/counsellor/dashboard" className="hover:text-teal-400 transition-colors">
                    Counsellor Case Management
                  </Link>
                </li>
                <li>
                  <Link href="/counsellor/moderation" className="hover:text-teal-400 transition-colors">
                    Community Safety Desk
                  </Link>
                </li>
                <li>
                  <Link href="/counsellor/resources" className="hover:text-teal-400 transition-colors">
                    Resource Publishing Library
                  </Link>
                </li>
                <li>
                  <Link href="/demo" className="hover:text-teal-400 transition-colors">
                    Full Prototype Walkthrough
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright & Disclaimer */}
          <div className="border-t border-slate-800 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <p>© {new Date().getFullYear()} MindEase Campus. All rights reserved.</p>
            <p className="text-center sm:text-right">
              Campus &amp; emergency crisis hotlines are configurable per university deployment.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
