"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useStore } from "@/lib/store";

import { AnonymousModeBar } from "@/components/privacy";
import { Button, EmptyState, SkeletonCard, Badge } from "@/components/ui";
import { cx } from "@/lib/format";

const TOPICS = ["All topics", "Academics", "Relationships", "Family", "Loneliness", "Career", "Financial stress", "Hostel life", "General"];
const TABS = ["For You", "Recent", "Trending", "Unanswered"];

export default function CommunityPage() {
  const { ready, state, toast } = useStore();
  const myHandle = state.identity?.handle ?? "MindMate Anonymous";

  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPostText, setNewPostText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTopic, setActiveTopic] = useState("All topics");
  const [activeTab, setActiveTab] = useState("Recent");

  // 🔥 1. FETCH GLOBAL POSTS (NO USER FILTER = VISIBLE TO ALL)
  useEffect(() => {
    const q = query(collection(db, "community_posts"), orderBy("createdAt", "desc"));
    
    const unsub = onSnapshot(q, (snap) => {
      const fetchedPosts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(fetchedPosts);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // 🔥 2. CREATE A NEW PUBLIC POST
  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "community_posts"), {
        text: newPostText,
        authorHandle: myHandle,
        topic: activeTopic === "All topics" ? "General" : activeTopic,
        likes: 0,
        createdAt: new Date().toISOString(),
      });
      setNewPostText("");
      toast("Post shared with the community!", "success");
    } catch (error) {
      console.error("Error posting:", error);
      toast("Failed to post. Try again.", "urgent");
    }
    setIsSubmitting(false);
  };

  // Filter posts based on selected topic
  const displayedPosts = activeTopic === "All topics" 
    ? posts 
    : posts.filter(p => p.topic === activeTopic);

  if (!ready) {
    return (
      <div className="space-y-4">
        <SkeletonCard /><SkeletonCard />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <AnonymousModeBar />

      <header>
        <h1 className="text-2xl font-bold tracking-tight text-navy-900">Community</h1>
        <p className="mt-1 text-sm text-navy-600">
          Students on your campus, writing anonymously. Be kind — someone is having the worst week of their year in here.
        </p>
      </header>

      {/* CREATE POST INPUT */}
      <form onSubmit={handlePost} className="card p-2 pl-4 flex items-center gap-3 border-navy-200 shadow-sm focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500 transition-all">
        <span className="text-xl opacity-60" aria-hidden>👀</span>
        <input
          type="text"
          value={newPostText}
          onChange={(e) => setNewPostText(e.target.value)}
          placeholder="What's on your mind?"
          className="flex-1 bg-transparent border-none focus:outline-none text-sm text-navy-900 placeholder:text-navy-400 py-3"
          disabled={isSubmitting}
        />
        <Button type="submit" tone="primary" disabled={!newPostText.trim() || isSubmitting}>
          {isSubmitting ? "Posting..." : "Post"}
        </Button>
      </form>

      {/* TABS */}
      <div className="flex gap-4 border-b border-navy-100 pb-2 text-sm font-medium">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cx(
              "px-1 py-1 transition-colors",
              activeTab === tab ? "text-teal-800 border-b-2 border-teal-800" : "text-navy-500 hover:text-navy-900"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TOPIC FILTERS */}
      <div className="flex flex-wrap gap-2">
        {TOPICS.map(topic => (
          <button
            key={topic}
            onClick={() => setActiveTopic(topic)}
            className={cx(
              "px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors",
              activeTopic === topic 
                ? "bg-teal-700 text-white border-teal-700" 
                : "bg-white text-navy-700 border-navy-200 hover:bg-navy-50"
            )}
          >
            {topic}
          </button>
        ))}
      </div>

      <div className="flex justify-between items-center text-xs text-navy-500 font-medium">
        <span>{displayedPosts.length} posts</span>
        <button className="hover:underline">Saved posts →</button>
      </div>

      {/* POSTS FEED */}
      <div className="space-y-4">
        {loading ? (
          <SkeletonCard />
        ) : displayedPosts.length === 0 ? (
          <EmptyState
            icon="🌱"
            title="No posts yet. Be the first to share something."
            body="Whatever you write here shows up under your pseudonym, never your name."
          />
        ) : (
          displayedPosts.map((post) => (
            <article key={post.id} className="card p-5 border-navy-100 bg-white hover:border-navy-200 transition-colors shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-800 font-bold text-xs">
                    {post.authorHandle.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-navy-900">{post.authorHandle}</p>
                    <p className="text-[11px] text-navy-400 font-medium">
                      {new Date(post.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </p>
                  </div>
                </div>
                <Badge tone="navy">{post.topic}</Badge>
              </div>
              
              <p className="text-sm text-navy-800 whitespace-pre-wrap leading-relaxed">
                {post.text}
              </p>
              
              <div className="mt-4 flex gap-4 border-t border-navy-50 pt-3">
                <button className="flex items-center gap-1.5 text-xs font-semibold text-navy-500 hover:text-teal-700 transition-colors">
                  <span aria-hidden>🤍</span> {post.likes || 0} Likes
                </button>
                <button className="flex items-center gap-1.5 text-xs font-semibold text-navy-500 hover:text-teal-700 transition-colors">
                  <span aria-hidden>💬</span> Reply
                </button>
              </div>
            </article>
          ))
        )}
      </div>

    </div>
  );
}