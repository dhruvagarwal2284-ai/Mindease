"use client";

import Link from "next/link";
import { useMemo } from "react";
import { PostCard } from "@/components/community";
import { EmptyState, SkeletonCard } from "@/components/ui";
import { useStore } from "@/lib/store";

export default function SavedPostsPage() {
  const { ready, state } = useStore();

  const replyCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of state.replies) {
      if (r.moderation === "removed") continue;
      map.set(r.postId, (map.get(r.postId) ?? 0) + 1);
    }
    return map;
  }, [state.replies]);

  if (!ready) return <SkeletonCard />;

  const saved = state.posts.filter((p) => p.saved && p.moderation !== "removed");

  return (
    <div className="space-y-4">
      <Link
        href="/student/community"
        className="muted inline-block text-sm hover:underline"
      >
        ← Community
      </Link>

      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-navy-900">
          Saved posts
        </h1>
        <p className="muted mt-1 text-sm">
          Kept on this device, for you. Nobody is told that you saved their post.
        </p>
      </header>

      {saved.length === 0 ? (
        <EmptyState
          icon="🔖"
          title="Nothing saved yet"
          body="Tap Save on a post you want to come back to — the one that put words to something, or the one you want to reply to when you have more in you."
          action={
            <Link
              href="/student/community"
              className="inline-flex min-h-11 items-center rounded-xl bg-teal-700 px-4 font-medium text-white hover:bg-teal-800"
            >
              Browse the community
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {saved.map((p) => (
            <PostCard key={p.id} post={p} replyCount={replyCounts.get(p.id) ?? 0} />
          ))}
        </div>
      )}
    </div>
  );
}
