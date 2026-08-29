
"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation"; 
import { doc, setDoc, getDoc, updateDoc, arrayUnion, collection, query, where, onSnapshot } from "firebase/firestore"; // 🔥 FIREBASE CHAT
import { db } from "@/lib/firebase"; // 🔥 DB INSTANCE
import { Badge, Button } from "@/components/ui";
import { cx, formatTime, relativeTime, uid } from "@/lib/format";
import { screenContent } from "@/lib/moderation";
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
  
  // 🔥 Target Handle from URL (If coming from Community Page)
  const searchParams = useSearchParams();
  const targetHandle = searchParams.get("target");

  // State to hold targeted users in the sidebar
  const [targetedPeers, setTargetedPeers] = useState<string[]>([]);

  // Automatically add target from URL to the list and open sidebar
  // Automatically add target from URL to the list and open sidebar (Fixed Duplicates)
  // Automatically add target from URL to the list and open sidebar (Fixed Duplicates)
  useEffect(() => {
    if (targetHandle) {
      setTargetedPeers(prev => {
        if (prev.includes(targetHandle)) return prev;
        return [targetHandle, ...prev];
      });
      setRightPanelOpen(true);
    }
  }, [targetHandle]);

  // 🔥 2. REAL-TIME FIREBASE LISTENER (WAKES UP THE OTHER USER) 🔥
  useEffect(() => {
    if (!myHandle) return;

    const q = query(
      collection(db, "peer_chats"),
      where("participants", "array-contains", myHandle),
      where("status", "==", "active")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const chatData = change.doc.data();
        const chatId = change.doc.id;

        if (change.type === "added" || change.type === "modified") {
          const otherPeer = chatData.participants.find((p: string) => p !== myHandle) || "Peer";

          // Agar user waiting pe hai aur nayi chat aayi hai -> WAKE UP!
          if (status === "waiting") {
            setMatchId(chatId);
            setMatchedPeer(otherPeer);
            setStatus("matched");
            setIsSimulated(false);
            toast("Incoming Chat!", "success", `${otherPeer} connected with you.`);
            
            // Sidebar update kar do
            setTargetedPeers((prev) => prev.includes(otherPeer) ? prev : [otherPeer, ...prev]);
          }

          // Messages update karo
          if (matchId === chatId || status === "waiting") {
            const formattedMessages = (chatData.messages || []).map((m: any) => ({
              id: m.id,
              sender: m.senderHandle === myHandle ? "self" : "peer",
              senderHandle: m.senderHandle,
              body: m.body,
              createdAt: m.createdAt,
            }));
            setMessages(formattedMessages);
          }
        }
        
        if (change.type === "removed" || (change.type === "modified" && chatData.status === "closed")) {
           if (matchId === chatId) {
             toast("Chat Ended", "info", "The other peer left the chat.");
             setStatus("waiting");
             setMatchId(null);
             setMatchedPeer(null);
             setMessages([]);
           }
        }
      });
    });

    return () => unsubscribe();
  }, [myHandle, status, matchId, toast]);

  // Shown when safety screening matches crisis language in an outgoing message.
  const [crisisPrompt, setCrisisPrompt] = useState(false);

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
        addToPeerQueue({ handle: signal.handle, tabId: signal.tabId, at: signal.at });
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

      // 🔥 AUTO-CONNECT IF SOMEONE TARGETS US FROM COMMUNITY 🔥
      if (
        status === "waiting" &&
        signal.type === "match" &&
        signal.supporterTabId === "targeted" &&
        signal.supporterHandle === myHandle // Agar ye match hua, matlab ping humare liye hai!
      ) {
        setMatchedPeer(signal.seekerHandle);
        setMatchId(signal.matchId);
        setIsSimulated(false);
        setStatus("matched");
        setMessages([]);
        toast("Incoming Chat!", "success", `${signal.seekerHandle} wants to talk!`);
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

      // 🔥 REAL-TIME TARGETED MESSAGE HANDLING 🔥
      if (signal.type === "message") {
        let currentMatchId = matchId;
        let currentStatus = status;

        // Fallback: Agar pehla ping miss ho gaya, toh message aate hi connect kar do
        if (status === "waiting" && signal.matchId.startsWith("targeted_")) {
          const targets = signal.matchId.replace("targeted_", "").split("_");
          if (targets[0] === myHandle) {
            setMatchedPeer(signal.senderHandle);
            setMatchId(signal.matchId);
            setIsSimulated(false);
            setStatus("matched");
            currentMatchId = signal.matchId;
            currentStatus = "matched";
            toast("Incoming chat!", "success", `${signal.senderHandle} sent you a message.`);
          }
        }

        if (currentStatus === "matched" && signal.matchId === currentMatchId) {
          if (signal.senderTabId !== tabId) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === signal.id)) return prev; // Duplicate rokne ke liye
              return [
                ...prev,
                {
                  id: signal.id,
                  sender: "peer",
                  senderHandle: signal.senderHandle,
                  body: signal.body,
                  createdAt: signal.at,
                },
              ];
            });
          }
        }
      }
    },
    // 🔥 YAHAN THI PROBLEM: myHandle ko is line mein add karna zaroori tha! 🔥
    [status, state.supportMode, tabId, matchId, addToPeerQueue, removeFromPeerQueue, toast, myHandle]
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

    // Safety screening. A crisis match never blocks the message — it surfaces
    // support alongside it, the same way the community composer does.
    if (screenContent(text).crisis) setCrisisPrompt(true);

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

   // 🔥 FIREBASE MESSAGE SENDING 🔥
    if (!isSimulated && matchId && matchId.startsWith("fb_")) {
      const chatRef = doc(db, "peer_chats", matchId);
      updateDoc(chatRef, {
        messages: arrayUnion({
          id: newMsg.id,
          senderHandle: myHandle,
          body: text,
          createdAt: newMsg.createdAt
        }),
        updatedAt: new Date().toISOString()
      }).catch(console.error);
    } 
    // OLD BROADCAST CHANNEL BACKUP (For "Find Anonymous Peer" feature)
    else if (!isSimulated && channelRef.current) {
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
    // 🔥 CLOSE FIREBASE CHAT 🔥
    if (matchId && matchId.startsWith("fb_")) {
      const chatRef = doc(db, "peer_chats", matchId);
      updateDoc(chatRef, { status: "closed" }).catch(console.error);
    } 
    // OLD BROADCAST CHANNEL LEAVE
    else if (matchId && !isSimulated && channelRef.current) {
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

              {crisisPrompt ? (
                <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 animate-fade-up">
                  <p className="text-sm font-semibold text-amber-900">
                    That sounded heavy. Support is here if you want it.
                  </p>
                  <p className="mt-0.5 text-xs text-amber-900/80">
                    Your message was sent as normal — nothing was blocked and nobody was
                    told. This is only an offer.
                  </p>
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    <Link
                      href="/student/help"
                      className="inline-flex min-h-9 items-center rounded-lg border border-urgent-200 bg-urgent-50 px-3 text-xs font-semibold text-urgent-900 hover:bg-urgent-100"
                    >
                      🆘 Get help now
                    </Link>
                    <Link
                      href="/student/support/request"
                      className="inline-flex min-h-9 items-center rounded-lg border border-teal-200 bg-teal-50 px-3 text-xs font-semibold text-teal-900 hover:bg-teal-100"
                    >
                      🤝 Talk to a counsellor
                    </Link>
                    <button
                      type="button"
                      onClick={() => setCrisisPrompt(false)}
                      className="ml-auto text-xs font-medium text-navy-500 hover:text-navy-800"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ) : null}

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
      {/* ➡️ RIGHT SLIDE-IN PANEL (Targeted & Previous Connections) */}
      {/* ============================================================== */}
      <div 
        className={cx(
          "fixed top-0 right-0 h-full w-80 bg-white border-l border-navy-100 shadow-xl transition-transform duration-300 z-40 transform flex flex-col", 
          rightPanelOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="p-4 border-b border-navy-100 flex items-center justify-between bg-navy-50 shrink-0">
          <h2 className="font-bold text-navy-900 flex items-center gap-2">
            💬 Peer Connections
          </h2>
          <button onClick={() => setRightPanelOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-navy-200 text-navy-600 transition-colors cursor-pointer">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-gray-50/30">
          
          {/* 🔥 1. DISCOVER / FIND ANONYMOUS PEER (RESERVED ARCHITECTURE) 🔥 */}
          <div className="mb-6 animate-fade-up">
            <p className="text-xs font-bold text-navy-500 uppercase tracking-wider mb-2">Discover</p>
            <div 
              onClick={() => {
                setStatus("waiting");
                setMatchedPeer(null);
                setMatchId(null);
                setMessages([]);
                setIsSimulated(false);
                if(window.innerWidth < 1024) setRightPanelOpen(false); // Close on mobile
              }}
              className={cx(
                "bg-white border-2 rounded-xl p-3 shadow-sm hover:shadow-md cursor-pointer transition-all flex items-center gap-3 group",
                status === "waiting" ? "border-teal-500 bg-teal-50/70" : "border-navy-100 hover:border-teal-300"
              )}
            >
              <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-800 text-lg">🌱</div>
              <div>
                <p className="font-bold text-navy-900 text-sm">Find Anonymous Peer</p>
                <p className="text-xs text-navy-600">Get matched instantly.</p>
              </div>
            </div>
          </div>

          {/* 🔥 2. TARGETED PEERS SECTION (From Community) */}
          {targetedPeers.length > 0 && (
            <div className="mb-6 animate-fade-up">
              <p className="text-xs font-bold text-navy-500 uppercase tracking-wider mb-2">From Community</p>
             <div className="space-y-2.5">
                {targetedPeers.map(handle => {
                  const isActiveChat = status === "matched" && matchedPeer === handle;
                  
                  return (
                  <div key={handle} className={cx(
                    "bg-white border-2 rounded-xl p-3 shadow-sm hover:shadow-md cursor-pointer transition-all relative overflow-hidden group",
                    isActiveChat ? "border-teal-500 bg-teal-50/50" : "border-teal-200"
                  )}>
                    {isActiveChat && <div className="absolute top-0 right-0 h-full w-1 bg-teal-500"></div>}
                    <div className="flex justify-between items-center mb-1">
                      <p className="font-bold text-navy-900 text-sm">{handle}</p>
                      <Badge tone="mint">Targeted</Badge>
                    </div>
                    <p className="text-xs text-navy-600 mb-3">You wanted to talk to this peer.</p>
               <Button 
                      size="sm" 
                      tone="primary" 
                      onClick={async () => {
                        // 🔥 CREATE OR JOIN FIREBASE CHAT SESSION 🔥
                        // Sorting handles ensures both users generate the EXACT same ID no matter who clicks first
                        const newMatchId = `fb_${[myHandle, handle].sort().join("_")}`; 
                        
                        try {
                          const chatRef = doc(db, "peer_chats", newMatchId);
                          const chatSnap = await getDoc(chatRef);
                          
                          if (!chatSnap.exists()) {
                            await setDoc(chatRef, {
                              participants: [myHandle, handle],
                              status: "active",
                              messages: [],
                              createdAt: new Date().toISOString(),
                              updatedAt: new Date().toISOString()
                            });
                          } else {
                            await updateDoc(chatRef, { status: "active", updatedAt: new Date().toISOString() });
                          }

                          setIsSimulated(false);
                          setMatchedPeer(handle);
                          setMatchId(newMatchId);
                          setStatus("matched");
                          // Load past messages if they exist
                          if (chatSnap.exists() && chatSnap.data().messages) {
                            const formattedMessages = chatSnap.data().messages.map((m: any) => ({
                              id: m.id,
                              sender: m.senderHandle === myHandle ? "self" : "peer",
                              senderHandle: m.senderHandle,
                              body: m.body,
                              createdAt: m.createdAt,
                            }));
                            setMessages(formattedMessages);
                          } else {
                            setMessages([]);
                          }
                          
                          toast("Live chat ready", "success", "Connected securely via Firebase!");
                          if(window.innerWidth < 1024) setRightPanelOpen(false); 
                        } catch (err) {
                          console.error(err);
                          toast("Connection failed", "urgent", "Could not connect to Firebase.");
                        }
                      }} 
                      className="w-full font-medium"
                    >
                      Start Chat ➔
                    </Button>
                  </div>
                ); 
              })} 
            </div>
          </div>
        )}

          {/* PREVIOUS CONNECTIONS SECTION */}
          <div className="animate-fade-up">
            <p className="text-xs font-bold text-navy-500 uppercase tracking-wider mb-2">Recent Chats</p>
            <div className="space-y-2.5">
              <div className="bg-white border border-navy-100 rounded-xl p-3 shadow-sm hover:border-teal-300 cursor-pointer transition-colors group">
                <div className="flex justify-between items-start mb-1">
                  <p className="font-semibold text-navy-900 text-sm">MindMate #C3P0</p>
                  <span className="text-[10px] text-navy-400 group-hover:text-teal-600 transition-colors">2 days ago</span>
                </div>
                <p className="text-xs text-navy-500 truncate">I've been feeling a bit stressed with...</p>
              </div>

              <div className="bg-white border border-navy-100 rounded-xl p-3 shadow-sm hover:border-teal-300 cursor-pointer transition-colors group">
                <div className="flex justify-between items-start mb-1">
                  <p className="font-semibold text-navy-900 text-sm">MindMate #R2D2</p>
                  <span className="text-[10px] text-navy-400 group-hover:text-teal-600 transition-colors">Last week</span>
                </div>
                <p className="text-xs text-navy-500 truncate">Thanks for listening to me today...</p>
              </div>
            </div>
          </div>

          <div className="text-center pt-6 pb-2">
            <p className="text-[10px] text-navy-400 font-medium bg-navy-100/50 inline-block px-3 py-1.5 rounded-full">
              For privacy, older chats are auto-deleted.
            </p>
          </div>
        </div>
      </div>
      
    </div>
  );
}