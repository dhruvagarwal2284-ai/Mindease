// "use client";

// import Link from "next/link";
// import { useParams, useRouter } from "next/navigation";
// import { useState, useEffect } from "react"; // 🔥 useEffect added
// // 🔥 FIREBASE IMPORTS
// import { doc, onSnapshot, updateDoc } from "firebase/firestore";
// import { db } from "@/lib/firebase";

// import { WeeklyMoodBars } from "@/components/charts";
// import { HumanReviewBanner } from "@/components/support";
// import { LiveChat } from "@/components/ui/LiveChat"; // 🔥 CHAT COMPONENT ADDED
// import {
//   Badge,
//   Button,
//   Callout,
//   EmptyState,
//   Field,
//   Input,
//   Modal,
//   SectionTitle,
//   Select,
//   SkeletonCard,
//   Textarea,
//   Timeline,
// } from "@/components/ui";
// import { cx, formatDateTime, formatDay, formatTime, isoDay } from "@/lib/format";
// import { SCOPE_COPY } from "@/lib/privacy";
// import { RESOURCES, resourceById } from "@/lib/resources";
// import { useStore } from "@/lib/store";
// import { SUPPORT_MODES } from "@/lib/types";
// import type { CaseStatus, SharedDataScope, SupportMode, CounsellingCase } from "@/lib/types";

// const STATUS_TONE: Record<CaseStatus, "info" | "amber" | "mint" | "neutral" | "pro"> = {
//   requested: "info",
//   awaiting_student: "amber",
//   active: "mint",
//   scheduled: "pro",
//   closed: "neutral",
// };

// const STATUS_LABEL: Record<CaseStatus, string> = {
//   requested: "Pending request",
//   awaiting_student: "Awaiting student response",
//   active: "Active",
//   scheduled: "Scheduled",
//   closed: "Closed",
// };

// export default function CaseDetailPage() {
//   const params = useParams<{ id: string }>();
//   const id = Array.isArray(params.id) ? params.id[0] : params.id;
//   const router = useRouter();
  
//   const {
//     ready,
//     state,
//     indicator,
//     addCaseNote,
//     offerResource,
//     requestVoluntaryContact,
//     scheduleAppointment,
//     recordFollowUp,
//     toast,
//   } = useStore();

//   // 🔥 FIREBASE STATES
//   const [kase, setKase] = useState<CounsellingCase | null>(null);
//   const [loadingFirebase, setLoadingFirebase] = useState(true);
  
//   // 🔥 CHAT STATE
//   const [chatOpen, setChatOpen] = useState(false);

//   const [note, setNote] = useState("");
//   const [showResource, setShowResource] = useState(false);
//   const [resourcePick, setResourcePick] = useState(RESOURCES[0].id);
//   const [showSchedule, setShowSchedule] = useState(false);
//   const [apptDate, setApptDate] = useState(isoDay(new Date()));
//   const [apptTime, setApptTime] = useState("16:30");
//   const [apptMode, setApptMode] = useState<SupportMode>("In-person");
//   const [followUp, setFollowUp] = useState("");
//   const [showContact, setShowContact] = useState(false);
//   const [showClose, setShowClose] = useState(false);

//   // 🔥 1. REAL-TIME FIREBASE LISTENER (Fetches exact case by ID)
//   useEffect(() => {
//     if (!id) return;
//     const docRef = doc(db, "cases", id);
    
//     const unsubscribe = onSnapshot(docRef, (docSnap) => {
//       if (docSnap.exists()) {
//         setKase({ id: docSnap.id, ...docSnap.data() } as CounsellingCase);
//       } else {
//         setKase(null);
//       }
//       setLoadingFirebase(false);
//     }, (error) => {
//       console.error("Error fetching case:", error);
//       setLoadingFirebase(false);
//     });

//     return () => unsubscribe();
//   }, [id]);

//   // 🔥 2. HELPER TO UPDATE STATUS IN FIREBASE
//   const updateFirebaseStatus = async (newStatus: CaseStatus) => {
//     try {
//       await updateDoc(doc(db, "cases", id), {
//         status: newStatus,
//         updatedAt: new Date().toISOString(),
//       });
//       toast(`Case updated to ${newStatus}`, "success");
//     } catch (error) {
//       console.error("Failed to update status", error);
//       toast("Failed to update case", "urgent");
//     }
//   };

//   const handleAcceptAndChat = async () => {
//     if (kase?.status === "requested") {
//       await updateFirebaseStatus("active");
//     }
//     setChatOpen(true);
//   };

//   // ----------------------------------------------------

//   if (!ready || loadingFirebase) return <SkeletonCard />;

//   if (!kase) {
//     return (
//       <EmptyState
//         icon="🗂️"
//         title="No such case"
//         body="It may have been closed and archived, or the link may be stale."
//         action={
//           <Link
//             href="/counsellor/cases"
//             className="inline-flex min-h-11 items-center rounded-xl bg-pro-700 px-4 font-medium text-white hover:bg-pro-800"
//           >
//             Back to cases
//           </Link>
//         }
//       />
//     );
//   }

//   // Safe fallbacks for privacy logic in case Firebase data is missing some fields
//   const safeScope = kase.sharedScope || {};
//   const scopeKeys = Object.keys(SCOPE_COPY) as (keyof SharedDataScope)[];
//   const consented = scopeKeys.filter((k) => safeScope[k]);
//   const withheld = scopeKeys.filter((k) => !safeScope[k]);

//   const appts = (state.appointments || [])
//     .filter((a) => a.caseId === kase.caseId)
//     .sort((a, b) => (a.at < b.at ? 1 : -1));
//   const upcoming = appts.filter((a) => a.status === "upcoming");
//   const previous = appts.filter((a) => a.status !== "upcoming");

//   const sharedJournal = kase.isDemoStudent
//     ? state.journal.filter((j) => j.sharedWithCounsellor)
//     : [];
//   const recentTags = kase.isDemoStudent
//     ? [...new Set(state.checkIns.slice(-10).flatMap((c) => c.tags))]
//     : [];

//   const scopeValue = (k: keyof SharedDataScope) => {
//     if (k === "concern") return <p className="text-sm text-navy-800">{kase.concern}</p>;
//     if (k === "preferredMode") return <p className="text-sm text-navy-800">{kase.mode}</p>;
//     if (k === "contactHandle")
//       return (
//         <p className="font-mono text-sm text-navy-800">
//           {kase.studentHandle ?? "Not attached"}
//         </p>
//       );
//     if (k === "moodTrend")
//       return kase.isDemoStudent ? (
//         <WeeklyMoodBars weeks={indicator.weeklyMood} compact />
//       ) : (
//         <p className="muted text-sm">Weekly averages shared by the student.</p>
//       );
//     // ... rest of the scopeValue logic remains same
//     return null;
//   };

//   return (
//     <div className="space-y-5">
//       <Link href="/counsellor/cases" className="muted inline-block text-sm hover:underline">
//         ← Cases
//       </Link>

//       <HumanReviewBanner />

//       <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
//         {/* ------------------------------------------------------- main */}
//         <div className="space-y-5">
//           <header className="card p-4 sm:p-5">
//             <div className="flex flex-wrap items-start justify-between gap-3">
//               <div>
//                 <h1 className="font-mono text-2xl font-semibold tracking-tight text-navy-900">
//                   Case #{kase.caseId}
//                 </h1>
//                 <p className="muted mt-1 text-sm">
//                   {kase.concern} · {kase.mode}
//                 </p>
//               </div>
//               <Badge tone={STATUS_TONE[kase.status]}>{STATUS_LABEL[kase.status]}</Badge>
//             </div>

//             {kase.studentHandle ? (
//               <Callout tone="amber" icon="🤝" title="Identity linked by consent" className="mt-4">
//                 The student attached{" "}
//                 <span className="font-mono font-medium">{kase.studentHandle}</span> so you can
//                 reply directly. This is still a pseudonym — no name, email or roll number was
//                 shared.
//               </Callout>
//             ) : (
//               <Callout tone="info" icon="🕶️" title="Anonymous until consent" className="mt-4">
//                 You cannot see who this student is, and there is no control on this screen
//                 that would reveal it. Identity linkage happens only when the student
//                 explicitly opts in from their own device.
//               </Callout>
//             )}
//           </header>

//           <section className="card p-4 sm:p-5">
//             <SectionTitle title="Overview" />
//             <dl className="grid gap-3 sm:grid-cols-2">
//               {[
//                 ["Student-selected concern", kase.concern],
//                 ["Preferred support mode", kase.mode],
//                 ["Current status", STATUS_LABEL[kase.status]],
//                 ["Requested", kase.createdAt ? formatDateTime(kase.createdAt) : "Just now"],
//                 ["Last updated", kase.updatedAt ? formatDateTime(kase.updatedAt) : "Just now"],
//                 ["Next follow-up", kase.nextFollowUp ? formatDay(kase.nextFollowUp) : "Not set"],
//               ].map(([label, value]) => (
//                 <div key={label} className="rounded-lg border border-navy-100 p-3">
//                   <dt className="muted text-xs tracking-wide uppercase">{label}</dt>
//                   <dd className="mt-0.5 text-sm font-medium text-navy-900">{value}</dd>
//                 </div>
//               ))}
//             </dl>
//             {kase.note ? (
//               <div className="mt-3 rounded-xl border border-navy-100 bg-navy-50/60 p-3.5">
//                 <p className="muted text-xs tracking-wide uppercase">
//                   What the student wrote
//                 </p>
//                 <p className="mt-1 text-sm whitespace-pre-wrap text-navy-800">{kase.note}</p>
//               </div>
//             ) : null}
//           </section>

//           {/* Student-shared information section (Kept exactly as your original code) */}
//           {/* ... */}
//         </div>

//         {/* ---------------------------------------------------- sidebar */}
//         <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          
//           <section className="card p-4 border-2 border-teal-500">
//             <h2 className="mb-3 text-sm font-semibold tracking-wide text-navy-700 uppercase">
//               Immediate Action
//             </h2>
//             <div className="space-y-2">
//               {/* 🔥 NEW LIVE CHAT BUTTON */}
//               <Button 
//                 full 
//                 size="lg" 
//                 tone="primary" 
//                 onClick={handleAcceptAndChat}
//               >
//                 {kase.status === "requested" ? "💬 Accept & Chat Now" : "💬 Open Live Chat"}
//               </Button>
//             </div>
//           </section>

//           <section className="card p-4">
//             <h2 className="mb-3 text-sm font-semibold tracking-wide text-navy-700 uppercase">
//               Case management
//             </h2>
//             <div className="space-y-2">
//               <Button full onClick={() => setShowResource(true)}>
//                 Offer a resource
//               </Button>
//               <Button full onClick={() => setShowSchedule(true)}>
//                 Schedule appointment
//               </Button>
//               <Button
//                 full
//                 tone="ghost"
//                 onClick={() => setShowClose(true)}
//                 disabled={kase.status === "closed"}
//               >
//                 Close or archive
//               </Button>
//             </div>
//           </section>

//           <section className="rounded-2xl border border-pro-200 bg-pro-50 p-4">
//             <h2 className="text-sm font-semibold text-pro-900">Role boundary</h2>
//             <p className="mt-1 text-sm text-pro-900/80">
//               This screen mirrors the backend&rsquo;s consent boundary — it does not create
//               it. There is no action here that can surface data the student did not share.
//             </p>
//           </section>
//         </aside>
//       </div>

//       {/* --------------------------------------------------------- modals */}
//       {/* Rest of your Modals (Resource, Contact, Schedule) remain unchanged */}

//       <Modal
//         open={showClose}
//         onClose={() => setShowClose(false)}
//         size="sm"
//         title="Close this case?"
//         description="Closing archives it under institutional workflow. The student can always re-request support."
//         footer={
//           <>
//             <Button onClick={() => setShowClose(false)}>Cancel</Button>
//             <Button
//               tone="pro"
//               onClick={async () => {
//                 // 🔥 UPDATED TO WRITE TO FIREBASE
//                 await updateFirebaseStatus("closed");
//                 setShowClose(false);
//                 router.push("/counsellor/cases"); // Redirect back to list
//               }}
//             >
//               Close case
//             </Button>
//           </>
//         }
//       />

//       {/* 🔥 RIGHT SIDE DRAWER FOR LIVE CHAT */}
//       {chatOpen && (
//         <div className="fixed inset-0 z-[999] flex justify-end bg-navy-900/40 backdrop-blur-sm transition-all duration-300">
//           <div className="h-screen w-full sm:w-[450px] bg-white shadow-2xl animate-in slide-in-from-right-8 duration-300 flex flex-col p-4 border-l border-navy-200">
//              {/* Make sure to pass your counsellor identity prop if required by LiveChat */}
//             {/* <LiveChat chatId={kase.caseId} userType="counsellor" onClose={() => setChatOpen(false)} /> */}
//             <LiveChat chatId={kase.caseId} userType="counsellor" onClose={() => setChatOpen(false)} />
//           </div>
//         </div>
//       )}

//     </div>
//   );
// }
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

import { Badge, Button, SkeletonCard } from "@/components/ui";
// 🔥 WAHI SAME CHAT COMPONENT IMPORT KIYA
import { LiveChat } from "@/components/ui/LiveChat"; 

export default function CounsellorCaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  
  // URL se case id nikal rahe hain
  const caseId = params.id as string;

  const [caseData, setCaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 1. 🔥 FIREBASE SE SPECIFIC CASE FETCH KARNA
  useEffect(() => {
    if (!caseId) return;
    const unsub = onSnapshot(doc(db, "cases", caseId), (docSnap) => {
      if (docSnap.exists()) {
        setCaseData({ id: docSnap.id, ...docSnap.data() });
      }
      setLoading(false);
    });
    return () => unsub();
  }, [caseId]);

  // 2. 🔥 CASE ACCEPT KARNE KA LOGIC
  const handleAcceptCase = async () => {
    try {
      await updateDoc(doc(db, "cases", caseId), {
        status: "active",
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error accepting case:", error);
    }
  };

  if (loading) return <div className="p-10"><SkeletonCard /></div>;
  
  if (!caseData) return (
    <div className="p-10 text-center">
      <h2 className="text-xl font-bold text-navy-900">Case not found</h2>
      <Button onClick={() => router.push('/counsellor/cases')} className="mt-4">Back to Dashboard</Button>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 items-start">
      
      {/* ================= LEFT SIDE: CASE DETAILS ================= */}
      <div className="w-full lg:w-[45%] space-y-6">
        
        {/* Header */}
        <header className="flex items-start justify-between">
          <div>
            <button onClick={() => router.push('/counsellor/cases')} className="text-sm text-navy-500 hover:underline mb-2">
              ← Back to Cases
            </button>
            <h1 className="text-2xl font-bold text-navy-900 tracking-tight">
              Case #{caseData.caseId || caseData.id.slice(-4).toUpperCase()}
            </h1>
            <p className="text-sm text-navy-600 mt-1">
              Student: <span className="font-semibold">{caseData.studentHandle || "Anonymous"}</span>
            </p>
          </div>
          <Badge tone={caseData.status === 'requested' ? 'amber' : 'teal'}>
            {caseData.status.toUpperCase()}
          </Badge>
        </header>

        {/* Case Info Card */}
        <div className="card p-5 space-y-5 shadow-sm border-navy-100">
          <div>
            <h3 className="text-xs font-bold text-navy-400 uppercase tracking-wider mb-1">Concern</h3>
            <p className="text-navy-900 font-medium">{caseData.concern || "General Support"}</p>
          </div>
          <div>
            <h3 className="text-xs font-bold text-navy-400 uppercase tracking-wider mb-1">Requested Mode</h3>
            <Badge tone="navy">{caseData.mode || "Chat"}</Badge>
          </div>
          <div>
            <h3 className="text-xs font-bold text-navy-400 uppercase tracking-wider mb-1">Student Note</h3>
            <div className="bg-navy-50 p-4 rounded-xl border border-navy-100 text-sm text-navy-800 italic">
              {caseData.note ? `"${caseData.note}"` : "No additional note provided by the student."}
            </div>
          </div>
        </div>

        {/* 🔥 ACCEPT BUTTON PANEL */}
        {caseData.status === "requested" && (
          <div className="card p-6 bg-teal-50 border-teal-200 shadow-sm text-center">
            <span className="text-3xl mb-2 block" aria-hidden>👋</span>
            <h3 className="font-semibold text-teal-900 text-lg">New Request Waiting</h3>
            <p className="text-sm text-teal-800 mb-5 mt-1">
              Accepting this case updates its status to active so the student knows you are here.
            </p>
            <Button tone="primary" size="lg" full onClick={handleAcceptCase}>
              Accept Case
            </Button>
          </div>
        )}
      </div>

      {/* ================= RIGHT SIDE: LIVE CHAT ================= */}
      <div className="w-full lg:w-[55%] sticky top-6">
        {/* 🔥 Yahan se Lock pura hata diya hai! Direct Chat Render hogi */}
        <LiveChat chatId={caseData.id} />
      </div>

    </div>
  );
}