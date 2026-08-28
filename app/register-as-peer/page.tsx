// "use client";

// import Link from "next/link";
// import { useState } from "react";
// import { LandingFooter, LandingHeader } from "@/components/landing";
// import { Badge, Button, Callout, Field, Input } from "@/components/ui";
// import { uid } from "@/lib/format";
// import { useStore } from "@/lib/store";

// export default function RegisterAsPeerPage() {
//   const { ready, state, setSupportMode, setIdentity, toast } = useStore();

//   const [phone, setPhone] = useState("");
//   const [alias, setAlias] = useState(state.identity?.handle ?? "MindMate #Peer01");
//   const [isSubmitted, setIsSubmitted] = useState(false);
//   const [error, setError] = useState("");

//   const handleGenerateAlias = () => {
//     const hex = Math.random().toString(16).slice(2, 7).toUpperCase();
//     setAlias(`MindMate #${hex}`);
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     setError("");

//     const cleanPhone = phone.trim();
//     if (!cleanPhone || cleanPhone.replace(/\D/g, "").length < 7) {
//       setError("Please provide a valid contact number.");
//       return;
//     }

//     if (!alias.trim()) {
//       setError("Please choose a display alias.");
//       return;
//     }

//     // Save identity & activate supporting mode
//     setIdentity({
//       ...state.identity,
//       handle: alias.trim(),
//     });
//     setSupportMode("supporting");
//     setIsSubmitted(true);
//     toast(
//       "Registered as Peer Supporter!",
//       "success",
//       `You are now registered as ${alias.trim()}. You can listen and support fellow students anytime.`,
//     );
//   };

//   return (
//     <div className="min-h-screen flex flex-col bg-white text-navy-900 font-sans selection:bg-teal-100 selection:text-teal-900">
//       <LandingHeader microTagline="Become a Peer Supporter." />

//       <main id="main" className="flex-1 w-full bg-gray-50 py-12 sm:py-16">
//         <div className="max-w-4xl mx-auto px-4 sm:px-6">
//           {/* Back link */}
//           <div className="mb-6">
//             <Link
//               href="/"
//               className="text-xs font-semibold text-teal-800 hover:text-teal-900 hover:underline inline-flex items-center gap-1"
//             >
//               ← Back to MindEase Home
//             </Link>
//           </div>

//           {isSubmitted ? (
//             /* ============================================== Success State */
//             <div className="card p-8 sm:p-12 text-center animate-fade-up space-y-5">
//               <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-teal-50 border border-teal-200">
//                 <span className="text-3xl" aria-hidden>
//                   🤝
//                 </span>
//               </div>
//               <div>
//                 <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
//                   Welcome to the Peer Support Team!
//                 </h1>
//                 <p className="muted mt-2 text-sm sm:text-base max-w-lg mx-auto">
//                   You are now registered as <strong className="text-navy-900 font-semibold">{alias}</strong>. When students request anonymous peer support, you can accept and chat with them in real-time.
//                 </p>
//               </div>

//               <div className="p-4 max-w-md mx-auto rounded-2xl bg-mint-50/80 border border-mint-200 text-left text-xs text-mint-900 space-y-1.5">
//                 <p className="font-semibold">✨ What happens next:</p>
//                 <p>• Your anonymous mode is active with your custom alias.</p>
//                 <p>• Open the Peer Chat screen whenever you have time to listen.</p>
//                 <p>• Zero obligations — you control your own availability.</p>
//               </div>

//               <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
//                 <Link
//                   href="/student/peer"
//                   className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm shadow-xs transition-all"
//                 >
//                   Open Peer Chat Queue →
//                 </Link>
//                 <Link
//                   href="/student/home"
//                   className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white border border-navy-200 hover:bg-navy-50 text-navy-900 font-semibold text-sm shadow-2xs transition-all"
//                 >
//                   Go to Student Home
//                 </Link>
//               </div>
//             </div>
//           ) : (
//             /* ============================================== Registration Form State */
//             <div className="space-y-8 animate-fade-up">
//               {/* Hero Header */}
//               <div className="text-center sm:text-left space-y-3">
//                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-200 bg-teal-50 text-xs font-semibold text-teal-900">
//                   <span>🤝</span> Voluntary &amp; Confidential Campus Program
//                 </div>
//                 <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-900 tracking-tight">
//                   Become a MindMate. Support your peers, on your terms.
//                 </h1>
//                 <p className="muted text-sm sm:text-base max-w-2xl leading-relaxed">
//                   Join our verified peer supporter network. Listen to students going through tough days, share coping strategies, and foster an empathetic campus culture — completely voluntary, low-friction, and privacy-protected.
//                 </p>
//               </div>

//               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
//                 {/* Left Form Box */}
//                 <div className="lg:col-span-7 card p-6 sm:p-8 bg-white shadow-sm border border-gray-200">
//                   <h2 className="text-lg font-bold text-navy-900 mb-1">
//                     Peer Supporter Application
//                   </h2>
//                   <p className="muted text-xs mb-6">
//                     Only two details are needed to activate your peer supporter status.
//                   </p>

//                   <form onSubmit={handleSubmit} className="space-y-5">
//                     {error ? (
//                       <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800 font-medium">
//                         {error}
//                       </div>
//                     ) : null}

//                     {/* Field 1: Contact Number */}
//                     <Field
//                       label="Contact Number"
//                       required
//                       hint="Used for verification and administrative communications only."
//                     >
//                       <Input
//                         type="tel"
//                         value={phone}
//                         onChange={(e) => setPhone(e.target.value)}
//                         placeholder="e.g. 9876543210"
//                         required
//                         className="bg-navy-50/40"
//                       />
//                     </Field>

//                     {/* Field 2: Display Alias */}
//                     <Field
//                       label="Pick your MindMate Alias"
//                       required
//                       hint="This is the pseudonymous handle shown to students when you chat."
//                     >
//                       <div className="flex gap-2">
//                         <Input
//                           type="text"
//                           value={alias}
//                           onChange={(e) => setAlias(e.target.value)}
//                           placeholder="e.g. MindMate #4C81B"
//                           required
//                           className="bg-navy-50/40 font-mono font-medium"
//                         />
//                         <Button
//                           type="button"
//                           tone="secondary"
//                           size="md"
//                           onClick={handleGenerateAlias}
//                           className="shrink-0 text-xs"
//                           title="Generate a random pseudonym"
//                         >
//                           🎲 Shuffle
//                         </Button>
//                       </div>
//                     </Field>

//                     {/* Current Badge Preview */}
//                     <div className="rounded-xl border border-teal-100 bg-teal-50/60 p-3 flex items-center justify-between">
//                       <span className="text-xs text-teal-900 font-medium">
//                         Your public student badge:
//                       </span>
//                       <Badge tone="teal">{alias || "MindMate"}</Badge>
//                     </div>

//                     <Button
//                       type="submit"
//                       tone="primary"
//                       size="lg"
//                       full
//                       className="mt-2 font-bold"
//                     >
//                       Register as Peer Supporter
//                     </Button>
//                   </form>
//                 </div>

//                 {/* Right Trust / Privacy Guarantee Box */}
//                 <div className="lg:col-span-5 space-y-4">
//                   {/* Trust Reassurance Card */}
//                   <div className="rounded-2xl border border-navy-200 bg-white p-6 shadow-sm space-y-4">
//                     <div className="flex items-center gap-2.5 border-b border-navy-100 pb-3">
//                       <span className="text-xl" aria-hidden>
//                         🔒
//                       </span>
//                       <h3 className="font-bold text-navy-900 text-sm">
//                         Privacy &amp; Identity Guarantee
//                       </h3>
//                     </div>

//                     {/* Mandatory Exact Policy Callout */}
//                     <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 text-xs text-emerald-950 font-medium leading-relaxed">
//                       Your real identity is never shared with anyone by default. The only exception: if you&rsquo;re selected for an award or certification, your real name may be shared <strong>only after you explicitly consent</strong> at that time.
//                     </div>

//                     {/* Two-column visual checklist */}
//                     <div className="space-y-2.5 pt-1 text-xs">
//                       <p className="font-semibold text-navy-900">
//                         What peers see during chat:
//                       </p>
//                       <ul className="space-y-1.5 text-navy-700">
//                         <li className="flex items-start gap-2">
//                           <span className="text-teal-600 font-bold" aria-hidden>✓</span>
//                           <span>Your chosen pseudonym alias ({alias})</span>
//                         </li>
//                         <li className="flex items-start gap-2">
//                           <span className="text-teal-600 font-bold" aria-hidden>✓</span>
//                           <span>Ephemeral real-time chat messages only</span>
//                         </li>
//                       </ul>

//                       <p className="font-semibold text-navy-900 pt-2 border-t border-navy-100">
//                         What is strictly withheld:
//                       </p>
//                       <ul className="space-y-1.5 text-navy-600">
//                         <li className="flex items-start gap-2">
//                           <span className="text-red-500 font-bold" aria-hidden>✕</span>
//                           <span>Your contact number &amp; real name</span>
//                         </li>
//                         <li className="flex items-start gap-2">
//                           <span className="text-red-500 font-bold" aria-hidden>✕</span>
//                           <span>Your personal journal &amp; check-in history</span>
//                         </li>
//                         <li className="flex items-start gap-2">
//                           <span className="text-red-500 font-bold" aria-hidden>✕</span>
//                           <span>Student ID, roll numbers &amp; device details</span>
//                         </li>
//                       </ul>
//                     </div>
//                   </div>

//                   {/* Helpline footnote */}
//                   <Callout tone="info" icon="💬" title="Need help while supporting?">
//                     If a peer in chat expresses critical distress, you can guide them to the campus counselling centre or crisis line with one click.
//                   </Callout>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </main>

//       <LandingFooter />
//     </div>
//   );
// }


"use client";

import Link from "next/link";
import { useState } from "react";
import { LandingFooter, LandingHeader } from "@/components/landing";
import { Badge, Button, Callout, Field, Input } from "@/components/ui";
import { uid } from "@/lib/format";
import { generateIdentity } from "@/lib/privacy";
import { useStore } from "@/lib/store";

export default function RegisterAsPeerPage() {
  const { ready, state, setSupportMode, setIdentity, toast } = useStore();

  // 🔥 Phone wala state hata diya
  const [alias, setAlias] = useState(state.identity?.handle ?? "MindMate #Peer01");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleGenerateAlias = () => {
    const hex = Math.random().toString(16).slice(2, 7).toUpperCase();
    setAlias(`MindMate #${hex}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!alias.trim()) {
      setError("Please choose a display alias.");
      return;
    }

    // Save identity & activate supporting mode.
    // state.identity is null until onboarding completes, so fall back to a
    // freshly generated one rather than spreading null and losing caseId.
    const base = state.identity ?? generateIdentity();
    setIdentity({
      ...base,
      handle: alias.trim(),
    });
    setSupportMode("supporting");
    setIsSubmitted(true);
    toast(
      "Registered as Peer Supporter!",
      "success",
      `You are now registered as ${alias.trim()}. You can listen and support fellow students anytime.`,
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-navy-900 font-sans selection:bg-teal-100 selection:text-teal-900">
      <LandingHeader />

      <main id="main" className="flex-1 w-full bg-gray-50 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Back link */}
          <div className="mb-6">
            <Link
              href="/"
              className="text-xs font-semibold text-teal-800 hover:text-teal-900 hover:underline inline-flex items-center gap-1"
            >
              ← Back to MindEase Home
            </Link>
          </div>

          {isSubmitted ? (
            /* ============================================== Success State */
            <div className="card p-8 sm:p-12 text-center animate-fade-up space-y-5">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-teal-50 border border-teal-200">
                <span className="text-3xl" aria-hidden>
                  🤝
                </span>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
                  Welcome to the Peer Support Team!
                </h1>
                <p className="muted mt-2 text-sm sm:text-base max-w-lg mx-auto">
                  You are now registered as <strong className="text-navy-900 font-semibold">{alias}</strong>. When students request anonymous peer support, you can accept and chat with them in real-time.
                </p>
              </div>

              <div className="p-4 max-w-md mx-auto rounded-2xl bg-mint-50/80 border border-mint-200 text-left text-xs text-mint-900 space-y-1.5">
                <p className="font-semibold">✨ What happens next:</p>
                <p>• Your anonymous mode is active with your custom alias.</p>
                <p>• Open the Peer Chat screen whenever you have time to listen.</p>
                <p>• Zero obligations — you control your own availability.</p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
                <Link
                  href="/student/peer"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm shadow-xs transition-all"
                >
                  Open Peer Chat Queue →
                </Link>
                <Link
                  href="/student/home"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white border border-navy-200 hover:bg-navy-50 text-navy-900 font-semibold text-sm shadow-2xs transition-all"
                >
                  Go to Student Home
                </Link>
              </div>
            </div>
          ) : (
            /* ============================================== Registration Form State */
            <div className="space-y-8 animate-fade-up">
              {/* Hero Header */}
              <div className="text-center sm:text-left space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-200 bg-teal-50 text-xs font-semibold text-teal-900">
                  <span>🤝</span> Voluntary &amp; Confidential Campus Program
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-900 tracking-tight">
                  Become a MindMate. Support your peers, on your terms.
                </h1>
                <p className="muted text-sm sm:text-base max-w-2xl leading-relaxed">
                  Join our verified peer supporter network. Listen to students going through tough days, share coping strategies, and foster an empathetic campus culture — completely voluntary, low-friction, and privacy-protected.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Form Box */}
                <div className="lg:col-span-7 card p-6 sm:p-8 bg-white shadow-sm border border-gray-200">
                  <h2 className="text-lg font-bold text-navy-900 mb-1">
                    Peer Supporter Application
                  </h2>
                  <p className="muted text-xs mb-6">
                    Only a display alias is needed to activate your peer supporter status.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {error ? (
                      <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800 font-medium">
                        {error}
                      </div>
                    ) : null}

                    {/* 🔥 Field 1 (Phone) Pura Hata Diya! */}

                    {/* Field: Display Alias */}
                    <Field
                      label="Pick your MindMate Alias"
                      required
                      hint="This is the pseudonymous handle shown to students when you chat."
                    >
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          value={alias}
                          onChange={(e) => setAlias(e.target.value)}
                          placeholder="e.g. MindMate #4C81B"
                          required
                          className="bg-navy-50/40 font-mono font-medium"
                        />
                        <Button
                          type="button"
                          tone="secondary"
                          size="md"
                          onClick={handleGenerateAlias}
                          className="shrink-0 text-xs"
                          title="Generate a random pseudonym"
                        >
                          🎲 Shuffle
                        </Button>
                      </div>
                    </Field>

                    {/* Current Badge Preview */}
                    <div className="rounded-xl border border-teal-100 bg-teal-50/60 p-3 flex items-center justify-between">
                      <span className="text-xs text-teal-900 font-medium">
                        Your public student badge:
                      </span>
                      <Badge tone="teal">{alias || "MindMate"}</Badge>
                    </div>

                    <Button
                      type="submit"
                      tone="primary"
                      size="lg"
                      full
                      className="mt-2 font-bold"
                    >
                      Register as Peer Supporter
                    </Button>
                  </form>
                </div>

                {/* Right Trust / Privacy Guarantee Box */}
                <div className="lg:col-span-5 space-y-4">
                  {/* Trust Reassurance Card */}
                  <div className="rounded-2xl border border-navy-200 bg-white p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-2.5 border-b border-navy-100 pb-3">
                      <span className="text-xl" aria-hidden>
                        🔒
                      </span>
                      <h3 className="font-bold text-navy-900 text-sm">
                        Privacy &amp; Identity Guarantee
                      </h3>
                    </div>

                    {/* Mandatory Exact Policy Callout */}
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 text-xs text-emerald-950 font-medium leading-relaxed">
                      Your real identity is never shared with anyone by default. The only exception: if you&rsquo;re selected for an award or certification, your real name may be shared <strong>only after you explicitly consent</strong> at that time.
                    </div>

                    {/* Two-column visual checklist */}
                    <div className="space-y-2.5 pt-1 text-xs">
                      <p className="font-semibold text-navy-900">
                        What peers see during chat:
                      </p>
                      <ul className="space-y-1.5 text-navy-700">
                        <li className="flex items-start gap-2">
                          <span className="text-teal-600 font-bold" aria-hidden>✓</span>
                          <span>Your chosen pseudonym alias ({alias})</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-teal-600 font-bold" aria-hidden>✓</span>
                          <span>Ephemeral real-time chat messages only</span>
                        </li>
                      </ul>

                      <p className="font-semibold text-navy-900 pt-2 border-t border-navy-100">
                        What is strictly withheld:
                      </p>
                      <ul className="space-y-1.5 text-navy-600">
                        <li className="flex items-start gap-2">
                          <span className="text-red-500 font-bold" aria-hidden>✕</span>
                          <span>Your real name &amp; contact details</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-500 font-bold" aria-hidden>✕</span>
                          <span>Your personal journal &amp; check-in history</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-500 font-bold" aria-hidden>✕</span>
                          <span>Student ID, roll numbers &amp; device details</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Helpline footnote */}
                  <Callout tone="info" icon="💬" title="Need help while supporting?">
                    If a peer in chat expresses critical distress, you can guide them to the campus counselling centre or crisis line with one click.
                  </Callout>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
