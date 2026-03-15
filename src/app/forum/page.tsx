"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  getForumCategories,
  getForumThreads,
  getForumReplies,
  createForumThread,
  createForumReply,
  reportForumContent,
  type ForumCategory,
  type ForumThread,
  type ForumReply,
} from "@/lib/api";

type View =
  | { type: "categories" }
  | { type: "threads"; category: ForumCategory }
  | { type: "thread"; thread: ForumThread };

function ReportModal({
  reason,
  onChangeReason,
  onSubmit,
  onCancel,
}: {
  reason: string;
  onChangeReason: (v: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md animate-scale-in rounded-2xl bg-white p-8 shadow-xl">
        <h3 className="text-xl font-bold text-slate-900 mb-2">Report Content</h3>
        <p className="text-sm text-slate-500 mb-6 font-medium">Help us keep the forum safe and respectful.</p>
        <textarea
          className="w-full rounded-xl border border-slate-200 p-4 text-sm transition-all focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/5 bg-slate-50"
          rows={4}
          placeholder="Describe why you are reporting this content..."
          value={reason}
          onChange={(e) => onChangeReason(e.target.value)}
        />
        <div className="mt-8 flex gap-3">
          <button
            onClick={onSubmit}
            className="flex-1 btn-primary bg-red-600 hover:bg-red-700 border-none justify-center"
          >
            Submit Report
          </button>
          <button
            onClick={onCancel}
            className="flex-1 btn-secondary justify-center"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

const AVATAR_COLORS = [
  "bg-primary-500",
  "bg-secondary-500",
  "bg-indigo-500",
  "bg-slate-500",
  "bg-blue-500",
];

function avatarBg(name?: string | null) {
  if (!name) return AVATAR_COLORS[0];
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

const Guidelines = () => (
  <div className="card-modern p-6 bg-primary-50 border-none">
    <div className="mb-4 flex items-center gap-2">
      <div className="h-2 w-2 rounded-full bg-primary-600" />
      <h3 className="text-sm font-bold text-primary-900 uppercase tracking-wider">Community Guidelines</h3>
    </div>
    <ul className="space-y-3 mb-6">
      {[
        "Be respectful and kind",
        "No hate speech or harassment",
        "Stay on topic",
        "Protect community safety",
        "Report harmful or misleading content",
      ].map((rule) => (
        <li key={rule} className="flex items-start gap-3 text-sm text-primary-800/80 font-medium leading-tight">
          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary-400" />
          {rule}
        </li>
      ))}
    </ul>
    <div className="pt-4 border-t border-primary-200/50">
      <p className="text-xs font-bold text-primary-700 leading-relaxed italic">
        🛡️ Discussions are moderated to ensure a safe and respectful community environment.
      </p>
    </div>
  </div>
);

const DEFAULT_CATEGORIES: ForumCategory[] = [
  { id: 991, name_en: "General Discussion", name_my: "", name_th: "", name_ms: "", description_en: "General community talk.", slug: "general", display_order: 1, is_active: true, thread_count: 0, latest_activity_at: null, latest_thread_title: null, created_at: "", updated_at: "" },
  { id: 992, name_en: "Community Announcements", name_my: "", name_th: "", name_ms: "", description_en: "Important updates.", slug: "announcements", display_order: 2, is_active: true, thread_count: 0, latest_activity_at: null, latest_thread_title: null, created_at: "", updated_at: "" },
  { id: 993, name_en: "Human Rights & Advocacy", name_my: "", name_th: "", name_ms: "", description_en: "Advocacy efforts.", slug: "advocacy", display_order: 3, is_active: true, thread_count: 0, latest_activity_at: null, latest_thread_title: null, created_at: "", updated_at: "" },
  { id: 994, name_en: "Education & Opportunities", name_my: "", name_th: "", name_ms: "", description_en: "Scholarships and learning.", slug: "education", display_order: 4, is_active: true, thread_count: 0, latest_activity_at: null, latest_thread_title: null, created_at: "", updated_at: "" },
  { id: 995, name_en: "Events & Networking", name_my: "", name_th: "", name_ms: "", description_en: "Connect with others.", slug: "events", display_order: 5, is_active: true, thread_count: 0, latest_activity_at: null, latest_thread_title: null, created_at: "", updated_at: "" },
  { id: 996, name_en: "Culture & Identity", name_my: "", name_th: "", name_ms: "", description_en: "Share our heritage.", slug: "culture", display_order: 6, is_active: true, thread_count: 0, latest_activity_at: null, latest_thread_title: null, created_at: "", updated_at: "" },
];

const CAT_ICONS: Record<string, string> = {
  "General Discussion": "💬",
  "Community Announcements": "📢",
  "Human Rights & Advocacy": "⚖️",
  "Education & Opportunities": "🎓",
  "Events & Networking": "🤝",
  "Culture & Identity": "🎭",
};

export default function ForumPage() {
  const router = useRouter();
  const [view, setView] = useState<View>({ type: "categories" });
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [newThreadTitle, setNewThreadTitle] = useState("");
  const [newThreadBody, setNewThreadBody] = useState("");
  const [newReplyBody, setNewReplyBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [msg, setMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [reportReason, setReportReason] = useState("");
  const [reportTarget, setReportTarget] = useState<{ thread_id?: string; reply_id?: string } | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(localStorage.getItem("access_token"));
  }, []);

  useEffect(() => {
    setLoading(true);
    getForumCategories()
      .then(cats => {
        setCategories(cats.length > 0 ? cats : DEFAULT_CATEGORIES);
      })
      .catch(() => {
        setCategories(DEFAULT_CATEGORIES);
      })
      .finally(() => setLoading(false));
  }, []);

  const openCategory = useCallback(async (cat: ForumCategory) => {
    setLoading(true);
    setView({ type: "threads", category: cat });
    try {
      setThreads(await getForumThreads(cat.id));
    } catch {}
    setLoading(false);
  }, []);

  const openThread = useCallback(async (thread: ForumThread) => {
    setLoading(true);
    setView({ type: "thread", thread });
    try {
      setReplies(await getForumReplies(thread.id));
    } catch {}
    setLoading(false);
  }, []);

  async function handleCreateThread(e: FormEvent, categoryId: number) {
    e.preventDefault();
    if (!token) { router.push("/login?next=/forum"); return; }
    if (!newThreadTitle.trim() || newThreadBody.trim().length < 10) return;
    setPosting(true);
    setMsg("");
    try {
      const newThread = await createForumThread(token, { category_id: categoryId, title: newThreadTitle, body: newThreadBody });
      setNewThreadTitle("");
      setNewThreadBody("");
      setThreads(await getForumThreads(categoryId));
      await openThread(newThread);
    } catch (err: unknown) {
      setMsg((err as Error).message || "Failed to create thread");
    }
    setPosting(false);
  }

  async function handleCreateReply(e: FormEvent, threadId: string) {
    e.preventDefault();
    if (!token) { router.push("/login?next=/forum"); return; }
    if (!newReplyBody.trim()) return;
    setPosting(true);
    try {
      await createForumReply(token, threadId, newReplyBody);
      setNewReplyBody("");
      setReplies(await getForumReplies(threadId));
    } catch (err: unknown) {
      setMsg((err as Error).message || "Failed to post reply");
    }
    setPosting(false);
  }

  async function handleReport() {
    if (!token || !reportTarget || !reportReason.trim()) return;
    try {
      await reportForumContent(token, { ...reportTarget, reason: reportReason });
      setReportTarget(null);
      setReportReason("");
      setMsg("Report submitted. Thank you.");
    } catch {}
  }

  /* ─── CATEGORIES VIEW ──── */
  if (view.type === "categories") {
    return (
      <div className="bg-white min-h-screen">
        {reportTarget && (
          <ReportModal
            reason={reportReason}
            onChangeReason={setReportReason}
            onSubmit={handleReport}
            onCancel={() => { setReportTarget(null); setReportReason(""); }}
          />
        )}

        <header className="pt-20 pb-16 border-b border-slate-100 relative overflow-hidden bg-slate-50">
          <div className="absolute inset-0 bg-pattern opacity-[0.03] pointer-events-none" />
          <div className="mx-auto max-w-7xl px-6 relative z-10 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div className="flex-1">
              <span className="badge-primary mb-4 py-1 px-3 inline-block">
                 Diaspora Discussion Forum
              </span>
              <h1 className="hero-title mb-4">
                Myanmar Community Forum
              </h1>
              <p className="text-lg text-slate-600 max-w-2xl leading-relaxed mb-4">
                The Together Myanmar Community Forum is a space for members of the global Myanmar diaspora to connect, share resources, and discuss important issues.
              </p>
              <p className="text-[14px] font-bold text-slate-500 max-w-2xl leading-relaxed flex items-center gap-2">
                 <span className="text-primary-500">🤝</span> The forum helps members of the Myanmar diaspora exchange ideas, share resources, and support each other.
              </p>
            </div>
          </div>
        </header>

        {/* Search Bar */}
        <section className="bg-white sticky top-[64px] z-20 border-b border-slate-100 shadow-sm px-6 py-4">
          <div className="mx-auto max-w-7xl flex flex-col md:flex-row gap-4 items-center">
            <div className="relative w-full md:max-w-md">
               <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30">🔍</span>
               <input
                 type="text"
                 placeholder="Search discussions..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="input-modern pl-11 h-11 py-1 w-full border-slate-200 focus:border-primary-300"
               />
            </div>
            {token && (
              <button onClick={() => {
                const firstCat = categories[0];
                if (firstCat) openCategory(firstCat);
              }} className="btn-primary w-full md:w-auto h-11 ml-auto">
                + Start a Discussion
              </button>
            )}
          </div>
        </section>

        <section className="bg-slate-50 px-6 py-16">
          <div className="mx-auto max-w-7xl grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <h2 className="section-title mb-8 px-2">Discussion Hub</h2>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="shimmer-bg h-24 rounded-2xl" />
                  ))}
                </div>
              ) : categories.length === 0 ? (
                <div className="card-modern py-24 bg-white border-slate-200 text-center shadow-sm">
                  <div className="text-5xl mb-6">💬</div>
                  <p className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Discussion categories will appear here soon.</p>
                  <p className="text-slate-500 font-medium text-lg max-w-md mx-auto">Help build the community by starting the first conversation.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {categories.map((cat, i) => {
                    const icon = CAT_ICONS[cat.name_en] || "💬";
                    return (
                      <button
                        key={cat.id}
                        onClick={() => openCategory(cat)}
                        className="card-modern p-6 bg-white border-slate-200 shadow-sm group text-left transition-all hover:border-primary-300 hover:shadow-md"
                      >
                        <div className="flex items-start gap-4">
                          <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-sm ${avatarBg(cat.name_en)}`}>
                            {icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-4 mb-1">
                              <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary-600 transition-colors">
                                {cat.name_en}
                              </h3>
                              <span className="text-[11px] font-bold text-slate-400 uppercase italic tracking-wider">{cat.name_my}</span>
                            </div>
                            <p className="text-sm text-slate-500 leading-relaxed font-medium line-clamp-2">
                               {cat.description_en || "Join this space for moderated discussions."}
                            </p>
                          </div>
                          <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-primary-50 transition-colors">
                             <svg className="h-4 w-4 text-slate-400 group-hover:text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                             </svg>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="card-modern p-8 bg-white border-slate-200 shadow-sm mb-6">
                <h3 className="text-base font-bold text-slate-900 mb-4">Start Participating</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-8">
                  Browse discussion categories or create a new topic to start a conversation with the community. Only registered members can create discussions.
                </p>
                {!token ? (
                  <button
                    onClick={() => router.push("/login?next=/forum")}
                    className="btn-primary w-full justify-center"
                  >
                    Post an Update
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      const firstCat = categories[0];
                      if (firstCat) openCategory(firstCat);
                    }}
                    className="btn-primary w-full justify-center"
                  >
                    Start a Discussion
                  </button>
                )}
              </div>
              
              {/* Popular Topics UI Mock */}
              <div className="card-modern p-6 bg-white border-slate-200 shadow-sm flex flex-col gap-4">
                 <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">🔥 Popular Topics</h3>
                 <div className="text-[13px] font-medium text-slate-500 space-y-3">
                    <p className="cursor-pointer hover:text-primary-600">Networking in Bangkok <span className="text-slate-300 text-[11px] float-right">24 replies</span></p>
                    <p className="cursor-pointer hover:text-primary-600">Advice for Students <span className="text-slate-300 text-[11px] float-right">18 replies</span></p>
                 </div>
              </div>
              <Guidelines />
            </div>
          </div>
        </section>
      </div>
    );
  }

  /* ─── THREADS VIEW ──── */
  if (view.type === "threads") {
    const cat = view.category;
    return (
      <div className="bg-slate-50 min-h-screen">
        {reportTarget && (
          <ReportModal
            reason={reportReason}
            onChangeReason={setReportReason}
            onSubmit={handleReport}
            onCancel={() => { setReportTarget(null); setReportReason(""); }}
          />
        )}

        <header className="pt-24 pb-12 bg-white border-b border-slate-100">
          <div className="mx-auto max-w-7xl px-6">
            <button
              onClick={() => setView({ type: "categories" })}
              className="group mb-6 inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-primary-600 transition-colors"
            >
              <svg className="h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
              Return Hub
            </button>
            <h1 className="text-3xl font-black text-slate-900 mb-2">{cat.name_en}</h1>
            <p className="text-slate-500 font-medium max-w-2xl">{cat.description_en}</p>
          </div>
        </header>

        <section className="px-6 py-12">
          <div className="mx-auto max-w-7xl grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="shimmer-bg h-24 rounded-2xl" />
                  ))}
                </div>
              ) : threads.length === 0 ? (
                <div className="card-modern py-20 bg-white border-dashed border-slate-200 text-center">
                  <div className="text-4xl mb-4 opacity-50">✍️</div>
                  <p className="text-slate-500 font-medium">Be the first to start a conversation here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {[...threads]
                    .sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0))
                    .map((t) => (
                      <button
                        key={t.id}
                        onClick={() => openThread(t)}
                        className="card-modern p-6 bg-white border-slate-200 shadow-sm group text-left w-full transition-all hover:border-primary-300"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                               {t.is_pinned && (
                                 <span className="badge-primary bg-primary-100 text-primary-700 border-none py-0 px-2 text-[10px]">PINNED</span>
                               )}
                               <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-1">
                                 {t.title}
                               </h3>
                            </div>
                            <p className="text-sm text-slate-500 font-medium line-clamp-2 mb-4 leading-relaxed">{t.body}</p>
                            
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] font-bold text-slate-400">
                               <span className="flex items-center gap-1.5">
                                 <div className={`h-4 w-4 rounded-full ${avatarBg(t.author_display_name)} shrink-0`} />
                                 {t.author_display_name || "Anonymous User"}
                               </span>
                               <span className="flex items-center gap-1.5">
                                  💬 {t.reply_count} Replies
                               </span>
                               <span className="flex items-center gap-1.5">
                                  👁 {t.view_count} Views
                               </span>
                               <span>
                                  {new Date(t.created_at).toLocaleDateString()}
                               </span>
                            </div>
                          </div>
                          <div className="hidden sm:flex flex-col items-center justify-center h-10 w-10 shrink-0 rounded-lg bg-slate-50 text-slate-400 font-black text-[10px]">
                             NAV
                          </div>
                        </div>
                      </button>
                    ))}
                </div>
              )}

              {/* Start new thread form redesign */}
              {token ? (
                <div className="card-modern p-8 bg-white border-slate-200 shadow-sm mt-12">
                   <h3 className="text-xl font-black text-slate-900 mb-2">Create New Discussion</h3>
                   <p className="text-sm font-medium text-slate-500 mb-6">Share your ideas, questions, or community updates.</p>
                   {msg && <p className="p-3 bg-red-50 text-red-600 rounded-lg mb-4 text-sm font-bold">{msg}</p>}
                   <form onSubmit={(e) => handleCreateThread(e, cat.id)} className="space-y-4">
                      <input
                        className="input-modern bg-slate-50 border-slate-200 focus:border-primary-300"
                        placeholder="Discussion title..."
                        value={newThreadTitle}
                        onChange={(e) => setNewThreadTitle(e.target.value)}
                        maxLength={500}
                        required
                      />
                      <textarea
                        className="input-modern resize-none bg-slate-50 border-slate-200 focus:border-primary-300"
                        rows={6}
                        placeholder="Share your thoughts with the community..."
                        value={newThreadBody}
                        onChange={(e) => setNewThreadBody(e.target.value)}
                        minLength={10}
                        maxLength={10000}
                        required
                      />
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
                         <div className="flex flex-wrap items-center gap-2">
                           {["advocacy", "education", "culture", "community support"].map(tag => (
                             <span key={tag} className="badge-modern bg-slate-100 text-slate-500 border-none capitalize text-[10px] cursor-pointer hover:bg-slate-200">
                               #{tag}
                             </span>
                           ))}
                         </div>
                         <button
                           type="submit"
                           disabled={posting}
                           className="btn-primary w-full sm:w-auto justify-center"
                         >
                           {posting ? "..." : "Start Discussion"}
                         </button>
                      </div>
                   </form>
                </div>
              ) : (
                <div className="card-modern p-8 bg-white border-slate-200 shadow-sm mt-12 text-center">
                   <p className="text-slate-500 font-medium mb-4">Only registered members can create discussions.</p>
                   <button onClick={() => router.push("/login?next=/forum")} className="btn-primary">Authenticate Account</button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <Guidelines />
            </div>
          </div>
        </section>
      </div>
    );
  }

  /* ─── THREAD DETAIL VIEW ──── */
  const thread = view.thread;
  return (
    <div className="bg-slate-50 min-h-screen">
      {reportTarget && (
        <ReportModal
          reason={reportReason}
          onChangeReason={setReportReason}
          onSubmit={handleReport}
          onCancel={() => { setReportTarget(null); setReportReason(""); }}
        />
      )}

      <header className="pt-24 pb-12 bg-white border-b border-slate-100">
        <div className="mx-auto max-w-4xl px-6">
          <button
            onClick={() => {
              const cat = categories.find((c) => c.id === thread.category_id);
              if (cat) openCategory(cat);
              else setView({ type: "categories" });
            }}
            className="group mb-6 inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-primary-600 transition-colors"
          >
            <svg className="h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            Discussion List
          </button>
          <h1 className="text-3xl font-black text-slate-900 mb-4">{thread.title}</h1>
          <div className="flex flex-wrap items-center gap-6 text-[13px] font-bold text-slate-400">
            <span className="flex items-center gap-2">
                <div className={`h-6 w-6 rounded-full ${avatarBg(thread.author_display_name)} flex items-center justify-center text-[10px] text-white`}>
                   {thread.author_display_name?.charAt(0)}
                </div>
                {thread.author_display_name || "Author"}
            </span>
            <span>💬 {thread.reply_count} Replies</span>
            <span>👁 {thread.view_count} Views</span>
            <span>Posted {new Date(thread.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </header>

      <section className="px-6 py-12">
        <div className="mx-auto max-w-4xl space-y-8">
          {/* Main post */}
          <div className="card-modern p-10 bg-white border-slate-200 shadow-md">
            <div className="prose prose-slate max-w-none">
               <p className="text-slate-700 text-[16px] leading-relaxed whitespace-pre-wrap">
                 {thread.body}
               </p>
            </div>
            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
               <button
                 onClick={() => setReportTarget({ thread_id: thread.id })}
                 className="text-[12px] font-bold text-slate-300 hover:text-red-500 transition-colors"
               >
                 REPORT CONTENT
               </button>
            </div>
          </div>

          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
             <h4 className="text-lg font-bold text-slate-900">Conversation</h4>
             {msg && <span className="text-sm font-bold text-primary-600">{msg}</span>}
          </div>

          {/* Replies */}
          {loading ? (
            <div className="space-y-4">
               {[1, 2].map(i => <div key={i} className="shimmer-bg h-24 rounded-2xl" />)}
            </div>
          ) : (
            <div className="space-y-4">
              {replies.map((reply) => (
                <div key={reply.id} className="flex gap-4">
                  <div className={`h-9 w-9 shrink-0 rounded-full ${avatarBg(reply.author_display_name)} flex items-center justify-center text-[11px] font-black text-white shadow-sm ring-4 ring-slate-50`}>
                    {reply.author_display_name?.charAt(0) || "?"}
                  </div>
                  <div className="flex-1 card-modern p-6 bg-white border-slate-100 shadow-sm relative rounded-tl-none">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900">
                        {reply.author_display_name || "Anonymous Member"}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-bold text-slate-400">
                          {new Date(reply.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                        <button
                          onClick={() => setReportTarget({ reply_id: reply.id })}
                          className="text-[10px] font-bold text-slate-200 hover:text-red-500 uppercase tracking-tight"
                        >
                          Report
                        </button>
                      </div>
                    </div>
                    <p className="text-[15px] font-medium leading-relaxed text-slate-600 whitespace-pre-wrap">{reply.body}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reply form redesign */}
          {thread.status === "open" && (
            <div className="card-modern p-8 bg-white border-slate-200 shadow-sm mt-12">
               <h3 className="text-lg font-bold text-slate-900 mb-6 font-primary">Add to conversation</h3>
               {!token ? (
                 <div className="bg-slate-50 rounded-xl p-8 text-center">
                    <p className="text-slate-500 font-medium mb-4">Please register or sign in to participate.</p>
                    <button onClick={() => router.push("/login?next=/forum")} className="btn-primary">Authenticate Account</button>
                 </div>
               ) : (
                 <form onSubmit={(e) => handleCreateReply(e, thread.id)} className="space-y-4">
                   <textarea
                     className="input-modern resize-none"
                     rows={5}
                     placeholder="Type your response..."
                     value={newReplyBody}
                     onChange={(e) => setNewReplyBody(e.target.value)}
                     minLength={10}
                     maxLength={10000}
                     required
                   />
                   <div className="flex items-center justify-end">
                     <button
                       type="submit"
                       disabled={posting}
                       className="btn-primary"
                     >
                       {posting ? "..." : "Send Reply"}
                     </button>
                   </div>
                 </form>
               )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
