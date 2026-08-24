"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PostCard } from "@/components/community";
import { AnonymousModeBar } from "@/components/privacy";
import { Button, Chip, EmptyState, SkeletonCard, Tabs } from "@/components/ui";
import { daysAgo, isoDay } from "@/lib/format";
import { useStore } from "@/lib/store";
import { TOPICS } from "@/lib/types";
import type { Post, Topic } from "@/lib/types";

type TabKey = "foryou" | "recent" | "trending" | "unanswered";

const TABS: { value: TabKey; label: string }[] = [
  { value: "foryou", label: "For You" },
  { value: "recent", label: "Recent" },
  { value: "trending", label: "Trending" },
  { value: "unanswered", label: "Unanswered" },
];

function reactionTotal(post: Post): number {
  return Object.values(post.reactions).reduce((s, n) => s + (n ?? 0), 0);
}

export default function CommunityFeedPage() {
  const { ready, state } = useStore();
  const [tab, setTab] = useState<TabKey>("foryou");
  const [topic, setTopic] = useState<Topic | "All">("All");
  const [showHidden, setShowHidden] = useState(false);

  const replyCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of state.replies) {
      if (r.moderation === "removed") continue;
      map.set(r.postId, (map.get(r.postId) ?? 0) + 1);
    }
    return map;
  }, [state.replies]);

  /** Topics the student has been checking in about lately — drives "For You". */
  const myTopics = useMemo(() => {
    const cutoff = isoDay(daysAgo(21));
    const counts = new Map<string, number>();
    for (const c of state.checkIns) {
      if (c.date < cutoff) continue;
      for (const t of c.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
    }
    return counts;
  }, [state.checkIns]);

  const { visible, hiddenCount } = useMemo(() => {
    const base = state.posts.filter(
      (p) => p.moderation !== "removed" && (topic === "All" || p.topic === topic),
    );

    const suppressed = base.filter(
      (p) => p.hidden || state.blockedHandles.includes(p.authorHandle),
    );
    let list = showHidden
      ? base
      : base.filter((p) => !p.hidden && !state.blockedHandles.includes(p.authorHandle));

    if (tab === "recent") {
      list = [...list].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    } else if (tab === "trending") {
      list = [...list].sort((a, b) => reactionTotal(b) - reactionTotal(a));
    } else if (tab === "unanswered") {
      list = list
        .filter((p) => (replyCounts.get(p.id) ?? 0) === 0)
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    } else {
      const score = (p: Post) => {
        const topicHits = myTopics.get(p.topic) ?? 0;
        const own = p.authorIsSelf ? 5 : 0;
        return own + topicHits * 3 + Math.min(3, reactionTotal(p) / 10);
      };
      list = [...list].sort((a, b) => {
        const d = score(b) - score(a);
        return d !== 0 ? d : a.createdAt < b.createdAt ? 1 : -1;
      });
    }

    return { visible: list, hiddenCount: suppressed.length };
  }, [state.posts, state.blockedHandles, topic, tab, replyCounts, myTopics, showHidden]);

  if (!ready) {
    return (
      <div className="space-y-3">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnonymousModeBar />

      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-navy-900">Community</h1>
        <p className="muted mt-1 text-sm">
          Students on your campus, writing anonymously. Be kind — someone is having the
          worst week of their year in here.
        </p>
      </header>

      <Link
        href="/student/community/new"
        className="flex min-h-14 items-center gap-3 rounded-2xl border border-navy-200 bg-white px-4 text-navy-500 transition-colors hover:border-teal-300 hover:bg-teal-50/50"
      >
        <span
          className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-100 text-sm"
          aria-hidden
        >
          🕶️
        </span>
        <span className="flex-1 text-[0.95rem]">What&rsquo;s on your mind?</span>
        <span className="rounded-lg bg-teal-700 px-3 py-1.5 text-sm font-medium text-white">
          Post
        </span>
      </Link>

      <Tabs tabs={TABS} value={tab} onChange={setTab} />

      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        <Chip selected={topic === "All"} onClick={() => setTopic("All")}>
          All topics
        </Chip>
        {TOPICS.map((t) => (
          <Chip key={t} selected={topic === t} onClick={() => setTopic(t)}>
            {t}
          </Chip>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="muted text-xs" aria-live="polite">
          {visible.length === 1 ? "1 post" : `${visible.length} posts`}
          {topic !== "All" ? ` in ${topic}` : ""}
        </p>
        <Link
          href="/student/community/saved"
          className="text-xs font-medium text-teal-800 hover:underline"
        >
          Saved posts →
        </Link>
      </div>

      {hiddenCount > 0 ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-navy-100 bg-navy-50 px-4 py-2.5 text-sm">
          <span className="muted">
            {hiddenCount === 1 ? "1 post is" : `${hiddenCount} posts are`} hidden or from
            someone you blocked.
          </span>
          <Button size="sm" tone="ghost" onClick={() => setShowHidden((s) => !s)}>
            {showHidden ? "Hide again" : "Show them"}
          </Button>
        </div>
      ) : null}

      {state.simulate.offline ? (
        <EmptyState
          icon="📴"
          title="You're offline"
          body="The feed needs a connection. Anything you were writing has been saved on this device."
        />
      ) : visible.length === 0 ? (
        <EmptyState
          icon="🌱"
          title="No posts yet. Be the first to share something."
          body={
            topic === "All"
              ? "Whatever you write here shows up under your pseudonym, never your name."
              : `Nothing under ${topic} yet. Yours could be the first.`
          }
          action={
            <Link
              href="/student/community/new"
              className="inline-flex min-h-11 items-center rounded-xl bg-teal-700 px-4 font-medium text-white hover:bg-teal-800"
            >
              Write a post
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {visible.map((p) => (
            <PostCard key={p.id} post={p} replyCount={replyCounts.get(p.id) ?? 0} />
          ))}
        </div>
      )}
    </div>
  );
}
