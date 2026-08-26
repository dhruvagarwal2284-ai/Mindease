// "use client";

// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { useMemo, useState } from "react";
// import {
//   Badge,
//   Callout,
//   DataTable,
//   EmptyState,
//   LinkButton,
//   SectionTitle,
//   SkeletonCard,
//   Tabs,
// } from "@/components/ui";
// import type { Column } from "@/components/ui";
// import { formatDateTime, formatDayShort, isoDay, pluralize, relativeTime } from "@/lib/format";
// import { useStore } from "@/lib/store";
// import type { CaseStatus, CounsellingCase } from "@/lib/types";

// /* ------------------------------------------------------------------ status */

// type StatusTone = "info" | "amber" | "teal" | "pro" | "neutral";

// const STATUS_COPY: Record<CaseStatus, { label: string; tone: StatusTone }> = {
//   requested: { label: "Requested", tone: "info" },
//   awaiting_student: { label: "Awaiting student", tone: "amber" },
//   active: { label: "Active", tone: "teal" },
//   scheduled: { label: "Scheduled", tone: "pro" },
//   closed: { label: "Closed", tone: "neutral" },
// };

// /* -------------------------------------------------------------------- tabs */

// type TabKey = "active" | "pending" | "followups" | "history";

// const ACTIVE_STATUSES: CaseStatus[] = ["active", "scheduled", "awaiting_student"];

// function isActive(c: CounsellingCase): boolean {
//   return ACTIVE_STATUSES.includes(c.status);
// }

// function isFollowUpDue(c: CounsellingCase, today: string): boolean {
//   return Boolean(c.nextFollowUp) && (c.nextFollowUp as string) <= today;
// }

// function byUpdatedDesc(a: CounsellingCase, b: CounsellingCase): number {
//   return a.updatedAt < b.updatedAt ? 1 : -1;
// }

// /* -------------------------------------------------------------------- page */

// export default function CounsellorCasesPage() {
//   const { ready, state } = useStore();
//   const router = useRouter();
//   const [tab, setTab] = useState<TabKey>("active");

//   const today = isoDay();

//   const buckets = useMemo(() => {
//     const cases = state.cases;
//     return {
//       active: cases.filter(isActive).sort(byUpdatedDesc),
//       pending: cases.filter((c) => c.status === "requested").sort(byUpdatedDesc),
//       followups: cases
//         .filter((c) => c.status !== "closed" && isFollowUpDue(c, today))
//         .sort((a, b) => ((a.nextFollowUp ?? "") < (b.nextFollowUp ?? "") ? -1 : 1)),
//       history: cases.filter((c) => c.status === "closed").sort(byUpdatedDesc),
//     };
//   }, [state.cases, today]);

//   const columns: Column<CounsellingCase>[] = useMemo(() => {
//     const base: Column<CounsellingCase>[] = [
//       {
//         key: "caseId",
//         header: "Case ID",
//         className: "w-28",
//         render: (c) => (
//           <Link
//             href={`/counsellor/cases/${c.id}`}
//             onClick={(e) => e.stopPropagation()}
//             className="font-mono text-sm font-semibold text-navy-900 underline-offset-2 hover:underline"
//           >
//             #{c.caseId}
//           </Link>
//         ),
//       },
//       {
//         key: "student",
//         header: "Student",
//         render: (c) =>
//           c.studentHandle ? (
//             <span className="font-medium text-navy-900">{c.studentHandle}</span>
//           ) : (
//             <span className="muted italic">Anonymous until consent</span>
//           ),
//       },
//       {
//         key: "concern",
//         header: "Concern",
//         render: (c) => <span className="text-navy-800">{c.concern}</span>,
//       },
//       {
//         key: "mode",
//         header: "Mode",
//         className: "w-28",
//         render: (c) => <Badge tone="navy">{c.mode}</Badge>,
//       },
//       {
//         key: "status",
//         header: "Status",
//         className: "w-40",
//         render: (c) => (
//           <Badge tone={STATUS_COPY[c.status].tone}>{STATUS_COPY[c.status].label}</Badge>
//         ),
//       },
//       {
//         key: "updated",
//         header: "Last updated",
//         className: "w-36",
//         render: (c) => (
//           <span className="muted text-xs" title={formatDateTime(c.updatedAt)}>
//             {relativeTime(c.updatedAt)}
//           </span>
//         ),
//       },
//     ];

//     if (tab !== "followups") return base;

//     return [
//       ...base,
//       {
//         key: "followUp",
//         header: "Follow-up due",
//         className: "w-36",
//         render: (c) => {
//           if (!c.nextFollowUp) return <span className="muted text-xs">—</span>;
//           const overdue = c.nextFollowUp < today;
//           return (
//             <Badge tone={overdue ? "amber" : "info"}>
//               {overdue ? "Overdue · " : "Today · "}
//               {formatDayShort(c.nextFollowUp)}
//             </Badge>
//           );
//         },
//       },
//     ];
//   }, [tab, today]);

//   if (!ready) {
//     return (
//       <div className="space-y-3">
//         <SkeletonCard />
//         <SkeletonCard />
//       </div>
//     );
//   }

//   const rows = buckets[tab];

//   const EMPTY: Record<TabKey, React.ReactNode> = {
//     active: (
//       <EmptyState
//         icon="🤝"
//         title="No active cases right now"
//         body="Nothing is open on your caseload. When a student chooses to talk to someone, their case appears here — under an anonymous case ID until they opt in to sharing more."
//         action={<LinkButton href="/counsellor/alerts">Review support alerts</LinkButton>}
//       />
//     ),
//     pending: (
//       <EmptyState
//         icon="📮"
//         title="No new requests waiting"
//         body="Every request a student sends is listed here first, with only the items they explicitly ticked to share."
//         action={<LinkButton href="/counsellor/alerts">Go to the alert queue</LinkButton>}
//       />
//     ),
//     followups: (
//       <EmptyState
//         icon="🗓️"
//         title="No follow-ups due today"
//         body="Follow-ups you record on a case show up here on the day they fall due, so nobody quietly slips off the list."
//       />
//     ),
//     history: (
//       <EmptyState
//         icon="📁"
//         title="No closed cases yet"
//         body="Cases you close or archive stay here as a record. A student can always re-request support; closing a case never closes the door."
//       />
//     ),
//   };

//   return (
//     <div className="space-y-5">
//       <SectionTitle
//         title="Case management"
//         subtitle="Opt-in counselling cases. Identity stays withheld until the student chooses to share it."
//       />

//       <Callout tone="pro" icon="🔐" title="Anonymous case IDs by default">
//         A case shows a pseudonym only where the student ticked &ldquo;share my
//         pseudonym&rdquo;. Everything else on a case is limited to the items they consented
//         to — this screen cannot request more.
//       </Callout>

//       <Tabs<TabKey>
//         tone="pro"
//         value={tab}
//         onChange={setTab}
//         tabs={[
//           { value: "active", label: "Active cases", count: buckets.active.length },
//           { value: "pending", label: "Pending requests", count: buckets.pending.length },
//           { value: "followups", label: "Follow-ups due", count: buckets.followups.length },
//           { value: "history", label: "Case history", count: buckets.history.length },
//         ]}
//       />

//       <p className="muted text-sm" aria-live="polite">
//         {rows.length
//           ? `Showing ${pluralize(rows.length, "case")}, most recently updated first.`
//           : "Nothing in this view."}
//       </p>

//       <DataTable<CounsellingCase>
//         caption="Counselling cases"
//         columns={columns}
//         rows={rows}
//         rowKey={(c) => c.id}
//         onRowClick={(c) => router.push(`/counsellor/cases/${c.id}`)}
//         empty={EMPTY[tab]}
//       />
//     </div>
//   );
// }


"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useEffect } from "react"; // 🔥 useEffect added
import { collection, query, onSnapshot } from "firebase/firestore"; // 🔥 Firebase imports
import { db } from "@/lib/firebase"; // 🔥 Your Firebase instance

import {
  Badge,
  Callout,
  DataTable,
  EmptyState,
  LinkButton,
  SectionTitle,
  SkeletonCard,
  Tabs,
} from "@/components/ui";
import type { Column } from "@/components/ui";
import { formatDateTime, formatDayShort, isoDay, pluralize, relativeTime } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { CaseStatus, CounsellingCase } from "@/lib/types";

/* ------------------------------------------------------------------ status */

type StatusTone = "info" | "amber" | "teal" | "pro" | "neutral";

const STATUS_COPY: Record<CaseStatus, { label: string; tone: StatusTone }> = {
  requested: { label: "Requested", tone: "info" },
  awaiting_student: { label: "Awaiting student", tone: "amber" },
  active: { label: "Active", tone: "teal" },
  scheduled: { label: "Scheduled", tone: "pro" },
  closed: { label: "Closed", tone: "neutral" },
};

/* -------------------------------------------------------------------- tabs */

type TabKey = "active" | "pending" | "followups" | "history";

const ACTIVE_STATUSES: CaseStatus[] = ["active", "scheduled", "awaiting_student"];

function isActive(c: CounsellingCase): boolean {
  return ACTIVE_STATUSES.includes(c.status);
}

function isFollowUpDue(c: CounsellingCase, today: string): boolean {
  return Boolean(c.nextFollowUp) && (c.nextFollowUp as string) <= today;
}

function byUpdatedDesc(a: CounsellingCase, b: CounsellingCase): number {
  return a.updatedAt < b.updatedAt ? 1 : -1;
}

/* -------------------------------------------------------------------- page */

export default function CounsellorCasesPage() {
  const { ready, state } = useStore();
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("active");

  // 🔥 FIREBASE STATES
  const [firebaseCases, setFirebaseCases] = useState<CounsellingCase[]>([]);
  const [loadingFirebase, setLoadingFirebase] = useState(true);

  const today = isoDay();

  // 🔥 REAL-TIME FIREBASE LISTENER
  useEffect(() => {
    // Assuming your collection is named "cases" in Firestore
    const q = query(collection(db, "cases"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedCases = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as CounsellingCase[];
      
      setFirebaseCases(fetchedCases);
      setLoadingFirebase(false);
    }, (error) => {
      console.error("Error fetching cases from Firebase:", error);
      setLoadingFirebase(false);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  // 🔥 UPDATED: Now grouping based on 'firebaseCases' instead of 'state.cases'
  const buckets = useMemo(() => {
    const cases = firebaseCases; 
    return {
      active: cases.filter(isActive).sort(byUpdatedDesc),
      pending: cases.filter((c) => c.status === "requested").sort(byUpdatedDesc),
      followups: cases
        .filter((c) => c.status !== "closed" && isFollowUpDue(c, today))
        .sort((a, b) => ((a.nextFollowUp ?? "") < (b.nextFollowUp ?? "") ? -1 : 1)),
      history: cases.filter((c) => c.status === "closed").sort(byUpdatedDesc),
    };
  }, [firebaseCases, today]); // Dependency updated to firebaseCases

  const columns: Column<CounsellingCase>[] = useMemo(() => {
    const base: Column<CounsellingCase>[] = [
      {
        key: "caseId",
        header: "Case ID",
        className: "w-28",
        render: (c) => (
          <Link
            href={`/counsellor/cases/${c.id}`}
            onClick={(e) => e.stopPropagation()}
            className="font-mono text-sm font-semibold text-navy-900 underline-offset-2 hover:underline"
          >
            #{c.caseId || c.id.slice(-4).toUpperCase()} {/* 🔥 Fallback to Firestore ID if caseId is missing */}
          </Link>
        ),
      },
      {
        key: "student",
        header: "Student",
        render: (c) =>
          c.studentHandle ? (
            <span className="font-medium text-navy-900">{c.studentHandle}</span>
          ) : (
            <span className="muted italic">Anonymous until consent</span>
          ),
      },
      {
        key: "concern",
        header: "Concern",
        render: (c) => <span className="text-navy-800">{c.concern}</span>,
      },
      {
        key: "mode",
        header: "Mode",
        className: "w-28",
        render: (c) => <Badge tone="navy">{c.mode}</Badge>,
      },
      {
        key: "status",
        header: "Status",
        className: "w-40",
        render: (c) => {
          // 🔥 Safety check in case Firebase data has a status not defined in STATUS_COPY
          const statusInfo = STATUS_COPY[c.status] || { label: c.status, tone: "neutral" };
          return (
            <Badge tone={statusInfo.tone}>{statusInfo.label}</Badge>
          );
        },
      },
      {
        key: "updated",
        header: "Last updated",
        className: "w-36",
        render: (c) => (
          <span className="muted text-xs" title={c.updatedAt ? formatDateTime(c.updatedAt) : ""}>
            {c.updatedAt ? relativeTime(c.updatedAt) : "Just now"}
          </span>
        ),
      },
    ];

    if (tab !== "followups") return base;

    return [
      ...base,
      {
        key: "followUp",
        header: "Follow-up due",
        className: "w-36",
        render: (c) => {
          if (!c.nextFollowUp) return <span className="muted text-xs">—</span>;
          const overdue = c.nextFollowUp < today;
          return (
            <Badge tone={overdue ? "amber" : "info"}>
              {overdue ? "Overdue · " : "Today · "}
              {formatDayShort(c.nextFollowUp)}
            </Badge>
          );
        },
      },
    ];
  }, [tab, today]);

  // 🔥 Wait for both the app store and Firebase to be ready
  if (!ready || loadingFirebase) {
    return (
      <div className="space-y-3">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  const rows = buckets[tab];

  const EMPTY: Record<TabKey, React.ReactNode> = {
    active: (
      <EmptyState
        icon="🤝"
        title="No active cases right now"
        body="Nothing is open on your caseload. When a student chooses to talk to someone, their case appears here — under an anonymous case ID until they opt in to sharing more."
        action={<LinkButton href="/counsellor/alerts">Review support alerts</LinkButton>}
      />
    ),
    pending: (
      <EmptyState
        icon="📮"
        title="No new requests waiting"
        body="Every request a student sends is listed here first, with only the items they explicitly ticked to share."
        action={<LinkButton href="/counsellor/alerts">Go to the alert queue</LinkButton>}
      />
    ),
    followups: (
      <EmptyState
        icon="🗓️"
        title="No follow-ups due today"
        body="Follow-ups you record on a case show up here on the day they fall due, so nobody quietly slips off the list."
      />
    ),
    history: (
      <EmptyState
        icon="📁"
        title="No closed cases yet"
        body="Cases you close or archive stay here as a record. A student can always re-request support; closing a case never closes the door."
      />
    ),
  };

  return (
    <div className="space-y-5">
      <SectionTitle
        title="Case management"
        subtitle="Opt-in counselling cases. Identity stays withheld until the student chooses to share it."
      />

      <Callout tone="pro" icon="🔐" title="Anonymous case IDs by default">
        A case shows a pseudonym only where the student ticked &ldquo;share my
        pseudonym&rdquo;. Everything else on a case is limited to the items they consented
        to — this screen cannot request more.
      </Callout>

      <Tabs<TabKey>
        tone="pro"
        value={tab}
        onChange={setTab}
        tabs={[
          { value: "active", label: "Active cases", count: buckets.active.length },
          { value: "pending", label: "Pending requests", count: buckets.pending.length },
          { value: "followups", label: "Follow-ups due", count: buckets.followups.length },
          { value: "history", label: "Case history", count: buckets.history.length },
        ]}
      />

      <p className="muted text-sm" aria-live="polite">
        {rows.length
          ? `Showing ${pluralize(rows.length, "case")}, most recently updated first.`
          : "Nothing in this view."}
      </p>

      <DataTable<CounsellingCase>
        caption="Counselling cases"
        columns={columns}
        rows={rows}
        rowKey={(c) => c.id}
        onRowClick={(c) => router.push(`/counsellor/cases/${c.id}`)}
        empty={EMPTY[tab]}
      />
    </div>
  );
}
