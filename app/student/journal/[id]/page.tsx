"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { JournalEditor, LockIndicator } from "@/components/journal";
import {
  Button,
  Callout,
  EmptyState,
  Modal,
  SkeletonCard,
  Toggle,
} from "@/components/ui";
import { formatDateTime } from "@/lib/format";
import { useStore } from "@/lib/store";

export default function JournalEntryPage() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { ready, state, toggleJournalShare, toast } = useStore();
  const [confirmShare, setConfirmShare] = useState(false);

  if (!ready) return <SkeletonCard />;

  const entry = state.journal.find((j) => j.id === id);

  if (!entry) {
    return (
      <EmptyState
        icon="🍃"
        title="That entry isn't here"
        body="It may have been deleted from this device, or the link may be out of date."
        action={
          <Link
            href="/student/journal"
            className="inline-flex min-h-11 items-center rounded-xl bg-teal-700 px-4 font-medium text-white hover:bg-teal-800"
          >
            Back to your journal
          </Link>
        }
      />
    );
  }

  const openCases = state.cases.filter(
    (c) => c.isDemoStudent && c.status !== "closed",
  );

  const confirmToggle = () => {
    toggleJournalShare(entry.id);
    setConfirmShare(false);
    toast(
      entry.sharedWithCounsellor ? "Sharing revoked" : "Entry shared",
      entry.sharedWithCounsellor ? "info" : "warning",
      entry.sharedWithCounsellor
        ? "It is private to you again."
        : "Only this entry. You can revoke it any time.",
    );
  };

  return (
    <div className="space-y-4">
      <Link href="/student/journal" className="muted inline-block text-sm hover:underline">
        ← Journal
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-navy-900">
          {entry.title || "Entry"}
        </h1>
        <LockIndicator shared={entry.sharedWithCounsellor} />
      </div>
      <p className="muted -mt-2 text-xs">
        Written {formatDateTime(entry.createdAt)}
        {entry.updatedAt !== entry.createdAt
          ? ` · edited ${formatDateTime(entry.updatedAt)}`
          : ""}
      </p>

      <JournalEditor entry={entry} />

      {/* ------------------------------------------------- sharing control */}
      <section
        aria-labelledby="share-heading"
        className={
          entry.sharedWithCounsellor
            ? "rounded-2xl border border-amber-200 bg-amber-50/60 p-4 sm:p-5"
            : "card p-4 sm:p-5"
        }
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 id="share-heading" className="font-semibold text-navy-900">
              Share this entry with my counsellor
            </h2>
            <p className="muted mt-1 text-sm">
              Off by default. Turning this on makes <strong>this one entry</strong> readable
              by the counsellor on your case — nothing else in your journal moves with it.
            </p>
          </div>
          <Toggle
            checked={entry.sharedWithCounsellor}
            onChange={() => setConfirmShare(true)}
            label="Share this entry with my counsellor"
            tone="urgent"
          />
        </div>

        {entry.sharedWithCounsellor ? (
          <Callout tone="amber" icon="🤝" className="mt-3">
            Shared. You can revoke this at any moment and it disappears from their view.
          </Callout>
        ) : null}

        {openCases.length === 0 && !entry.sharedWithCounsellor ? (
          <p className="muted mt-3 text-xs">
            You do not have an open support request yet, so there is nobody to share with.{" "}
            <Link
              href="/student/support/request"
              className="font-medium text-teal-800 underline underline-offset-2"
            >
              Talk to someone
            </Link>{" "}
            if you would like one.
          </p>
        ) : null}
      </section>

      <Modal
        open={confirmShare}
        onClose={() => setConfirmShare(false)}
        tone={entry.sharedWithCounsellor ? "default" : "urgent"}
        title={
          entry.sharedWithCounsellor
            ? "Stop sharing this entry?"
            : "Share this entry with a counsellor?"
        }
        description={
          entry.sharedWithCounsellor
            ? "It becomes private to you again immediately."
            : "Read this carefully — it is the only way anything from your journal leaves this device."
        }
        footer={
          <>
            <Button onClick={() => setConfirmShare(false)}>Cancel</Button>
            <Button
              tone={entry.sharedWithCounsellor ? "primary" : "urgent"}
              onClick={confirmToggle}
            >
              {entry.sharedWithCounsellor ? "Stop sharing" : "Yes, share this entry"}
            </Button>
          </>
        }
      >
        {entry.sharedWithCounsellor ? (
          <p className="text-sm text-navy-700">
            The counsellor will no longer see this entry on your case. Anything they already
            read, they have already read — revoking removes access, not memory.
          </p>
        ) : (
          <div className="space-y-3">
            <div>
              <p className="mb-2 text-sm font-semibold text-navy-900">What this does</p>
              <ul className="space-y-1.5 text-sm text-navy-800">
                <li className="flex gap-2">
                  <span className="text-mint-600" aria-hidden>
                    ✓
                  </span>
                  A counsellor on your case can read this entry, in full
                </li>
                <li className="flex gap-2">
                  <span className="text-mint-600" aria-hidden>
                    ✓
                  </span>
                  You can revoke it at any time, from this same screen
                </li>
              </ul>
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-navy-900">What it does not do</p>
              <ul className="space-y-1.5 text-sm text-navy-500">
                <li className="flex gap-2">
                  <span aria-hidden>✕</span>
                  Share any other journal entry, now or later
                </li>
                <li className="flex gap-2">
                  <span aria-hidden>✕</span>
                  Reveal your name, email or roll number
                </li>
                <li className="flex gap-2">
                  <span aria-hidden>✕</span>
                  Change any of your other privacy settings
                </li>
              </ul>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
