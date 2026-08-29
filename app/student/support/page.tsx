"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { RESOURCES } from "@/lib/resources";
import { Badge, SkeletonCard, SectionTitle } from "@/components/ui";

const CATEGORIES = ["All", "Academics", "Sleep", "Belonging", "Anxiety", "Finances", "Family", "Peer support"];

export default function StudentSupportPage() {
  const { ready, state, toast } = useStore();
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  if (!ready) {
    return <div className="space-y-3"><SkeletonCard /><SkeletonCard /></div>;
  }

  // Combine default resources with any custom resources uploaded by the counsellor
  const allResources = [...(state.customResources || []), ...RESOURCES] as any[];
  // Filtering Logic (Search + Category)
  const filteredResources = allResources.filter(r => {
    const matchesCategory = filter === "All" || r.category === filter;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = r.title.toLowerCase().includes(searchLower) || 
                          r.summary?.toLowerCase().includes(searchLower) || 
                          (r.tags && r.tags.some(t => t.toLowerCase().includes(searchLower)));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-10">
      
      {/* PAGE HEADER */}
      <header className="animate-fade-up">
        <h1 className="text-2xl font-semibold tracking-tight text-navy-900">Support & Resources</h1>
        <p className="muted mt-1 text-sm">Find self-help guides or reach out to a professional.</p>
      </header>

      {/* EMERGENCY / DIRECT CONTACT CTA */}
      <section className="rounded-2xl border border-pro-200 bg-pro-50 p-5 sm:p-6 animate-fade-up">
        <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
          <div>
            <h2 className="text-lg font-semibold text-pro-900">Need to talk to someone?</h2>
            <p className="text-sm text-pro-900/80 mt-1">Schedule a formal appointment or request chat support with campus counselling.</p>
          </div>
          <Link
            href="/student/support/request"
            className="shrink-0 inline-flex items-center justify-center rounded-xl bg-pro-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-pro-700 transition-colors"
          >
            Book a counsellor
          </Link>
        </div>
      </section>

      {/* RESOURCE LIBRARY SECTION */}
      <section className="animate-fade-up" style={{ animationDelay: "100ms" }}>
        <SectionTitle 
          title="Resource library" 
          subtitle="Explore guides and exercises published by campus counselling." 
        />

        {/* Search & Filters */}
        <div className="mt-4 space-y-4">
          <input
            type="text"
            placeholder="Search by title, summary or concern tag..."
            className="w-full rounded-xl border border-navy-200 px-4 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                  filter === cat
                    ? "bg-teal-700 text-white border-teal-700"
                    : "bg-white text-navy-600 border-navy-200 hover:bg-navy-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Resources List */}
        <div className="mt-6 space-y-4">
          {filteredResources.length === 0 ? (
            <div className="text-center p-8 border rounded-2xl bg-slate-50 text-navy-500 text-sm">
              No resources found matching your search.
            </div>
          ) : (
            filteredResources.map((resource) => (
              <div
                key={resource.id}
                onClick={() => toast("Opening resource...", "info")}
                className="block p-5 rounded-2xl border border-navy-100 bg-white shadow-sm hover:shadow-md transition-all hover:border-teal-200 cursor-pointer"
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="text-base font-semibold text-navy-900">{resource.title}</h3>
                    <p className="text-xs text-navy-500 mt-1">{resource.category} · {resource.readTime || "5 min read"}</p>
                    <p className="text-sm text-navy-700 mt-2">{resource.summary}</p>
                  </div>
                  {resource.readTime && (
                    <Badge tone="neutral" className="shrink-0">{resource.readTime}</Badge>
                  )}
                </div>
                
                {/* Resource Tags */}
                {resource.tags && resource.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {resource.tags.map(tag => (
                      <Badge key={tag} tone="neutral" className="text-[10px] uppercase tracking-wider">{tag}</Badge>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>

    </div>
  );
}