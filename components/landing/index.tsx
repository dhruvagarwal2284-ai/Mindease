"use client";

import Link from "next/link";
import React from "react";
import { MindEaseLogo } from "@/components/MindEaseLogo";

export const DEFAULT_HEADER_MICRO_TAGLINE = "Support, at your own pace.";

interface LandingHeaderProps {
  microTagline?: string;
  showEmergencyBanner?: boolean;
}

export function LandingHeader({
  microTagline = DEFAULT_HEADER_MICRO_TAGLINE,
  showEmergencyBanner = true,
}: LandingHeaderProps) {
  const [isBannerVisible, setIsBannerVisible] = React.useState(showEmergencyBanner);

  return (
    <div className="w-full sticky top-0 z-40 bg-surface/85 backdrop-blur-2xl backdrop-saturate-150 border-b border-navy-200/50 shadow-xs transition-all">
      {/* 1. Subtle Emergency Banner with Dismiss button */}
      {isBannerVisible ? (
        <div className="w-full bg-red-500/10 border-b border-red-500/20 text-red-900 dark:text-red-300 py-1.5 px-4 text-xs backdrop-blur-md transition-all animate-fade-in">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm shrink-0" aria-hidden>
                🆘
              </span>
              <span className="font-semibold shrink-0">Need urgent support?</span>
              <span className="hidden sm:inline opacity-90 truncate">
                Confidential 24/7 crisis hotlines are always open.
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/student/help"
                className="font-bold text-red-700 hover:text-red-900 hover:underline flex items-center gap-1 shrink-0"
              >
                Get immediate help <span aria-hidden>→</span>
              </Link>
              <button
                type="button"
                onClick={() => setIsBannerVisible(false)}
                className="p-1 rounded-md text-red-800/70 hover:text-red-950 hover:bg-red-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 transition-colors"
                aria-label="Dismiss banner"
                title="Dismiss banner"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* 2. Simplified Header Bar: Exactly 3 elements */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
        {/* Element 1: Official Logo + Subtitle */}
        <MindEaseLogo subtitle="Student Wellbeing" size="md" />

        {/* Element 2: Affirmative Micro-Tagline */}
        <div className="hidden sm:flex items-center justify-center flex-1 text-center px-4">
          <p className="text-sm font-medium text-navy-800/90 italic tracking-wide">
            &ldquo;{microTagline}&rdquo;
          </p>
        </div>

        {/* Element 3: Single Primary Button */}
        <div className="flex items-center shrink-0">
          <Link
            href="/register-as-peer"
            className="inline-flex items-center justify-center px-4.5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs sm:text-sm font-semibold shadow-xs transition-all active:scale-95"
          >
            Register as Peer Supporter
          </Link>
        </div>
      </header>
    </div>
  );
}

export function LandingFooter() {
  return (
    <footer className="w-full bg-slate-900 text-slate-200 pt-14 pb-10 relative z-20 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 sm:gap-12">
          {/* Column 1: Brand & Description */}
          <div className="space-y-4">
            <MindEaseLogo subtitle="Student Wellbeing" size="md" variant="light" />
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
                <Link href="/onboarding" className="hover:text-teal-400 transition-colors">
                  Student Onboarding
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

          {/* Column 3: Platform & Staff */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Staff &amp; Governance
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>
                <Link href="/register-as-peer" className="hover:text-teal-400 transition-colors font-medium">
                  Register as Peer Supporter
                </Link>
              </li>
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
                <Link href="/demo" className="hover:text-teal-400 transition-colors">
                  Full Prototype Walkthrough
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright & PsychOps Credit */}
        <div className="border-t border-slate-800 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} MindEase Campus · Built by Team PsychOps</p>
          <p className="text-center sm:text-right">
            Crisis &amp; helpline contacts are configured by individual higher education institutions.
          </p>
        </div>
      </div>
    </footer>
  );
}
