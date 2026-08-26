"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
  const mine = state.notifications.filter((n) => n.audience === audience);
  const unread = mine.filter((n) => !n.read).length;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
        className={cx(
          "relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
          tone === "counsellor" ? "hover:bg-pro-100" : "hover:bg-navy-100",
        )}
      >
        <span aria-hidden className="text-lg">
          🔔
        </span>
        {unread ? (
          <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-urgent-600 px-1 text-[0.6rem] font-semibold text-white">
            {unread}
          </span>
        ) : null}
      </button>

      <Drawer open={open} onClose={() => setOpen(false)} title="Notifications">
        <div className="mb-3 flex items-center justify-between">
          <p className="muted text-xs">
            Previews never show sensitive content — open the app to read the detail.
          </p>
          {unread ? (
            <Button size="sm" tone="ghost" onClick={() => markAllRead(audience)}>
              Mark all read
            </Button>
          ) : null}
        </div>
        {mine.length === 0 ? (
          <p className="muted text-sm">Nothing new right now.</p>
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
                    "block rounded-xl border p-3 transition-colors",
                    n.read
                      ? "border-navy-100 bg-white"
                      : "border-teal-200 bg-teal-50/60 hover:bg-teal-50",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-navy-900">{n.preview}</p>
                    {!n.read ? <Badge tone="teal">New</Badge> : null}
                  </div>
                  <p className="muted mt-0.5 text-sm">{n.body}</p>
                  <p className="muted mt-1 text-xs">{relativeTime(n.at)}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Drawer>
    </>
  );
}

export function OfflineBanner() {
  const { state } = useStore();
  if (!state.simulate.offline) return null;
  return (
    <div className="no-print bg-amber-100 px-4 py-2 text-center text-sm text-amber-900">
      <span aria-hidden>📴</span> You&rsquo;re offline. Your private drafts are saved on
      this device and will sync when you reconnect.
    </div>
  );
}

/* -------------------------------------------------------------- student   */

const STUDENT_TABS = [
  { href: "/student/home", label: "Home", icon: "🏠" },
  { href: "/student/community", label: "Community", icon: "💬" },
  { href: "/student/journal", label: "Journal", icon: "📓" },
  { href: "/student/support", label: "Support", icon: "🤝" },
  { href: "/student/help", label: "Help", icon: "🆘", urgent: true },
];

export function StudentTopBar() {
  const { state } = useStore();
  return (
    <header className="no-print sticky top-0 z-30 border-b border-navy-100 bg-white/90 backdrop-blur lg:hidden">
      <div className="mx-auto flex h-14 max-w-3xl items-center gap-3 px-4">
        <Link href="/student/home" className="flex items-center gap-2">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-900 text-sm font-bold text-white"
            aria-hidden
          >
            M
          </span>
          <span className="font-semibold tracking-tight text-navy-900">MindEase</span>
        </Link>
        <span className="muted hidden truncate text-xs sm:inline">
          {state.identity?.handle}
        </span>
        <div className="ml-auto flex items-center gap-1">
          <NotificationBell audience="student" />
          <Link
            href="/student/settings"
            aria-label="Settings"
            className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-navy-100"
          >
            <span aria-hidden className="text-lg">
              ⚙️
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}

export function StudentBottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Primary"
      className="no-print fixed inset-x-0 bottom-0 z-30 border-t border-navy-100 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      <ul className="mx-auto flex max-w-3xl">
        {STUDENT_TABS.map((t) => {
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
  const { state, setSupportMode, toast } = useStore();

  return (
    <div className="flex h-full flex-col">
      <Link
        href="/student/home"
        onClick={onNavigate}
        className="flex items-center gap-2.5 px-5 py-5"
      >
        <span
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-900 text-sm font-bold text-white"
          aria-hidden
        >
          M
        </span>
        <span>
          <span className="block leading-tight font-semibold text-navy-900">MindEase</span>
          <span className="block text-xs text-teal-800">Student portal</span>
        </span>
      </Link>

      <nav aria-label="Student sections" className="flex-1 px-3">
        <ul className="space-y-1">
          {STUDENT_TABS.map((t) => {
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

      <div className="border-t border-navy-100 px-4 py-4 space-y-3">
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
              <span aria-hidden className="text-base">⚙️</span>
            </Link>
          </div>
        </div>

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
          }}
          className="w-full text-left flex items-center justify-between rounded-xl border border-navy-200 bg-navy-50/70 hover:bg-navy-100 px-2.5 py-1.5 text-xs text-navy-700 transition-colors cursor-pointer"
        >
          <span>Switch to {state.supportMode === "supporting" ? "Seeking mode" : "Supporting mode"}</span>
          <span className="font-semibold text-teal-800" aria-hidden>⇄</span>
        </button>

        <div className="pt-0.5">
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
      <Link
        href="/counsellor/dashboard"
        onClick={onNavigate}
        className="flex items-center gap-2.5 px-5 py-5"
      >
        <span
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-pro-700 text-sm font-bold text-white"
          aria-hidden
        >
          M
        </span>
        <span>
          <span className="block leading-tight font-semibold text-navy-900">MindEase</span>
          <span className="block text-xs text-pro-700">Counsellor platform</span>
        </span>
      </Link>

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
