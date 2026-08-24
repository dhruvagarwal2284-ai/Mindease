"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { PostCard, ReplyCard, SAFE_REPLY_REMINDER } from "@/components/community";
import { AnonymousModeBar } from "@/components/privacy";
import {
  Button,
  Callout,
  EmptyState,
  Modal,
  SkeletonCard,
  Textarea,
} from "@/components/ui";
import { screenContent } from "@/lib/moderation";
import type { ScreenResult } from "@/lib/moderation";
import { useStore } from "@/lib/store";

export default function PostDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { ready, state, repliesFor, createReply, toast } = useStore();

  const [body, setBody] = useState("");
  const [screen, setScreen] = useState<ScreenResult | null>(null);

  if (!ready) {
    return (
      <div className="space-y-3">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  const post = state.posts.find((p) => p.id === id);

  if (!post || post.moderation === "removed") {
    return (
      <div className="space-y-4">
        <EmptyState
          icon="🍃"
          title="This post isn't here any more"
          body="It may have been removed by a counsellor, or the link may be out of date. Nothing you did caused this."
          action={
            <Link
              href="/student/community"
              className="inline-flex min-h-11 items-center rounded-xl bg-teal-700 px-4 font-medium text-white hover:bg-teal-800"
            >
              Back to the community
            </Link>
          }
        />
      </div>
    );
  }

  const replies = repliesFor(post.id);

  const send = (forceReview: boolean) => {
    createReply(post.id, body, forceReview);
    setBody("");
    setScreen(null);
    toast(
      forceReview ? "Reply sent for review" : "Reply posted",
      forceReview ? "info" : "success",
      forceReview ? "A counsellor will look at it first." : undefined,
    );
  };

  const submit = () => {
    const result = screenContent(body);
    if (result.ok) {
      send(false);
      return;
    }
    setScreen(result);
  };

  return (
    <div className="space-y-4">
      <AnonymousModeBar />

      <Link
        href="/student/community"
        className="muted inline-block text-sm hover:underline"
      >
        ← Community
      </Link>

      <PostCard post={post} replyCount={replies.length} detail />

      <section aria-labelledby="replies-heading" className="space-y-3">
        <h2 id="replies-heading" className="text-lg font-semibold text-navy-900">
          {replies.length === 0
            ? "No replies yet"
            : replies.length === 1
              ? "1 reply"
              : `${replies.length} replies`}
        </h2>

        {replies.length === 0 ? (
          <p className="muted rounded-xl border border-navy-100 bg-white px-4 py-5 text-sm">
            Nobody has answered yet. Being the first person to say something can matter
            more than saying the right thing.
          </p>
        ) : (
          <div className="space-y-3">
            {replies.map((r) => (
              <ReplyCard key={r.id} reply={r} />
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="reply-heading" className="card p-4 sm:p-5">
        <h2 id="reply-heading" className="text-base font-semibold text-navy-900">
          Write a reply
        </h2>

        <Callout tone="info" icon="💙" className="mt-3">
          {SAFE_REPLY_REMINDER}
        </Callout>

        <Textarea
          rows={5}
          className="mt-3"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="What would have helped you when you were where they are?"
          aria-label="Your reply"
        />

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <p className="muted text-xs">
            Posting as{" "}
            <span className="font-medium">{state.identity?.handle ?? "Anonymous"}</span>
          </p>
          <Button
            tone="primary"
            className="ml-auto"
            disabled={body.trim().length < 3}
            onClick={submit}
          >
            Reply
          </Button>
        </div>
      </section>

      <Modal
        open={screen !== null}
        onClose={() => setScreen(null)}
        tone={screen?.crisis ? "urgent" : "default"}
        title={
          screen?.crisis
            ? "Before you send — how are you doing?"
            : "Review before posting"
        }
        description={screen?.message}
        footer={
          screen?.crisis ? (
            <>
              <Button onClick={() => setScreen(null)}>Keep writing</Button>
              <Button tone="primary" onClick={() => send(false)}>
                Send it
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => setScreen(null)}>Edit</Button>
              <Button tone="primary" onClick={() => send(true)}>
                Post anyway — send for review
              </Button>
            </>
          )
        }
      >
        {screen?.crisis ? (
          <div className="space-y-3">
            <p className="text-sm text-navy-700">
              Sometimes we write to someone else what we most need to hear. Support is
              here if you want it — sending the reply is still entirely up to you.
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              <Link
                href="/student/help"
                className="flex min-h-14 items-center justify-center rounded-xl border border-urgent-200 bg-urgent-50 px-4 text-center font-medium text-urgent-900 hover:bg-urgent-100"
              >
                🆘 Get help now
              </Link>
              <Link
                href="/student/support/request"
                className="flex min-h-14 items-center justify-center rounded-xl border border-teal-200 bg-teal-50 px-4 text-center font-medium text-teal-900 hover:bg-teal-100"
              >
                🤝 Talk to someone
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-navy-700">
              You can post it anyway — a counsellor will read it before it appears under
              the post.
            </p>
            {screen?.matched.length ? (
              <div className="rounded-xl border border-navy-100 bg-navy-50 p-3">
                <p className="text-xs font-medium tracking-wide text-navy-600 uppercase">
                  What was picked up
                </p>
                <p className="mt-1 font-mono text-sm text-navy-800">
                  {screen.matched.join(" · ")}
                </p>
              </div>
            ) : null}
          </div>
        )}
      </Modal>
    </div>
  );
}
