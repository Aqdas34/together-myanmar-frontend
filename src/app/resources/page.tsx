"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getResourceCategories, getResources, ResourceCategory, Resource } from "@/lib/api";

const CAT_META: Record<string, { icon: string; color: string; border: string; accent: string }> = {
  education:           { icon: "🎓", color: "text-blue-700",   border: "border-blue-200 bg-blue-50",   accent: "bg-blue-500" },
  employment:          { icon: "💼", color: "text-emerald-700", border: "border-emerald-200 bg-emerald-50", accent: "bg-emerald-500" },
  "legal-aid":         { icon: "⚖️",  color: "text-amber-700",  border: "border-amber-200 bg-amber-50",  accent: "bg-amber-500" },
  health:              { icon: "🏥", color: "text-rose-700",   border: "border-rose-200 bg-rose-50",   accent: "bg-rose-500" },
  "community-programs":{ icon: "🤝", color: "text-indigo-700", border: "border-indigo-200 bg-indigo-50", accent: "bg-indigo-500" },
};
const DEFAULT_META = { icon: "📄", color: "text-slate-700", border: "border-slate-200 bg-slate-50", accent: "bg-slate-400" };

const RESOURCE_TYPES = ["Online", "In-Person", "Hotline", "Document", "Organization"];
const COUNTRIES = [
  "Thailand", "Malaysia", "Singapore", "Japan", "South Korea",
  "Australia", "United Kingdom", "United States", "Germany", "Other",
];

function ResourceCard({ resource, category }: { resource: Resource; category?: ResourceCategory }) {
  const meta = category ? (CAT_META[category.slug] ?? DEFAULT_META) : DEFAULT_META;
  return (
    <div className="card-modern group flex flex-col overflow-hidden bg-white border-slate-200 shadow-sm transition-all hover:border-primary-200 hover:shadow-md">
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-4 flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`badge-modern flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${meta.border} ${meta.color} border-none`}>
              <span className="text-sm leading-none">{meta.icon}</span>
              {category?.name_en ?? "Resource"}
            </span>
            {resource.is_verified && (
              <span className="badge-modern bg-primary-100 text-primary-700 border-none px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider">
                ✓ Verified
              </span>
            )}
          </div>
          {resource.resource_type && (
            <span className="shrink-0 text-[10px] font-black text-slate-400 uppercase tracking-tighter bg-slate-50 px-2 py-1 rounded border border-slate-100">
               {resource.resource_type}
            </span>
          )}
        </div>
        <h3 className="text-[17px] font-black text-slate-900 group-hover:text-primary-600 transition-colors mb-2 leading-snug">
           {resource.title_en}
        </h3>
        {resource.title_my && <p className="mb-2 text-[13px] font-bold text-slate-400 italic">{resource.title_my}</p>}
        <p className="mb-6 line-clamp-2 flex-1 text-sm text-slate-500 font-medium leading-relaxed">
           {resource.description_en}
        </p>
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
          {resource.country && (
             <span className="text-[12px] font-bold text-slate-400 flex items-center gap-1">
                📍 {resource.country}
             </span>
          )}
          <div className="ml-auto flex gap-2">
            <Link
              href={`/resources/${resource.id}`}
              className="btn-ghost py-1.5 px-3 text-[12px]"
            >
              Details
            </Link>
            <a
              href={resource.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary py-1.5 px-4 text-[12px] shadow-none"
            >
              Access Hub →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResourcesPage() {
  const [categories, setCategories] = useState<ResourceCategory[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | "">("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedType, setSelectedType] = useState("");

  useEffect(() => {
    getResourceCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    getResources({
      category_id: selectedCategory !== "" ? (selectedCategory as number) : undefined,
      country: selectedCountry || undefined,
      resource_type: selectedType || undefined,
      search: debouncedSearch || undefined,
    })
      .then(setResources)
      .catch(() => setResources([]))
      .finally(() => setLoading(false));
  }, [selectedCategory, selectedCountry, selectedType, debouncedSearch]);

  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c]));
  const hasFilters = selectedCategory !== "" || selectedCountry || selectedType || search;

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <header className="pt-20 pb-16 border-b border-slate-100 relative overflow-hidden bg-slate-50">
        <div className="absolute inset-0 bg-pattern opacity-[0.03] pointer-events-none" />
        <div className="mx-auto max-w-7xl px-6 relative z-10 text-center md:text-left">
          <span className="badge-primary mb-4 py-1 px-3 inline-block">
             Together Myanmar
          </span>
          <h1 className="hero-title mb-4">Community Resource Hub</h1>
          <p className="text-lg text-slate-600 max-w-3xl leading-relaxed mb-6 mx-auto md:mx-0">
            The Together Myanmar Resource Hub connects Myanmar communities worldwide with trusted information on education, employment, legal aid, health services, and community programs.
          </p>
          <p className="text-sm font-bold text-emerald-600 mb-8 flex items-center justify-center md:justify-start gap-2">
            <span className="text-lg">🛡️</span> All submissions are reviewed to ensure accuracy and community safety.
          </p>
          
          <div className="flex max-w-xl mx-auto md:mx-0 items-center rounded-2xl bg-white border border-slate-200 px-5 py-3 shadow-sm focus-within:ring-4 focus-within:ring-primary-500/5 focus-within:border-primary-300 transition-all">
            <span className="mr-4 opacity-40 text-xl">🔍</span>
            <input
              type="text"
              placeholder="Search by keyword, organization, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-[15px] font-medium text-slate-900 placeholder-slate-400 outline-none w-full"
            />
            {search && (
              <button onClick={() => setSearch("")} className="ml-3 text-slate-300 hover:text-slate-500 transition-colors">✕</button>
            )}
          </div>
          <p className="text-xs text-slate-500 font-medium mt-3 ml-2 italic text-center md:text-left">Search by keyword, organization name, or location.</p>
        </div>
      </header>

      {/* Categories Visual Icons */}
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 lg:gap-8">
            <button onClick={() => { setSelectedCategory(""); document.getElementById("directory")?.scrollIntoView({ behavior: "smooth" }); }} className="flex flex-col items-center gap-2 group">
              <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm transition-transform group-hover:-translate-y-1 ${selectedCategory === "" ? "bg-primary-600 text-white" : "bg-slate-50 border border-slate-200"}`}>🌐</div>
              <span className={`text-xs font-bold uppercase tracking-tight ${selectedCategory === "" ? "text-primary-600" : "text-slate-500"}`}>All</span>
            </button>
            {categories.map((cat) => {
              const m = CAT_META[cat.slug] ?? DEFAULT_META;
              const isSelected = selectedCategory === cat.id;
              return (
                <button key={cat.id} onClick={() => { setSelectedCategory(cat.id); document.getElementById("directory")?.scrollIntoView({ behavior: "smooth" }); }} className="flex flex-col items-center gap-2 group">
                  <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm transition-transform group-hover:-translate-y-1 ${isSelected ? "bg-primary-600 text-white" : "bg-white border border-slate-200"}`}>
                    {m.icon}
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-tight ${isSelected ? "text-primary-600" : "text-slate-500"}`}>{cat.name_en}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Resources Starter (Static examples while DB empty) */}
      {!hasFilters && resources.length === 0 && !loading && (
        <section className="bg-amber-50/50 border-b border-amber-100 px-6 py-12">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center gap-3 mb-8">
              <span className="text-2xl">⭐</span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Featured Resources</h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { title: "Myanmar Refugee Legal Aid", cat: "Legal Aid", icon: "⚖️", type: "Organization", loc: "Thailand", desc: "Free legal consultations and visa assistance for displaced individuals.", url: "#" },
                { title: "Diaspora Tech Scholarship", cat: "Education", icon: "🎓", type: "Online", loc: "Global", desc: "Full-tuition scholarships for Myanmar youth in computer science.", url: "#" },
                { title: "TeleHealth Myanmar", cat: "Health", icon: "🏥", type: "Hotline", loc: "Online", desc: "24/7 mental health hotline and telemedicine consultations.", url: "#" },
              ].map((r, i) => (
                <div key={i} className="card-modern bg-white p-6 shadow-sm border border-slate-200 flex flex-col">
                   <div className="flex items-center gap-2 mb-3">
                     <span className="text-xl">{r.icon}</span>
                     <span className="badge-modern bg-slate-100 text-slate-600 text-[10px] uppercase border-none tracking-widest px-2 py-0.5">{r.cat}</span>
                   </div>
                   <h3 className="text-lg font-black text-slate-900 mb-1 leading-snug">{r.title}</h3>
                   <p className="text-xs text-slate-400 font-bold mb-3 flex items-center gap-2"><span>{r.type}</span> • <span>📍 {r.loc}</span></p>
                   <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6 flex-1">{r.desc}</p>
                   <a href={r.url} className="btn-primary w-full justify-center py-2 text-xs">Access Hub →</a>
                </div>
              ))}
            </div>
           </div>
        </section>
      )}

      {/* Content */}
      <section id="directory" className="bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-7xl flex flex-col gap-10 lg:flex-row">

          {/* Sidebar */}
          <aside className="w-full shrink-0 space-y-6 lg:w-64">
            <div className="card-modern p-6 bg-white border-slate-200">
              <h3 className="mb-4 text-xs font-black text-slate-900 uppercase tracking-widest px-2">Knowledge Domains</h3>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory("")}
                  className={`w-full rounded-xl px-4 py-2.5 text-left text-sm font-bold transition-all ${
                    selectedCategory === "" 
                      ? "bg-primary-600 text-white shadow-md shadow-primary-200" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => {
                  const m = CAT_META[cat.slug] ?? DEFAULT_META;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full rounded-xl px-4 py-2.5 text-left text-sm font-bold transition-all ${
                        selectedCategory === cat.id 
                          ? "bg-primary-600 text-white shadow-md shadow-primary-200" 
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <span className="mr-2 opacity-70">{m.icon}</span>
                      {cat.name_en}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="card-modern p-6 bg-white border-slate-200">
               <h3 className="mb-2 text-xs font-black text-slate-900 uppercase tracking-widest px-2">Geographic Scope</h3>
               <p className="text-[11px] font-medium text-slate-500 px-2 mb-4 leading-relaxed italic">Filter resources by region or country.</p>
               <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="input-modern bg-slate-50 border-slate-100 font-bold text-sm"
              >
                <option value="">Global Network</option>
                {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="card-modern p-6 bg-white border-slate-200">
               <h3 className="mb-2 text-xs font-black text-slate-900 uppercase tracking-widest px-2">Delivery Type</h3>
               <p className="text-[12px] font-medium text-slate-500 px-2 mb-4 leading-relaxed italic">
                 • Online<br/>
                 • In-person<br/>
                 • Hybrid<br/>
                 • Hotline
               </p>
               <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="input-modern bg-slate-50 border-slate-100 font-bold text-sm"
              >
                <option value="">All Formats</option>
                {RESOURCE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="card-modern p-8 bg-gradient-to-br from-primary-900 to-primary-800 text-white border-none shadow-xl shadow-primary-200 relative overflow-hidden">
               <div className="absolute -right-6 -top-6 text-7xl opacity-10 rotate-12">🤝</div>
               <h3 className="text-xl font-black mb-3 tracking-tight leading-snug relative z-10 text-white">Help Expand the Resource Hub</h3>
               <p className="text-primary-100 text-[13px] font-medium mb-8 leading-relaxed relative z-10">
                 This directory grows through community contributions. Share trusted resources to support Myanmar communities worldwide.
               </p>
               <Link
                href="/resources/submit"
                className="btn-primary bg-white text-primary-900 border-none hover:bg-primary-50 hover:scale-[1.02] transition-all justify-center w-full py-3.5 text-sm font-bold relative z-10 shadow-lg"
              >
                Submit a Resource
              </Link>
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1 min-w-0">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-4">
              <p className="text-[13px] font-black text-slate-600 tracking-tight px-2">
                {loading ? "Loading directory..." : resources.length > 0 ? `${resources.length} Verified Entries Found` : "Directory Catalog"}
              </p>
              <div className="flex items-center gap-4 px-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Last updated: March 2026</span>
                {hasFilters && (
                  <button
                    onClick={() => { setSelectedCategory(""); setSelectedCountry(""); setSelectedType(""); setSearch(""); }}
                    className="text-[11px] font-black text-primary-600 hover:text-primary-700 uppercase tracking-tighter bg-primary-50 px-3 py-1.5 rounded-full"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            </div>

            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-48 animate-pulse rounded-2xl bg-white border border-slate-100" />
                ))}
              </div>
            ) : resources.length === 0 ? (
              <div className="card-modern py-24 bg-white border-slate-200 text-center shadow-sm">
                <div className="text-6xl mb-6">📭</div>
                {hasFilters ? (
                  <>
                    <p className="text-2xl font-black text-slate-900 mb-3">No resources found</p>
                    <p className="text-slate-500 font-medium text-lg mb-8 max-w-md mx-auto">
                      Try adjusting filters or submit a new resource to the directory.
                    </p>
                    <button onClick={() => { setSelectedCategory(""); setSelectedCountry(""); setSelectedType(""); setSearch(""); }} className="btn-secondary mr-3">Clear Filters</button>
                    <Link href="/resources/submit" className="btn-primary">Submit a Resource</Link>
                  </>
                ) : (
                  <>
                    <p className="text-2xl font-black text-slate-900 mb-3 tracking-tight">We are currently building the resource hub.</p>
                    <p className="text-slate-500 font-medium text-lg mb-10 max-w-lg mx-auto leading-relaxed">
                      Verified community resources will appear here soon. If you know of a trusted organization or service, you can help by adding it.
                    </p>
                    <Link href="/resources/submit" className="btn-primary py-3 px-8 text-[15px] shadow-md shadow-primary-200">Submit a Resource</Link>
                  </>
                )}
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {resources.map((r) => (
                  <ResourceCard key={r.id} resource={r} category={categoryMap[r.category_id]} />
                ))}
              </div>
            )}
          </main>
        </div>
      </section>
    </div>
  );
}
