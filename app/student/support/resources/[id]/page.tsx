"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge, Button, Callout, EmptyState, LinkButton, SkeletonCard } from "@/components/ui";
import { resourceById } from "@/lib/resources";
import { useStore } from "@/lib/store";

export default function ResourceReaderPage() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const { ready, state } = useStore();

  if (!ready) return <SkeletonCard />;

  const customResources = state.customResources ?? [];
  const resource = resourceById(id, customResources);

  if (!resource) {
    return (
      <div className="space-y-4">
        <Link
          href="/student/support"
          className="muted inline-flex items-center gap-1 text-sm hover:underline"
        >
          ← Back to Support
        </Link>
        <EmptyState
          icon="🔍"
          title="Article not found"
          body="This resource may have been removed or the link is invalid."
        />
        <div className="pt-2">
          <LinkButton href="/student/support" tone="primary">
            Browse all resources
          </LinkButton>
        </div>
      </div>
    );
  }

  const isCustom = customResources.some((c) => c.id === resource.id);
  const paragraphs = (resource.content || resource.summary)
    .split("\n\n")
    .filter((p) => p.trim().length > 0);

  return (
    <article className="max-w-3xl space-y-6 animate-fade-up">
      {/* Navigation & Header */}
      <div>
        <Link
          href="/student/support"
          className="muted inline-flex items-center gap-1 text-sm font-medium text-teal-800 hover:underline mb-4"
        >
          ← Back to Support library
        </Link>

        <div className="flex flex-wrap items-center gap-2 mb-2">
          <Badge tone="teal">{resource.category}</Badge>
          <Badge tone="neutral">{resource.minutes} min read</Badge>
          {isCustom ? (
            <Badge tone="pro">
              {resource.author ? `Posted by ${resource.author}` : "Posted by counselling team"}
            </Badge>
          ) : null}
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-navy-900 leading-tight">
          {resource.title}
        </h1>
      </div>

      {/* Summary Box */}
      <div className="rounded-2xl border border-teal-200 bg-teal-50/60 p-4 sm:p-5 text-sm text-navy-800 font-medium leading-relaxed">
        {resource.summary}
      </div>

      {/* Article Body */}
      <div className="card p-5 sm:p-8 space-y-4 text-navy-800 text-[0.95rem] sm:text-base leading-relaxed">
        {paragraphs.map((para, idx) => (
          <p key={idx} className="whitespace-pre-line">
            {para}
          </p>
        ))}
      </div>

      {/* Tags */}
      {resource.matches && resource.matches.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="muted text-xs font-medium">Related topics:</span>
          {resource.matches.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-navy-100 bg-navy-50 px-2.5 py-1 text-xs text-navy-700"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      {/* Next Steps & Counselling Callout */}
      <div className="rounded-2xl border border-navy-200 bg-navy-50/70 p-5 sm:p-6 space-y-3">
        <h2 className="text-base font-semibold text-navy-900">Need to talk this through?</h2>
        <p className="text-sm text-navy-700">
          Reading is often a helpful first step, but you don&rsquo;t have to handle everything alone. You can connect anonymously with a peer or speak to a campus counsellor.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <LinkButton href="/student/peer" tone="primary" size="sm">
            Chat with a peer
          </LinkButton>
          <LinkButton href="/student/support/request" size="sm">
            Book a counsellor
          </LinkButton>
          <LinkButton href="/student/support" tone="ghost" size="sm">
            Browse more resources
          </LinkButton>
        </div>
      </div>
    </article>
  );
}
