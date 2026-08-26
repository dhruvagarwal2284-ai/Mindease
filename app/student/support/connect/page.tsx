"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Badge, Button } from "@/components/ui";
import { cx, formatTime } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { PeerChatMessage } from "@/lib/types";

/* --------------------------------------------------------- canned replies */

const INITIAL_GREETINGS = [
  "Hey there 👋 I'm around if you want to chat or vent about anything on your mind.",
  "Hi! Thanks for connecting. How is your day going?",
  "Hey! No pressure at all, just here to listen if you want to talk.",
];

const CANNED_REPLIES = [
  "That sounds really tough. I'm glad you're talking about it.",
  "You're definitely not alone in this — a lot of us on campus feel the same way.",
  "I hear you. That takes courage to share.",
  "It's completely okay to not have everything figured out right now.",
  "That must be exhausting. Remember to take it one step at a time.",
  "I've been in a similar spot before. Things can get easier.",
  "Thanks for trusting me with that. I'm listening.",
  "No judgement here at all — take all the time you need. 💛",
  "That makes a lot of sense. How are you holding up otherwise?",
  "You're doing the best you can, and that's genuinely enough.",
];

/* ------------------------------------------------------ typing indicator */

function TypingIndicator({ handle }: { handle: string }) {
  return (
    <div
      className="flex items-center gap-2 px-1 py-1 text-xs text-navy-500 animate-fade-up"
      aria-live="polite"
    >
      <span>{handle} is typing</span>
      <span className="flex gap-1" aria-hidden>
        <span className="h-1.5 w-1.5 rounded-full bg-teal-600 animate-pulse-soft" />
        <span
          className="h-1.5 w-1.5 rounded-full bg-teal-600 animate-pulse-soft"
          style={{ animationDelay: "0.2s" }}
        />
        <span
          className="h-1.5 w-1.5 rounded-full bg-teal-600 animate-pulse-soft"
          style={{ animationDelay: "0.4s" }}
        />
      </span>
    </div>
  );
}

/* ---------------------------------------------------------- chat bubble */

function ChatBubble({
  message,
  peerHandle,
}: {
  message: PeerChatMessage;
  peerHandle: string;
}) {
  const isSelf = message.sender === "self";
  return (
    <div
      className={cx(
        "flex flex-col animate-fade-up",
        isSelf ? "items-end" : "items-start",
      )}
    >
      <div className="flex items-center gap-1.5 px-1 mb-1">
        <span className="text-xs font-medium text-navy-600">
          {isSelf ? "You" : peerHandle}
        </span>
        <span className="text-[10px] text-navy-400">
          {formatTime(message.createdAt)}
        </span>
      </div>
      <div
        className={cx(
          "max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isSelf
            ? "rounded-br-sm bg-teal-700 text-white shadow-sm"
            : "rounded-bl-sm border border-navy-100 bg-white text-navy-900 shadow-sm",
        )}
      >
        {message.body}
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- page */

export default function PeerConnectPage() {
  const { ready, state, startPeerChat, sendPeerMessage, endPeerChat } = useStore();

  const [phase, setPhase] = useState<"matching" | "chat">("matching");
  const [isTyping, setIsTyping] = useState(false);
  const [draft, setDraft] = useState("");
  const replyIndex = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const initialized = useRef(false);

  // Initialize or resume session
  useEffect(() => {
    if (!ready) return;
    if (state.peerChat) {
      setPhase("chat");
    } else if (!initialized.current) {
      initialized.current = true;
      setPhase("matching");
      const matchTimer = setTimeout(() => {
        const session = startPeerChat();
        setPhase("chat");
        // Send initial greeting after connecting
        setTimeout(() => {
          const randomGreeting =
            INITIAL_GREETINGS[Math.floor(Math.random() * INITIAL_GREETINGS.length)];
          sendPeerMessage(randomGreeting, "peer");
        }, 600);
      }, 1800);

      return () => clearTimeout(matchTimer);
    }
  }, [ready, state.peerChat, startPeerChat, sendPeerMessage]);

  // Auto-scroll on new messages or typing state changes
  const messages = state.peerChat?.messages ?? [];
  const messageCount = messages.length;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messageCount, isTyping]);

  const handleSend = useCallback(
    (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      const text = draft.trim();
      if (!text || isTyping) return;

      setDraft("");
      sendPeerMessage(text, "self");

      // Focus back on input
      inputRef.current?.focus();

      // Trigger simulated typing & peer reply
      setIsTyping(true);
      const delay = 1200 + Math.random() * 1000;
      const timeoutId = setTimeout(() => {
        setIsTyping(false);
        const reply =
          CANNED_REPLIES[replyIndex.current % CANNED_REPLIES.length];
        replyIndex.current += 1;
        sendPeerMessage(reply, "peer");
      }, delay);

      return () => clearTimeout(timeoutId);
    },
    [draft, isTyping, sendPeerMessage],
  );

  const handleEndChat = useCallback(() => {
    endPeerChat();
    setPhase("matching");
    initialized.current = false;
  }, [endPeerChat]);

  const peerHandle = state.peerChat?.peerHandle ?? "Anonymous Peer";

  return (
    <div className="flex min-h-[calc(100dvh-12rem)] flex-col">
      {/* ------------------------------------------------ Matching State */}
      {phase === "matching" ? (
        <div className="my-auto flex flex-col items-center justify-center py-16 text-center animate-fade-up">
          <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-teal-50 border border-teal-200 shadow-sm">
            <span className="text-3xl animate-bounce" aria-hidden>
              🤝
            </span>
            <span
              className="absolute -top-1 -right-1 flex h-4 w-4"
              aria-hidden
            >
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
              <span className="relative inline-flex h-4 w-4 rounded-full bg-teal-500" />
            </span>
          </div>

          <h1 className="text-xl font-semibold tracking-tight text-navy-900 sm:text-2xl">
            Connecting you with a peer…
          </h1>
          <p className="muted mx-auto mt-2 max-w-sm text-sm">
            Finding an active student peer. Your conversation is completely anonymous
            and stays on this device.
          </p>

          <div className="mt-6 flex items-center gap-2 rounded-full border border-mint-200 bg-mint-50 px-3.5 py-1.5 text-xs text-mint-900">
            <span aria-hidden>🕶️</span>
            <span>Anonymous Mode Active</span>
          </div>

          <div className="mt-8">
            <Link
              href="/student/home"
              className="text-xs font-medium text-navy-600 hover:text-navy-900 underline underline-offset-2"
            >
              Cancel and return to home
            </Link>
          </div>
        </div>
      ) : (
        /* ------------------------------------------------ Active Chat Screen */
        <div className="flex flex-1 flex-col rounded-2xl border border-navy-100 bg-canvas overflow-hidden shadow-card animate-fade-up">
          {/* Chat Header */}
          <header className="flex items-center justify-between border-b border-navy-100 bg-white px-4 py-3 sm:px-5">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-800 font-semibold text-base"
                aria-hidden
              >
                🕶️
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-semibold text-sm sm:text-base text-navy-900">
                    {peerHandle}
                  </h1>
                  <Badge tone="mint" className="hidden sm:inline-flex text-[10px]">
                    Peer
                  </Badge>
                </div>
                <p className="text-xs text-mint-800 flex items-center gap-1.5">
                  <span className="inline-block h-2 w-2 rounded-full bg-mint-500 animate-pulse-soft" />
                  Connected & Anonymous
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/student/support/request"
                className="hidden md:inline-flex text-xs font-medium text-teal-800 hover:underline"
              >
                Need a counsellor?
              </Link>
              <Button
                tone="ghost"
                size="sm"
                onClick={handleEndChat}
                className="text-xs text-navy-600 hover:text-urgent-700"
              >
                End Chat
              </Button>
            </div>
          </header>

          {/* Privacy Notice Banner */}
          <div className="border-b border-info-100 bg-info-50/70 px-4 py-2 text-xs text-info-900 flex items-center justify-between">
            <span>
              🔒 <strong>Private peer chat:</strong> Messages are temporary and not shared with staff.
            </span>
            <Link
              href="/student/help"
              className="text-urgent-700 font-medium hover:underline shrink-0 ml-2"
            >
              Need crisis help?
            </Link>
          </div>

          {/* Message Thread Container */}
          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto p-4 sm:p-5 min-h-[300px] max-h-[55vh]"
            aria-live="polite"
            aria-label="Chat messages"
          >
            {messages.map((msg) => (
              <ChatBubble
                key={msg.id}
                message={msg}
                peerHandle={peerHandle}
              />
            ))}

            {isTyping && <TypingIndicator handle={peerHandle} />}
          </div>

          {/* Chat Composer Bar */}
          <form
            onSubmit={handleSend}
            className="border-t border-navy-100 bg-white p-3 sm:p-4"
          >
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={`Message ${peerHandle}…`}
                aria-label={`Message ${peerHandle}`}
                className="flex-1 rounded-xl border border-navy-200 bg-navy-50/40 px-3.5 py-2.5 text-sm text-navy-900 placeholder:text-navy-400 focus:border-teal-500 focus:bg-white focus:outline-none transition-colors"
                maxLength={500}
              />
              <Button
                type="submit"
                tone="primary"
                size="md"
                disabled={!draft.trim() || isTyping}
                className="shrink-0 font-medium"
              >
                Send
              </Button>
            </div>
            <p className="muted mt-2 text-[11px] text-center sm:text-left">
              Press Enter to send. For safety, do not share personal contacts or passwords.
            </p>
          </form>
        </div>
      )}
    </div>
  );
}
