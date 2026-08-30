"use client";

import { ThemeSelector } from "@/components/ThemeSelector";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
// 🔥 NAYA: Firebase Imports
import { collection, query, onSnapshot, orderBy,doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

import { DailyCheckIn } from "@/components/checkin";
import { AnonymousModeBar } from "@/components/privacy";
import { AiUnavailable, StudentSupportPrompt } from "@/components/support";
import { Badge, Button, Card, LinkButton, SkeletonCard } from "@/components/ui";
import { Breathe } from "@/components/ui/Breathe";
import { LiveChat } from "@/components/ui/LiveChat"; 
import { cx, isoDay } from "@/lib/format";
import { recommendResources } from "@/lib/resources";
import { useStore } from "@/lib/store";
import { shouldPromptStudent } from "@/lib/support-indicator";

/** Shape of a document in the Firestore `cases` collection. */
type CaseDoc = {
  id: string;
  caseId?: string;
  /** hidden owner key used to filter a student's own cases */
  ownerId?: string;
  studentHandle?: string;
  concern?: string;
  mode?: string;
  note?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
};


function greetingFor(date: Date): string {
  const h = date.getHours();
  if (h < 5) return "You're up late";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 22) return "Good evening";
  return "Winding down";
}

const QUICK_ACTIONS = [
  {
    href: "/student/journal/new",
    label: "Write privately",
    body: "A page only you can read. Nothing leaves this device.",
    icon: "📓",
    className: "border-info-200 bg-info-50 text-info-900 hover:border-info-300 hover:bg-info-100/70",
  },
  {
    href: "/student/support/request",
    label: "Book a counsellor",
    body: "Schedule a formal appointment with campus counselling.",
    icon: "🤝",
    className: "border-pro-200 bg-pro-50 text-pro-900 hover:border-pro-300 hover:bg-pro-100/70",
  },
];

export default function StudentHomePage() {
  const { ready, state, indicator, toast, dismissSupportPrompt } = useStore();
  const myHandle = state.identity?.handle ?? "MindMate";

  const [activeChatCase, setActiveChatCase] = useState<any | null>(null);
  
  // 🔥 FIREBASE REAL-TIME CASES
  const [realCases, setRealCases] = useState<any[]>([]);

  // useEffect(() => {
  //   // Fetching real cases from Firebase instead of local dummy data
  //   const q = query(collection(db, "cases"), orderBy("updatedAt", "desc"));
  //   const unsub = onSnapshot(q, (snap) => {
  //     const allCases = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  //     // Hackathon Hack: If you didn't save a strict userId, we show recent cases here for the demo.
  //     // Ideally, filter by: allCases.filter(c => c.userId === myHandle)
  //     setRealCases(allCases.slice(0, 5)); 
  //   });
  //   return () => unsub();
  // }, [myHandle]);

  useEffect(() => {
    // Fetching real cases from Firebase instead of local dummy data
    const q = query(collection(db, "cases"), orderBy("updatedAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      
      // doc.data() is untyped DocumentData — annotate what a case document
      // actually holds, otherwise only `id` is visible to TypeScript.
      const allCases: CaseDoc[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<CaseDoc, "id">),
      }));
      
      // 🔥 YAHAN HAI FIX: Sab cases me se sirf apne account (myHandle) wale filter karo
      // 🔥 YAHAN HAI FIX: Ab hum hidden 'ownerId' se filter kar rahe hain
      const myOwnCases = allCases.filter(c => c.ownerId === myHandle || c.studentHandle === myHandle);
      
      setRealCases(myOwnCases);

    });
    return () => unsub();
  }, [myHandle]);

  const recentTags = useMemo(() => {
    const recent = [...state.checkIns].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 5);
    return Array.from(new Set(recent.flatMap((c) => c.tags as string[])));
  }, [state.checkIns]);

  const recommended = useMemo(() => recommendResources(recentTags, 3), [recentTags]);

 const handleWithdraw = async (caseId: string) => {
    if (confirm("Are you sure you want to withdraw this request?")) {
      await deleteDoc(doc(db, "cases", caseId));
      toast("Request withdrawn successfully", "info");
      setActiveChatCase(null); // Drawer band karne ke liye
    }
  };

  if (!ready) {
    return (
      <div className="space-y-3"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>
    );
  }

  const analysisOn = state.consent.aiSupportAnalysis;
  const showPrompt = analysisOn && !state.simulate.aiDown && shouldPromptStudent(indicator) && state.dismissedPromptOn !== isoDay();

  return (
    <div className="stagger space-y-5 pb-0">
      <ThemeSelector />

      <header>
        <p className="muted text-sm">{greetingFor(new Date())},</p>
        <h1 className="text-2xl font-semibold tracking-tight text-navy-900">{myHandle}</h1>
        <p className="muted mt-1 text-sm">What support could you use right now?</p>
        <AnonymousModeBar className="mt-3" />
      </header>

      <DailyCheckIn />

      {/* Offered, never prescribed — no streak, nothing recorded. The one
          thing on this screen that asks nothing of the person using it. */}
      <Card className="py-7">
        <Breathe />
      </Card>

      <div aria-live="polite">
        {analysisOn && state.simulate.aiDown ? <AiUnavailable /> : null}
        {showPrompt ? <StudentSupportPrompt indicator={indicator} onDismiss={dismissSupportPrompt} className="animate-fade-up" /> : null}
      </div>

      <section aria-labelledby="quick-actions-heading">
        <h2 id="quick-actions-heading" className="mb-3 text-lg font-semibold tracking-tight text-navy-900">What would help right now?</h2>
        <ul className="grid grid-cols-2 gap-3">
          {QUICK_ACTIONS.map((a) => (
            <li key={a.href}>
              <Link href={a.href} className={cx("flex h-full min-h-[7.5rem] flex-col justify-between rounded-2xl border p-4 transition-colors", a.className)}>
                <span className="text-2xl leading-none" aria-hidden>{a.icon}</span>
                <span className="mt-3 block">
                  <span className="block font-semibold">{a.label}</span>
                  <span className="mt-0.5 block text-xs opacity-80">{a.body}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* 🔥 FIREBASE ACTIVE TRACKING WIDGET */}
      {realCases.length > 0 && (
        <section aria-labelledby="tracking-heading" className="animate-fade-up">
          <h2 id="tracking-heading" className="mb-3 text-lg font-semibold tracking-tight text-navy-900 flex items-center gap-2">
            📋 Track your requests (Live)
          </h2>
          <div className="space-y-3">
            {realCases.map((c) => (
              <div key={c.id} className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-teal-200 bg-white shadow-sm hover:shadow-md">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-navy-900">#{c.caseId || c.id.slice(-4).toUpperCase()}</span>
                    <Badge tone={c.status === 'requested' ? 'amber' : c.status === 'scheduled' ? 'teal' : 'pro'}>
                      {c.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-navy-700 font-medium">
                    Requested {c.mode?.toLowerCase() || 'chat'} support for {c.concern?.toLowerCase() || 'general support'}
                  </p>
                  <p className="text-xs text-navy-500 mt-1">
                    Updated: {c.updatedAt ? new Date(c.updatedAt).toLocaleString() : 'Just now'}
                  </p>
                </div>
                
                <div className="shrink-0 flex flex-wrap gap-2">
                  <Button tone="primary" size="sm" onClick={() => setActiveChatCase(c)}>
                    Open Chat 💬
                  </Button>
                  <Button tone="secondary" size="sm" onClick={() => handleWithdraw(c.id)}>
                    Withdraw ✕
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 🔥 THE MAGIC DRAWER WITH CONTEXT */}
      {activeChatCase && (
        <div className="fixed inset-0 z-[999] flex justify-end bg-navy-900/40 backdrop-blur-sm transition-all duration-300">
          <div className="h-screen w-full sm:w-[450px] bg-white shadow-2xl animate-in slide-in-from-right-8 duration-300 flex flex-col border-l border-navy-200">
            
            {/* 📝 CONTEXT HEADER (What the student originally wrote) */}
            <div className="bg-navy-50 p-5 border-b border-navy-200">
              <div className="flex justify-between items-start mb-2">
                <h2 className="font-bold text-navy-900 text-lg">Case #{activeChatCase.caseId || activeChatCase.id.slice(-4).toUpperCase()}</h2>
                <Badge tone={activeChatCase.status === 'requested' ? 'amber' : 'teal'}>
                  {activeChatCase.status.toUpperCase()}
                </Badge>
              </div>
              <div className="space-y-1 text-sm text-navy-700 bg-white p-3 rounded-lg border border-navy-100 shadow-sm mt-3">
                <p><span className="font-semibold text-navy-900">Concern:</span> {activeChatCase.concern || 'General support'}</p>
                <p><span className="font-semibold text-navy-900">Mode:</span> {activeChatCase.mode || 'Chat'}</p>
                <p className="mt-2"><span className="font-semibold text-navy-900 block mb-1">Your Note:</span> 
                  <span className="italic">"{activeChatCase.note || "No additional note provided."}"</span>
                </p>
              </div>
            </div>

            {/* LIVE CHAT */}
            {/* <div className="flex-1 overflow-hidden relative">
              <LiveChat chatId={activeChatCase.id} onClose={() => setActiveChatCase(null)} />
            </div> */}
{/* LIVE CHAT */}
            <div className="flex-1 overflow-hidden relative">
              <LiveChat 
                chatId={activeChatCase.id} 
                userType="student" 
                onClose={() => setActiveChatCase(null)} 
              />
            </div>


          </div>
        </div>
      )}

    </div>
  );
}