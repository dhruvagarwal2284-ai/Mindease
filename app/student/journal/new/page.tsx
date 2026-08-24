"use client";

import Link from "next/link";
import { JournalEditor } from "@/components/journal";
import { Callout, SkeletonCard } from "@/components/ui";
import { useStore } from "@/lib/store";

export default function NewJournalEntryPage() {
  const { ready } = useStore();
  if (!ready) return <SkeletonCard />;

  return (
    <div className="space-y-4">
      <Link href="/student/journal" className="muted inline-block text-sm hover:underline">
        &larr; Journal
      </Link>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-navy-900">New entry</h1>
        <p className="muted mt-1 text-sm">
          Written to this device. No counsellor, no other student, and no part of MindEase
          reads this unless you decide to share it.
        </p>
      </div>

      <Callout tone="info" icon="&#128274;" title="Private to you">
        Your journal entries are not visible to counsellors unless you explicitly choose to
        share them.
      </Callout>

      <JournalEditor />
    </div>
  );
}
