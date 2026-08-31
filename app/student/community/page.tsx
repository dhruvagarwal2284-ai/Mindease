"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, query, orderBy, onSnapshot, addDoc, doc, updateDoc } from "firebase/firestore";

import { db } from "@/lib/firebase";
import { useStore } from "@/lib/store";

import { AnonymousModeBar } from "@/components/privacy";
import { Button, EmptyState, SkeletonCard, Badge } from "@/components/ui";
import { cx } from "@/lib/format";

const TOPICS = ["All topics", "Academics", "Relationships", "Family", "Loneliness", "Career", "Financial stress", "Hostel life", "General"];
const TABS = ["For You", "Recent", "Trending", "Unanswered"];

/**
 * Check-in concern tags (lib/types.ts CONCERN_TAGS) onto feed topics. The two
 * vocabularies were written separately and do not match: "Finances" vs
 * "Financial stress", "Hostel" vs "Hostel life", and "Exams" has no topic of
 * its own. "For You" needs the bridge. Sleep is deliberately absent — there is
 * no feed topic for it, so it contributes nothing rather than mis-filing.
 */
const TAG_TO_TOPIC: Record<string, string> = {
  Academics: "Academics",
  Exams: "Academics",
  Relationships: "Relationships",
  Family: "Family",
  Finances: "Financial stress",
  Loneliness: "Loneliness",
  Career: "Career",
  Hostel: "Hostel life",
  Other: "General",
};

const replyCount = (p: { replies?: unknown[] }) => p.replies?.length ?? 0;

/** Shown when a tab filters everything out — each tab fails differently. */
const EMPTY_COPY: Record<string, { icon: string; title: string; body: string }> = {
  "For You": {
    icon: "🌱",
    title: "Nothing here matches your check-ins yet",
    body: "For You uses the concern tags from your own check-ins. Try Recent, or add a check-in on the home screen.",
  },
  Unanswered: {
    icon: "💬",
    title: "Every post has a reply",
    body: "Nobody on the feed is waiting right now. That is the point of this tab being empty.",
  },
  Recent: {
    icon: "🌱",
    title: "No posts yet. Be the first to share something.",
    body: "Whatever you write here shows up under your pseudonym, never your name.",
  },
  Trending: {
    icon: "🌱",
    title: "Nothing has picked up yet",
    body: "Posts move here once other students react or reply.",
  },
};

export default function CommunityPage() {
  const { ready, state, toast } = useStore();
  const myHandle = state.identity?.handle ?? "MindMate Anonymous";

  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPostText, setNewPostText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTopic, setActiveTopic] = useState("All topics");
  const [activeTab, setActiveTab] = useState("Recent");

  // Deep link, e.g. /student/community?tab=Unanswered — the leaderboard's
  // "Go answer one" lands here. Read from location rather than
  // useSearchParams so this page keeps prerendering without a Suspense
  // boundary; it is client-only anyway.
  useEffect(() => {
    const tab = new URLSearchParams(window.location.search).get("tab");
    if (tab && TABS.includes(tab)) setActiveTab(tab);
  }, []);

  const router = useRouter(); // 🔥 Page redirect ke liye
  const [userMenuOpen, setUserMenuOpen] = useState<string | null>(null); // 🔥 Profile click dropdown ke liye

  // 🔥 Naya state Discord-style reply box toggle karne ke liye
  // 🔥 Naya state Discord-style reply box toggle karne ke liye
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
const [expandedPosts, setExpandedPosts] = useState<string[]>([]);
 
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
  // 🔥 3. HANDLE REPLY SUBMISSION TO FIREBASE
  const handleReplySubmit = async (postId: string, currentReplies: any[] = []) => {
    if (!replyText.trim()) return;
    try {
      const postRef = doc(db, "community_posts", postId);
      const newReply = {
        id: Date.now().toString(),
        authorHandle: myHandle,
        body: replyText,
        createdAt: new Date().toISOString()
      };
      await updateDoc(postRef, { replies: [...currentReplies, newReply] });
      setReplyText("");
    } catch (error) {
      console.error("Error replying:", error);
      toast("Failed to reply.", "urgent");
    }
  };

  // Topics this student actually checks in about, used by the "For You" tab.
  const myTopics = useMemo(() => {
    const tags = (state.checkIns ?? []).slice(0, 12).flatMap((c) => c.tags ?? []);
    return new Set(tags.map((t) => TAG_TO_TOPIC[t]).filter(Boolean));
  }, [state.checkIns]);

  // Topic chips and the tab compose: the chips narrow the subject, the tab
  // decides which slice of that subject you get.
  const displayedPosts = useMemo(() => {
    let rows = activeTopic === "All topics" ? posts : posts.filter((p) => p.topic === activeTopic);

    if (activeTab === "Unanswered") {
      rows = rows.filter((p) => replyCount(p) === 0);
    } else if (activeTab === "For You" && myTopics.size > 0) {
      rows = rows.filter((p) => myTopics.has(p.topic));
    } else if (activeTab === "Trending") {
      // A reply is a stronger signal of a post landing than a like, so it
      // counts double. Sorted copy — never sort the Firestore array in place.
      const heat = (p: { likes?: number; replies?: unknown[] }) =>
        (p.likes ?? 0) + replyCount(p) * 2;
      rows = [...rows].sort((a, b) => heat(b) - heat(a));
    }
    // "Recent" is the Firestore query order (createdAt desc) — nothing to do.
    return rows;
  }, [posts, activeTopic, activeTab, myTopics]);
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
          <EmptyState {...(EMPTY_COPY[activeTab] ?? EMPTY_COPY.Recent)} />
        ) : (
          displayedPosts.map((post) => (
            <article key={post.id} className="card p-5 border-navy-100 bg-white hover:border-navy-200 transition-colors shadow-sm">
              <div className="flex justify-between items-start mb-3">
                
                {/* 🔥 Yahan Clickable Profile & Dropdown banaya hai 🔥 */}
                {/* 🔥 Yahan Clickable Profile & Dropdown banaya hai 🔥 */}
                <div className="relative">
                  <button 
                    onClick={() => {
                      if (post.authorHandle === myHandle) {
                        toast("This is your own post! You cannot start a chat with yourself.", "info");
                      } else {
                        setUserMenuOpen(userMenuOpen === post.id ? null : post.id);
                      }
                    }}
                    className="flex items-center gap-2 text-left hover:bg-navy-50 p-1.5 -ml-1.5 rounded-xl transition-colors cursor-pointer"
                  >
                    <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-800 font-bold text-xs shrink-0">
                      {post.authorHandle.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-navy-900">{post.authorHandle}</p>
                      <p className="text-[11px] text-navy-400 font-medium">
                        {new Date(post.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </p>
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  {userMenuOpen === post.id && post.authorHandle !== myHandle && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(null)}></div>
                      <div className="absolute top-full left-0 mt-1 z-20 w-48 bg-white border border-navy-100 rounded-xl shadow-lg p-1 animate-fade-in">
                        <button
                          onClick={() => router.push(`/student/peer?target=${encodeURIComponent(post.authorHandle)}`)}
                          className="w-full text-left px-3 py-2 text-sm font-semibold text-navy-700 hover:bg-teal-50 hover:text-teal-900 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                        >
                          <span aria-hidden>💬</span> Talk to this peer
                        </button>
                      </div>
                    </>
                  )}
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
                {/*<button className="flex items-center gap-1.5 text-xs font-semibold text-navy-500 hover:text-teal-700 transition-colors">
                  <span aria-hidden>💬</span> Reply
                </button>
              </div>
            </article>
          )) */}
<button 
                  onClick={() => setReplyingTo(replyingTo === post.id ? null : post.id)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-navy-500 hover:text-teal-700 transition-colors cursor-pointer"
                >
                  {/* Button par direct replies ka count dikhega */}
                  <span aria-hidden>💬</span> {post.replies?.length ? `${post.replies.length} Replies` : "Reply"}
                </button>
              </div>

              {/* 🔥 DISCORD STYLE REPLIES & INPUT SECTION 🔥 */}
              {/* Ab sirf tabhi dikhega jab user "Replies" button click karega */}
              {replyingTo === post.id ? (
                <div className="mt-3 border-t border-navy-50 pt-3 pl-2 bg-navy-50/30 rounded-b-xl animate-fade-in">
                  
                  {/* Agar replies 4 se zyada hain toh 'View all' toggle dikhao */}
                  {post.replies && post.replies.length > 4 && !expandedPosts.includes(post.id) && (
                    <div className="mb-2 pl-2 border-l-2 border-navy-100">
                      <button 
                        onClick={() => setExpandedPosts([...expandedPosts, post.id])}
                        className="text-xs font-semibold text-navy-500 hover:text-navy-700 hover:underline cursor-pointer transition-colors"
                      >
                        View all {post.replies.length} replies...
                      </button>
                    </div>
                  )}
                  {post.replies && post.replies.length > 4 && expandedPosts.includes(post.id) && (
                    <div className="mb-2 pl-2 border-l-2 border-navy-100">
                      <button 
                        onClick={() => setExpandedPosts(expandedPosts.filter(id => id !== post.id))}
                        className="text-xs font-semibold text-navy-500 hover:text-navy-700 hover:underline cursor-pointer transition-colors"
                      >
                        Show less replies
                      </button>
                    </div>
                  )}

                  {/* Reply Input Box */}
                  <div className="flex gap-2 items-center mt-2">
                    <div className="h-6 w-6 rounded-full bg-teal-100 flex items-center justify-center text-teal-800 font-bold text-[10px] shrink-0">
                      {myHandle.substring(0, 2).toUpperCase()}
                    </div>
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Reply to ${post.authorHandle}...`}
                      className="flex-1 bg-white border border-navy-200 rounded-full px-4 py-1.5 text-xs focus:outline-none focus:border-teal-500 transition-colors"
                      autoFocus
                    />
                    <Button 
                      size="sm" 
                      tone="primary" 
                      onClick={() => handleReplySubmit(post.id, post.replies)}
                      disabled={!replyText.trim()}
                      className="py-1.5 px-3 text-xs rounded-full cursor-pointer disabled:opacity-50"
                    >
                      Send
                    </Button>
                  </div>

                  {/* 🔥 ACTUAL REPLIES RENDER HONGE YAHAN 🔥 */}
                  {post.replies && post.replies.length > 0 && (
                    <div className="mt-3 space-y-2 pl-2 border-l-2 border-navy-100">
                      {/* Sirf 4 replies dikhayega by default, jab tak View all click na ho */}
                      {(expandedPosts.includes(post.id) ? post.replies : post.replies.slice(0, 4)).map((reply: any) => (
                        <div key={reply.id} className="bg-white p-3 rounded-xl border border-navy-100 shadow-2xs">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-navy-900 text-xs">{reply.authorHandle}</span>
                            <span className="text-[10px] text-navy-400">
                              {new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-navy-800">{reply.body}</p>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              ) : null}

            </article> 
               
          ))

        )}
      </div>

    </div>
  );
}