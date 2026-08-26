"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ReauthDialog } from "@/components/privacy";
import {
  Badge,
  Button,
  Callout,
  Chip,
  EmptyState,
  Input,
  LinkButton,
  SectionTitle,
  SkeletonCard,
} from "@/components/ui";
import { cx, daysAgo, formatDateTime, isoDay } from "@/lib/format";
import { scopeSummary, withheldSummary } from "@/lib/privacy";
import { recommendResources, RESOURCES, resourceById } from "@/lib/resources";
import { useStore } from "@/lib/store";
import type { CaseStatus, CounsellingCase } from "@/lib/types";

const STATUS_COPY: Record<CaseStatus, { label: string; tone: "info" | "amber" | "mint" | "neutral" }> = {
  requested: { label: "Waiting for a counsellor", tone: "info" },
  awaiting_student: { label: "They have replied — over to you", tone: "amber" },
  active: { label: "Active", tone: "mint" },
  scheduled: { label: "Appointment booked", tone: "mint" },
  closed: { label: "Closed", tone: "neutral" },
};

function CaseCard({ kase }: { kase: CounsellingCase }) {
  const { state, linkIdentity, withdrawCase, toast } = useStore();
  const [reauth, setReauth] = useState(false);
  const shared = scopeSummary(kase.sharedScope);
  const withheld = withheldSummary(kase.sharedScope);
  const status = STATUS_COPY[kase.status];

  return (
    <article className="card p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-navy-900">{kase.concern}</h3>
          <p className="muted mt-0.5 text-xs">
            {kase.mode} · requested {formatDateTime(kase.createdAt)} · case{" "}
            <span className="font-mono">{kase.caseId}</span>
          </p>
        </div>
        <Badge tone={status.tone}>{status.label}</Badge>
      </div>

      {kase.status === "awaiting_student" ? (
        <Callout tone="amber" icon="🤝" title="A counsellor has offered to talk" className="mt-3">
          <p>
            They cannot see who you are. If you would like them to be able to reply to you
            directly, you can attach your pseudonym — and if you would rather not, ignoring
            this has no consequence at all. Nobody is told either way.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              size="sm"
              tone="primary"
              onClick={() => {
                linkIdentity(kase.id);
                toast("Pseudonym attached", "success", "Still no name, email or roll number.");
              }}
            >
              Accept — attach my pseudonym
            </Button>
            <Button size="sm" tone="ghost">
              Not right now
            </Button>
          </div>
        </Callout>
      ) : null}

      {kase.offeredResourceIds.length ? (
        <div className="mt-3 rounded-xl border border-mint-200 bg-mint-50/60 p-3">
          <p className="text-sm font-medium text-mint-900">
            A counsellor shared {kase.offeredResourceIds.length === 1 ? "a resource" : "resources"} with you
          </p>
          <ul className="mt-1.5 space-y-1">
            {kase.offeredResourceIds.map((rid) => {
              const r = resourceById(rid, state.customResources);
              return r ? (
                <li key={rid} className="text-sm text-navy-800">
                  <Link
                    href={`/student/support/resources/${r.id}`}
                    className="font-medium text-teal-800 hover:underline"
                  >
                    {r.title}
                  </Link>{" "}
                  <span className="muted">· {r.minutes} min</span>
                </li>
              ) : null;
            })}
          </ul>
        </div>
      ) : null}

      <div className="mt-4 rounded-xl border border-navy-100 bg-navy-50/60 p-3.5">
        <p className="text-sm font-semibold text-navy-900">
          What this counsellor can see
        </p>
        <ul className="mt-2 space-y-1">
          {shared.map((s) => (
            <li key={s} className="flex gap-2 text-sm text-navy-800">
              <span className="text-mint-600" aria-hidden>
                ✓
              </span>
              {s}
            </li>
          ))}
        </ul>
        {withheld.length ? (
          <>
            <p className="mt-3 text-sm font-semibold text-navy-900">
              What they cannot
            </p>
            <ul className="mt-2 space-y-1">
              {withheld.map((s) => (
                <li key={s} className="flex gap-2 text-sm text-navy-500">
                  <span aria-hidden>✕</span>
                  {s}
                </li>
              ))}
            </ul>
          </>
        ) : null}
        <p className="muted mt-3 text-xs">
          …and nothing else. Your name, email, roll number and journal are not attached to
          this case.
        </p>
      </div>

      {kase.status !== "closed" ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Link
            href="/student/support/appointments"
            className="text-sm font-medium text-teal-800 hover:underline"
          >
            View appointments →
          </Link>
          <Button size="sm" tone="ghost" className="ml-auto" onClick={() => setReauth(true)}>
            Withdraw this request
          </Button>
        </div>
      ) : null}

      <ReauthDialog
        open={reauth}
        onClose={() => setReauth(false)}
        action="withdrawing your support request and detaching everything you shared"
        onVerified={() => {
          withdrawCase(kase.id);
          setReauth(false);
          toast("Request withdrawn", "info", "Everything you shared is detached.");
        }}
      />
    </article>
  );
}

// export default function SupportHubPage() {
//   const { ready, state } = useStore();
//   const [category, setCategory] = useState<string>("All");
//   const [query, setQuery] = useState("");

//   const customResources = state.customResources ?? [];
//   const allResources = useMemo(
//     () => [...customResources, ...RESOURCES],
//     [customResources],
//   );

//   const recentTags = useMemo(() => {
//     const cutoff = isoDay(daysAgo(21));
//     const set = new Set<string>();
//     for (const c of state.checkIns) {
//       if (c.date >= cutoff) for (const t of c.tags) set.add(t);
//     }
//     return [...set];
//   }, [state.checkIns]);

//   const suggested = useMemo(
//     () =>
//       state.consent.aiSupportAnalysis
//         ? recommendResources(recentTags, 3, customResources).map((r) => r.id)
//         : [],
//     [recentTags, state.consent.aiSupportAnalysis, customResources],
//   );

//   if (!ready) return <SkeletonCard />;

//   const categories = ["All", ...new Set(allResources.map((r) => r.category))];
//   const filtered = allResources.filter((r) => {
//     const inCat = category === "All" || r.category === category;
//     const q = query.trim().toLowerCase();
//     const inQuery =
//       !q || r.title.toLowerCase().includes(q) || r.summary.toLowerCase().includes(q);
//     return inCat && inQuery;
//   });

//   const myCases = state.cases.filter((c) => c.isDemoStudent);

//   return (
//     <div className="space-y-6">
//       <header>
//         <h1 className="text-2xl font-semibold tracking-tight text-navy-900">Support</h1>
//         <p className="muted mt-1 text-sm">
//           Things to read on your own, and a way to talk to a person when you want one.
//         </p>
//       </header>

//       <section className="rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50 to-white p-5">
//         <p className="text-2xl" aria-hidden>
//           🤝
//         </p>
//         <h2 className="mt-2 text-lg font-semibold text-navy-900">
//           Would you like to talk to a counsellor?
//         </h2>
//         <p className="mt-1 text-sm text-navy-700">
//           You choose what they see, one item at a time, before anything is sent. You can
//           withdraw at any point.
//         </p>
//         <div className="mt-4 flex flex-wrap gap-2">
//           <LinkButton href="/student/peer" tone="primary">
//             Talk to a peer now
//           </LinkButton>
//           <LinkButton href="/student/support/request">
//             Book a counsellor
//           </LinkButton>
//           <LinkButton href="/student/support/appointments">My appointments</LinkButton>
//         </div>
//       </section>

//       {/* ------------------------------------------------------ my support */}
//       <section aria-labelledby="my-support">
//         <SectionTitle
//           title={<span id="my-support">My support</span>}
//           subtitle="Requests you have made, and exactly what each one shares."
//         />
//         {myCases.length === 0 ? (
//           <EmptyState
//             icon="🌱"
//             title="You haven't asked for anything yet"
//             body="Asking is optional, reversible, and does not go on any record. If it would help, it is here."
//           />
//         ) : (
//           <div className="space-y-3">
//             {myCases.map((c) => (
//               <CaseCard key={c.id} kase={c} />
//             ))}
//           </div>
//         )}
//       </section>

//       {/* -------------------------------------------------------- resources */}
//       <section aria-labelledby="resources">
//         <SectionTitle
//           title={<span id="resources">Find resources</span>}
//           subtitle="Short and practical. No sign-up, no tracking of what you opened. Click any resource to read the full article."
//         />

//         <div className="space-y-3">
//           <Input
//             value={query}
//             onChange={(e) => setQuery(e.target.value)}
//             placeholder="Search resources"
//             aria-label="Search resources"
//             type="search"
//           />
//           <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
//             {categories.map((c) => (
//               <Chip key={c} selected={category === c} onClick={() => setCategory(c)}>
//                 {c}
//               </Chip>
//             ))}
//           </div>
//         </div>

//         {filtered.length === 0 ? (
//           <EmptyState
//             className="mt-4"
//             icon="🔍"
//             title="Nothing matches that"
//             body="Try a different word, or clear the filters to see everything."
//           />
//         ) : (
//           <div className="mt-4 space-y-2.5">
//             {filtered.map((r) => {
//               const isSuggested = suggested.includes(r.id);
//               const isCustom = customResources.some((c) => c.id === r.id);
//               return (
//                 <Link
//                   key={r.id}
//                   href={`/student/support/resources/${r.id}`}
//                   className={cx(
//                     "block rounded-2xl border p-4 transition-all hover:border-teal-300 hover:shadow-sm",
//                     isSuggested
//                       ? "border-mint-200 bg-mint-50/50"
//                       : isCustom
//                         ? "border-pro-200 bg-pro-50/30"
//                         : "border-navy-100 bg-white",
//                   )}
//                 >
//                   <div className="flex flex-wrap items-start justify-between gap-2">
//                     <h3 className="font-medium text-navy-900 group-hover:text-teal-900">
//                       {r.title}
//                     </h3>
//                     <div className="flex items-center gap-1.5">
//                       {isCustom ? (
//                         <Badge tone="pro">From counselling team</Badge>
//                       ) : null}
//                       {isSuggested ? (
//                         <Badge tone="mint">Suggested for you</Badge>
//                       ) : (
//                         <Badge tone="neutral">{r.minutes} min read</Badge>
//                       )}
//                     </div>
//                   </div>
//                   <p className="muted mt-0.5 text-xs">
//                     {r.category} · {r.minutes} min read
//                   </p>
//                   <p className="mt-2 text-sm text-navy-700 leading-relaxed">{r.summary}</p>
//                   <p className="mt-3 text-xs font-semibold text-teal-800 flex items-center gap-1">
//                     Read article <span aria-hidden>→</span>
//                   </p>
//                 </Link>
//               );
//             })}
//           </div>
//         )}

//         {state.consent.aiSupportAnalysis ? (
//           <p className="muted mt-3 text-xs">
//             Suggestions come from the topics you tapped in your own check-ins on this
//             device. Turn that off in{" "}
//             <Link
//               href="/student/settings"
//               className="font-medium text-teal-800 underline underline-offset-2"
//             >
//               Settings
//             </Link>{" "}
//             and this section becomes a plain list.
//           </p>
//         ) : (
//           <p className="muted mt-3 text-xs">
//             Personalised suggestions are off, so this is simply the full library.
//           </p>
//         )}
//       </section>
//     </div>
//   );
// }

export default function SupportHubPage() {
  const { ready, state } = useStore();
  const [category, setCategory] = useState<string>("All");
  const [query, setQuery] = useState("");
  
  // 🔥 NAYA STATE VIEW MORE KE LIYE
  const [visibleCount, setVisibleCount] = useState(3);

  const customResources = state.customResources ?? [];
  const allResources = useMemo(
    () => [...customResources, ...RESOURCES],
    [customResources],
  );

  const recentTags = useMemo(() => {
    const cutoff = isoDay(daysAgo(21));
    const set = new Set<string>();
    for (const c of state.checkIns) {
      if (c.date >= cutoff) for (const t of c.tags) set.add(t);
    }
    return [...set];
  }, [state.checkIns]);

  const suggested = useMemo(
    () =>
      state.consent.aiSupportAnalysis
        ? recommendResources(recentTags, 3, customResources).map((r) => r.id)
        : [],
    [recentTags, state.consent.aiSupportAnalysis, customResources],
  );

  if (!ready) return <SkeletonCard />;

  const categories = ["All", ...new Set(allResources.map((r) => r.category))];
  const filtered = allResources.filter((r) => {
    const inCat = category === "All" || r.category === category;
    const q = query.trim().toLowerCase();
    const inQuery =
      !q || r.title.toLowerCase().includes(q) || r.summary.toLowerCase().includes(q);
    return inCat && inQuery;
  });

  const myCases = state.cases.filter((c) => c.isDemoStudent);
  
  // 🔥 SIRF UTNE CASES DIKHAYENGE JITNA VISIBLE COUNT HAI
  const visibleCases = myCases.slice(0, visibleCount);
  const hasMoreCases = myCases.length > visibleCount;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-navy-900">Support</h1>
        <p className="muted mt-1 text-sm">
          Things to read on your own, and a way to talk to a person when you want one.
        </p>
      </header>

      <section className="rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50 to-white p-5">
        <p className="text-2xl" aria-hidden>
          🤝
        </p>
        <h2 className="mt-2 text-lg font-semibold text-navy-900">
          Would you like to talk to a counsellor?
        </h2>
        <p className="mt-1 text-sm text-navy-700">
          You choose what they see, one item at a time, before anything is sent. You can
          withdraw at any point.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <LinkButton href="/student/peer" tone="primary">
            Talk to a peer now
          </LinkButton>
          <LinkButton href="/student/support/request">
            Book a counsellor
          </LinkButton>
          <LinkButton href="/student/support/appointments">My appointments</LinkButton>
        </div>
      </section>

      {/* ------------------------------------------------------ my support */}
      <section aria-labelledby="my-support">
        <SectionTitle
          title={<span id="my-support">My support</span>}
          subtitle="Requests you have made, and exactly what each one shares."
        />
        {myCases.length === 0 ? (
          <EmptyState
            icon="🌱"
            title="You haven't asked for anything yet"
            body="Asking is optional, reversible, and does not go on any record. If it would help, it is here."
          />
        ) : (
          <div className="space-y-3">
            {/* 🔥 UPDATED TO MAP ONLY VISIBLE CASES */}
            {visibleCases.map((c) => (
              <CaseCard key={c.id} kase={c} />
            ))}
            
            {/* 🔥 VIEW MORE BUTTON */}
            {hasMoreCases && (
              <div className="flex justify-center pt-2">
                <Button 
                  tone="secondary" 
                  size="sm" 
                  onClick={() => setVisibleCount((prev) => prev + 3)}
                  className="w-full sm:w-auto"
                >
                  View more past requests ↴
                </Button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* -------------------------------------------------------- resources */}
      <section aria-labelledby="resources">
        <SectionTitle
          title={<span id="resources">Find resources</span>}
          subtitle="Short and practical. No sign-up, no tracking of what you opened. Click any resource to read the full article."
        />

        <div className="space-y-3">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search resources"
            aria-label="Search resources"
            type="search"
          />
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
            {categories.map((c) => (
              <Chip key={c} selected={category === c} onClick={() => setCategory(c)}>
                {c}
              </Chip>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            className="mt-4"
            icon="🔍"
            title="Nothing matches that"
            body="Try a different word, or clear the filters to see everything."
          />
        ) : (
          <div className="mt-4 space-y-2.5">
            {filtered.map((r) => {
              const isSuggested = suggested.includes(r.id);
              const isCustom = customResources.some((c) => c.id === r.id);
              return (
                <Link
                  key={r.id}
                  href={`/student/support/resources/${r.id}`}
                  className={cx(
                    "block rounded-2xl border p-4 transition-all hover:border-teal-300 hover:shadow-sm",
                    isSuggested
                      ? "border-mint-200 bg-mint-50/50"
                      : isCustom
                        ? "border-pro-200 bg-pro-50/30"
                        : "border-navy-100 bg-white",
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="font-medium text-navy-900 group-hover:text-teal-900">
                      {r.title}
                    </h3>
                    <div className="flex items-center gap-1.5">
                      {isCustom ? (
                        <Badge tone="pro">From counselling team</Badge>
                      ) : null}
                      {isSuggested ? (
                        <Badge tone="mint">Suggested for you</Badge>
                      ) : (
                        <Badge tone="neutral">{r.minutes} min read</Badge>
                      )}
                    </div>
                  </div>
                  <p className="muted mt-0.5 text-xs">
                    {r.category} · {r.minutes} min read
                  </p>
                  <p className="mt-2 text-sm text-navy-700 leading-relaxed">{r.summary}</p>
                  <p className="mt-3 text-xs font-semibold text-teal-800 flex items-center gap-1">
                    Read article <span aria-hidden>→</span>
                  </p>
                </Link>
              );
            })}
          </div>
        )}

        {state.consent.aiSupportAnalysis ? (
          <p className="muted mt-3 text-xs">
            Suggestions come from the topics you tapped in your own check-ins on this
            device. Turn that off in{" "}
            <Link
              href="/student/settings"
              className="font-medium text-teal-800 underline underline-offset-2"
            >
              Settings
            </Link>{" "}
            and this section becomes a plain list.
          </p>
        ) : (
          <p className="muted mt-3 text-xs">
            Personalised suggestions are off, so this is simply the full library.
          </p>
        )}
      </section>
    </div>
  );
}
