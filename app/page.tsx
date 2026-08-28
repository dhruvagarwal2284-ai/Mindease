"use client";

import Image from "next/image";
import Link from "next/link";
import { LandingFooter, LandingHeader } from "@/components/landing";
import { useStore } from "@/lib/store";
import { useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const FEATURES = [
  {
    icon: "🕶️",
    title: "Anonymous Peer Chat",
    description: "Real-time 1:1 ephemeral conversations with fellow students. No real names, roll numbers, or chat histories are ever stored.",
    link: "/student/peer",
    linkText: "Try Peer Chat",
    badgeTone: "bg-teal-50/90 border-teal-200/80 text-teal-900",
  },
  {
    icon: "🔒",
    title: "Private Local Journal",
    description: "A safe place to write, reflect, and track mood trends. Your thoughts remain encrypted on your device and are never shared without permission.",
    link: "/student/journal",
    linkText: "Open Journal",
    badgeTone: "bg-indigo-50/90 border-indigo-200/80 text-indigo-950",
  },
  {
    icon: "🤖",
    title: "AI Support & Resources",
    description: "Intelligent self-check-in insights and tailored campus coping guides for exam stress, burnout, and sleep without automated diagnosis.",
    link: "/student/support",
    linkText: "Browse Library",
    badgeTone: "bg-purple-50/90 border-purple-200/80 text-purple-950",
  },
  {
    icon: "🤝",
    title: "Consent-First Counselling",
    description: "Connect with campus counsellors on your own terms. Choose exactly what information leaves your device item-by-item before booking.",
    link: "/student/support/request",
    linkText: "Book Support",
    badgeTone: "bg-emerald-50/90 border-emerald-200/80 text-emerald-950",
  },
];

export default function LandingPage() {
  const { ready, state, savedAccounts, setIdentity, toast } = useStore();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedHandle, setSelectedHandle] = useState("");
  const [pinInput, setPinInput] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleStudentClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (savedAccounts && savedAccounts.length > 0) {
      setShowLoginModal(true);
    } else {
      window.location.href = "/onboarding";
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      const userRef = doc(db, "users", selectedHandle);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists() && userSnap.data().pin === pinInput) {
        setIdentity({
          handle: selectedHandle,
          caseId: userSnap.data().caseId || "A71X",
        });
        toast("Login Successful!", "success");
        window.location.href = "/student/home";
      } else {
        toast("Incorrect PIN", "urgent");
      }
    } catch (err) {
      toast("Error logging in", "warning");
    }
    setIsLoggingIn(false);
  };

  return (
    <div className="min-h-screen flex flex-col text-navy-950 font-sans selection:bg-teal-100 selection:text-teal-900">
      <LandingHeader />

      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <Image
          src="/images/hero-campus-watercolor.png"
          alt="MindEase Campus Illustration"
          fill
          priority
          quality={100}
          className="object-cover object-right md:object-[center_right]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/40 to-transparent sm:via-white/20 lg:from-white/80 lg:via-transparent" />
      </div>

      <div className="relative z-10 flex-1 w-full bg-transparent">
        <section id="main" className="w-full flex items-center pt-6 pb-8 sm:pt-10 sm:pb-12 lg:pt-14 lg:pb-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
            <div className="max-w-xl lg:max-w-2xl space-y-4 sm:space-y-5 animate-fade-up">
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full border border-teal-200 bg-white/80 backdrop-blur shadow-2xs text-xs font-bold text-teal-950">
                <span className="h-2 w-2 rounded-full bg-teal-600 animate-pulse-soft" />
                Anonymous Student Support
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-navy-950 leading-[1.12]">
                Support you can reach without giving up your privacy.
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-navy-900 font-medium leading-relaxed bg-white/50 sm:bg-transparent backdrop-blur-xs sm:backdrop-blur-none p-2.5 sm:p-0 rounded-xl">
                MindEase provides university students with anonymous peer chat, an encrypted on-device journal, and a consent-first counsellor pathway that only opens when you choose to open it.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <button
                  onClick={handleStudentClick}
                  className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-sm sm:text-base shadow-xs transition-all text-center active:scale-98"
                >
                  Enter as Student →
                </button>
                <Link
                  href="/counsellor/dashboard"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white/80 hover:bg-white backdrop-blur-sm text-navy-950 font-bold text-sm sm:text-base border border-navy-200 shadow-2xs transition-all text-center active:scale-98"
                >
                  Counsellor Platform
                </Link>
              </div>

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

        <section id="features" className="w-full pt-2 pb-14 sm:pt-4 sm:pb-18 bg-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
              <p className="text-xs font-extrabold uppercase tracking-wider text-teal-900 [text-shadow:_0_1px_1px_rgb(255_255_255_/_80%)]">
                Core Capabilities
              </p>
              <h2 className="mt-1.5 text-2xl sm:text-3xl lg:text-3.5xl font-extrabold text-navy-950 tracking-tight [text-shadow:_0_1px_2px_rgb(255_255_255_/_60%)]">
                Designed around student trust &amp; safety
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {FEATURES.map((feat) => (
                <div key={feat.title} className="rounded-3xl border border-white/80 bg-white/65 backdrop-blur-xl p-5 sm:p-6 shadow-lg shadow-navy-950/5 transition-all duration-300 hover:-translate-y-1.5 hover:bg-white/80 hover:shadow-xl hover:border-white flex flex-col justify-between group">
                  <div>
                    <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border text-lg mb-3 shadow-2xs ${feat.badgeTone}`} aria-hidden>
                      {feat.icon}
                    </div>
                    <h3 className="text-base font-extrabold text-navy-950 tracking-tight">{feat.title}</h3>
                    <p className="mt-1.5 text-xs sm:text-sm text-navy-800 leading-relaxed font-normal">{feat.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl animate-fade-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-navy-950">Welcome Back</h2>
              <button onClick={() => setShowLoginModal(false)} className="text-navy-400 hover:text-navy-900">✕</button>
            </div>

            {selectedHandle ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <p className="text-sm font-medium text-navy-700">Logging in as <span className="font-bold text-teal-800">{selectedHandle}</span></p>
                <input
                  type="password" maxLength={4} required placeholder="Enter 4-digit PIN"
                  className="w-full px-4 py-3 rounded-xl border border-navy-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none text-center text-xl tracking-[0.5em]"
                  value={pinInput} onChange={(e) => setPinInput(e.target.value)}
                />
                <div className="flex gap-2">
                  <button type="button" onClick={() => setSelectedHandle("")} className="flex-1 px-4 py-2 border rounded-xl hover:bg-navy-50 font-medium">Back</button>
                  <button type="submit" disabled={isLoggingIn} className="flex-1 px-4 py-2 bg-teal-800 text-white rounded-xl hover:bg-teal-900 font-medium disabled:opacity-50">
                    {isLoggingIn ? "Checking..." : "Login"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-navy-600 mb-2">Select a recent account to continue:</p>
                {(savedAccounts || []).map((acc: any) => (
                  <button
                    key={acc.handle} onClick={() => setSelectedHandle(acc.handle)}
                    className="w-full text-left px-4 py-3 rounded-xl border border-navy-100 hover:border-teal-500 hover:bg-teal-50 font-medium flex justify-between items-center transition-colors"
                  >
                    <span>{acc.handle}</span><span aria-hidden>→</span>
                  </button>
                ))}
                
                <div className="my-4 border-t border-navy-100" />
                <Link href="/onboarding" className="w-full block text-center px-4 py-3 rounded-xl bg-navy-50 hover:bg-navy-100 text-navy-900 font-bold transition-colors">
                  + Create New Anonymous Account
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      <LandingFooter />
    </div>
  );
}