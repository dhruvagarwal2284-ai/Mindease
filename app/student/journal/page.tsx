"use client";

import Link from "next/link";
import { JournalCard, PrivateSpaceHeader } from "@/components/journal";
import { EmptyState, LinkButton, SkeletonCard } from "@/components/ui";
import { useStore } from "@/lib/store";

export default function JournalHomePage() {
  const { ready, state } = useStore();

  if (!ready) {
    return (
      <div className="space-y-3">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  const entries = [...state.journal].sort((a, b) =>
    a.updatedAt < b.updatedAt ? 1 : -1,
  );
  const drafts = entries.filter((e) => e.isDraft);
  const saved = entries.filter((e) => !e.isDraft);

  return (
    <div className="space-y-5">
      <PrivateSpaceHeader
        action={
          <LinkButton href="/student/journal/new" tone="primary">
            + New entry
          </LinkButton>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="muted text-sm">
          {entries.length === 0
            ? "No entries yet"
            : `${entries.length} ${entries.length === 1 ? "entry" : "entries"} on this device`}
        </p>
        <Link
          href="/student/journal/trends"
          className="text-sm font-medium text-teal-800 hover:underline"
        >
          Your mood pattern →
        </Link>
      </div>

      {entries.length === 0 ? (
        <EmptyState
          icon="📓"
          title="Nothing here yet"
          body="This space is yours — nobody else can read it. Some people write a paragraph, some write one line about how the day went. Both count."
          action={
            <LinkButton href="/student/journal/new" tone="primary">
              Write your first entry
            </LinkButton>
          }
        />
      ) : (
        <div className="space-y-5">
          {drafts.length > 0 ? (
            <section aria-labelledby="drafts-heading" className="space-y-2.5">
              <h2
                id="drafts-heading"
                className="text-xs font-semibold tracking-wide text-navy-500 uppercase"
              >
                Drafts · {drafts.length}
              </h2>
              {drafts.map((e) => (
                <JournalCard key={e.id} entry={e} />
              ))}
            </section>
          ) : null}

          {saved.length > 0 ? (
            <section aria-labelledby="entries-heading" className="space-y-2.5">
              <h2
                id="entries-heading"
                className="text-xs font-semibold tracking-wide text-navy-500 uppercase"
              >
                Entries
              </h2>
              {saved.map((e) => (
                <JournalCard key={e.id} entry={e} />
              ))}
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}
