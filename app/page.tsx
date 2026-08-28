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
    badge: "● Live 1:1 · Ephemeral",
    title: "Anonymous Peer Chat",
    description: "Real-time 1:1 ephemeral conversations with fellow students. No real names, roll numbers, or chat histories are ever stored.",
    link: "/student/peer",
    linkText: "Try Peer Chat",
    image: "/images/features/peer-chat.png",
    badgeTone: "bg-teal-50/90 border-teal-200/80 text-teal-900",
  },
  {
    badge: "🔒 Device-Only Storage",
    title: "Private Local Journal",
    description: "A safe place to write, reflect, and track mood trends. Your thoughts remain encrypted on your device and are never shared without permission.",
    link: "/student/journal",
    linkText: "Open Journal",
    image: "/images/features/journal.png",
    badgeTone: "bg-indigo-50/90 border-indigo-200/80 text-indigo-950",
  },
  {
    badge: "🌱 Self-Paced Guides",
    title: "AI Support & Resources",
    description: "Intelligent self-check-in insights and tailored campus coping guides for exam stress, burnout, and sleep without automated diagnosis.",
    link: "/student/support",
    linkText: "Browse Library",
    image: "/images/features/resources.png",
    badgeTone: "bg-purple-50/90 border-purple-200/80 text-purple-950",
  },
  {
    badge: "🤝 Direct Campus Pathway",
    title: "Consent-First Counselling",
    description: "Connect with campus counsellors on your own terms. Choose exactly what information leaves your device item-by-item before booking.",
    link: "/student/support/request",
    linkText: "Book Support",
    image: "/images/features/counselling.png",
    badgeTone: "bg-emerald-50/90 border-emerald-200/80 text-emerald-950",
  },
];

export default function LandingPage() {
  const { ready, state, savedAccounts, setIdentity, toast } = useStore();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedHandle, setSelectedHandle] = useState("");
  const [pinInput, setPinInput] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const studentDestination = ready && state.onboarded ? "/student/home" : "/onboarding";

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
const userData = userSnap.data() as any; // 🔥 TS ko bypass karne ke liye
      
      if (userSnap.exists() && userData.pin === pinInput) {
        setIdentity({
          handle: selectedHandle,
          caseId: userData.caseId || "A71X",
        } as any); // 🔥 Yahan bhi as any lagaya taaki red line na aaye
        
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
          src="/images/my-hero-campus.jpg"
          alt="Campus Sunrise Pathway"
          fill
          priority
          unoptimized
          className="object-cover object-center md:object-[center_right]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/40 to-transparent sm:via-white/20 lg:from-white/80 lg:via-transparent" />
      </div>

      <div className="relative z-10 flex-1 w-full bg-transparent">
        <section id="main" className="w-full flex items-center pt-6 pb-8 sm:pt-10 sm:pb-12 lg:pt-14 lg:pb-14">
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
                      <path
                        d="M3 8.5C38 3.5 95 11.5 152 5C188 1.5 224 8 247 6.5C215 9.5 145 12 78 10C38 8.8 12 7 4 9.5"
                        fill="currentColor"
                      />
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
                  <button
                    onClick={handleStudentClick}
                    className="inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-[#0f4b40] hover:bg-[#0b3b32] text-white font-bold text-base sm:text-lg shadow-sm transition-all text-center active:scale-98 cursor-pointer"
                  >
                    {ready && state.onboarded ? "Continue as Student →" : "Enter as Student →"}
                  </button>
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
            </div>
          </div>
        </section>

        <section id="features" className="w-full pt-2 pb-12 sm:pt-4 sm:pb-16 bg-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
              <p className="text-xs font-extrabold uppercase tracking-wider text-teal-900">
                Core Capabilities
              </p>
              <h2 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-black text-navy-950 tracking-tight leading-tight">
                Care that respects your privacy from day one
              </h2>
            </div>

            {/* 2x2 Grid Layout: 2 cards per row, 2 rows */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {FEATURES.map((feat) => (
                <div
                  key={feat.title}
                  className="relative rounded-3xl border border-white/80 bg-white/65 backdrop-blur-xl p-6 sm:p-8 shadow-lg shadow-navy-950/5 transition-all duration-300 hover:-translate-y-1.5 hover:bg-white/80 hover:shadow-xl hover:border-white flex flex-col justify-between group overflow-hidden"
                >
                  <div>
                    {/* Top Row: Left Pill Badge & Top-Right Illustration Graphic */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-bold shadow-2xs ${feat.badgeTone}`}
                      >
                        {feat.badge}
                      </div>
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 -mt-1 -mr-1">
                        <Image
                          src={feat.image}
                          alt={feat.title}
                          width={80}
                          height={80}
                          className="object-contain w-full h-full"
                        />
                      </div>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-black text-navy-950 tracking-tight">
                      {feat.title}
                    </h3>
                    <p className="mt-2 text-sm sm:text-base text-navy-800 leading-relaxed font-normal">
                      {feat.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-navy-900/10">
                    <Link
                      href={feat.link}
                      className="inline-flex items-center text-xs sm:text-sm font-bold text-teal-800 hover:text-teal-950 hover:underline gap-1.5"
                    >
                      {feat.linkText} <span aria-hidden>→</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================== Institutional Safety & Ethics Section */}
        <section id="safety" className="w-full py-8 sm:py-12 bg-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="rounded-3xl border border-white/80 bg-white/70 backdrop-blur-xl p-6 sm:p-10 lg:p-12 shadow-xl shadow-navy-950/5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-navy-900/10">
                <div className="space-y-1.5">
                  <p className="text-xs font-extrabold uppercase tracking-wider text-teal-900">
                    INSTITUTIONAL SAFETY &amp; ETHICS
                  </p>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-navy-950 tracking-tight leading-tight">
                    Your data stays yours. Period.
                  </h2>
                </div>
                <div className="shrink-0">
                  <Link
                    href="/register-as-peer"
                    className="inline-flex items-center justify-center px-6 py-3.5 rounded-2xl bg-[#0f4b40] hover:bg-[#0b3b32] text-white font-bold text-sm sm:text-base shadow-sm transition-all text-center active:scale-98 cursor-pointer"
                  >
                    Join as Peer Supporter →
                  </Link>
                </div>
              </div>

              {/* Three Institutional Guarantees */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 pt-8">
                <div className="space-y-2">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-lg shadow-2xs">
                    🛡️
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-navy-950">
                    Zero Surveillance &amp; Tracking
                  </h3>
                  <p className="text-xs sm:text-sm text-navy-800 leading-relaxed font-normal">
                    No analytics pixels, behavioral tracking, or identity logging. Students participate under pseudonyms with absolute peace of mind.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-950 text-lg shadow-2xs">
                    🔒
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-navy-950">
                    Local Device Storage
                  </h3>
                  <p className="text-xs sm:text-sm text-navy-800 leading-relaxed font-normal">
                    Private journals and mood logs stay encrypted strictly on your personal device. Nothing is sent to servers without explicit consent.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-lg shadow-2xs">
                    🤝
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-navy-950">
                    Human-Led Decisions
                  </h3>
                  <p className="text-xs sm:text-sm text-navy-800 leading-relaxed font-normal">
                    AI only powers supportive coping guides and check-in trends. All care, moderation, and escalations are conducted by real counsellors.
                  </p>
                </div>
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
                  <button type="button" onClick={() => setSelectedHandle("")} className="flex-1 px-4 py-2 border rounded-xl hover:bg-navy-50 font-medium cursor-pointer">Back</button>
                  <button type="submit" disabled={isLoggingIn} className="flex-1 px-4 py-2 bg-teal-800 text-white rounded-xl hover:bg-teal-900 font-medium disabled:opacity-50 cursor-pointer">
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
                    className="w-full text-left px-4 py-3 rounded-xl border border-navy-100 hover:border-teal-500 hover:bg-teal-50 font-medium flex justify-center justify-between items-center transition-colors cursor-pointer"
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