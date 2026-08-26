"use client";

import Link from "next/link";
import { useState } from "react";
import {
  DataPermissionCard,
  PrivacyBadge,
  ReauthDialog,
} from "@/components/privacy";
import type { PrivacyStatus } from "@/components/privacy";
import {
  Badge,
  Button,
  Callout,
  EmptyState,
  Input,
  Modal,
  SectionTitle,
  SkeletonCard,
  Tabs,
  Textarea,
  Toggle,
} from "@/components/ui";
import { cx } from "@/lib/format";
import { CONSENT_COPY } from "@/lib/privacy";
import { useStore } from "@/lib/store";
import type { A11ySettings, ConsentKey } from "@/lib/types";

type TabKey =
  | "profile"
  | "privacy"
  | "notifications"
  | "blocked"
  | "access"
  | "data"
  | "prototype";

const TABS: { value: TabKey; label: string }[] = [
  { value: "profile", label: "Profile" },
  { value: "privacy", label: "Privacy" },
  { value: "notifications", label: "Notifications" },
  { value: "blocked", label: "Blocked & hidden" },
  { value: "access", label: "Accessibility" },
  { value: "data", label: "Your data" },
  { value: "prototype", label: "Prototype" },
];

const STORAGE_ROWS: {
  what: string;
  where: string;
  who: string;
  status: PrivacyStatus;
}[] = [
  {
    what: "Your daily check-ins",
    where: "This device",
    who: "Only you, unless you share a mood trend with a counsellor",
    status: "private",
  },
  {
    what: "Your journal entries",
    where: "This device",
    who: "Only you, unless you tick a specific entry to share",
    status: "private",
  },
  {
    what: "Your community posts and replies",
    where: "The community feed",
    who: "Other students — under your pseudonym, never your name",
    status: "anonymous",
  },
  {
    what: "Your support requests",
    where: "The counselling team",
    who: "A counsellor sees only the items you ticked",
    status: "shared",
  },
  {
    what: "Campus wellbeing statistics",
    where: "Institutional analytics",
    who: "Nobody can single you out — small groups are suppressed",
    status: "aggregate",
  },
];

export default function StudentSettingsPage() {
  const {
    ready,
    state,
    setConsent,
    setA11y,
    setSupportMode,
    regenerateIdentity,
    exportData,
    deleteMyData,
    setSimulate,
    resetAll,
    hidePost,
    blockHandle,
    lock,
    toast,
  } = useStore();

  const [tab, setTab] = useState<TabKey>("profile");
  const [reauthFor, setReauthFor] =
    useState<null | "identity" | "delete" | ConsentKey>(null);
  const [showExport, setShowExport] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteWord, setDeleteWord] = useState("");
  const [resetConfirm, setResetConfirm] =
    useState<null | "seeded" | "empty">(null);

  if (!ready) return <SkeletonCard />;

  const hiddenPosts = state.posts.filter((p) => p.hidden);
  const consentKeys = Object.keys(CONSENT_COPY) as ConsentKey[];

  const handleConsentChange = (
    key: ConsentKey,
    next: boolean,
  ) => {
    const sensitive = CONSENT_COPY[key].sensitive;

    if (sensitive && !next) {
      setReauthFor(key);
      return;
    }

    setConsent(key, next);
  };

  return (
    <div className="space-y-5">

      {/* =========================================================
          HEADER
      ========================================================= */}

      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-navy-900">
          Settings
        </h1>

        <p className="muted mt-1 text-sm">
          Everything MindEase knows about you, and the switch for each of it.
        </p>
      </header>

      {/* =========================================================
          TABS
      ========================================================= */}

      <Tabs
        tabs={TABS}
        value={tab}
        onChange={setTab}
      />

      {/* =========================================================
          PROFILE
      ========================================================= */}

      {tab === "profile" ? (
        <div className="space-y-4">

          {/* ------------------------- Pseudonym */}

          <section className="card p-4 sm:p-5">
            <SectionTitle
              title="Your pseudonym"
              subtitle="Generated on this device. Not derived from anything about you."
            />

            <div className="rounded-2xl border border-teal-200 bg-teal-50 px-5 py-6 text-center">
              <p className="font-mono text-xl font-semibold text-navy-900">
                {state.identity?.handle ?? "—"}
              </p>

              <p className="muted mt-1 text-xs">
                Counsellors see the case id{" "}
                <span className="font-mono font-medium">
                  {state.identity?.caseId ?? "—"}
                </span>{" "}
                instead of a name.
              </p>
            </div>

            <Button
              className="mt-3"
              onClick={() => setReauthFor("identity")}
            >
              Generate a new pseudonym
            </Button>

            <p className="muted mt-2 text-xs">
              Posts you already made keep the old handle — a new pseudonym is
              a fresh start, not a rewrite of history.
            </p>
          </section>

          {/* ------------------------- Peer role */}

          <section className="card p-4 sm:p-5">
            <SectionTitle
              title="Peer role"
              subtitle="Choose whether you are looking for support or available to help others."
            />

            <div className="mt-2 flex items-start justify-between gap-4 rounded-xl border border-navy-100 p-4">
              <div>
                <p className="font-medium text-navy-900">
                  {state.supportMode === "supporting"
                    ? "Supporting peers"
                    : "Seeking support"}
                </p>

                <p className="muted mt-0.5 text-sm">
                  {state.supportMode === "supporting"
                    ? "You are opted in to receive 1:1 anonymous chat requests from peers on campus."
                    : "You are in student mode, exploring resources and seeking peer or counsellor support."}
                </p>
              </div>

              <Toggle
                checked={state.supportMode === "supporting"}
                onChange={(v) => {
                  const next = v ? "supporting" : "seeking";

                  setSupportMode(next);

                  toast(
                    v
                      ? "Switched to Peer Supporter"
                      : "Switched to Seeking Support",
                    "info",
                    v
                      ? "You are now available for 1:1 peer chats."
                      : "You are now in student mode looking for resources or support.",
                  );
                }}
                label="Peer supporter role"
              />
            </div>
          </section>

          {/* ------------------------- Counsellor connections */}

          <section className="card p-4 sm:p-5">
            <SectionTitle title="Counsellor connections" />

            {state.cases.filter((c) => c.isDemoStudent).length === 0 ? (
              <p className="muted text-sm">
                You have no open support requests.{" "}
                <Link
                  href="/student/support/request"
                  className="font-medium text-teal-800 underline underline-offset-2"
                >
                  Book a counsellor
                </Link>
                .
              </p>
            ) : (
              <ul className="space-y-2">
                {state.cases
                  .filter((c) => c.isDemoStudent)
                  .map((c) => (
                    <li
                      key={c.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-navy-100 p-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-navy-900">
                          {c.concern}
                        </p>

                        <p className="muted text-xs">
                          {c.mode} · case {c.caseId} ·{" "}
                          {c.status.replace("_", " ")}
                        </p>
                      </div>

                      <Link
                        href="/student/support"
                        className="text-sm font-medium text-teal-800 hover:underline"
                      >
                        Manage →
                      </Link>
                    </li>
                  ))}
              </ul>
            )}

            <Link
              href="/student/support/appointments"
              className="mt-3 inline-block text-sm font-medium text-teal-800 hover:underline"
            >
              Appointment history →
            </Link>
          </section>

          {/* ------------------------- Session */}

          <section className="card p-4 sm:p-5">
            <SectionTitle
              title="Session"
              subtitle="Security on a shared or borrowed device."
            />

            <p className="text-sm text-navy-700">
              MindEase locks itself after 15 minutes of inactivity so nothing
              sensitive sits on screen. Unlocking loses nothing.
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <Button onClick={lock}>
                Lock now
              </Button>

              <Link
                href="/"
                className="inline-flex min-h-11 items-center rounded-xl border border-navy-200 px-4 text-sm font-medium text-navy-800 hover:bg-navy-50"
              >
                Sign out
              </Link>
            </div>
          </section>
        </div>
      ) : null}

      {/* =========================================================
          PRIVACY
      ========================================================= */}

      {tab === "privacy" ? (
        <div className="space-y-4">

          {/* ------------------------- Privacy Status */}

          <section className="card p-4 sm:p-5">
            <SectionTitle
              title="Privacy status"
              subtitle="Your current privacy and sharing settings."
            />

            <ul className="mt-3 space-y-2">
              {consentKeys.map((key) => {
                const enabled = state.consent[key];

                return (
                  <li
                    key={key}
                    className="flex items-center justify-between gap-3 rounded-xl border border-navy-100 px-3 py-2.5"
                  >
                    <span className="min-w-0 text-sm text-navy-800">
                      {CONSENT_COPY[key].label}
                    </span>

                    <Badge
                      tone={enabled ? "mint" : "neutral"}
                    >
                      {enabled ? "ON" : "OFF"}
                    </Badge>
                  </li>
                );
              })}
            </ul>

            <a
              href="#manage-permissions"
              className="mt-3 inline-block text-sm font-medium text-teal-800 underline underline-offset-2 hover:text-teal-900"
            >
              Manage privacy permissions →
            </a>
          </section>

          {/* ------------------------- Privacy Dashboard */}

          <section className="card p-4 sm:p-5">
            <SectionTitle
              title="Privacy dashboard"
              subtitle="What is stored, where it lives, and who can see it."
            />

            <div className="space-y-2.5">
              {STORAGE_ROWS.map((r) => (
                <div
                  key={r.what}
                  className="rounded-xl border border-navy-100 p-3.5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="font-medium text-navy-900">
                      {r.what}
                    </p>

                    <PrivacyBadge status={r.status} />
                  </div>

                  <dl className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
                    <div className="flex gap-2">
                      <dt className="muted shrink-0">
                        Stored:
                      </dt>

                      <dd className="text-navy-800">
                        {r.where}
                      </dd>
                    </div>

                    <div className="flex gap-2">
                      <dt className="muted shrink-0">
                        Visible to:
                      </dt>

                      <dd className="text-navy-800">
                        {r.who}
                      </dd>
                    </div>
                  </dl>
                </div>
              ))}
            </div>

            <Callout
              tone="info"
              icon="ℹ️"
              className="mt-4"
            >
              This prototype keeps everything in your browser&rsquo;s local
              storage, which is the stand-in for the platform&rsquo;s protected
              on-device storage model. Nothing is uploaded to a server,
              because there is no server.
            </Callout>
          </section>

          {/* ------------------------- Manage Permissions */}

          <section
            id="manage-permissions"
            className="space-y-2.5"
          >
            <SectionTitle
              title="Manage permissions"
              subtitle="Each one explains why it exists before it asks for anything."
            />

            {consentKeys.map((key) => (
              <DataPermissionCard
                key={key}
                label={CONSENT_COPY[key].label}
                why={CONSENT_COPY[key].why}
                sensitive={CONSENT_COPY[key].sensitive}
                checked={state.consent[key]}
                onChange={(value) =>
                  handleConsentChange(key, value)
                }
              />
            ))}
          </section>
        </div>
      ) : null}

      {/* =========================================================
          NOTIFICATIONS
      ========================================================= */}

      {tab === "notifications" ? (
        <section className="card p-4 sm:p-5">
          <SectionTitle title="Notifications" />

          <div className="flex items-start justify-between gap-4 rounded-xl border border-navy-100 p-4">
            <div>
              <p className="font-medium text-navy-900">
                Send me notifications
              </p>

              <p className="muted mt-0.5 text-sm">
                {CONSENT_COPY.notifications.why}
              </p>
            </div>

            <Toggle
              checked={state.consent.notifications}
              onChange={(v) =>
                setConsent("notifications", v)
              }
              label="Send me notifications"
            />
          </div>

          <div className="mt-4">
            <p className="text-sm font-semibold text-navy-900">
              What a notification actually looks like
            </p>

            <p className="muted mt-1 text-sm">
              Previews never carry content. Somebody glancing at your lock
              screen learns nothing.
            </p>

            <div className="mt-3 rounded-2xl border border-navy-200 bg-navy-900 p-4">
              <div className="rounded-xl bg-white/95 p-3">
                <p className="flex items-center gap-2 text-xs font-medium text-navy-500">
                  <span
                    className="flex h-4 w-4 items-center justify-center rounded bg-navy-900 text-[0.5rem] text-white"
                    aria-hidden
                  >
                    M
                  </span>

                  MindEase · now
                </p>

                <p className="mt-1 text-sm font-medium text-navy-900">
                  You have a new MindEase update
                </p>
              </div>

              <p className="mt-2 text-center text-xs text-navy-300">
                Not: &ldquo;A counsellor replied about your anxiety&rdquo;
              </p>
            </div>
          </div>
        </section>
      ) : null}

      {/* =========================================================
          BLOCKED & HIDDEN
      ========================================================= */}

      {tab === "blocked" ? (
        <div className="space-y-4">

          <section className="card p-4 sm:p-5">
            <SectionTitle title="Blocked students" />

            {state.blockedHandles.length === 0 ? (
              <p className="muted text-sm">
                You have not blocked anyone. Blocking is one-way and silent —
                they are never told.
              </p>
            ) : (
              <ul className="space-y-2">
                {state.blockedHandles.map((handle) => (
                  <li
                    key={handle}
                    className="flex items-center justify-between gap-3 rounded-xl border border-navy-100 p-3"
                  >
                    <span className="font-mono text-sm text-navy-800">
                      {handle}
                    </span>

                    <Button
                      size="sm"
                      onClick={() => blockHandle(handle)}
                    >
                      Unblock
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card p-4 sm:p-5">
            <SectionTitle title="Hidden posts" />

            {hiddenPosts.length === 0 ? (
              <p className="muted text-sm">
                Nothing hidden.
              </p>
            ) : (
              <ul className="space-y-2">
                {hiddenPosts.map((post) => (
                  <li
                    key={post.id}
                    className="flex items-start justify-between gap-3 rounded-xl border border-navy-100 p-3"
                  >
                    <span className="muted min-w-0 flex-1 text-sm">
                      {post.body.slice(0, 90)}…
                    </span>

                    <Button
                      size="sm"
                      onClick={() => hidePost(post.id)}
                    >
                      Unhide
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      ) : null}

      {/* =========================================================
          ACCESSIBILITY
      ========================================================= */}

      {tab === "access" ? (
        <section className="card p-4 sm:p-5">
          <SectionTitle
            title="Accessibility"
            subtitle="These apply immediately, across both the student and counsellor views."
          />

          <div className="space-y-2.5">
            {(
              [
                {
                  key: "highContrast",
                  label: "High contrast",
                  why: "Stronger borders, pure black text, no soft tints.",
                },
                {
                  key: "reducedMotion",
                  label: "Reduced motion",
                  why: "Removes transitions and animation. Also honoured automatically if your system asks for it.",
                },
                {
                  key: "largeText",
                  label: "Larger text",
                  why: "Scales the whole interface up rather than just the body copy.",
                },
              ] as {
                key: keyof A11ySettings;
                label: string;
                why: string;
              }[]
            ).map((a) => (
              <div
                key={a.key}
                className="flex items-start justify-between gap-4 rounded-xl border border-navy-100 p-4"
              >
                <div>
                  <p className="font-medium text-navy-900">
                    {a.label}
                  </p>

                  <p className="muted mt-0.5 text-sm">
                    {a.why}
                  </p>
                </div>

                <Toggle
                  checked={state.a11y[a.key]}
                  onChange={(v) =>
                    setA11y(a.key, v)
                  }
                  label={a.label}
                />
              </div>
            ))}
          </div>

          <Callout
            tone="mint"
            icon="⌨️"
            className="mt-4"
          >
            Keyboard navigation, visible focus rings and screen-reader labels
            are always on. They are not a mode you switch into.
          </Callout>
        </section>
      ) : null}

      {/* =========================================================
          YOUR DATA
      ========================================================= */}

      {tab === "data" ? (
        <div className="space-y-4">

          <section className="card p-4 sm:p-5">
            <SectionTitle
              title="Export my data"
              subtitle="Everything of yours, as JSON."
            />

            <p className="text-sm text-navy-700">
              Your identity, consent settings, check-ins, journal, your own
              posts and replies, and your support requests.
            </p>

            <Button
              className="mt-3"
              onClick={() => setShowExport(true)}
            >
              Show my data
            </Button>
          </section>

          <section className="rounded-2xl border-2 border-urgent-200 bg-urgent-50/40 p-4 sm:p-5">
            <SectionTitle title="Delete everything" />

            <p className="text-sm text-navy-800">
              Erases your pseudonym, check-ins, journal, your own posts and
              replies, and your support requests from this device. There is no
              backup and no undo — that is the point.
            </p>

            <Button
              tone="urgent"
              className="mt-3"
              onClick={() => setReauthFor("delete")}
            >
              Delete my data
            </Button>
          </section>
        </div>
      ) : null}

      {/* =========================================================
          PROTOTYPE
      ========================================================= */}

      {tab === "prototype" ? (
        <section className="rounded-2xl border-2 border-dashed border-navy-300 bg-white p-4 sm:p-5">

          <p className="mb-3 inline-block rounded-full bg-navy-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
            Prototype controls
          </p>

          <p className="muted text-sm">
            These would not exist in a real deployment. They are here so the
            failure states and the demo reset can be shown on demand.
          </p>

          <div className="mt-4 space-y-2.5">

            <div className="flex items-start justify-between gap-4 rounded-xl border border-navy-100 p-4">
              <div>
                <p className="font-medium text-navy-900">
                  Simulate: AI unavailable
                </p>

                <p className="muted mt-0.5 text-sm">
                  Surfaces &ldquo;Support analysis is temporarily unavailable.
                  Your private journal remains available.&rdquo;
                </p>
              </div>

              <Toggle
                checked={state.simulate.aiDown}
                onChange={(v) =>
                  setSimulate("aiDown", v)
                }
                label="Simulate AI unavailable"
              />
            </div>

            <div className="flex items-start justify-between gap-4 rounded-xl border border-navy-100 p-4">
              <div>
                <p className="font-medium text-navy-900">
                  Simulate: offline
                </p>

                <p className="muted mt-0.5 text-sm">
                  Surfaces &ldquo;You&rsquo;re offline. Your private draft has
                  been saved locally.&rdquo;
                </p>
              </div>

              <Toggle
                checked={state.simulate.offline}
                onChange={(v) =>
                  setSimulate("offline", v)
                }
                label="Simulate offline"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              onClick={() =>
                setResetConfirm("seeded")
              }
            >
              Reset with demo history
            </Button>

            <Button
              onClick={() =>
                setResetConfirm("empty")
              }
            >
              Reset to an empty account
            </Button>

            <Link
              href="/demo"
              className="inline-flex min-h-11 items-center text-sm font-medium text-teal-800 hover:underline"
            >
              Open the demo script →
            </Link>
          </div>
        </section>
      ) : null}

      {/* =========================================================
          REAUTH DIALOG
      ========================================================= */}

      <ReauthDialog
        open={reauthFor !== null}
        onClose={() => setReauthFor(null)}
        action={
          reauthFor === "identity"
            ? "replacing your anonymous identity"
            : reauthFor === "delete"
              ? "erasing everything stored on this device"
              : `turning off ${
                  reauthFor
                    ? CONSENT_COPY[
                        reauthFor as ConsentKey
                      ]?.label.toLowerCase()
                    : ""
                }`
        }
        onVerified={() => {
          if (reauthFor === "identity") {
            const next = regenerateIdentity();

            toast(
              "New pseudonym",
              "success",
              `You are now ${next.handle}.`,
            );
          } else if (reauthFor === "delete") {
            setDeleteConfirm(true);
          } else if (reauthFor) {
            setConsent(
              reauthFor as ConsentKey,
              false,
            );

            toast(
              "Consent withdrawn",
              "info",
            );
          }

          setReauthFor(null);
        }}
      />

      {/* =========================================================
          EXPORT MODAL
      ========================================================= */}

      <Modal
        open={showExport}
        onClose={() => setShowExport(false)}
        title="Your data"
        size="lg"
        description="Everything MindEase holds about you on this device."
        footer={
          <>
            <Button
              onClick={() =>
                setShowExport(false)
              }
            >
              Close
            </Button>

            <Button
              tone="primary"
              onClick={() => {
                navigator.clipboard
                  ?.writeText(exportData())
                  .then(() =>
                    toast(
                      "Copied to clipboard",
                      "success",
                    ),
                  )
                  .catch(() =>
                    toast(
                      "Could not copy",
                      "warning",
                      "Select the text instead.",
                    ),
                  );
              }}
            >
              Copy to clipboard
            </Button>
          </>
        }
      >
        <p className="muted mb-3 text-sm">
          A real deployment would offer this as a file download. This prototype
          shows it instead, so you can see exactly what an export contains.
        </p>

        <Textarea
          readOnly
          rows={16}
          value={exportData()}
          className="font-mono text-xs"
          aria-label="Your exported data"
        />
      </Modal>

      {/* =========================================================
          DELETE MODAL
      ========================================================= */}

      <Modal
        open={deleteConfirm}
        onClose={() => {
          setDeleteConfirm(false);
          setDeleteWord("");
        }}
        tone="urgent"
        size="sm"
        title="This cannot be undone"
        description="Type DELETE to confirm."
        footer={
          <>
            <Button
              onClick={() => {
                setDeleteConfirm(false);
                setDeleteWord("");
              }}
            >
              Keep my data
            </Button>

            <Button
              tone="urgent"
              disabled={
                deleteWord.trim().toUpperCase() !==
                "DELETE"
              }
              onClick={() => {
                deleteMyData();
                setDeleteConfirm(false);
                setDeleteWord("");

                toast(
                  "Everything deleted",
                  "info",
                  "This device holds nothing of yours.",
                );
              }}
            >
              Delete everything
            </Button>
          </>
        }
      >
        <ul className="mb-3 space-y-1.5 text-sm text-navy-800">
          <li>· Your pseudonym and case id</li>
          <li>· {state.checkIns.length} check-ins</li>
          <li>· {state.journal.length} journal entries</li>
          <li>· Your own posts, replies and support requests</li>
        </ul>

        <Input
          value={deleteWord}
          onChange={(e) =>
            setDeleteWord(e.target.value)
          }
          placeholder="DELETE"
          aria-label="Type DELETE to confirm"
          className="text-center font-mono uppercase"
        />
      </Modal>

      {/* =========================================================
          RESET MODAL
      ========================================================= */}

      <Modal
        open={resetConfirm !== null}
        onClose={() => setResetConfirm(null)}
        size="sm"
        title={
          resetConfirm === "seeded"
            ? "Reset with demo history?"
            : "Reset to an empty account?"
        }
        description={
          resetConfirm === "seeded"
            ? "Restores four weeks of check-ins so the longitudinal support indicator has something to show."
            : "Starts from nothing: no check-ins, no journal, no history."
        }
        footer={
          <>
            <Button
              onClick={() =>
                setResetConfirm(null)
              }
            >
              Cancel
            </Button>

            <Button
              tone="primary"
              onClick={() => {
                if (resetConfirm) {
                  resetAll(resetConfirm);
                }

                setResetConfirm(null);

                toast(
                  "Reset complete",
                  "success",
                );
              }}
            >
              Reset
            </Button>
          </>
        }
      />

      {/* =========================================================
          EMPTY BLOCKED STATE
      ========================================================= */}

      {tab === "blocked" &&
      state.blockedHandles.length === 0 &&
      hiddenPosts.length === 0 ? (
        <EmptyState
          icon="🌿"
          title="Nothing to manage here"
          body="You have not needed to block or hide anyone. Long may that last."
          className={cx("mt-2")}
        />
      ) : null}

    </div>
  );
}