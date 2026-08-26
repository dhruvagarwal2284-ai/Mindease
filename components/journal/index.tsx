"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
// 🔥 Firebase Imports
import { doc, setDoc, deleteDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";

import { MOOD_COLOR } from "@/components/charts";
import { Badge, Button, Callout, Chip, Input, Modal, Textarea } from "@/components/ui";
import { cx, excerpt, formatDay, isoDay, mood as moodDef, MOODS } from "@/lib/format";
import { useStore } from "@/lib/store";
import { CONCERN_TAGS } from "@/lib/types";
import type { JournalEntry, MoodValue } from "@/lib/types";

/* --------------------------------------------------- PrivateSpaceHeader  */

export function PrivateSpaceHeader({ action }: { action?: React.ReactNode }) {
  return (
    <header className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold tracking-[0.18em] text-info-700 uppercase">
            <span aria-hidden>🔒</span> Your private space
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-navy-900">
            Journal
          </h1>
        </div>
        {action}
      </div>

      <Callout tone="info" icon="🔒" title="Private to you">
        Your journal entries are not visible to counsellors unless you explicitly choose to
        share them.
      </Callout>
    </header>
  );
}

/* -------------------------------------------------------------- lock bar */

export function LockIndicator({ shared }: { shared?: boolean }) {
  return shared ? (
    <Badge tone="amber" icon={<span aria-hidden>🤝</span>}>
      Shared with your counsellor
    </Badge>
  ) : (
    <Badge tone="info" icon={<span aria-hidden>🔒</span>}>
      Private to you
    </Badge>
  );
}

/* ----------------------------------------------------------- JournalCard */

export function JournalCard({ entry }: { entry: JournalEntry }) {
  const m = moodDef(entry.mood);
  return (
    <Link
      href={`/student/journal/${entry.id}`}
      className="block rounded-2xl border border-navy-100 bg-white p-4 transition-colors hover:border-info-300 hover:bg-info-50/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-navy-900">
            {formatDay(isoDay(new Date(entry.createdAt)))}
            {entry.title ? (
              <span className="muted font-normal"> · {entry.title}</span>
            ) : null}
          </p>
          <p className="muted mt-0.5 flex items-center gap-1.5 text-xs">
            <span aria-hidden>{m.emoji}</span> {m.label}
          </p>
        </div>
        <span
          className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ background: MOOD_COLOR[entry.mood] }}
          aria-hidden
        />
      </div>

      <p className="mt-2.5 text-sm leading-relaxed text-navy-700">
        {entry.body?.trim() ? excerpt(entry.body, 150) : "(empty entry)"}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {entry.isDraft ? <Badge tone="neutral">Draft</Badge> : null}
        {entry.sharedWithCounsellor ? <Badge tone="amber">Shared</Badge> : null}
        {entry.tags?.map((t) => (
          <span key={t} className="muted text-xs">
            {t}
          </span>
        ))}
      </div>
    </Link>
  );
}

/* --------------------------------------------------------- JournalEditor */

export function JournalEditor({ entry }: { entry?: JournalEntry }) {
  const router = useRouter();
  const { toast, state } = useStore();
  
  // Tera user handle Firebase me link karne ke liye
  const myHandle = state.identity?.handle ?? "MindMate";

  const [entryId, setEntryId] = useState<string | undefined>(entry?.id);
  const [title, setTitle] = useState(entry?.title ?? "");
  const [body, setBody] = useState(entry?.body ?? "");
  const [entryMood, setEntryMood] = useState<MoodValue>(entry?.mood ?? 3);
  const [tags, setTags] = useState<string[]>(entry?.tags ?? []);
  const [customTag, setCustomTag] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const dirty = useRef(false);

  // 🔥 FIREBASE CORE SAVE FUNCTION (Create & Edit dono handle karega)
  const handleFirebaseSave = async (isDraftStatus: boolean) => {
    // Agar entryId pehle se hai toh wahi update karo, warna naya ID banao
    const docRef = entryId ? doc(db, "journals", entryId) : doc(collection(db, "journals"));
    const currentId = docRef.id;

    const dataToSave = {
      userId: myHandle,
      title,
      body,
      mood: entryMood,
      tags,
      isDraft: isDraftStatus,
      updatedAt: new Date().toISOString(),
      // Agar naya bana rahe hain tabhi createdAt daalo
      ...(!entryId && { createdAt: new Date().toISOString() }),
    };

    // Firebase pe save/update maro (merge: true se existing data overwrite nahi hota unnecessarily)
    await setDoc(docRef, dataToSave, { merge: true });
    
    if (!entryId) setEntryId(currentId);
    return currentId;
  };

  /* ---------------------- Autosave to Firebase ---------------------- */
  useEffect(() => {
    if (!dirty.current) return;
    if (!body.trim() && !title.trim()) return;
    
    const t = window.setTimeout(async () => {
      try {
        await handleFirebaseSave(true); // Autosave hamesha Draft banke save hoga
        setSavedAt(new Date().toLocaleTimeString(undefined, {
          hour: "numeric",
          minute: "2-digit",
        }));
        dirty.current = false;
      } catch (error) {
        console.error("Autosave failed", error);
      }
    }, 2500);
    
    return () => window.clearTimeout(t);
  }, [title, body, entryMood, tags, entryId]); // removed local saveJournal dependency

  const mark = () => {
    dirty.current = true;
  };

  const addCustomTag = () => {
    const t = customTag.trim();
    if (!t || tags.includes(t)) return;
    setTags((prev) => [...prev, t]);
    setCustomTag("");
    mark();
  };

  /* ---------------------- Final Submit ---------------------- */
  const commit = async (isDraft: boolean) => {
    try {
      await handleFirebaseSave(isDraft);
      dirty.current = false;
      toast(
        isDraft ? "Draft saved to cloud ☁️" : "Entry securely saved ☁️",
        "success"
      );
      router.push(`/student/journal`); // Save hote hi wapas Journal list pe
    } catch (error) {
      toast("Failed to save", "warning");
    }
  };

  /* ---------------------- Delete Entry ---------------------- */
  const remove = async () => {
    if (entryId) {
      try {
        await deleteDoc(doc(db, "journals", entryId));
        toast("Entry deleted forever 🗑️", "info", "Erased from cloud database.");
      } catch (error) {
        toast("Failed to delete", "warning");
      }
    }
    setConfirmDelete(false);
    router.push("/student/journal");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <LockIndicator shared={entry?.sharedWithCounsellor} />
        <p className="muted text-xs" aria-live="polite">
          {savedAt
            ? `Cloud draft saved at ${savedAt}`
            : "Saves securely to cloud as you write"}
        </p>
      </div>

      <div className="rounded-2xl border border-info-200 bg-white p-4 sm:p-5">
        <p className="muted text-xs">
          {formatDay(isoDay(entry ? new Date(entry.createdAt) : new Date()))}
          {entry?.isDraft || !entry ? " · draft" : ""}
        </p>

        <input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            mark();
          }}
          aria-label="Title, optional"
          placeholder="Give it a title, or don't"
          className="mt-2 w-full border-0 bg-transparent text-xl font-semibold tracking-tight text-navy-900 placeholder:text-navy-300 focus:outline-none"
        />

        <Textarea
          rows={14}
          value={body}
          onChange={(e) => {
            setBody(e.target.value);
            mark();
          }}
          aria-label="Journal entry"
          placeholder="Nobody reads this but you. Start anywhere — it doesn't have to make sense yet."
          className="mt-3 border-0 px-0 text-base leading-relaxed focus:border-0"
        />
      </div>

      <fieldset className="card p-4">
        <legend className="px-1 text-sm font-medium text-navy-800">
          How were you feeling?
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {MOODS.map((m) => (
            <button
              key={m.value}
              type="button"
              aria-pressed={entryMood === m.value}
              onClick={() => {
                setEntryMood(m.value);
                mark();
              }}
              className={cx(
                "flex min-h-11 flex-col items-center gap-0.5 rounded-xl border px-4 py-2 text-xs font-medium transition-colors",
                entryMood === m.value
                  ? "border-transparent text-white"
                  : "border-navy-200 bg-white text-navy-700 hover:bg-navy-50",
              )}
              style={
                entryMood === m.value ? { background: MOOD_COLOR[m.value] } : undefined
              }
            >
              <span className="text-lg" aria-hidden>
                {m.emoji}
              </span>
              {m.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="card p-4">
        <legend className="px-1 text-sm font-medium text-navy-800">Tags, optional</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {CONCERN_TAGS.map((t) => (
            <Chip
              key={t}
              selected={tags.includes(t)}
              onClick={() => {
                setTags((prev) =>
                  prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
                );
                mark();
              }}
            >
              {t}
            </Chip>
          ))}
          {tags
            .filter((t) => !CONCERN_TAGS.includes(t as never))
            .map((t) => (
              <Chip
                key={t}
                selected
                onClick={() => {
                  setTags((prev) => prev.filter((x) => x !== t));
                  mark();
                }}
              >
                {t} ✕
              </Chip>
            ))}
        </div>
        <div className="mt-3 flex gap-2">
          <Input
            value={customTag}
            onChange={(e) => setCustomTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustomTag();
              }
            }}
            placeholder="Add your own tag"
            aria-label="Add your own tag"
          />
          <Button onClick={addCustomTag} disabled={!customTag.trim()}>
            Add
          </Button>
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center gap-2">
        {entryId ? (
          <Button tone="ghost" onClick={() => setConfirmDelete(true)}>
            Delete
          </Button>
        ) : (
          <Link href="/student/journal" className="muted text-sm hover:underline">
            Cancel
          </Link>
        )}
        <div className="ml-auto flex gap-2">
          <Button onClick={() => commit(true)} disabled={!body.trim()}>
            Save draft
          </Button>
          <Button tone="primary" onClick={() => commit(false)} disabled={!body.trim()}>
            Save entry
          </Button>
        </div>
      </div>

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        tone="urgent"
        size="sm"
        title="Delete this entry?"
        description="It will be erased permanently from the cloud database. This cannot be undone."
        footer={
          <>
            <Button onClick={() => setConfirmDelete(false)}>Keep it</Button>
            <Button tone="urgent" onClick={remove}>
              Delete for good
            </Button>
          </>
        }
      />
    </div>
  );
}