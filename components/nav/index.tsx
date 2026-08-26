"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MindEaseLogo } from "@/components/MindEaseLogo";
import { Badge, Button, Drawer } from "@/components/ui";
import { cx, relativeTime } from "@/lib/format";
import { useStore } from "@/lib/store";

/* ----------------------------------------------------------------- shared */

function NotificationBell({
  audience,
  tone = "student",
}: {
  audience: "student" | "counsellor";
  tone?: "student" | "counsellor";
}) {
  const { state, markNotificationRead, markAllRead } = useStore();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const mine = state.notifications.filter((n) => n.audience === audience);
  const unread = mine.filter((n) => !n.read).length;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return;
    const handleDown = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node) &&
        panelRef.current &&
        !panelRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleDown);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleDown);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const hasActivePeerChat = state.supportMode === "supporting" && !!state.peerChat;
  const isSupporter = state.supportMode === "supporting";
  const peerQueue = state.peerQueue ?? [];

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Notifications (${unread} unread)`}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="relative flex h-10 w-10 items-center justify-center rounded-xl text-navy-600 hover:bg-navy-100 transition-colors"
      >
        <span aria-hidden className="text-lg">
          🔔
        </span>
        {unread > 0 ? (
          <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-urgent-500 px-1 text-[10px] font-bold text-white shadow-xs">
            {unread}
          </span>
        ) : null}
      </button>

      {/* Render Backdrop & Modal in document.body via Portal to prevent layout stacking context issues */}
      {open && mounted
        ? createPortal(
            <>
              {/* Fullscreen Backdrop Blur */}
              <div
                className="fixed inset-0 z-[150] bg-navy-950/40 backdrop-blur-sm animate-fade-in"
                onClick={() => setOpen(false)}
                aria-hidden="true"
              />

              {/* Floating Notification Panel */}
              <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-label="Notifications"
                className="fixed top-16 right-4 sm:right-6 z-[160] w-[calc(100vw-2rem)] sm:w-96 max-h-[85vh] flex flex-col rounded-2xl border border-navy-200/80 bg-white shadow-2xl shadow-navy-950/25 animate-scale-in overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-navy-100 px-4 py-3 bg-navy-50/60 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-base" aria-hidden>
                      🔔
                    </span>
                    <h2 className="font-semibold text-navy-900 text-sm">Notifications</h2>
                    {unread ? <Badge tone="urgent">{unread} unread</Badge> : null}
                  </div>
                  <div className="flex items-center gap-2">
                    {unread ? (
                      <Button
                        size="sm"
                        tone="ghost"
                        onClick={() => markAllRead(audience)}
                        className="text-xs font-medium text-teal-800 hover:text-teal-900"
                      >
                        Mark all read
                      </Button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      aria-label="Close notifications"
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-navy-400 hover:bg-navy-200/60 hover:text-navy-700 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Scrollable content */}
                <div className="overflow-y-auto p-4 space-y-3 flex-1">
                  {/* Supporter Live Item */}
                  {hasActivePeerChat && state.peerChat ? (
                    <div className="rounded-xl border border-mint-200 bg-mint-50/80 p-3 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-mint-900 flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-mint-500 animate-pulse-soft" />
                          Live now
                        </span>
                        <Badge tone="mint">Active 1:1</Badge>
                      </div>
                      <p className="mt-1 text-sm font-medium text-navy-900">
                        Connected with {state.peerChat.peerHandle}
                      </p>
                      <Link
                        href="/student/peer"
                        onClick={() => setOpen(false)}
                        className="mt-2 inline-flex items-center text-xs font-semibold text-teal-800 hover:underline"
                      >
                        Open peer chat →
                      </Link>
                    </div>
                  ) : null}

                  {/* Supporter Waiting Seeker Items */}
                  {isSupporter && peerQueue.length > 0 ? (
                    <div className="rounded-xl border border-teal-200 bg-teal-50/80 p-3 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-teal-900 flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse-soft" />
                          Students waiting
                        </span>
                        <Badge tone="teal">{peerQueue.length}</Badge>
                      </div>
                      <ul className="mt-2 space-y-1.5">
                        {peerQueue.map((item) => (
                          <li
                            key={item.tabId}
                            className="flex items-center justify-between rounded-lg bg-white/90 px-2.5 py-1.5 text-xs shadow-2xs"
                          >
                            <span className="font-medium text-navy-900">{item.handle}</span>
                            <span className="muted text-[11px]">{relativeTime(item.at)}</span>
                          </li>
                        ))}
                      </ul>
                      <Link
                        href="/student/peer"
                        onClick={() => setOpen(false)}
                        className="mt-2 inline-flex items-center text-xs font-semibold text-teal-800 hover:underline"
                      >
                        Go to Peer support queue →
                      </Link>
                    </div>
                  ) : null}

                  {/* Regular Notifications */}
                  {mine.length === 0 && !hasActivePeerChat && peerQueue.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-2xl mb-1" aria-hidden>
                        ✨
                      </p>
                      <p className="text-sm font-medium text-navy-800">You&rsquo;re all caught up</p>
                      <p className="muted text-xs mt-0.5">Nothing new right now.</p>
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {mine.map((n) => (
                        <li key={n.id}>
                          <Link
                            href={n.href ?? "#"}
                            onClick={() => {
                              markNotificationRead(n.id);
                              setOpen(false);
                            }}
                            className={cx(
                              "block rounded-xl border p-3 transition-all hover:shadow-xs",
                              n.read
                                ? "border-navy-100 bg-white hover:bg-navy-50"
                                : "border-teal-300 bg-teal-50/70 hover:bg-teal-50",
                            )}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-semibold text-navy-900">{n.preview}</p>
                              {!n.read ? <Badge tone="teal">New</Badge> : null}
                            </div>
                            <p className="muted mt-1 text-xs leading-relaxed">{n.body}</p>
                            <p className="text-[10px] text-navy-400 mt-1.5">{relativeTime(n.at)}</p>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Footer */}
                <div className="border-t border-navy-100 bg-navy-50/40 px-4 py-2 text-center text-[11px] text-navy-500 shrink-0">
                  🔒 Previews never show sensitive personal content.
                </div>
              </div>
            </>,
            document.body,
          )
        : null}
    </div>
  );
}

export function OfflineBanner() {
  const { state } = useStore();
  if (!state.simulate.offline) return null;
  return (
    <div className="no-print bg-amber-100 px-4 py-2 text-center text-sm text-amber-900">
      <span aria-hidden>📴</span> You&rsquo;re offline. Your private drafts are saved on this device
      and will sync when you reconnect.
    </div>
  );
}

/* -------------------------------------------------------------- student   */

type StudentTab = {
  href: string;
  label: string;
  icon: string;
  urgent?: boolean;
};

function getStudentTabs(supportMode: string): StudentTab[] {
  const tabs = [
    { href: "/student/home", label: "Home", icon: "🏠" },
    { href: "/student/community", label: "Community", icon: "💬" },
    { href: "/student/journal", label: "Journal", icon: "📓" },
  ];

  if (supportMode === "supporting") {
    tabs.push({ href: "/student/peer", label: "Peer Hub", icon: "🫂" });
    tabs.push({ href: "/student/leaderboard", label: "Leaderboard", icon: "🏆" });
  } else {
    tabs.push({ href: "/student/peer", label: "Talk to someone", icon: "💭" });
  }

  tabs.push({ href: "/student/support", label: "Support", icon: "🤝" });
  tabs.push({ href: "/student/help", label: "Help", icon: "🆘", urgent: true });

  return tabs;
}

export function StudentTopBar() {
  const { state } = useStore();
  return (
    <header className="no-print sticky top-0 z-30 border-b border-navy-100 bg-white/90 backdrop-blur lg:hidden">
      <div className="mx-auto flex h-14 max-w-3xl items-center gap-3 px-4">
        <MindEaseLogo href="/student/home" size="sm" />
        <span className="muted hidden truncate text-xs sm:inline">{state.identity?.handle}</span>
        <div className="ml-auto flex items-center gap-1">
          <NotificationBell audience="student" />
          <Link
            href="/student/settings"
            aria-label="Settings"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-navy-600 hover:bg-navy-100"
          >
            ⚙
          </Link>
        </div>
      </div>
    </header>
  );
}

export function StudentBottomNav() {
  const pathname = usePathname();
  const { state } = useStore();
  return (
    <nav
      aria-label="Student primary"
      className="no-print fixed right-0 bottom-0 left-0 z-30 border-t border-navy-100 bg-white/95 px-2 backdrop-blur lg:hidden"
    >
      <ul className="mx-auto flex max-w-3xl">
        {getStudentTabs(state.supportMode).map((t) => {
          const active = pathname.startsWith(t.href);
          return (
            <li key={t.href} className="flex-1">
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={cx(
                  "flex min-h-16 flex-col items-center justify-center gap-0.5 text-[0.7rem] font-medium transition-colors",
                  active
                    ? t.urgent
                      ? "text-urgent-700"
                      : "text-teal-800"
                    : "text-navy-500 hover:text-navy-800",
                )}
              >
                <span
                  aria-hidden
                  className={cx(
                    "flex h-8 w-12 items-center justify-center rounded-full text-lg transition-colors",
                    active && (t.urgent ? "bg-urgent-50" : "bg-teal-50"),
                  )}
                >
                  {t.icon}
                </span>
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function StudentSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { state, setSupportMode, toast } = useStore();

  return (
    <div className="flex h-full flex-col">
      <div className="px-5 py-5">
        <MindEaseLogo href="/student/home" size="md" subtitle="Student Portal" />
      </div>

      <nav aria-label="Student sections" className="flex-1 px-3">
        <ul className="space-y-1">
          {getStudentTabs(state.supportMode).map((t) => {
            const active = pathname.startsWith(t.href);
            return (
              <li key={t.href}>
                <Link
                  href={t.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cx(
                    "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors",
                    active
                      ? t.urgent
                        ? "bg-urgent-100 text-urgent-900 font-semibold"
                        : "bg-teal-100 text-teal-900 font-semibold"
                      : t.urgent
                        ? "text-urgent-700 hover:bg-urgent-50"
                        : "text-navy-600 hover:bg-navy-100 hover:text-navy-900",
                  )}
                >
                  <span aria-hidden className="w-5 text-center text-base">
                    {t.icon}
                  </span>
                  <span className="flex-1">{t.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-navy-100 px-4 py-4 space-y-4">
        {/* Switch Button */}
        <button
          type="button"
          onClick={() => {
            const next = state.supportMode === "supporting" ? "seeking" : "supporting";
            setSupportMode(next);
            toast(
              next === "supporting" ? "Switched to Peer Supporter" : "Switched to Seeking Support",
              "info",
              next === "supporting"
                ? "You are now available to chat with peers who need support."
                : "You are now in student mode looking for resources or support.",
            );
            router.push("/student/home");
            if (onNavigate) onNavigate();
          }}
          className="w-full text-left flex items-center justify-between rounded-xl border border-navy-200 bg-navy-50/70 hover:bg-navy-100 px-3 py-2 text-xs font-medium text-navy-800 transition-colors cursor-pointer"
        >
          <span>Switch to {state.supportMode === "supporting" ? "Seeking mode" : "Supporting mode"}</span>
          <span className="font-bold text-teal-800 text-sm" aria-hidden>
            ⇄
          </span>
        </button>

        {/* Profile Info */}
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-mono font-semibold text-navy-900">
              {state.identity?.handle ?? "MindMate"}
            </p>
            <p className="text-[11px] text-navy-500 flex items-center gap-1.5 mt-0.5">
              <span
                className={cx(
                  "h-1.5 w-1.5 rounded-full",
                  state.supportMode === "supporting" ? "bg-mint-500" : "bg-teal-500",
                )}
                aria-hidden
              />
              Currently:{" "}
              <strong className="font-medium text-navy-700">
                {state.supportMode === "supporting" ? "Peer supporter" : "Seeking support"}
              </strong>
            </p>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            <NotificationBell audience="student" />
            <Link
              href="/student/settings"
              onClick={onNavigate}
              aria-label="Settings"
              className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-navy-100 transition-colors"
            >
              <span aria-hidden className="text-base">
                ⚙️
              </span>
            </Link>
          </div>
        </div>

        <div className="pt-1">
          <Link
            href="/"
            onClick={onNavigate}
            className="inline-block text-xs font-medium text-teal-800 hover:underline"
          >
            Switch role / sign out
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ counsellor  */

const COUNSELLOR_NAV = [
  { href: "/counsellor/dashboard", label: "Dashboard", icon: "▦" },
  { href: "/counsellor/alerts", label: "Support alerts", icon: "◈" },
  { href: "/counsellor/cases", label: "Cases", icon: "▤" },
  { href: "/counsellor/appointments", label: "Appointments", icon: "▣" },
  { href: "/counsellor/moderation", label: "Community safety", icon: "⚑" },
  { href: "/counsellor/resources", label: "Resources", icon: "◇" },
  { href: "/counsellor/analytics", label: "Analytics", icon: "◧" },
  { href: "/counsellor/settings", label: "Settings", icon: "⚙" },
];

export function CounsellorSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { state } = useStore();
  const newAlerts = state.alerts.filter((a) => a.status === "new").length;
  const pendingMod = state.moderation.filter((m) => m.status !== "resolved").length;
  const pendingCases = state.cases.filter((c) => c.status === "requested").length;

  const badgeFor = (href: string) =>
    href.endsWith("/alerts")
      ? newAlerts
      : href.endsWith("/moderation")
        ? pendingMod
        : href.endsWith("/cases")
          ? pendingCases
          : 0;

  return (
    <div className="flex h-full flex-col">
      <div className="px-5 py-5">
        <MindEaseLogo href="/counsellor/dashboard" size="md" subtitle="Counsellor Platform" />
      </div>

      <nav aria-label="Counsellor sections" className="flex-1 px-3">
        <ul className="space-y-0.5">
          {COUNSELLOR_NAV.map((n) => {
            const active = pathname.startsWith(n.href);
            const badge = badgeFor(n.href);
            return (
              <li key={n.href}>
                <Link
                  href={n.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cx(
                    "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors",
                    active
                      ? "bg-pro-100 text-pro-900"
                      : "text-navy-600 hover:bg-navy-100 hover:text-navy-900",
                  )}
                >
                  <span aria-hidden className="w-4 text-center">
                    {n.icon}
                  </span>
                  <span className="flex-1">{n.label}</span>
                  {badge ? (
                    <span className="rounded-full bg-urgent-600 px-1.5 py-0.5 text-[0.65rem] font-semibold text-white">
                      {badge}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-navy-100 px-5 py-4">
        <p className="text-xs font-medium text-navy-800">Dr. A. Rao</p>
        <p className="muted text-xs">Campus counselling · Staff view</p>
        <Link
          href="/"
          className="mt-2 inline-block text-xs font-medium text-teal-800 hover:underline"
        >
          Switch role / sign out
        </Link>
      </div>
    </div>
  );
}

export function CounsellorTopBar({ title }: { title: string }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="no-print sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-navy-100 bg-white/90 px-4 backdrop-blur lg:px-6">
      <button
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
        className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-navy-100 lg:hidden"
      >
        <span aria-hidden>☰</span>
      </button>
      <h1 className="truncate text-base font-semibold text-navy-900">{title}</h1>
      <div className="ml-auto flex items-center gap-1">
        <NotificationBell audience="counsellor" tone="counsellor" />
      </div>

      <Drawer open={open} onClose={() => setOpen(false)} title="Navigation">
        <CounsellorSidebar onNavigate={() => setOpen(false)} />
      </Drawer>
    </header>
  );
}