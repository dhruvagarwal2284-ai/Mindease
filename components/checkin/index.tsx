"use client";

import Link from "next/link";
import { useState } from "react";
import { MOOD_COLOR } from "@/components/charts";
import { PrivacyBadge } from "@/components/privacy";
import {
  Badge,
  Button,
  Callout,
  Chip,
  Field,
  SkeletonCard,
  Textarea,
} from "@/components/ui";
import { cx, mood as moodDef, MOODS } from "@/lib/format";
import { useStore } from "@/lib/store";
import { CONCERN_TAGS } from "@/lib/types";
import type { ConcernTag, MoodValue } from "@/lib/types";

/* ------------------------------------------------------------------ parts */

function PrivacyLine({ className }: { className?: string }) {
  return (
    <p className={cx("muted text-xs", className)}>
      <span aria-hidden>🔒</span> Your check-in is used according to your{" "}
      <Link
        href="/student/settings"
        className="font-medium text-teal-800 underline underline-offset-2 hover:text-teal-900"
      >
        privacy settings
      </Link>
      .
    </p>
  );
}

function MoodButton({
  value,
  label,
  emoji,
  selected,
  onSelect,
}: {
  value: MoodValue;
  label: string;
  emoji: string;
  selected: boolean;
  onSelect: (v: MoodValue) => void;
}) {
  const colour = MOOD_COLOR[value];
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect(value)}
      className={cx(
        "flex min-h-[4.75rem] flex-col items-center justify-center gap-1 rounded-2xl border px-1 py-3 transition-colors",
        selected
          ? "border-transparent font-semibold text-navy-900"
          : "border-navy-100 bg-white text-navy-600 hover:border-navy-300 hover:bg-navy-50",
      )}
      style={
        selected
          ? { backgroundColor: `${colour}14`, boxShadow: `0 0 0 2px ${colour}` }
          : undefined
      }
    >
      <span className="text-2xl leading-none" aria-hidden>
        {emoji}
      </span>
      <span className="text-center text-[0.68rem] leading-tight break-words">
        {label}
      </span>
    </button>
  );
}

/* ------------------------------------------------------------ DailyCheckIn */

export function DailyCheckIn({ className }: { className?: string }) {
  const { ready, state, saveCheckIn, todaysCheckIn, toast } = useStore();

  const [editing, setEditing] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const [selected, setSelected] = useState<MoodValue | null>(null);
  const [tags, setTags] = useState<ConcernTag[]>([]);
  const [note, setNote] = useState("");

  if (!ready) return <SkeletonCard />;

  const existing = todaysCheckIn();

  const openEditor = () => {
    const current = todaysCheckIn();
    setSelected(current ? current.mood : null);
    setTags(current ? [...current.tags] : []);
    setNote(current?.note ?? "");
    setSkipped(false);
    setEditing(true);
  };

  const toggleTag = (tag: ConcernTag) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const save = () => {
    if (selected === null) return;
    const isUpdate = Boolean(existing);
    saveCheckIn({ mood: selected, tags, note: note.trim() || undefined });
    setEditing(false);
    setSkipped(false);
    toast(
      isUpdate
        ? "Today’s check-in updated."
        : "Checked in. Thank you for taking a moment for yourself.",
      "success",
      "Saved on this device, for you.",
    );
  };

  const skip = () => {
    setEditing(false);
    setSkipped(true);
  };

  /* ------------------------------------------- mood tracking switched off */

  if (!state.consent.moodTracking) {
    return (
      <section
        className={cx("card p-4 sm:p-5", className)}
        aria-labelledby="checkin-heading"
      >
        <h2 id="checkin-heading" className="text-lg font-semibold text-navy-900">
          Daily check-in
        </h2>
        <Callout tone="info" icon="🔕" title="Mood tracking is off" className="mt-3">
          You chose not to record daily check-ins, so MindEase is not asking how you are
          and is keeping no mood history. Everything else still works.{" "}
          <Link
            href="/student/settings"
            className="font-medium text-info-900 underline underline-offset-2"
          >
            Turn mood tracking back on
          </Link>{" "}
          whenever you want.
        </Callout>
      </section>
    );
  }

  /* --------------------------------------------------- already checked in */

  if (existing && !editing) {
    const m = moodDef(existing.mood);
    return (
      <section
        className={cx("card p-4 sm:p-5", className)}
        aria-labelledby="checkin-heading"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="checkin-heading" className="text-lg font-semibold text-navy-900">
            Today&rsquo;s check-in
          </h2>
          <PrivacyBadge status="private" />
        </div>

        <div className="mt-3 flex items-center gap-3 rounded-2xl border border-mint-200 bg-mint-50 px-4 py-3">
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-2xl"
            aria-hidden
          >
            {m.emoji}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-mint-900">
              <span aria-hidden>✓</span> Checked in today
            </p>
            <p className="text-sm text-mint-800">
              You said you were feeling <strong>{m.label}</strong>.
            </p>
          </div>
        </div>

        {existing.tags.length ? (
          <div className="mt-3">
            <p className="muted text-xs font-medium tracking-wide uppercase">
              What was affecting you
            </p>
            <ul className="mt-1.5 flex flex-wrap gap-1.5">
              {existing.tags.map((t) => (
                <li key={t}>
                  <Badge tone="navy">{t}</Badge>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {existing.note ? (
          <p className="mt-3 rounded-xl border border-navy-100 bg-navy-50/60 px-3.5 py-2.5 text-sm text-navy-700 italic">
            &ldquo;{existing.note}&rdquo;
          </p>
        ) : null}

        <div className="mt-4">
          <Button onClick={openEditor}>Update today&rsquo;s check-in</Button>
        </div>

        <PrivacyLine className="mt-3" />
      </section>
    );
  }

  /* -------------------------------------------------------- skipped today */

  if (skipped) {
    return (
      <section
        className={cx(
          "card flex flex-wrap items-center justify-between gap-3 p-4",
          className,
        )}
        aria-labelledby="checkin-heading"
      >
        <div className="min-w-0">
          <h2 id="checkin-heading" className="font-semibold text-navy-900">
            Check-in skipped
          </h2>
          <p className="muted text-sm">
            Nothing was saved. It will still be here if you want it later today.
          </p>
        </div>
        <Button onClick={openEditor}>Check in anyway</Button>
      </section>
    );
  }

  /* --------------------------------------------------------------- editor */

  const heading = existing
    ? "Update today’s check-in"
    : "How are you feeling today?";

  return (
    <section
      className={cx("card p-4 sm:p-5", className)}
      aria-labelledby="checkin-heading"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="checkin-heading" className="text-lg font-semibold text-navy-900">
          {heading}
        </h2>
        <PrivacyBadge status="private" />
      </div>
      <p className="muted mt-1 text-sm">
        One tap is enough. Everything after it is optional.
      </p>

      <div
        role="group"
        aria-labelledby="checkin-heading"
        className="mt-4 grid grid-cols-5 gap-1.5 sm:gap-2"
      >
        {MOODS.map((m) => (
          <MoodButton
            key={m.value}
            value={m.value}
            label={m.label}
            emoji={m.emoji}
            selected={selected === m.value}
            onSelect={setSelected}
          />
        ))}
      </div>
      <p className="sr-only" aria-live="polite">
        {selected === null
          ? "No mood selected yet."
          : `Selected: ${moodDef(selected).label}.`}
      </p>

      <fieldset className="mt-5 border-0 p-0">
        <legend className="mb-2 text-sm font-medium text-navy-800">
          What&rsquo;s affecting you today?{" "}
          <span className="muted font-normal">Pick as many as fit.</span>
        </legend>
        <div className="flex flex-wrap gap-1.5">
          {CONCERN_TAGS.map((tag) => (
            <Chip
              key={tag}
              selected={tags.includes(tag)}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </Chip>
          ))}
        </div>
      </fieldset>

      <Field
        label="Anything you want to add?"
        hint="Optional. This stays on your device and is never posted anywhere."
        className="mt-5"
      >
        <Textarea
          rows={3}
          value={note}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setNote(e.target.value)
          }
          placeholder="Today felt…"
        />
      </Field>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Button
          tone="primary"
          size="lg"
          onClick={save}
          disabled={selected === null}
          className="flex-1 sm:flex-none"
        >
          Save check-in
        </Button>
        <Button tone="ghost" size="lg" onClick={skip}>
          Skip for today
        </Button>
      </div>
      {selected === null ? (
        <p className="muted mt-2 text-xs">Choose a mood above to save your check-in.</p>
      ) : null}

      <PrivacyLine className="mt-3" />
    </section>
  );
}
