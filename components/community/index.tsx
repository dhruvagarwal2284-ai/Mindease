"use client";

import Link from "next/link";
import { useState } from "react";
import { SafeContentWarning } from "@/components/privacy";
import { Badge, Button, Callout, Modal, Textarea } from "@/components/ui";
import { cx, mood as moodDef, relativeTime } from "@/lib/format";
import { REPORT_REASONS } from "@/lib/moderation";
import { useStore } from "@/lib/store";
import { SUPPORT_REACTIONS } from "@/lib/types";
import type { FlagReason, Post, ReactionKey, Reply } from "@/lib/types";

export const SAFE_REPLY_REMINDER =
  "Try to respond with empathy. Sharing your experience is safer than presenting medical advice as fact.";

/* ------------------------------------------------------------ reactions  */

export function ReactionBar({
  kind,
  id,
  reactions,
  mine,
}: {
  kind: "post" | "reply";
  id: string;
  reactions: Partial<Record<ReactionKey, number>>;
  mine: ReactionKey[];
}) {
  const { toggleReaction } = useStore();
  const [open, setOpen] = useState(false);
  const total = Object.values(reactions).reduce((s, n) => s + (n ?? 0), 0);

  return (
    <div className="relative">
      <Button
        size="sm"
        tone={mine.length ? "support" : "secondary"}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span aria-hidden>💛</span>
        Support
        {total ? <span className="tabular-nums">{total}</span> : null}
      </Button>

      {open ? (
        <>
          <button
            aria-label="Close support menu"
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div
            role="menu"
            className="animate-fade-up absolute bottom-full left-0 z-20 mb-2 w-60 rounded-xl border border-navy-200 bg-white p-1.5 shadow-float"
          >
            <p className="muted px-2 py-1 text-xs">
              Send something supportive — not a like.
            </p>
            {SUPPORT_REACTIONS.map((r) => {
              const active = mine.includes(r.key);
              return (
                <button
                  key={r.key}
                  role="menuitem"
                  onClick={() => toggleReaction(kind, id, r.key)}
                  className={cx(
                    "flex min-h-10 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-sm transition-colors",
                    active
                      ? "bg-mint-50 font-medium text-mint-900"
                      : "text-navy-700 hover:bg-navy-50",
                  )}
                >
                  <span aria-hidden>{r.emoji}</span>
                  <span className="flex-1">{r.label}</span>
                  {reactions[r.key] ? (
                    <span className="muted text-xs tabular-nums">{reactions[r.key]}</span>
                  ) : null}
                  {active ? (
                    <span className="text-mint-600" aria-label="sent">
                      ✓
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}

function ReactionSummary({
  reactions,
}: {
  reactions: Partial<Record<ReactionKey, number>>;
}) {
  const sent = SUPPORT_REACTIONS.filter((r) => (reactions[r.key] ?? 0) > 0);
  if (!sent.length) return null;
  const total = sent.reduce((s, r) => s + (reactions[r.key] ?? 0), 0);
  return (
    <p className="muted flex items-center gap-1 text-xs">
      <span aria-hidden>{sent.map((r) => r.emoji).join("")}</span>
      <span>
        {total} {total === 1 ? "person has" : "people have"} sent support
      </span>
    </p>
  );
}

/* --------------------------------------------------------------- report  */

function ReportModal({
  open,
  onClose,
  postId,
}: {
  open: boolean;
  onClose: () => void;
  postId: string;
}) {
  const { reportPost, toast } = useStore();
  const [reason, setReason] = useState<FlagReason | null>(null);
  const [note, setNote] = useState("");

  const submit = () => {
    if (!reason) return;
    reportPost(postId, reason, note);
    toast("Report sent to a counsellor", "success", "A human reviews every report.");
    setReason(null);
    setNote("");
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Report this post"
      description="A counsellor reads every report. The author is not told who reported them."
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button tone="primary" disabled={!reason} onClick={submit}>
            Send report
          </Button>
        </>
      }
    >
      <fieldset className="space-y-2">
        <legend className="mb-2 text-sm font-medium text-navy-800">
          What is the problem?
        </legend>
        {REPORT_REASONS.map((r) => (
          <label
            key={r.value}
            className={cx(
              "flex cursor-pointer items-start gap-3 rounded-xl border p-3",
              reason === r.value
                ? "border-teal-500 bg-teal-50"
                : "border-navy-100 hover:border-navy-200",
            )}
          >
            <input
              type="radio"
              name="report-reason"
              className="mt-1 accent-teal-700"
              checked={reason === r.value}
              onChange={() => setReason(r.value)}
            />
            <span>
              <span className="block text-sm font-medium text-navy-900">{r.label}</span>
              <span className="muted block text-sm">{r.detail}</span>
            </span>
          </label>
        ))}
      </fieldset>

      <label className="mt-4 block">
        <span className="mb-1.5 block text-sm font-medium text-navy-800">
          Anything to add? Optional.
        </span>
        <Textarea
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Context that would help whoever reviews this."
        />
      </label>
    </Modal>
  );
}

/* ------------------------------------------------------------- post card */

export function PostCard({
  post,
  replyCount,
  detail,
}: {
  post: Post;
  replyCount: number;
  /** true on the post-detail page: no "read more" link, body always full */
  detail?: boolean;
}) {
  const { toggleSavePost, hidePost, blockHandle, state, toast } = useStore();
  const [menu, setMenu] = useState(false);
  const [reporting, setReporting] = useState(false);

  if (post.moderation === "removed") return null;

  const blocked = state.blockedHandles.includes(post.authorHandle);
  const pending = post.moderation === "pending_review";
  const m = post.mood ? moodDef(post.mood) : null;

  const body = (
    <p className="mt-2.5 leading-relaxed whitespace-pre-wrap text-navy-800">{post.body}</p>
  );

  return (
    <article
      className={cx(
        "card p-4 sm:p-5",
        pending && "border-amber-200 bg-amber-50/40",
      )}
    >
      <header className="flex items-start gap-3">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-100 text-sm"
          aria-hidden
        >
          🕶️
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-navy-900">
            Anonymous Student
            {post.authorIsSelf ? (
              <span className="muted font-normal"> · you</span>
            ) : null}
          </p>
          <p className="muted text-xs">
            {relativeTime(post.createdAt)}
            {blocked ? " · blocked" : ""}
          </p>
        </div>

        <div className="relative">
          <button
            onClick={() => setMenu((o) => !o)}
            aria-label="Post options"
            aria-expanded={menu}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-navy-400 hover:bg-navy-50 hover:text-navy-700"
          >
            <span aria-hidden>⋯</span>
          </button>
          {menu ? (
            <>
              <button
                aria-label="Close menu"
                className="fixed inset-0 z-10 cursor-default"
                onClick={() => setMenu(false)}
              />
              <div
                role="menu"
                className="absolute top-full right-0 z-20 mt-1 w-52 rounded-xl border border-navy-200 bg-white p-1.5 shadow-float"
              >
                <button
                  role="menuitem"
                  onClick={() => {
                    setMenu(false);
                    setReporting(true);
                  }}
                  className="min-h-10 w-full rounded-lg px-2.5 text-left text-sm text-navy-700 hover:bg-navy-50"
                >
                  Report to a counsellor
                </button>
                <button
                  role="menuitem"
                  onClick={() => {
                    hidePost(post.id);
                    setMenu(false);
                    toast(post.hidden ? "Post shown again" : "Post hidden from your feed");
                  }}
                  className="min-h-10 w-full rounded-lg px-2.5 text-left text-sm text-navy-700 hover:bg-navy-50"
                >
                  {post.hidden ? "Unhide this post" : "Hide this post"}
                </button>
                {!post.authorIsSelf ? (
                  <button
                    role="menuitem"
                    onClick={() => {
                      blockHandle(post.authorHandle);
                      setMenu(false);
                      toast(blocked ? "Unblocked" : "Blocked — you will not see their posts");
                    }}
                    className="min-h-10 w-full rounded-lg px-2.5 text-left text-sm text-navy-700 hover:bg-navy-50"
                  >
                    {blocked ? "Unblock this student" : "Block this student"}
                  </button>
                ) : null}
              </div>
            </>
          ) : null}
        </div>
      </header>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Badge tone="navy">{post.topic}</Badge>
        {m ? (
          <Badge tone="neutral">
            <span aria-hidden>{m.emoji}</span> Feeling {m.label.toLowerCase()}
          </Badge>
        ) : null}
        {post.saved ? <Badge tone="teal">Saved</Badge> : null}
        {post.reported ? <Badge tone="amber">You reported this</Badge> : null}
      </div>

      {pending ? (
        <Callout tone="amber" icon="⏳" title="Awaiting review" className="mt-3">
          Only you can see this. A counsellor is looking at it before it appears in the
          feed — that usually takes a few minutes.
        </Callout>
      ) : null}

      {post.contentWarning ? (
        <div className="mt-3">
          <SafeContentWarning reason={post.contentWarning}>{body}</SafeContentWarning>
        </div>
      ) : (
        body
      )}

      <div className="mt-3">
        <ReactionSummary reactions={post.reactions} />
      </div>

      <footer className="mt-3 flex flex-wrap items-center gap-2 border-t border-navy-50 pt-3">
        <ReactionBar
          kind="post"
          id={post.id}
          reactions={post.reactions}
          mine={post.myReactions}
        />
        {detail ? null : (
          <Link
            href={`/student/community/${post.id}`}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-navy-200 px-3 text-sm font-medium text-navy-800 hover:bg-navy-50"
          >
            <span aria-hidden>💬</span>
            {replyCount === 1 ? "1 reply" : `${replyCount} replies`}
          </Link>
        )}
        <Button
          size="sm"
          tone={post.saved ? "primary" : "secondary"}
          onClick={() => toggleSavePost(post.id)}
        >
          <span aria-hidden>{post.saved ? "🔖" : "📑"}</span>
          {post.saved ? "Saved" : "Save"}
        </Button>
      </footer>

      <ReportModal
        open={reporting}
        onClose={() => setReporting(false)}
        postId={post.id}
      />
    </article>
  );
}

/* ------------------------------------------------------------ reply card */

export function ReplyCard({ reply }: { reply: Reply }) {
  if (reply.moderation === "removed") return null;
  const pending = reply.moderation === "pending_review";

  return (
    <article
      className={cx(
        "rounded-xl border p-4",
        pending ? "border-amber-200 bg-amber-50/40" : "border-navy-100 bg-white",
      )}
    >
      <header className="flex items-center gap-2.5">
        <span
          className="flex h-7 w-7 items-center justify-center rounded-full bg-navy-100 text-xs"
          aria-hidden
        >
          🕶️
        </span>
        <p className="text-sm font-medium text-navy-900">
          Anonymous Student
          {reply.authorIsSelf ? <span className="muted font-normal"> · you</span> : null}
        </p>
        <p className="muted text-xs">{relativeTime(reply.createdAt)}</p>
      </header>

      {pending ? (
        <p className="mt-2 text-xs font-medium text-amber-800">
          Awaiting review — only you can see this for now.
        </p>
      ) : null}

      <p className="mt-2 leading-relaxed whitespace-pre-wrap text-navy-800">
        {reply.body}
      </p>

      <div className="mt-3">
        <ReactionBar
          kind="reply"
          id={reply.id}
          reactions={reply.reactions}
          mine={reply.myReactions}
        />
      </div>
    </article>
  );
}
