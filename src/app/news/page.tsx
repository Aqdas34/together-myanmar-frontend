"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getNews, getNewsCategories, type NewsPost, type NewsCategory } from "@/lib/api";
import { useLanguage } from "@/lib/language-context";

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
      <header className="pt-20 pb-16 border-b border-slate-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-pattern opacity-[0.03] pointer-events-none" />
        <div className="mx-auto max-w-7xl px-6 relative z-10">
          <span className="badge-primary mb-4 py-1 px-3">
             Community Newsroom
          </span>
          <h1 className="hero-title mb-4">News & Updates</h1>
          <p className="text-lg text-slate-500 max-w-2xl leading-relaxed">
             Verified information, community stories, and global announcements from our moderated news network.
          </p>
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
          
          <div className="flex items-center gap-3 ml-auto">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order:</span>
             <select
               value={sort}
               onChange={(e) => { setSort(e.target.value); setPage(1); }}
               className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-50 outline-none focus:border-primary-300"
             >
               <option value="newest">Chronological</option>
               <option value="oldest">Historical</option>
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
          {loading ? (
            <div className="space-y-6">
               {[1, 2, 3].map(i => <div key={i} className="h-48 animate-pulse bg-white border border-slate-100 rounded-2xl" />)}
            </div>
          ) : posts.length === 0 ? (
            <div className="card-modern py-32 bg-white border-dashed border-slate-200 text-center">
              <div className="text-5xl mb-6 opacity-20">📰</div>
              <p className="text-xl font-bold text-slate-900 mb-2">Archive empty</p>
              <p className="text-slate-500 font-medium">Try broadening your search or selection.</p>
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
                    <div className="p-8 flex-1">
                      <div className="mb-4 flex flex-wrap items-center gap-2">
                        {isFeatured && (
                           <span className="badge-modern bg-primary-900 text-white border-none py-1 px-2.5 text-[10px] font-black">FEATURED REPORT</span>
                        )}
                        {post.categories.map((cat) => (
                           <span key={cat.id} className={`badge-modern border-none py-1 px-3 text-[10px] font-black uppercase tracking-wider ${CATEGORY_COLORS[cat.slug] || "bg-slate-100 text-slate-600"}`}>
                             {lang === "my" && cat.name_my ? cat.name_my : cat.name_en}
                           </span>
                        ))}
                      </div>
                      
                      <h2 className={`font-black text-slate-900 transition-colors group-hover:text-primary-600 leading-tight mb-3 ${isFeatured ? 'text-2xl md:text-3xl' : 'text-xl'}`}>
                        {title}
                      </h2>
                      
                      <p className="text-slate-500 text-[15px] leading-relaxed font-medium mb-6">
                         {excerpt(body)}
                      </p>
                      
                      <footer className="mt-auto flex items-center justify-between pt-6 border-t border-slate-50">
                        <div className="flex items-center gap-4 text-[12px] font-bold text-slate-400">
                           {post.author_name && (
                             <span className="flex items-center gap-1.5">
                                <div className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-400">
                                   {post.author_name.charAt(0)}
                                </div>
                                {post.author_name}
                             </span>
                           )}
                           {post.published_at && (
                             <span>
                                {new Date(post.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                             </span>
                           )}
                        </div>
                        <span className="text-[12px] font-black text-primary-600 uppercase tracking-widest flex items-center gap-1.5 transition-transform group-hover:translate-x-1">
                           Full Story
                           <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                             <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                           </svg>
                        </span>
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
