"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SAFE_REPLY_REMINDER } from "@/components/community";
import { AnonymousModeBar } from "@/components/privacy";
import {
  Button,
  Callout,
  Chip,
  Field,
  Input,
  Modal,
  Select,
  Textarea,
  Toggle,
} from "@/components/ui";
import { MOODS } from "@/lib/format";
import { screenContent } from "@/lib/moderation";
import type { ScreenResult } from "@/lib/moderation";
import { useStore } from "@/lib/store";
import { TOPICS } from "@/lib/types";
import type { MoodValue, Topic } from "@/lib/types";

export default function NewPostPage() {
  const router = useRouter();
  const { createPost, toast } = useStore();

  const [body, setBody] = useState("");
  const [topic, setTopic] = useState<Topic>("General");
  const [mood, setMood] = useState<MoodValue | null>(null);
  const [warning, setWarning] = useState("");
  const [showWarningField, setShowWarningField] = useState(false);
  const [screen, setScreen] = useState<ScreenResult | null>(null);

  const publish = (forceReview: boolean) => {
    const { heldForReview, post } = createPost({
      body,
      topic,
      mood: mood ?? undefined,
      contentWarning: warning || undefined,
      forceReview,
    });
    setScreen(null);
    if (heldForReview) {
      toast(
        "Sent for review",
        "info",
        "A counsellor will look at it before it appears in the feed.",
      );
      router.push("/student/community");
    } else {
      toast("Posted anonymously", "success");
      router.push(`/student/community/${post.id}`);
    }
  };

  const submit = () => {
    const result = screenContent(body);
    if (result.ok) {
      publish(false);
      return;
    }
    setScreen(result);
  };

  const canPost = body.trim().length > 3;

  return (
    <div className="space-y-4">
      <AnonymousModeBar />

      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-navy-900">
          What&rsquo;s on your mind?
        </h1>
        <p className="muted mt-1 text-sm">
          Written as your pseudonym. There is no way for another student to trace this back
          to you.
        </p>
      </header>

      <div className="card space-y-4 p-4 sm:p-5">
        <Field label="Your post" required>
          <Textarea
            rows={8}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Say as much or as little as you want. Nobody here knows who you are."
            aria-describedby="post-help"
          />
        </Field>
        <p id="post-help" className="muted -mt-2 text-xs">
          {SAFE_REPLY_REMINDER}
        </p>

        <Field label="Topic" required hint="Helps the right people find it.">
          <Select value={topic} onChange={(e) => setTopic(e.target.value as Topic)}>
            {TOPICS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </Field>

        <fieldset>
          <legend className="mb-1.5 text-sm font-medium text-navy-800">
            How are you feeling? Optional.
          </legend>
          <div className="flex flex-wrap gap-2">
            {MOODS.map((m) => (
              <Chip
                key={m.value}
                selected={mood === m.value}
                onClick={() => setMood(mood === m.value ? null : m.value)}
              >
                <span aria-hidden>{m.emoji}</span> {m.label}
              </Chip>
            ))}
          </div>
        </fieldset>

        <div className="rounded-xl border border-teal-200 bg-teal-50/60 p-3.5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-navy-900">Post anonymously</p>
              <p className="muted mt-0.5 text-sm">
                Always on. Anonymity is the product, not a setting — so this one cannot be
                switched off.
              </p>
            </div>
            <Toggle checked disabled onChange={() => {}} label="Post anonymously" />
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={() => setShowWarningField((s) => !s)}
            className="text-sm font-medium text-teal-800 hover:underline"
            aria-expanded={showWarningField}
          >
            {showWarningField ? "Remove content warning" : "+ Add a content warning"}
          </button>
          {showWarningField ? (
            <div className="mt-2">
              <Field
                label="Content warning"
                hint="Shown before the post is revealed, so people can choose their moment."
              >
                <Input
                  value={warning}
                  onChange={(e) => setWarning(e.target.value)}
                  placeholder="e.g. Mentions a difficult period with low mood"
                />
              </Field>
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Link href="/student/community" className="muted text-sm hover:underline">
          Cancel
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <span className="muted text-xs">Checked for safety before posting</span>
          <Button tone="primary" size="lg" disabled={!canPost} onClick={submit}>
            Post
          </Button>
        </div>
      </div>

      {/* ------------------------------------------- pre-post safety check */}
      <Modal
        open={screen !== null}
        onClose={() => setScreen(null)}
        tone={screen?.crisis ? "urgent" : "default"}
        title={
          screen?.crisis
            ? "Before you post — are you okay right now?"
            : "Worth a second look before this goes out"
        }
        description={screen?.message}
        footer={
          screen?.crisis ? (
            <>
              <Button onClick={() => setScreen(null)}>Keep writing</Button>
              <Button tone="primary" onClick={() => publish(false)}>
                Post it
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => setScreen(null)}>Edit my post</Button>
              <Button tone="primary" onClick={() => publish(true)}>
                Post anyway — send for review
              </Button>
            </>
          )
        }
      >
        {screen?.crisis ? (
          <div className="space-y-3">
            <Callout tone="mint" icon="🫂" title="You can have both">
              You can post this and get support at the same time. One does not cost you the
              other.
            </Callout>
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
            <p className="muted text-sm">
              Nothing has been reported and nobody has been notified. This is a suggestion,
              not an intervention.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-navy-700">
              If you post it anyway, a counsellor sees it before the feed does. You will be
              able to see it the whole time.
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
