"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getNews, getNewsCategories, type NewsPost, type NewsCategory, IMAGE_BASE } from "@/lib/api";
import { useLanguage } from "@/lib/language-context";

const CATEGORY_ICONS: Record<string, string> = {
  announcements: "📢",
  community: "🌍",
  resources: "📚",
  events: "📅",
  alerts: "📰",
};

const CATEGORY_COLORS: Record<string, string> = {
  announcements: "bg-blue-50 text-blue-700",
  community: "bg-emerald-50 text-emerald-700",
  resources: "bg-indigo-50 text-indigo-700",
  events: "bg-amber-50 text-amber-700",
  alerts: "bg-red-50 text-red-700",
};

function localTitle(post: NewsPost, lang: string): string {
  if (lang === "my" && post.title_my) return post.title_my;
  return post.title_en;
}

function localBody(post: NewsPost, lang: string): string {
  if (lang === "my" && post.body_my) return post.body_my;
  return post.body_en;
}

function excerpt(text: string): string {
  if (text.length <= 180) return text;
  return text.slice(0, 180).trimEnd() + "…";
}

const PAGE_SIZE = 10;

function NewsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { lang } = useLanguage();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [catSlug, setCatSlug] = useState(searchParams.get("category") ?? "");
  const [sort, setSort] = useState(searchParams.get("sort") ?? "newest");
  const [page, setPage] = useState(Number(searchParams.get("page") ?? "1"));

  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputSearch, setInputSearch] = useState(search);
  const [yearFilter, setYearFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  useEffect(() => {
    getNewsCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    getNews({
      search: search || undefined,
      category_slug: catSlug || undefined,
      sort,
      page,
      limit: PAGE_SIZE,
    })
      .then((res) => { setPosts(res.posts); setTotal(res.total); })
      .catch(() => { setPosts([]); setTotal(0); })
      .finally(() => setLoading(false));
  }, [search, catSlug, sort, page]);

  useEffect(() => {
    const qs = new URLSearchParams();
    if (search) qs.set("search", search);
    if (catSlug) qs.set("category", catSlug);
    if (sort !== "newest") qs.set("sort", sort);
    if (page > 1) qs.set("page", String(page));
    const newUrl = `/news${qs.toString() ? "?" + qs.toString() : ""}`;
    router.replace(newUrl, { scroll: false });
  }, [search, catSlug, sort, page]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(inputSearch);
    setPage(1);
  }

  function selectCat(slug: string) {
    setCatSlug(slug);
    setPage(1);
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <header className="pt-20 pb-16 border-b border-slate-100 relative overflow-hidden bg-slate-50">
        <div className="absolute inset-0 bg-pattern opacity-[0.03] pointer-events-none" />
        <div className="mx-auto max-w-7xl px-6 relative z-10 flex flex-col items-center text-center">
          <span className="badge-primary mb-4 py-1 px-3 inline-block">
             Together Myanmar Newsroom
          </span>
          <h1 className="hero-title mb-4">Myanmar Community News</h1>
          <p className="text-lg text-slate-600 max-w-3xl leading-relaxed mb-6">
             The Together Myanmar Newsroom shares verified updates, community stories, and important announcements from across the global Myanmar diaspora.
          </p>
          <p className="text-sm font-bold text-emerald-600 mb-8 flex items-center justify-center gap-2">
            <span className="text-lg">🛡️</span> All content is reviewed to ensure accuracy and responsible reporting.
          </p>

          <div className="mt-2 flex flex-col items-center">
             <Link href="/contact" className="btn-primary shadow-xl shadow-primary-500/20 py-4 px-10 text-[15px]">
               Submit a Story
             </Link>
             <p className="text-[14px] font-medium text-slate-500 mt-4 max-w-sm">
               Community members can share verified news, updates, and stories from Myanmar communities worldwide.
             </p>
          </div>
        </div>
      </header>

      {/* Filter Bar */}
      <section className="sticky top-[64px] z-20 border-b border-slate-100 bg-white/80 backdrop-blur-md px-6 py-4">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center gap-4">
          <form onSubmit={handleSearch} className="flex-1 min-w-[280px] flex gap-2">
            <div className="relative flex-1">
               <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30">🔍</span>
               <input
                 type="search"
                 value={inputSearch}
                 onChange={(e) => setInputSearch(e.target.value)}
                 placeholder="Search the archive..."
                 className="input-modern pl-10 h-10 py-1"
               />
            </div>
            {(search || catSlug) && (
              <button
                type="button"
                onClick={() => { setSearch(""); setInputSearch(""); setCatSlug(""); setPage(1); }}
                className="btn-ghost text-xs px-3"
              >
                Clear
              </button>
            )}
          </form>
          
          <div className="flex flex-wrap items-center gap-3 ml-auto">
             <select
               value={yearFilter}
               onChange={(e) => setYearFilter(e.target.value)}
               className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white outline-none focus:border-primary-300"
             >
               <option value="">Any Year</option>
               <option value="2026">2026</option>
               <option value="2025">2025</option>
             </select>
             <select
               value={locationFilter}
               onChange={(e) => setLocationFilter(e.target.value)}
               className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white outline-none focus:border-primary-300"
             >
               <option value="">Global</option>
               <option value="asia">Asia</option>
               <option value="na">North America</option>
             </select>
             <select
               value={sort}
               onChange={(e) => { setSort(e.target.value); setPage(1); }}
               className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-50 outline-none focus:border-primary-300 ml-2"
             >
               <option value="newest">Latest Updates</option>
               <option value="oldest">Oldest</option>
               <option value="az">Alphabetic</option>
             </select>
          </div>
        </div>
        
        <div className="mx-auto max-w-7xl flex flex-wrap gap-2 mt-4">
          <button
            onClick={() => selectCat("")}
            className={`rounded-full px-4 py-1.5 text-[11px] font-black uppercase tracking-widest transition-all ${
               catSlug === "" ? "bg-primary-600 text-white shadow-md" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            ALL CATEGORIES
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => selectCat(cat.slug)}
              className={`rounded-full px-4 py-1.5 text-[11px] font-black uppercase tracking-widest transition-all ${
                catSlug === cat.slug ? "bg-primary-600 text-white shadow-md" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {lang === "my" && cat.name_my ? cat.name_my : cat.name_en}
              {" "}
              <span className="opacity-50 font-normal ml-1">({cat.post_count})</span>
            </button>
          ))}
        </div>
      </section>

      {/* Articles */}
      <section className="bg-slate-50 px-6 py-16 min-h-[500px]">
        <div className="mx-auto max-w-5xl">

          {!loading && posts.length > 0 && page === 1 && !search && (
            <div className="mb-10 flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Featured & Latest Updates</h2>
            </div>
          )}

          {loading ? (
            <div className="space-y-6">
               {[1, 2, 3].map(i => <div key={i} className="h-48 animate-pulse bg-white border border-slate-100 rounded-2xl" />)}
            </div>
          ) : posts.length === 0 ? (
            <div className="card-modern py-24 bg-white border-slate-200 text-center shadow-sm">
              <div className="text-6xl mb-6">📰</div>
              <p className="text-2xl font-black text-slate-900 mb-3 tracking-tight">No news articles published yet.</p>
              <p className="text-slate-500 font-medium text-lg mb-8 max-w-md mx-auto">Updates and community stories will appear here soon.</p>
              {search || catSlug ? (
                <button onClick={() => { setSearch(""); setCatSlug(""); }} className="btn-secondary">Clear Filters</button>
              ) : (
                <Link href="/contact" className="btn-primary">Submit a Story</Link>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post, idx) => {
                const title = localTitle(post, lang);
                const body = localBody(post, lang);
                const firstCat = post.categories[0];
                const catCls = firstCat ? (CATEGORY_COLORS[firstCat.slug] || "bg-slate-100 text-slate-600") : "bg-slate-100 text-slate-600";
                const isFeatured = idx === 0 && page === 1 && !search && !catSlug;

                return (
                  <Link
                    key={post.id}
                    href={`/news/${post.id}`}
                    className={`card-modern group overflow-hidden bg-white border-slate-200 shadow-sm transition-all hover:border-primary-200 hover:shadow-md flex flex-col md:flex-row ${isFeatured ? 'md:ring-2 md:ring-primary-500/10' : ''}`}
                  >
                    {isFeatured && (
                       <div className="md:w-3 bg-primary-600 shrink-0" />
                    )}
                    
                    {/* Thumbnail */}
                    <div className="relative h-48 w-full shrink-0 overflow-hidden bg-slate-100 md:h-auto md:w-56 lg:w-72">
                      {post.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                          src={`${IMAGE_BASE}${post.image_url}`} 
                          alt={title} 
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-4xl opacity-20 grayscale">
                          {CATEGORY_ICONS[post.categories[0]?.slug] || "📰"}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>

                    <div className="p-8 flex-1 flex flex-col">
                        <div className="mb-4 flex flex-wrap items-center gap-2">
                          {isFeatured && (
                             <span className="badge-modern bg-primary-900 text-white border-none py-1 px-3 text-[10px] font-black uppercase tracking-wider">🌟 Featured Story</span>
                          )}
                          {post.categories.map((cat) => {
                             const slug = cat.slug.toLowerCase();
                             const icon = CATEGORY_ICONS[slug] || "📰";
                             return (
                               <span key={cat.id} className={`badge-modern border-none flex items-center gap-1.5 py-1 px-3 text-[10px] font-black uppercase tracking-wider ${CATEGORY_COLORS[slug] || "bg-slate-100 text-slate-600"}`}>
                                 <span>{icon}</span>
                                 {lang === "my" && cat.name_my ? cat.name_my : cat.name_en}
                               </span>
                             )
                          })}
                        </div>
                      
                      <h2 className={`font-black text-slate-900 transition-colors group-hover:text-primary-600 leading-tight mb-3 ${isFeatured ? 'text-2xl md:text-3xl' : 'text-xl'}`}>
                        {title}
                      </h2>
                      
                      <p className="text-slate-500 text-[15px] leading-relaxed font-medium mb-6">
                         {excerpt(body)}
                      </p>
                      
                      <footer className="mt-auto flex flex-col sm:flex-row sm:items-center justify-between pt-6 border-t border-slate-50 gap-4">
                        <div className="flex items-center gap-4 text-[12px] font-bold text-slate-500">
                           <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                              <span className="opacity-50 text-[14px]">✍️</span>
                              By {post.author_name ? post.author_name : "Together Myanmar Editorial Team"}
                           </span>
                           {post.published_at && (
                             <span className="text-slate-400">
                                {new Date(post.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                             </span>
                           )}
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                          <div className="flex gap-2 text-slate-300">
                            <span className="cursor-pointer hover:text-blue-500 transition-colors" title="Share on Facebook">👤</span>
                            <span className="cursor-pointer hover:text-slate-900 transition-colors" title="Share on X">🐦</span>
                            <span className="cursor-pointer hover:text-blue-700 transition-colors" title="Share on LinkedIn">💼</span>
                            <span className="cursor-pointer hover:text-emerald-500 transition-colors" title="Share on WhatsApp">💬</span>
                          </div>
                          <span className="text-[12px] font-black text-primary-600 uppercase tracking-widest flex items-center gap-1.5 transition-transform group-hover:translate-x-1">
                             Read More
                             <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                               <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                             </svg>
                          </span>
                        </div>
                      </footer>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-16 flex items-center justify-center gap-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="btn-secondary h-10 w-10 p-0 justify-center rounded-xl disabled:opacity-30"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`h-10 w-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${
                    p === page ? "bg-primary-600 text-white shadow-lg shadow-primary-200 scale-110" : "bg-white text-slate-500 border border-slate-200 hover:border-primary-300"
                  }`}
                >
                  {p}
                </button>
              ))}
              
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="btn-secondary h-10 w-10 p-0 justify-center rounded-xl disabled:opacity-30"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Community Voices & Newsletter */}
      <section className="bg-white px-6 py-20 border-t border-slate-100">
        <div className="mx-auto max-w-5xl grid md:grid-cols-2 gap-12">
           <div className="card-modern bg-slate-50 border-slate-200 p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                 <span className="text-3xl">🗣️</span>
                 <h2 className="text-xl font-black text-slate-900">Community Voices</h2>
              </div>
              <p className="text-slate-500 font-medium text-[15px] leading-relaxed mb-6">
                Are you part of the Myanmar diaspora with a story to tell? Share your personal stories, community achievements, and local initiatives.
              </p>
              <Link href="/contact" className="btn-secondary w-full justify-center bg-white">Submit Your Story</Link>
           </div>
           
            <div className="card-modern bg-gradient-to-br from-primary-900 to-primary-800 border-none p-8 shadow-xl shadow-primary-200 text-white relative overflow-hidden">
               <div className="absolute -right-4 -top-4 text-8xl opacity-10 rotate-12">✉️</div>
               <h2 className="text-xl font-black mb-3 relative z-10 text-white">Subscribe to Updates</h2>
              <p className="text-primary-100 font-medium text-[15px] leading-relaxed mb-6 relative z-10">
                Receive the best community news, event updates, and stories right in your inbox. No spam.
              </p>
              <form className="flex gap-2 relative z-10">
                <input type="email" placeholder="Email Address..." className="input-modern bg-white/10 border-white/20 text-white placeholder-white/50 w-full" />
                <button type="button" className="btn-primary bg-white text-primary-900 hover:bg-primary-50 px-6">Join</button>
              </form>
           </div>
        </div>
      </section>
    </div>
  );
}

export default function NewsPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[50vh] items-center justify-center text-slate-400 font-bold uppercase tracking-widest text-xs">Syncing Archive...</div>}>
      <NewsPageInner />
    </Suspense>
  );
}
