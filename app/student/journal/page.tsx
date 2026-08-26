"use client";

import Link from "next/link";
import { MoodTimeline } from "@/components/charts";
import { JournalCard, PrivateSpaceHeader } from "@/components/journal";
import { EmptyState, LinkButton, SkeletonCard } from "@/components/ui";
import { pluralize } from "@/lib/format";
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

  const checkInCount = state.checkIns.length;

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
            : `${entries.length} ${
                entries.length === 1 ? "entry" : "entries"
              } on this device`}
        </p>
      </div>

      {/* --------------------------------------------------- mood pattern */}
      <section
        className="card p-4 sm:p-5"
        aria-labelledby="mood-pattern-heading"
      >
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2
              id="mood-pattern-heading"
              className="text-lg font-semibold tracking-tight text-navy-900"
            >
              Your mood pattern
            </h2>

            <p className="muted mt-0.5 text-sm">
              Your own check-ins, kept on this device. Not a score, not a
              rating.
            </p>
          </div>

          <Link
            href="/student/journal/trends"
            className="min-h-11 self-center text-sm font-medium text-teal-800 hover:underline"
          >
            See your history →
          </Link>
        </div>

        {checkInCount < 2 ? (
          <div className="rounded-xl border border-dashed border-navy-200 bg-navy-50/50 px-5 py-8 text-center">
            <p className="text-2xl" aria-hidden>
              🌱
            </p>

            <p className="mt-1 font-medium text-navy-900">
              Nothing to show yet
            </p>

            <p className="muted mx-auto mt-1 max-w-sm text-sm">
              Two check-ins are enough to start seeing a shape. There is no
              streak to keep and nothing to catch up on.
            </p>
          </div>
        ) : (
          <>
            <MoodTimeline checkIns={state.checkIns} />

            <p className="muted mt-2 text-xs">
              {pluralize(checkInCount, "check-in")} recorded. Only you can see
              this.
            </p>
          </>
        )}
      </section>

      {/* ----------------------------------------------------- journal entries */}
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
            <section
              aria-labelledby="drafts-heading"
              className="space-y-2.5"
            >
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
            <section
              aria-labelledby="entries-heading"
              className="space-y-2.5"
            >
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