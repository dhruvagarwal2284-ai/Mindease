"use client";

import { useMemo, useState } from "react";
import {
  Badge,
  Button,
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
  const { ready, state, postResource, removeResource } = useStore();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [showCreate, setShowCreate] = useState(false);
  const [pickedTags, setPickedTags] = useState<string[]>(["Academics", "Exams"]);

  const [form, setForm] = useState({
    title: "",
    category: "",
    minutes: "5",
    summary: "",
    content: "",
    matches: "",
  });

  const customResources = state.customResources ?? [];
  const all = useMemo(() => [...customResources, ...RESOURCES], [customResources]);
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

  const recommended = recommendResources(pickedTags, 4, customResources);

  if (!ready) return <SkeletonCard />;

  const isCustom = (r: Resource) => customResources.some((d) => d.id === r.id);

  const create = () => {
    if (!form.title.trim() || !form.content.trim()) return;
    const resource: Resource = {
      id: uid("res"),
      title: form.title.trim(),
      category: form.category.trim() || "General",
      minutes: Number(form.minutes) || 5,
      summary: form.summary.trim() || form.content.trim().slice(0, 120) + "…",
      content: form.content.trim(),
      matches: form.matches
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      author: "Campus Counselling Team",
      createdAt: new Date().toISOString(),
    };
    postResource(resource);
    setShowCreate(false);
    setForm({ title: "", category: "", minutes: "5", summary: "", content: "", matches: "" });
  };

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-navy-900">
            Resource library
          </h1>
          <p className="muted mt-1 text-sm">
            What you can offer a student from a case or a moderation decision, and publish for campus reading.
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
            {filtered.map((r) => {
              const custom = isCustom(r);
              return (
                <article
                  key={r.id}
                  className={cx(
                    "rounded-xl border p-4 transition-colors",
                    custom ? "border-pro-200 bg-pro-50/40" : "border-navy-100 bg-white",
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h2 className="font-medium text-navy-900">{r.title}</h2>
                    <div className="flex items-center gap-1.5">
                      {custom ? (
                        <Badge tone="pro">Posted by counselling team</Badge>
                      ) : (
                        <Badge tone="neutral">{r.minutes} min</Badge>
                      )}
                    </div>
                  </div>
                  <p className="muted mt-0.5 text-xs">
                    {r.category} · {r.minutes} min read
                  </p>
                  <p className="mt-2 text-sm text-navy-700 leading-relaxed">{r.summary}</p>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-1.5">
                      {r.matches.map((m) => (
                        <span
                          key={m}
                          className="rounded-full bg-navy-50 px-2 py-0.5 text-xs text-navy-600 border border-navy-100"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                    {custom ? (
                      <button
                        type="button"
                        onClick={() => removeResource(r.id)}
                        className="text-xs font-medium text-urgent-700 hover:text-urgent-900 hover:underline"
                      >
                        Remove article
                      </button>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </Card>

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
        title="Post a resource article"
        tone="pro"
        description="This article will be immediately available for students to read in the library and recommendations."
        footer={
          <>
            <Button onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button
              tone="pro"
              disabled={!form.title.trim() || !form.content.trim()}
              onClick={create}
            >
              Post resource
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
              required
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
              rows={2}
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
              placeholder="One or two sentences summarizing the article."
            />
          </Field>
          <Field
            label="Full article content"
            required
            hint="Paragraphs and actionable guidance students can read."
          >
            <Textarea
              rows={6}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Write the full article content here..."
              required
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
