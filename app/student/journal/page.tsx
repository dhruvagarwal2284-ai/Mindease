
// "use client";

// import Link from "next/link";
// import { useEffect, useState } from "react";
// import { collection, query, where, onSnapshot } from "firebase/firestore";
// import { db } from "@/lib/firebase"; // Make sure path is correct
// import { addJournalEntry, deleteJournalEntry } from "@/lib/journalDb"; // Make sure path is correct

// import { MoodTimeline } from "@/components/charts";
// import { PrivateSpaceHeader } from "@/components/journal";
// import { EmptyState, LinkButton, SkeletonCard, Button } from "@/components/ui";
// import { pluralize } from "@/lib/format";
// import { useStore } from "@/lib/store";

// export default function JournalHomePage() {
//   const { ready, state, toast } = useStore();
//   const myHandle = state.identity?.handle ?? "MindMate";

//   // 🔥 Firebase States
//   const [entries, setEntries] = useState<any[]>([]);
//   const [loadingFirebase, setLoadingFirebase] = useState(true);
  
//   // 🔥 Naya Entry Save karne ka State
//   const [draft, setDraft] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   // 1. FIREBASE SE DATA FETCH KARNA (REAL-TIME)
//   useEffect(() => {
//     if (!myHandle) return;

//     const q = query(collection(db, "journals"), where("userId", "==", myHandle));
    
//     const unsubscribe = onSnapshot(q, (snapshot) => {
//       const fetched = snapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));
//       // Date ke hisaab se sort karo (Newest first)
//       fetched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
//       setEntries(fetched);
//       setLoadingFirebase(false);
//     });

//     return () => unsubscribe();
//   }, [myHandle]);

//   // 2. ENTRY SAVE KARNA
//   const handleSave = async () => {
//     if (!draft.trim()) return;
//     setIsSubmitting(true);
//     try {
//       await addJournalEntry(myHandle, draft);
//       setDraft(""); 
//       toast("Entry saved securely to cloud ☁️", "success");
//     } catch (error) {
//       console.error(error);
//       toast("Failed to save entry", "error");
//     }
//     setIsSubmitting(false);
//   };

//   // 3. ENTRY DELETE KARNA
//   const handleDelete = async (id: string) => {
//     try {
//       await deleteJournalEntry(id);
//       toast("Entry deleted forever 🗑️", "info");
//     } catch (error) {
//       console.error(error);
//       toast("Failed to delete", "error");
//     }
//   };

//   if (!ready || loadingFirebase) {
//     return (
//       <div className="space-y-3">
//         <SkeletonCard />
//         <SkeletonCard />
//       </div>
//     );
//   }

//   const checkInCount = state.checkIns.length;

//   return (
//     <div className="space-y-5">
//       <PrivateSpaceHeader
//         action={
//           <LinkButton href="/student/journal/new" tone="primary">
//             + Detailed entry
//           </LinkButton>
//         }
//       />

//       <div className="flex flex-wrap items-center justify-between gap-3">
//         <p className="muted text-sm">
//           {entries.length === 0
//             ? "No entries yet"
//             : `${entries.length} ${
//                 entries.length === 1 ? "entry" : "entries"
//               } secured in cloud`}
//         </p>
//       </div>

//       {/* --------------------------------------------------- QUICK ADD BOX */}
//       <section className="card p-4 sm:p-5 bg-teal-50/30 border-teal-100">
//         <h2 className="text-sm font-semibold text-navy-900 mb-2">Quick Cloud Journal ☁️</h2>
//         <textarea
//           className="w-full rounded-xl border border-navy-200 p-3 text-sm text-navy-900 focus:outline-teal-500"
//           rows={3}
//           placeholder="How are you feeling right now? (Saves directly to Firebase)"
//           value={draft}
//           onChange={(e) => setDraft(e.target.value)}
//         />
//         <div className="mt-3 flex justify-end">
//           <Button onClick={handleSave} disabled={isSubmitting || !draft.trim()}>
//             {isSubmitting ? "Saving..." : "Save Entry"}
//           </Button>
//         </div>
//       </section>

//       {/* --------------------------------------------------- MOOD PATTERN */}
//       <section
//         className="card p-4 sm:p-5"
//         aria-labelledby="mood-pattern-heading"
//       >
//         <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
//           <div>
//             <h2
//               id="mood-pattern-heading"
//               className="text-lg font-semibold tracking-tight text-navy-900"
//             >
//               Your mood pattern
//             </h2>
//             <p className="muted mt-0.5 text-sm">
//               Your own check-ins, kept on this device. Not a score, not a
//               rating.
//             </p>
//           </div>
//           <Link
//             href="/student/journal/trends"
//             className="min-h-11 self-center text-sm font-medium text-teal-800 hover:underline"
//           >
//             See your history →
//           </Link>
//         </div>

//         {checkInCount < 2 ? (
//           <div className="rounded-xl border border-dashed border-navy-200 bg-navy-50/50 px-5 py-8 text-center">
//             <p className="text-2xl" aria-hidden>🌱</p>
//             <p className="mt-1 font-medium text-navy-900">
//               Nothing to show yet
//             </p>
//             <p className="muted mx-auto mt-1 max-w-sm text-sm">
//               Two check-ins are enough to start seeing a shape. There is no
//               streak to keep and nothing to catch up on.
//             </p>
//           </div>
//         ) : (
//           <>
//             <MoodTimeline checkIns={state.checkIns} />
//             <p className="muted mt-2 text-xs">
//               {pluralize(checkInCount, "check-in")} recorded. Only you can see
//               this.
//             </p>
//           </>
//         )}
//       </section>

//       {/* ----------------------------------------------------- FIREBASE JOURNAL ENTRIES */}
//       {entries.length === 0 ? (
//         <EmptyState
//           icon="📓"
//           title="Nothing here yet"
//           body="Write your first entry in the box above. It will be securely saved to your Firebase cloud."
//         />
//       ) : (
//         <div className="space-y-4">
//           <h2 className="text-xs font-semibold tracking-wide text-navy-500 uppercase">
//             Your Cloud Entries
//           </h2>
          
//           {entries.map((entry) => (
//             <article key={entry.id} className="card p-4 sm:p-5 border-l-4 border-l-teal-400">
//               <p className="text-sm text-navy-900 whitespace-pre-wrap leading-relaxed">
//                 {entry.content}
//               </p>
              
//               <div className="mt-4 flex items-center justify-between border-t border-navy-100 pt-3">
//                 <span className="text-[11px] text-navy-400 font-medium">
//                   {new Date(entry.createdAt).toLocaleString()}
//                 </span>
                
//                 <button
//                   onClick={() => handleDelete(entry.id)}
//                   className="text-[11px] font-semibold text-urgent-600 hover:text-urgent-700 hover:underline px-2 py-1 rounded bg-urgent-50"
//                 >
//                   Delete 🗑️
//                 </button>
//               </div>
//             </article>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase"; // Make sure path is correct
import { addJournalEntry, deleteJournalEntry } from "@/lib/journalDb"; // Make sure path is correct

import { MoodTimeline } from "@/components/charts";
// 🔥 NAYA: JournalCard aur JournalEditor ko import kiya
import { PrivateSpaceHeader, JournalCard, JournalEditor } from "@/components/journal"; 
import { EmptyState, LinkButton, SkeletonCard, Button } from "@/components/ui";
import { pluralize } from "@/lib/format";
import { useStore } from "@/lib/store";
import { JournalEntry } from "@/lib/types";

export default function JournalHomePage() {
  const { ready, state, toast } = useStore();
  const myHandle = state.identity?.handle ?? "MindMate";

  // 🔥 Firebase States
  const [entries, setEntries] = useState<any[]>([]);
  const [loadingFirebase, setLoadingFirebase] = useState(true);
  
  // 🔥 Quick Entry States
  const [draft, setDraft] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🔥 Split-Screen (Side-by-Side) State
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  // 1. FIREBASE SE DATA FETCH KARNA (REAL-TIME)
  useEffect(() => {
    if (!myHandle) return;

    const q = query(collection(db, "journals"), where("userId", "==", myHandle));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      // Date ke hisaab se sort karo (Newest first)
      fetched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setEntries(fetched);
      setLoadingFirebase(false);
    });

    return () => unsubscribe();
  }, [myHandle]);

  // 2. QUICK ENTRY SAVE KARNA
  const handleSave = async () => {
    if (!draft.trim()) return;
    setIsSubmitting(true);
    try {
      await addJournalEntry(myHandle, draft);
      setDraft(""); 
      toast("Quick entry saved securely to cloud ☁️", "success");
    } catch (error) {
      console.error(error);
      toast("Failed to save entry", "error");
    }
    setIsSubmitting(false);
  };

  // 3. ENTRY DELETE KARNA
  const handleDelete = async (id: string) => {
    try {
      await deleteJournalEntry(id);
      if (selectedEntry?.id === id) setSelectedEntry(null); // Agar open hai toh close kardo
      toast("Entry deleted forever 🗑️", "info");
    } catch (error) {
      console.error(error);
      toast("Failed to delete", "error");
    }
  };

  if (!ready || loadingFirebase) {
    return (
      <div className="space-y-3">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  const checkInCount = state.checkIns.length;

  return (
    // 🔥 NAYA: flex layout for Split Screen View
    <div className="flex flex-col lg:flex-row gap-6 items-start relative">
      
      {/* ================= LEFT SIDE (MAIN FEED) ================= */}
      <div className={`w-full transition-all duration-300 ease-in-out ${selectedEntry ? 'lg:w-[45%]' : 'lg:w-full'} space-y-5`}>
        
        <PrivateSpaceHeader
          action={
            <LinkButton href="/student/journal/new" tone="primary">
              + Detailed entry
            </LinkButton>
          }
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="muted text-sm">
            {entries.length === 0
              ? "No entries yet"
              : `${entries.length} ${
                  entries.length === 1 ? "entry" : "entries"
                } secured in cloud`}
          </p>
        </div>

        {/* --------------------------------------------------- QUICK ADD BOX */}
        <section className="card p-4 sm:p-5 bg-teal-50/30 border-teal-100 shadow-sm transition-all hover:shadow-md">
          <h2 className="text-sm font-semibold text-navy-900 mb-2">Quick Cloud Journal ☁️</h2>
          <textarea
            className="w-full rounded-xl border border-navy-200 bg-white p-3 text-sm text-navy-900 focus:outline-teal-500 focus:ring-2 focus:ring-teal-100"
            rows={3}
            placeholder="How are you feeling right now? (Saves directly to Firebase)"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <div className="mt-3 flex justify-end">
            <Button onClick={handleSave} disabled={isSubmitting || !draft.trim()}>
              {isSubmitting ? "Saving..." : "Save Entry"}
            </Button>
          </div>
        </section>

        {/* --------------------------------------------------- MOOD PATTERN */}
        <section
          className="card p-4 sm:p-5 shadow-sm"
          aria-labelledby="mood-pattern-heading"
        >
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2
                id="mood-pattern-heading"
                className="text-lg font-semibold tracking-tight text-navy-900"
              >
                Your mood pattern
              </h2>
              <p className="muted mt-0.5 text-sm">
                Your own check-ins, kept on this device. Not a score, not a rating.
              </p>
            </div>
            <Link
              href="/student/journal/trends"
              className="min-h-11 self-center text-sm font-medium text-teal-800 hover:underline"
            >
              See your history →
            </Link>
          </div>

          {checkInCount < 2 ? (
            <div className="rounded-xl border border-dashed border-navy-200 bg-navy-50/50 px-5 py-8 text-center">
              <p className="text-2xl" aria-hidden>🌱</p>
              <p className="mt-1 font-medium text-navy-900">
                Nothing to show yet
              </p>
              <p className="muted mx-auto mt-1 max-w-sm text-sm">
                Two check-ins are enough to start seeing a shape. There is no
                streak to keep and nothing to catch up on.
              </p>
            </div>
          ) : (
            <>
              <MoodTimeline checkIns={state.checkIns} />
              <p className="muted mt-2 text-xs">
                {pluralize(checkInCount, "check-in")} recorded. Only you can see this.
              </p>
            </>
          )}
        </section>

        {/* ----------------------------------------------------- FIREBASE JOURNAL ENTRIES */}
        {entries.length === 0 ? (
          <EmptyState
            icon="📓"
            title="Nothing here yet"
            body="Write your first entry in the box above. It will be securely saved to your Firebase cloud."
          />
        ) : (
          <div className="space-y-4">
            <h2 className="text-xs font-semibold tracking-wide text-navy-500 uppercase">
              Your Cloud Entries
            </h2>
            
            {entries.map((entry) => {
              // 🔥 Data Normalize: "Quick Add" wala field (content) mapping for JournalCard (body)
              const formattedEntry = {
                ...entry,
                body: entry.body || entry.content || "", 
                title: entry.title || "",
                mood: entry.mood ?? 3, // Default mood if quick add doesn't have one
                createdAt: entry.createdAt || new Date().toISOString(),
                tags: entry.tags || [],
              };

              return (
                <div key={entry.id} className="relative group">
                  {/* 🔥 Replace kiya raw code ko JournalCard se */}
                  <JournalCard 
                    entry={formattedEntry} 
                    isSelected={selectedEntry?.id === entry.id}
                    onClick={() => {
                      // Click karne par side panel me khulega
                      setSelectedEntry(formattedEntry);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }} 
                  />
                  
                  {/* Delete button ko hover pe absolute rakha taaki clean dikhe */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Card click event ko rokne ke liye
                      handleDelete(entry.id);
                    }}
                    className="absolute top-4 right-4 text-[11px] font-semibold text-urgent-600 hover:text-urgent-700 hover:bg-urgent-100 px-2 py-1 rounded bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    title="Delete entry"
                  >
                    Delete 🗑️
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ================= RIGHT SIDE (EDIT PANEL / SPLIT SCREEN) ================= */}
      {selectedEntry && (
        <div className="w-full lg:w-[55%] sticky top-6 z-20 animate-in slide-in-from-right-4 fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-xl border border-navy-100 overflow-hidden relative">
            
            {/* Close Button Header */}
            <div className="bg-navy-50 border-b border-navy-100 px-4 py-3 flex justify-between items-center">
              <span className="text-sm font-semibold text-navy-700 flex items-center gap-2">
                <span aria-hidden>📝</span> Quick Edit Mode
              </span>
              <button 
                onClick={() => setSelectedEntry(null)} 
                className="text-navy-500 hover:text-navy-900 bg-white border border-navy-200 rounded-full px-3 py-1 text-xs font-medium transition-colors shadow-sm"
              >
                ✕ Close
              </button>
            </div>

            {/* The Editor itself */}
            <div className="p-5 max-h-[85vh] overflow-y-auto custom-scrollbar">
              {/* JournalEditor component yaha render ho raha hai jisse heading aur details sab change ho sakta hai */}
              <JournalEditor entry={selectedEntry} />
            </div>

          </div>
        </div>
      )}

    </div>
  );
}