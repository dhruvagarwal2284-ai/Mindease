"use client";

import Link from "next/link";
import React from "react";
import { MindEaseLogo } from "@/components/MindEaseLogo";

interface LandingHeaderProps {
  showEmergencyBanner?: boolean;
}

export function LandingHeader({
  showEmergencyBanner = true,
}: LandingHeaderProps) {
  const [isBannerVisible, setIsBannerVisible] = React.useState(showEmergencyBanner);
  const [isVisible, setIsVisible] = React.useState(true);
  const lastScrollYRef = React.useRef(0);

  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY <= 20) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollYRef.current && currentScrollY > 70) {
        // Scrolling down -> hide header
        setIsVisible(false);
      } else if (currentScrollY < lastScrollYRef.current) {
        // Scrolling up -> show header
        setIsVisible(true);
      }
      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`w-full sticky top-0 z-40 bg-surface/90 backdrop-blur-2xl backdrop-saturate-150 border-b border-navy-200/60 shadow-xs transition-transform duration-300 ease-in-out ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
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

      {/* 2. Header Bar: Logo, Navigation Menu, Primary CTA */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
        {/* Element 1: Official Logo */}
        <MindEaseLogo subtitle="Student Wellbeing" size="md" />

        {/* Element 2: Real Navigation Links (Visible on sm:) */}
        <nav aria-label="Main Navigation" className="hidden sm:flex items-center gap-1 md:gap-2">
          <Link
            href="/"
            className="px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium text-navy-700 hover:text-teal-900 hover:bg-teal-50/70 transition-colors"
          >
            Home
          </Link>
          <Link
            href="/student/peer"
            className="px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium text-navy-700 hover:text-teal-900 hover:bg-teal-50/70 transition-colors"
          >
            Peer Support
          </Link>
          <Link
            href="/student/journal"
            className="px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium text-navy-700 hover:text-teal-900 hover:bg-teal-50/70 transition-colors"
          >
            Journal
          </Link>
          <Link
            href="/student/support"
            className="px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium text-navy-700 hover:text-teal-900 hover:bg-teal-50/70 transition-colors"
          >
            Resources
          </Link>
          <Link
            href="/student/support/request"
            className="px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium text-navy-700 hover:text-teal-900 hover:bg-teal-50/70 transition-colors"
          >
            Counselling
          </Link>
        </nav>

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
    <footer className="w-full bg-slate-950 text-slate-200 pt-16 pb-12 relative z-20 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12">
          {/* Column 1: Brand, Tagline & Mission (Col 4) */}
          <div className="lg:col-span-4 space-y-4">
            <MindEaseLogo subtitle="Student Wellbeing" size="md" variant="light" />
            <p className="text-sm text-teal-300 font-medium leading-relaxed max-w-sm">
              Support you can reach on your own terms, without giving up your privacy.
            </p>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Privacy-first mental health support system for higher education institutions. Providing students with secure peer support and consent-driven professional counselling.
            </p>
          </div>

          {/* Column 2: Student Portals (Col 2) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Student Space
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>
                <Link href="/onboarding" className="hover:text-teal-400 transition-colors">
                  Getting Started
                </Link>
              </li>
              <li>
                <Link href="/student/peer" className="hover:text-teal-400 transition-colors">
                  Anonymous Peer Chat
                </Link>
              </li>
              <li>
                <Link href="/student/journal" className="hover:text-teal-400 transition-colors">
                  Private Mood Journal
                </Link>
              </li>
              <li>
                <Link href="/student/support" className="hover:text-teal-400 transition-colors">
                  Resource Library
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Platform Governance & Staff (Col 3) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
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
                  Counsellor Case Platform
                </Link>
              </li>
              <li>
                <Link href="/counsellor/moderation" className="hover:text-teal-400 transition-colors">
                  Community Safety Desk
                </Link>
              </li>
              <li>
                <Link href="/demo" className="hover:text-teal-400 transition-colors">
                  Prototype Walkthrough
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: 24/7 Immediate Crisis Box (Col 3) */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-red-500/20 bg-red-950/20 p-4.5 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wide">
                <span>🆘</span> 24/7 Crisis Support
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                If you or someone you know is in immediate distress, free confidential emergency help is always available.
              </p>
              <div className="pt-1">
                <Link
                  href="/student/help"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 hover:underline"
                >
                  View Emergency Contacts →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright, Institution note */}
        <div className="border-t border-slate-800/80 mt-14 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>Built with care by Team PsychOps</p>
          <p className="text-center sm:text-right text-slate-400 max-w-md">
            Emergency contacts and counselling resources are institution-configured for student safety.
          </p>
        </div>
      </div>
    </footer>
  );
}
