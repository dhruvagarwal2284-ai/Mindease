// "use client";

// /**
//  * Real-time Anonymous Peer-to-Peer Chat
//  *
//  * TECHNICAL CONSTRAINT & ARCHITECTURE NOTE:
//  * This prototype runs entirely client-side without a backend server or database.
//  * Cross-tab communication between two browser windows (one in "seeking" mode,
//  * one in "supporting" mode) is achieved genuinely in real-time via the browser's
//  * BroadcastChannel API (with a storage-event fallback for compatibility).
//  *
//  * In a production deployment with multiple distinct physical devices, this matching
//  * and messaging layer would be powered by a lightweight realtime service
//  * (e.g. WebSockets, Supabase Realtime, or Firebase Presence & Firestore).
//  */

// import Link from "next/link";
// import { useCallback, useEffect, useMemo, useRef, useState } from "react";
// import { Badge, Button } from "@/components/ui";
// import { cx, formatTime, relativeTime, uid } from "@/lib/format";
// import { useStore } from "@/lib/store";
// import type { PeerP2PSignal, PeerQueueItem, SupportRoleMode } from "@/lib/types";

// const CHANNEL_NAME = "mindease_peer_p2p_v2";

// const SIMULATED_REPLIES = [
//   "I hear you. That sounds really tough.",
//   "You're not alone in this — a lot of us on campus feel that way sometimes.",
//   "Thanks for sharing that with me. I'm right here listening.",
//   "Take your time. No rush and no judgement at all.",
//   "That must be overwhelming. How are you taking care of yourself today?",
//   "I've felt similar pressure before. It really helps just to vent.",
//   "You're doing the best you can right now, and that is valid.",
//   "I'm glad you reached out today. 💛",
// ];

// interface ChatMessage {
//   id: string;
//   sender: "self" | "peer";
//   senderHandle: string;
//   body: string;
//   createdAt: string;
// }

// export default function PeerChatPage() {
//   const {
//     ready,
//     state,
//     addToPeerQueue,
//     removeFromPeerQueue,
//     toast,
//   //  const { state} = useStore();
//   } = useStore();

//   // Tab-specific ID and local mode so two tabs on the same browser can test opposite roles
//   const tabId = useRef(uid("tab")).current;
//   // const [state.supportMode, setstate.supportMode] = useState<SupportRoleMode>(state.supportMode);

//   // Generate distinct handles if both tabs share the same base anonymous identity
//   const myHandle = useMemo(() => {
//     const base = state.identity?.handle ?? "MindMate #A7F29";
//     return state.supportMode === "supporting" ? `${base} (Supporter)` : base;
//   }, [state.identity?.handle, state.supportMode]);

//   const [status, setStatus] = useState<"waiting" | "matched">("waiting");
//   const [matchedPeer, setMatchedPeer] = useState<string | null>(null);
//   const [matchId, setMatchId] = useState<string | null>(null);
//   const [isSimulated, setIsSimulated] = useState(false);
//   const [messages, setMessages] = useState<ChatMessage[]>([]);
//   const [draft, setDraft] = useState("");
//   const [isTyping, setIsTyping] = useState(false);

//   const scrollRef = useRef<HTMLDivElement>(null);
//   const inputRef = useRef<HTMLInputElement>(null);
//   const channelRef = useRef<BroadcastChannel | null>(null);
//   const simReplyIndex = useRef(0);

//   // Auto-scroll on new message or typing state
//   useEffect(() => {
//     if (scrollRef.current) {
//       scrollRef.current.scrollTo({
//         top: scrollRef.current.scrollHeight,
//         behavior: "smooth",
//       });
//     }
//   }, [messages, isTyping]);

//   // Handle incoming BroadcastChannel signals
//   const handleSignal = useCallback(
//     (signal: PeerP2PSignal) => {
//       if (!signal || typeof signal !== "object") return;

//       // 1. Supporter sees Seeker broadcast -> add to queue rather than auto-match
//       if (
//         status === "waiting" &&
//         state.supportMode === "supporting" &&
//         signal.type === "seeking" &&
//         signal.tabId !== tabId
//       ) {
//         addToPeerQueue({
//           handle: signal.handle,
//           tabId: signal.tabId,
//           at: signal.at,
//         });
//       }

//       // 2. Seeker receives Match confirmation from Supporter
//       if (
//         status === "waiting" &&
//         state.supportMode === "seeking" &&
//         signal.type === "match" &&
//         signal.seekerTabId === tabId
//       ) {
//         setMatchedPeer(signal.supporterHandle);
//         setMatchId(signal.matchId);
//         setIsSimulated(false);
//         setStatus("matched");
//         toast("Peer supporter found!", "success", `Connected with ${signal.supporterHandle}.`);
//       }

//       // 3. Other supporters claim a seeker, or seeker leaves -> remove from queue
//       if (signal.type === "match" && state.supportMode === "supporting") {
//         removeFromPeerQueue(signal.seekerTabId);
//       }

//       if (signal.type === "leave") {
//         removeFromPeerQueue(signal.senderTabId);

//         // If currently matched with this peer, handle disconnect
//         if (status === "matched" && signal.matchId === matchId && signal.senderTabId !== tabId) {
//           toast("Peer disconnected", "info", "Your peer left the conversation.");
//           setStatus("waiting");
//           setMatchedPeer(null);
//           setMatchId(null);
//           setMessages([]);
//         }
//       }

//       // 4. Incoming Chat Message
//       if (status === "matched" && signal.type === "message" && signal.matchId === matchId) {
//         if (signal.senderTabId !== tabId) {
//           setMessages((prev) => [
//             ...prev,
//             {
//               id: signal.id,
//               sender: "peer",
//               senderHandle: signal.senderHandle,
//               body: signal.body,
//               createdAt: signal.at,
//             },
//           ]);
//         }
//       }
//     },
//     [status, state.supportMode, tabId, matchId, addToPeerQueue, removeFromPeerQueue, toast],
//   );

//   // Setup BroadcastChannel
//   useEffect(() => {
//     if (typeof window === "undefined") return;

//     let bc: BroadcastChannel | null = null;
//     try {
//       bc = new BroadcastChannel(CHANNEL_NAME);
//       channelRef.current = bc;
//       bc.onmessage = (e) => handleSignal(e.data);
//     } catch {
//       // BroadcastChannel unavailable
//     }

//     return () => {
//       bc?.close();
//       channelRef.current = null;
//     };
//   }, [handleSignal]);

//   // Presence heartbeat when waiting
//   useEffect(() => {
//     if (status !== "waiting") return;

//     const interval = setInterval(() => {
//       if (!channelRef.current) return;
//       if (state.supportMode === "seeking") {
//         channelRef.current.postMessage({
//           type: "seeking",
//           handle: myHandle,
//           tabId,
//           at: new Date().toISOString(),
//         });
//       } else {
//         channelRef.current.postMessage({
//           type: "supporting",
//           handle: myHandle,
//           tabId,
//           at: new Date().toISOString(),
//         });
//       }
//     }, 1000);

//     return () => clearInterval(interval);
//   }, [status, state.supportMode, myHandle, tabId]);

//   // Supporter manual accept request from queue
//   const handleAcceptRequest = (request: PeerQueueItem) => {
//     const isSim = request.tabId.startsWith("sim_");
//     const newMatchId = uid(isSim ? "sim_match" : "match");

//     if (!isSim && channelRef.current) {
//       const matchMsg: PeerP2PSignal = {
//         type: "match",
//         seekerTabId: request.tabId,
//         seekerHandle: request.handle,
//         supporterTabId: tabId,
//         supporterHandle: myHandle,
//         matchId: newMatchId,
//       };
//       channelRef.current.postMessage(matchMsg);
//     }

//     removeFromPeerQueue(request.tabId);
//     setMatchedPeer(request.handle);
//     setMatchId(newMatchId);
//     setIsSimulated(isSim);
//     setStatus("matched");

//     if (isSim) {
//       setMessages([
//         {
//           id: uid("sim_init"),
//           sender: "peer",
//           senderHandle: request.handle,
//           body: "Hi! Thanks for accepting to talk. I've been feeling a bit stressed with submissions lately.",
//           createdAt: new Date().toISOString(),
//         },
//       ]);
//     } else {
//       setMessages([]);
//     }

//     toast("Connected to live peer!", "success", `You are now chatting with ${request.handle}.`);
//   };

//   // Send message handler
//   const handleSend = (e?: React.FormEvent) => {
//     if (e) e.preventDefault();
//     const text = draft.trim();
//     if (!text || !matchId) return;

//     setDraft("");
//     const newMsg: ChatMessage = {
//       id: uid("msg"),
//       sender: "self",
//       senderHandle: myHandle,
//       body: text,
//       createdAt: new Date().toISOString(),
//     };
//     setMessages((prev) => [...prev, newMsg]);
//     inputRef.current?.focus();

//     if (!isSimulated && channelRef.current) {
//       // Send real broadcast message to the other tab
//       channelRef.current.postMessage({
//         type: "message",
//         matchId,
//         id: newMsg.id,
//         senderTabId: tabId,
//         senderHandle: myHandle,
//         body: text,
//         at: newMsg.createdAt,
//       });
//     } else if (isSimulated) {
//       // Simulated peer reply
//       setIsTyping(true);
//       setTimeout(() => {
//         setIsTyping(false);
//         const replyText =
//           SIMULATED_REPLIES[simReplyIndex.current % SIMULATED_REPLIES.length];
//         simReplyIndex.current += 1;
//         setMessages((prev) => [
//           ...prev,
//           {
//             id: uid("sim_msg"),
//             sender: "peer",
//             senderHandle: matchedPeer ?? "Demo Peer",
//             body: replyText,
//             createdAt: new Date().toISOString(),
//           },
//         ]);
//       }, 1200 + Math.random() * 1000);
//     }
//   };

//   // Leave conversation
//   const handleLeave = () => {
//     if (matchId && !isSimulated && channelRef.current) {
//       channelRef.current.postMessage({
//         type: "leave",
//         matchId,
//         senderTabId: tabId,
//         senderHandle: myHandle,
//       });
//     }
//     setStatus("waiting");
//     setMatchedPeer(null);
//     setMatchId(null);
//     setMessages([]);
//     setIsSimulated(false);
//     toast("Left conversation", "info", "Your anonymous chat session has ended.");
//   };

//   // Simulate a peer match for single-tab testing
//   const handleSimulateMatch = () => {
//     const fakeHandle =
//       state.supportMode === "seeking" ? "MindMate #4C81B" : "MindMate #91E0D";
//     const simMatchId = uid("sim_match");
//     setIsSimulated(true);
//     setMatchedPeer(fakeHandle);
//     setMatchId(simMatchId);
//     setStatus("matched");
//     setMessages([
//       {
//         id: uid("sim_init"),
//         sender: "peer",
//         senderHandle: fakeHandle,
//         body:
//           state.supportMode === "seeking"
//             ? "Hey there 👋 I'm here to listen. What's on your mind today?"
//             : "Hi! Thanks for being available. I've been feeling a bit stressed with assignments lately.",
//         createdAt: new Date().toISOString(),
//       },
//     ]);
//     toast("Demo peer connected", "success", `Connected with ${fakeHandle}.`);
//   };

//   // Simulate adding a seeker request to queue
//   const handleSimulateIncomingRequest = () => {
//     const hex = Math.random().toString(16).slice(2, 7).toUpperCase();
//     const simItem: PeerQueueItem = {
//       handle: `MindMate #${hex}`,
//       tabId: uid("sim_tab"),
//       at: new Date().toISOString(),
//     };
//     addToPeerQueue(simItem);
//     toast("Simulated request added", "info", `${simItem.handle} is now waiting in your queue.`);
//   };

//   if (!ready) return null;

//   const peerQueue = state.peerQueue ?? [];

//   return (
//     <div className="space-y-4">
//       {/* ---------------------------------------------------- Header */}
//       <header className="flex flex-wrap items-center justify-between gap-3 border-b border-navy-100 pb-3">
//         <div>
//           <div className="flex items-center gap-2">
//             <h1 className="text-2xl font-semibold tracking-tight text-navy-900">
//               Anonymous Peer Chat
//             </h1>
//             <Badge tone="mint">P2P</Badge>
//           </div>
//           <p className="muted mt-0.5 text-sm">
//             One-to-one, ephemeral conversations between students.
//           </p>
//         </div>

//         <div className="flex items-center gap-2">
//           <span className="text-xs text-navy-600">
//             This tab:{" "}
//             <strong className="font-semibold text-navy-900">
//               {state.supportMode === "supporting" ? "Peer Supporter" : "Seeking Support"}
//             </strong>
//           </span>
//           {/* <Button
//             size="sm"
//             tone="secondary"
//             onClick={() => {
//               if (status === "matched") handleLeave();
//               setstate.supportMode((m) => (m === "supporting" ? "seeking" : "supporting"));
//             }}
//           >
//             Switch to {state.supportMode === "supporting" ? "Seeking" : "Supporting"}
//           </Button> */}


//         </div>
//       </header>
// {/* Naya Leaderboard aur Notifications sirf Supporter ke liye */}
//       {state.supportMode === "supporting" && (
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 animate-fade-up">
          
//           {/* Leaderboard UI */}
//           <div className="p-4 border rounded-xl bg-orange-50 border-orange-200 shadow-sm">
//             <h3 className="font-bold text-orange-900 mb-2 flex items-center gap-2">
//               <span>🏆</span> Top Supporters
//             </h3>
//             <ul className="text-sm text-orange-800 space-y-1.5">
//               <li className="flex justify-between"><span>1. MindMate #88B2</span> <span>42 pts</span></li>
//               <li className="flex justify-between"><span>2. MindMate #11A9</span> <span>38 pts</span></li>
//               <li className="flex justify-between font-bold text-orange-900"><span>3. You</span> <span>15 pts</span></li>
//             </ul>
//           </div>

//           {/* Notifications UI */}
//           <div className="p-4 border rounded-xl bg-blue-50 border-blue-200 shadow-sm">
//             <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
//               <span>🔔</span> Alerts
//             </h3>
//             <p className="text-sm text-blue-800">
//               Listening for new students who need help. You will be notified here if someone requests you!
//             </p>
//           </div>
          
//         </div>
//       )}
//       {/* ------------------------------------------------ Waiting State */}
//       {status === "waiting" ? (
//         <div className="space-y-4 animate-fade-up">
//           <div className="card p-6 sm:p-8 text-center">
//             <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-teal-50 border border-teal-200">
//               <span className="text-2xl animate-bounce" aria-hidden>
//                 {state.supportMode === "supporting" ? "🤝" : "🌱"}
//               </span>
//             </div>

//             <h2 className="text-xl font-semibold text-navy-900">
//               {state.supportMode === "supporting"
//                 ? "Available to support peers"
//                 : "Looking for an anonymous peer…"}
//             </h2>

//             <p className="muted mx-auto mt-2 max-w-md text-sm">
//               {state.supportMode === "supporting"
//                 ? "You are listening for students who want to chat. When someone connects, they will appear in your queue below for you to accept."
//                 : "Connecting you with an active peer supporter on campus. No identity, names or student IDs are ever shared."}
//             </p>

//             <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
//               <span className="inline-flex items-center gap-2 rounded-full border border-mint-200 bg-mint-50 px-3.5 py-1.5 text-xs text-mint-900">
//                 <span className="h-2 w-2 rounded-full bg-mint-500 animate-pulse-soft" />
//                 Broadcasting as: {myHandle}
//               </span>
//             </div>

//             {/* Supporter Live Queue Section */}
//             {state.supportMode === "supporting" ? (
//               <div className="mt-8 rounded-2xl border border-navy-200 bg-white p-5 text-left shadow-sm">
//                 <div className="flex items-center justify-between border-b border-navy-100 pb-3">
//                   <div className="flex items-center gap-2">
//                     <h3 className="font-semibold text-navy-900 text-base">
//                       Students waiting to talk
//                     </h3>
//                     <Badge tone={peerQueue.length > 0 ? "teal" : "neutral"}>
//                       {peerQueue.length}
//                     </Badge>
//                   </div>
//                   <span className="muted text-xs">Click Accept to start 1:1 chat</span>
//                 </div>

//                 {peerQueue.length === 0 ? (
//                   <div className="py-8 text-center">
//                     <p className="text-2xl mb-2" aria-hidden>☕</p>
//                     <p className="text-sm font-medium text-navy-800">No requests in queue right now</p>
//                     <p className="muted text-xs mt-1">
//                       Listening for incoming student requests. Keep this tab open.
//                     </p>
//                   </div>
//                 ) : (
//                   <div className="mt-4 space-y-3">
//                     {peerQueue.map((req) => (
//                       <div
//                         key={req.tabId}
//                         className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-navy-200 bg-navy-50/40 p-4 transition-all hover:border-teal-300 hover:bg-teal-50/30"
//                       >
//                         <div className="flex items-center gap-3">
//                           <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-800 text-lg" aria-hidden>
//                             🕶️
//                           </div>
//                           <div>
//                             <p className="font-semibold text-navy-900 text-sm sm:text-base">
//                               {req.handle}
//                             </p>
//                             <p className="muted text-xs">
//                               Waiting {relativeTime(req.at)}
//                             </p>
//                           </div>
//                         </div>

//                         <Button
//                           tone="primary"
//                           size="sm"
//                           onClick={() => handleAcceptRequest(req)}
//                           className="font-medium"
//                         >
//                           Accept request
//                         </Button>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             ) : null}

//             {/* Multi-Tab & Demo Testing Instructions */}
//             <div className="mx-auto mt-6 max-w-lg rounded-2xl border border-navy-200 bg-navy-50/70 p-4 text-left text-xs text-navy-800">
//               <p className="font-semibold text-navy-900 mb-1">
//                 ✨ Live multi-tab 2-way chat:
//               </p>
//               <p className="muted mb-3">
//                 Open a <strong>second tab</strong> at <code>/student/peer</code>, switch its role to{" "}
//                 <strong>{state.supportMode === "supporting" ? "Seeking" : "Supporting"}</strong>, and test live real-time connection across tabs!
//               </p>
//               <div className="flex flex-wrap items-center justify-between gap-2 border-t border-navy-200/80 pt-3">
//                 <span className="muted">Testing in single tab?</span>
//                 <div className="flex flex-wrap gap-2">
//                   {state.supportMode === "supporting" ? (
//                     <Button size="sm" tone="secondary" onClick={handleSimulateIncomingRequest}>
//                       Simulate incoming request
//                     </Button>
//                   ) : null}
//                   <Button size="sm" tone="primary" onClick={handleSimulateMatch}>
//                     Simulate instant match
//                   </Button>
//                 </div>
//               </div>
//             </div>

//             <div className="mt-6">
//               <Link
//                 href="/student/home"
//                 className="text-xs font-medium text-navy-600 hover:text-navy-900 underline underline-offset-2"
//               >
//                 ← Back to Student Home
//               </Link>
//             </div>
//           </div>
//         </div>
//       ) : (
//         /* ------------------------------------------------ Active Chat State */
//         <div className="card overflow-hidden shadow-card animate-fade-up">
//           {/* Chat Room Header */}
//           <div className="flex flex-wrap items-center justify-between border-b border-navy-100 bg-navy-50/60 px-4 py-3 sm:px-5">
//             <div className="flex items-center gap-3">
//               <div
//                 className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-800 font-semibold"
//                 aria-hidden
//               >
//                 🕶️
//               </div>
//               <div>
//                 <div className="flex items-center gap-2">
//                   <h2 className="font-semibold text-navy-900 text-sm sm:text-base">
//                     {matchedPeer ?? "Peer"}
//                   </h2>
//                   {isSimulated ? (
//                     <Badge tone="neutral" className="text-[10px]">
//                       Demo Peer
//                     </Badge>
//                   ) : (
//                     <Badge tone="mint" className="text-[10px]">
//                       Live Peer (Tab)
//                     </Badge>
//                   )}
//                 </div>
//                 <p className="text-xs text-mint-800 flex items-center gap-1.5">
//                   <span className="h-2 w-2 rounded-full bg-mint-500 animate-pulse-soft" />
//                   You&rsquo;re currently connected · Completely Anonymous
//                 </p>
//               </div>
//             </div>

//             <Button
//               tone="ghost"
//               size="sm"
//               onClick={handleLeave}
//               className="text-xs text-urgent-700 hover:bg-urgent-50"
//             >
//               Leave conversation
//             </Button>
//           </div>

//           {/* Privacy reminder */}
//           <div className="border-b border-info-100 bg-info-50/60 px-4 py-2 text-xs text-info-900 flex items-center justify-between">
//             <span>
//               🔒 <strong>Private &amp; Ephemeral:</strong> Zero messages are saved. Once you leave, the chat is permanently gone.
//             </span>
//             <Link
//               href="/student/help"
//               className="font-medium text-urgent-700 hover:underline shrink-0 ml-2"
//             >
//               Crisis helpline →
//             </Link>
//           </div>

//           {/* Message Thread */}
//           <div
//             ref={scrollRef}
//             className="flex flex-col space-y-3 overflow-y-auto p-4 sm:p-5 min-h-[300px] max-h-[50vh]"
//             aria-live="polite"
//             role="log"
//             aria-label="Peer messages"
//           >
//             {messages.length === 0 ? (
//               <p className="muted my-auto text-center text-xs">
//                 You are now connected. Say hello to start the conversation!
//               </p>
//             ) : null}

//             {messages.map((m) => {
//               const isSelf = m.sender === "self";
//               return (
//                 <div
//                   key={m.id}
//                   className={cx("flex flex-col animate-fade-up", isSelf ? "items-end" : "items-start")}
//                 >
//                   <div className="flex items-center gap-1.5 px-1 mb-0.5">
//                     <span className="text-xs font-medium text-navy-600">
//                       {isSelf ? "You" : m.senderHandle || matchedPeer}
//                     </span>
//                     <span className="text-[10px] text-navy-400">
//                       {formatTime(m.createdAt)}
//                     </span>
//                   </div>
//                   <div
//                     className={cx(
//                       "max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
//                       isSelf
//                         ? "rounded-br-sm bg-teal-700 text-white shadow-sm"
//                         : "rounded-bl-sm border border-navy-100 bg-white text-navy-900 shadow-sm",
//                     )}
//                   >
//                     {m.body}
//                   </div>
//                 </div>
//               );
//             })}

//             {isTyping ? (
//               <div className="flex items-center gap-2 px-1 py-1 text-xs text-navy-500" aria-live="polite">
//                 <span>{matchedPeer} is typing</span>
//                 <span className="flex gap-1" aria-hidden>
//                   <span className="h-1.5 w-1.5 rounded-full bg-teal-600 animate-pulse-soft" />
//                   <span
//                     className="h-1.5 w-1.5 rounded-full bg-teal-600 animate-pulse-soft"
//                     style={{ animationDelay: "0.2s" }}
//                   />
//                   <span
//                     className="h-1.5 w-1.5 rounded-full bg-teal-600 animate-pulse-soft"
//                     style={{ animationDelay: "0.4s" }}
//                   />
//                 </span>
//               </div>
//             ) : null}
//           </div>

//           {/* Chat Composer */}
//           <form onSubmit={handleSend} className="border-t border-navy-100 bg-white p-3 sm:p-4">
//             <div className="flex items-center gap-2">
//               <input
//                 ref={inputRef}
//                 type="text"
//                 value={draft}
//                 onChange={(e) => setDraft(e.target.value)}
//                 placeholder={`Message ${matchedPeer ?? "peer"}…`}
//                 aria-label={`Message ${matchedPeer ?? "peer"}`}
//                 className="flex-1 rounded-xl border border-navy-200 bg-navy-50/40 px-3.5 py-2.5 text-sm text-navy-900 placeholder:text-navy-400 focus:border-teal-500 focus:bg-white focus:outline-none transition-colors"
//                 maxLength={500}
//               />
//               <Button
//                 type="submit"
//                 tone="primary"
//                 size="md"
//                 disabled={!draft.trim()}
//                 className="shrink-0 font-medium"
//               >
//                 Send
//               </Button>
//             </div>
//             <p className="muted mt-2 text-[11px] text-center sm:text-left">
//               Press Enter to send. Keep conversations respectful and anonymous.
//             </p>
//           </form>
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Badge, Button } from "@/components/ui";
import { cx, formatTime, relativeTime, uid } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { PeerP2PSignal, PeerQueueItem, SupportRoleMode } from "@/lib/types";

const CHANNEL_NAME = "mindease_peer_p2p_v2";

const SIMULATED_REPLIES = [
  "I hear you. That sounds really tough.",
  "You're not alone in this — a lot of us on campus feel that way sometimes.",
  "Thanks for sharing that with me. I'm right here listening.",
  "Take your time. No rush and no judgement at all.",
  "That must be overwhelming. How are you taking care of yourself today?",
];

interface ChatMessage {
  id: string;
  sender: "self" | "peer";
  senderHandle: string;
  body: string;
  createdAt: string;
}

export default function PeerChatPage() {
  const {
    ready,
    state,
    addToPeerQueue,
    removeFromPeerQueue,
    toast,
  } = useStore();

  const tabId = useRef(uid("tab")).current;

  const myHandle = useMemo(() => {
    const base = state.identity?.handle ?? "MindMate #A7F29";
    return state.supportMode === "supporting" ? `${base} (Supporter)` : base;
  }, [state.identity?.handle, state.supportMode]);

  const [status, setStatus] = useState<"waiting" | "matched">("waiting");
  const [matchedPeer, setMatchedPeer] = useState<string | null>(null);
  const [matchId, setMatchId] = useState<string | null>(null);
  const [isSimulated, setIsSimulated] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // 🚀 ONLY STATE NEEDED FOR RIGHT PANEL NOW
  const [rightPanelOpen, setRightPanelOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const simReplyIndex = useRef(0);

  // Auto-scroll on new message or typing state
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isTyping]);

  // Handle incoming BroadcastChannel signals
  const handleSignal = useCallback(
    (signal: PeerP2PSignal) => {
      if (!signal || typeof signal !== "object") return;

      if (
        status === "waiting" &&
        state.supportMode === "supporting" &&
        signal.type === "seeking" &&
        signal.tabId !== tabId
      ) {
        addToPeerQueue({
          handle: signal.handle,
          tabId: signal.tabId,
          at: signal.at,
        });
      }

      if (
        status === "waiting" &&
        state.supportMode === "seeking" &&
        signal.type === "match" &&
        signal.seekerTabId === tabId
      ) {
        setMatchedPeer(signal.supporterHandle);
        setMatchId(signal.matchId);
        setIsSimulated(false);
        setStatus("matched");
        toast("Peer supporter found!", "success", `Connected with ${signal.supporterHandle}.`);
      }

      if (signal.type === "match" && state.supportMode === "supporting") {
        removeFromPeerQueue(signal.seekerTabId);
      }

      if (signal.type === "leave") {
        removeFromPeerQueue(signal.senderTabId);
        if (status === "matched" && signal.matchId === matchId && signal.senderTabId !== tabId) {
          toast("Peer disconnected", "info", "Your peer left the conversation.");
          setStatus("waiting");
          setMatchedPeer(null);
          setMatchId(null);
          setMessages([]);
        }
      }

      if (status === "matched" && signal.type === "message" && signal.matchId === matchId) {
        if (signal.senderTabId !== tabId) {
          setMessages((prev) => [
            ...prev,
            {
              id: signal.id,
              sender: "peer",
              senderHandle: signal.senderHandle,
              body: signal.body,
              createdAt: signal.at,
            },
          ]);
        }
      }
    },
    [status, state.supportMode, tabId, matchId, addToPeerQueue, removeFromPeerQueue, toast],
  );

  // Setup BroadcastChannel
  useEffect(() => {
    if (typeof window === "undefined") return;
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel(CHANNEL_NAME);
      channelRef.current = bc;
      bc.onmessage = (e) => handleSignal(e.data);
    } catch {}
    return () => {
      bc?.close();
      channelRef.current = null;
    };
  }, [handleSignal]);

  // Presence heartbeat when waiting
  useEffect(() => {
    if (status !== "waiting") return;
    const interval = setInterval(() => {
      if (!channelRef.current) return;
      channelRef.current.postMessage({
        type: state.supportMode,
        handle: myHandle,
        tabId,
        at: new Date().toISOString(),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [status, state.supportMode, myHandle, tabId]);

  const handleAcceptRequest = (request: PeerQueueItem) => {
    const isSim = request.tabId.startsWith("sim_");
    const newMatchId = uid(isSim ? "sim_match" : "match");

    if (!isSim && channelRef.current) {
      channelRef.current.postMessage({
        type: "match",
        seekerTabId: request.tabId,
        seekerHandle: request.handle,
        supporterTabId: tabId,
        supporterHandle: myHandle,
        matchId: newMatchId,
      });
    }

    removeFromPeerQueue(request.tabId);
    setMatchedPeer(request.handle);
    setMatchId(newMatchId);
    setIsSimulated(isSim);
    setStatus("matched");

    if (isSim) {
      setMessages([
        {
          id: uid("sim_init"),
          sender: "peer",
          senderHandle: request.handle,
          body: "Hi! Thanks for accepting to talk. I've been feeling a bit stressed with submissions lately.",
          createdAt: new Date().toISOString(),
        },
      ]);
    } else {
      setMessages([]);
    }
    toast("Connected to live peer!", "success", `You are now chatting with ${request.handle}.`);
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = draft.trim();
    if (!text || !matchId) return;

    setDraft("");
    const newMsg: ChatMessage = {
      id: uid("msg"),
      sender: "self",
      senderHandle: myHandle,
      body: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMsg]);
    inputRef.current?.focus();

    if (!isSimulated && channelRef.current) {
      channelRef.current.postMessage({
        type: "message",
        matchId,
        id: newMsg.id,
        senderTabId: tabId,
        senderHandle: myHandle,
        body: text,
        at: newMsg.createdAt,
      });
    } else if (isSimulated) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const replyText = SIMULATED_REPLIES[simReplyIndex.current % SIMULATED_REPLIES.length];
        simReplyIndex.current += 1;
        setMessages((prev) => [
          ...prev,
          {
            id: uid("sim_msg"),
            sender: "peer",
            senderHandle: matchedPeer ?? "Demo Peer",
            body: replyText,
            createdAt: new Date().toISOString(),
          },
        ]);
      }, 1200 + Math.random() * 1000);
    }
  };

  const handleLeave = () => {
    if (matchId && !isSimulated && channelRef.current) {
      channelRef.current.postMessage({
        type: "leave",
        matchId,
        senderTabId: tabId,
        senderHandle: myHandle,
      });
    }
    setStatus("waiting");
    setMatchedPeer(null);
    setMatchId(null);
    setMessages([]);
    setIsSimulated(false);
    toast("Left conversation", "info", "Your anonymous chat session has ended.");
  };

  const handleSimulateMatch = () => {
    const fakeHandle = state.supportMode === "seeking" ? "MindMate #4C81B" : "MindMate #91E0D";
    setIsSimulated(true);
    setMatchedPeer(fakeHandle);
    setMatchId(uid("sim_match"));
    setStatus("matched");
    setMessages([
      {
        id: uid("sim_init"),
        sender: "peer",
        senderHandle: fakeHandle,
        body: state.supportMode === "seeking"
            ? "Hey there 👋 I'm here to listen. What's on your mind today?"
            : "Hi! Thanks for being available. I've been feeling a bit stressed with assignments lately.",
        createdAt: new Date().toISOString(),
      },
    ]);
    toast("Demo peer connected", "success", `Connected with ${fakeHandle}.`);
  };

  const handleSimulateIncomingRequest = () => {
    const hex = Math.random().toString(16).slice(2, 7).toUpperCase();
    const simItem: PeerQueueItem = {
      handle: `MindMate #${hex}`,
      tabId: uid("sim_tab"),
      at: new Date().toISOString(),
    };
    addToPeerQueue(simItem);
    toast("Simulated request added", "info", `${simItem.handle} is now waiting in your queue.`);
  };

  if (!ready) return null;
  const peerQueue = state.peerQueue ?? [];

  return (
    <div className="flex w-full h-[calc(100vh-4rem)] overflow-hidden">
      
      {/* ============================================================== */}
      {/* ⬅️ MAIN CONTENT AREA (Shifts left when sidebar opens) */}
      {/* ============================================================== */}
      <div className={cx("flex-1 transition-all duration-300 pr-0 overflow-y-auto", rightPanelOpen ? "lg:mr-80" : "")}>
        <div className="space-y-4 max-w-4xl mx-auto p-4 sm:p-6">
          
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-navy-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight text-navy-900">Anonymous Peer Chat</h1>
                <Badge tone="mint">P2P</Badge>
              </div>
              <p className="muted mt-0.5 text-sm">One-to-one, ephemeral conversations between students.</p>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-xs text-navy-600">
                This tab: <strong className="font-semibold text-navy-900">
                  {state.supportMode === "supporting" ? "Peer Supporter" : "Seeking Support"}
                </strong>
              </span>
              
              {/* BUTTON TO OPEN RIGHT SIDEBAR */}
              <Button 
                size="sm" 
                tone="secondary"
                onClick={() => setRightPanelOpen(!rightPanelOpen)}
                className="font-medium bg-navy-50"
              >
                {rightPanelOpen ? "Close Panel ➔" : "💬 Activity"}
              </Button>
            </div>
          </header>

          {/* Waiting State */}
          {status === "waiting" ? (
            <div className="space-y-4 animate-fade-up">
              <div className="card p-6 sm:p-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-teal-50 border border-teal-200">
                  <span className="text-2xl animate-bounce" aria-hidden>
                    {state.supportMode === "supporting" ? "🤝" : "🌱"}
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-navy-900">
                  {state.supportMode === "supporting" ? "Available to support peers" : "Looking for an anonymous peer…"}
                </h2>
                <p className="muted mx-auto mt-2 max-w-md text-sm">
                  {state.supportMode === "supporting"
                    ? "You are listening for students who want to chat. When someone connects, they will appear in your queue below for you to accept."
                    : "Connecting you with an active peer supporter on campus. No identity, names or student IDs are ever shared."}
                </p>

                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full border border-mint-200 bg-mint-50 px-3.5 py-1.5 text-xs text-mint-900">
                    <span className="h-2 w-2 rounded-full bg-mint-500 animate-pulse-soft" />
                    Broadcasting as: {myHandle}
                  </span>
                </div>

                {state.supportMode === "supporting" && (
                  <div className="mt-8 rounded-2xl border border-navy-200 bg-white p-5 text-left shadow-sm">
                    <div className="flex items-center justify-between border-b border-navy-100 pb-3">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-navy-900 text-base">Students waiting to talk</h3>
                        <Badge tone={peerQueue.length > 0 ? "teal" : "neutral"}>{peerQueue.length}</Badge>
                      </div>
                      <span className="muted text-xs">Click Accept to start 1:1 chat</span>
                    </div>

                    {peerQueue.length === 0 ? (
                      <div className="py-8 text-center">
                        <p className="text-2xl mb-2" aria-hidden>☕</p>
                        <p className="text-sm font-medium text-navy-800">No requests in queue right now</p>
                        <p className="muted text-xs mt-1">Listening for incoming student requests. Keep this tab open.</p>
                      </div>
                    ) : (
                      <div className="mt-4 space-y-3">
                        {peerQueue.map((req) => (
                          <div key={req.tabId} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-navy-200 bg-navy-50/40 p-4 transition-all hover:border-teal-300 hover:bg-teal-50/30">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-800 text-lg" aria-hidden>🕶️</div>
                              <div>
                                <p className="font-semibold text-navy-900 text-sm sm:text-base">{req.handle}</p>
                                <p className="muted text-xs">Waiting {relativeTime(req.at)}</p>
                              </div>
                            </div>
                            <Button tone="primary" size="sm" onClick={() => handleAcceptRequest(req)} className="font-medium">
                              Accept request
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="mx-auto mt-6 max-w-lg rounded-2xl border border-navy-200 bg-navy-50/70 p-4 text-left text-xs text-navy-800">
                  <p className="font-semibold text-navy-900 mb-1">✨ Live multi-tab 2-way chat:</p>
                  <p className="muted mb-3">
                    Open a <strong>second tab</strong> at <code>/student/peer</code>, switch its role to{" "}
                    <strong>{state.supportMode === "supporting" ? "Seeking" : "Supporting"}</strong>, and test live real-time connection across tabs!
                  </p>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-navy-200/80 pt-3">
                    <span className="muted">Testing in single tab?</span>
                    <div className="flex flex-wrap gap-2">
                      {state.supportMode === "supporting" && (
                        <Button size="sm" tone="secondary" onClick={handleSimulateIncomingRequest}>Simulate incoming request</Button>
                      )}
                      <Button size="sm" tone="primary" onClick={handleSimulateMatch}>Simulate instant match</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Active Chat State */
            <div className="card overflow-hidden shadow-card animate-fade-up">
              <div className="flex flex-wrap items-center justify-between border-b border-navy-100 bg-navy-50/60 px-4 py-3 sm:px-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-800 font-semibold" aria-hidden>🕶️</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold text-navy-900 text-sm sm:text-base">{matchedPeer ?? "Peer"}</h2>
                      <Badge tone={isSimulated ? "neutral" : "mint"} className="text-[10px]">
                        {isSimulated ? "Demo Peer" : "Live Peer (Tab)"}
                      </Badge>
                    </div>
                    <p className="text-xs text-mint-800 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-mint-500 animate-pulse-soft" />
                      You&rsquo;re currently connected · Completely Anonymous
                    </p>
                  </div>
                </div>
                <Button tone="ghost" size="sm" onClick={handleLeave} className="text-xs text-urgent-700 hover:bg-urgent-50">
                  Leave conversation
                </Button>
              </div>

              <div className="border-b border-info-100 bg-info-50/60 px-4 py-2 text-xs text-info-900 flex items-center justify-between">
                <span>🔒 <strong>Private &amp; Ephemeral:</strong> Zero messages are saved. Once you leave, the chat is permanently gone.</span>
                <Link href="/student/help" className="font-medium text-urgent-700 hover:underline shrink-0 ml-2">Crisis helpline →</Link>
              </div>

              <div ref={scrollRef} className="flex flex-col space-y-3 overflow-y-auto p-4 sm:p-5 min-h-[300px] max-h-[50vh]">
                {messages.length === 0 && (
                  <p className="muted my-auto text-center text-xs">You are now connected. Say hello to start the conversation!</p>
                )}
                {messages.map((m) => {
                  const isSelf = m.sender === "self";
                  return (
                    <div key={m.id} className={cx("flex flex-col animate-fade-up", isSelf ? "items-end" : "items-start")}>
                      <div className="flex items-center gap-1.5 px-1 mb-0.5">
                        <span className="text-xs font-medium text-navy-600">{isSelf ? "You" : m.senderHandle || matchedPeer}</span>
                        <span className="text-[10px] text-navy-400">{formatTime(m.createdAt)}</span>
                      </div>
                      <div className={cx("max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed", isSelf ? "rounded-br-sm bg-teal-700 text-white shadow-sm" : "rounded-bl-sm border border-navy-100 bg-white text-navy-900 shadow-sm")}>
                        {m.body}
                      </div>
                    </div>
                  );
                })}
                {isTyping && (
                  <div className="flex items-center gap-2 px-1 py-1 text-xs text-navy-500" aria-live="polite">
                    <span>{matchedPeer} is typing</span>
                    <span className="flex gap-1" aria-hidden>
                      <span className="h-1.5 w-1.5 rounded-full bg-teal-600 animate-pulse-soft" />
                      <span className="h-1.5 w-1.5 rounded-full bg-teal-600 animate-pulse-soft" style={{ animationDelay: "0.2s" }} />
                      <span className="h-1.5 w-1.5 rounded-full bg-teal-600 animate-pulse-soft" style={{ animationDelay: "0.4s" }} />
                    </span>
                  </div>
                )}
              </div>

              <form onSubmit={handleSend} className="border-t border-navy-100 bg-white p-3 sm:p-4">
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder={`Message ${matchedPeer ?? "peer"}…`}
                    className="flex-1 rounded-xl border border-navy-200 bg-navy-50/40 px-3.5 py-2.5 text-sm text-navy-900 placeholder:text-navy-400 focus:border-teal-500 focus:bg-white focus:outline-none transition-colors"
                  />
                  <Button type="submit" tone="primary" size="md" disabled={!draft.trim()} className="shrink-0 font-medium">Send</Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* ➡️ RIGHT SLIDE-IN PANEL (Only Previous Connections) */}
      {/* ============================================================== */}
      <div 
        className={cx(
          "fixed top-0 right-0 h-full w-80 bg-white border-l border-navy-100 shadow-xl transition-transform duration-300 z-40 transform flex flex-col", 
          rightPanelOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="p-4 border-b border-navy-100 flex items-center justify-between bg-navy-50">
          <h2 className="font-bold text-navy-900 flex items-center gap-2">
            💬 Previous Connections
          </h2>
          <button onClick={() => setRightPanelOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-navy-200 text-navy-600">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-gray-50/30">
          <div className="space-y-3 animate-fade-up">
            <div className="bg-white border border-navy-100 rounded-xl p-3 shadow-sm hover:border-teal-300 cursor-pointer transition-colors">
              <div className="flex justify-between items-start mb-1">
                <p className="font-semibold text-navy-900 text-sm">MindMate #C3P0</p>
                <span className="text-[10px] text-navy-400">2 days ago</span>
              </div>
              <p className="text-xs text-navy-500 truncate">I've been feeling a bit stressed with...</p>
            </div>

            <div className="bg-white border border-navy-100 rounded-xl p-3 shadow-sm hover:border-teal-300 cursor-pointer transition-colors">
              <div className="flex justify-between items-start mb-1">
                <p className="font-semibold text-navy-900 text-sm">MindMate #R2D2</p>
                <span className="text-[10px] text-navy-400">Last week</span>
              </div>
              <p className="text-xs text-navy-500 truncate">Thanks for listening to me today...</p>
            </div>

            <div className="text-center pt-4">
              <p className="text-xs text-navy-400 italic">For privacy, older chats are auto-deleted.</p>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}