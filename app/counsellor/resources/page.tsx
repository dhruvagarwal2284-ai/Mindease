"use client";

import { useMemo, useState } from "react";
import {
  Badge,
  Button,
  Callout,
  Card,
  Chip,
  EmptyState,
  Field,
  Input,
  Modal,
  SectionTitle,
  SkeletonCard,
  Textarea,
} from "@/components/ui";
import { cx, uid } from "@/lib/format";
import { recommendResources, RESOURCES } from "@/lib/resources";
import { useStore } from "@/lib/store";
import { CONCERN_TAGS } from "@/lib/types";
import type { Resource } from "@/lib/types";

export default function CounsellorResourcesPage() {
  const { ready, toast } = useStore();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [drafts, setDrafts] = useState<Resource[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [pickedTags, setPickedTags] = useState<string[]>(["Academics", "Exams"]);

  const [form, setForm] = useState({
    title: "",
    category: "",
    minutes: "5",
    summary: "",
    matches: "",
  });

  const all = useMemo(() => [...drafts, ...RESOURCES], [drafts]);
  const categories = useMemo(() => ["All", ...new Set(all.map((r) => r.category))], [all]);

  const filtered = all.filter((r) => {
    const inCat = category === "All" || r.category === category;
    const q = query.trim().toLowerCase();
    const inQuery =
      !q ||
      r.title.toLowerCase().includes(q) ||
      r.summary.toLowerCase().includes(q) ||
      r.matches.some((m) => m.toLowerCase().includes(q));
    return inCat && inQuery;
  });

  const recommended = recommendResources(pickedTags, 4);

  if (!ready) return <SkeletonCard />;

  const isDraft = (r: Resource) => drafts.some((d) => d.id === r.id);

  const create = () => {
    const draft: Resource = {
      id: uid("draft"),
      title: form.title.trim(),
      category: form.category.trim() || "Uncategorised",
      minutes: Number(form.minutes) || 5,
      summary: form.summary.trim(),
      matches: form.matches
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };
    setDrafts((d) => [draft, ...d]);
    setShowCreate(false);
    setForm({ title: "", category: "", minutes: "5", summary: "", matches: "" });
    toast("Draft created", "info", "Not persisted — this prototype has no resource store.");
  };

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-navy-900">
            Resource library
          </h1>
          <p className="muted mt-1 text-sm">
            What you can offer a student from a case or a moderation decision.
          </p>
        </div>
        <Button tone="pro" onClick={() => setShowCreate(true)}>
          + Create resource
        </Button>
      </header>

      {/* ------------------------------------------------------- library */}
      <Card className="p-4 sm:p-5">
        <div className="space-y-3">
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, summary or concern tag"
            aria-label="Search resources"
          />
          <div className="no-scrollbar flex gap-2 overflow-x-auto">
            {categories.map((c) => (
              <Chip key={c} selected={category === c} onClick={() => setCategory(c)}>
                {c}
              </Chip>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            className="mt-4"
            icon="🔍"
            title="No resources match that"
            body="Try a different term, or clear the category filter."
          />
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {filtered.map((r) => (
              <article
                key={r.id}
                className={cx(
                  "rounded-xl border p-4",
                  isDraft(r) ? "border-dashed border-amber-300 bg-amber-50/50" : "border-navy-100",
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h2 className="font-medium text-navy-900">{r.title}</h2>
                  {isDraft(r) ? (
                    <Badge tone="amber">Draft — not persisted</Badge>
                  ) : (
                    <Badge tone="neutral">{r.minutes} min</Badge>
                  )}
                </div>
                <p className="muted mt-0.5 text-xs">{r.category}</p>
                <p className="mt-2 text-sm text-navy-700">{r.summary}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {r.matches.map((m) => (
                    <span
                      key={m}
                      className="rounded-full bg-navy-50 px-2 py-0.5 text-xs text-navy-600"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </Card>

      {drafts.length ? (
        <Callout tone="amber" icon="⚠️" title="Drafts live only in this browser tab">
          This prototype has no resource store, so newly created resources are not saved.
          They disappear on reload — shown here so the workflow is visible, not to pretend
          it persists.
        </Callout>
      ) : null}

      {/* ------------------------------------------------ recommendations */}
      <Card className="p-4 sm:p-5">
        <SectionTitle
          title="Why a resource gets recommended"
          subtitle="Matching is tag overlap — no black box. Pick concerns to see what a student with that pattern would be offered."
        />

        <div className="flex flex-wrap gap-2">
          {CONCERN_TAGS.map((t) => (
            <Chip
              key={t}
              selected={pickedTags.includes(t)}
              onClick={() =>
                setPickedTags((prev) =>
                  prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
                )
              }
            >
              {t}
            </Chip>
          ))}
        </div>

        <div className="mt-4">
          {recommended.length === 0 ? (
            <p className="muted text-sm">
              Nothing in the library matches those tags — a gap worth filling.
            </p>
          ) : (
            <ol className="space-y-2">
              {recommended.map((r, i) => {
                const overlap = r.matches.filter((m) => pickedTags.includes(m));
                return (
                  <li
                    key={r.id}
                    className="flex gap-3 rounded-xl border border-navy-100 bg-white p-3.5"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-pro-100 text-xs font-semibold text-pro-800">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-navy-900">{r.title}</p>
                      <p className="muted mt-0.5 text-xs">
                        Matched on {overlap.join(", ") || "general relevance"} ·{" "}
                        {overlap.length} of {pickedTags.length} selected concerns
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </Card>

      {/* -------------------------------------------------------- create */}
      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create a resource"
        tone="pro"
        description="Drafted locally — this prototype does not persist resources."
        footer={
          <>
            <Button onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button tone="pro" disabled={!form.title.trim()} onClick={create}>
              Create draft
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Field label="Title" required>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Sleeping through submission season"
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Category">
              <Input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="e.g. Sleep"
              />
            </Field>
            <Field label="Minutes to read">
              <Input
                type="number"
                min={1}
                value={form.minutes}
                onChange={(e) => setForm({ ...form, minutes: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Summary">
            <Textarea
              rows={3}
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
              placeholder="One or two sentences a student would actually read."
            />
          </Field>
          <Field
            label="Concern tags"
            hint="Comma separated. These drive the recommendation matching."
          >
            <Input
              value={form.matches}
              onChange={(e) => setForm({ ...form, matches: e.target.value })}
              placeholder="Sleep, Hostel, Academics"
            />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
