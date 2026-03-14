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
      <header className="pt-20 pb-16 border-b border-slate-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-pattern opacity-[0.03] pointer-events-none" />
        <div className="mx-auto max-w-7xl px-6 relative z-10">
          <span className="badge-primary mb-4 py-1 px-3">
             Verified Community Directory
          </span>
          <h1 className="hero-title mb-4">Resource Hub</h1>
          <p className="text-lg text-slate-500 max-w-2xl leading-relaxed mb-8">
            Access multilingual directories for education, employment, health, legal aid, and essential community programs.
          </p>
          
          <div className="flex max-w-xl items-center rounded-2xl bg-slate-50 border border-slate-200 px-5 py-3 shadow-sm focus-within:ring-4 focus-within:ring-primary-500/5 focus-within:border-primary-300 transition-all">
            <span className="mr-4 opacity-40 text-xl">🔍</span>
            <input
              type="text"
              placeholder="Search by keywords, organization, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-[15px] font-medium text-slate-900 placeholder-slate-400 outline-none"
            />
            {search && (
              <button onClick={() => setSearch("")} className="ml-3 text-slate-300 hover:text-slate-500 transition-colors">✕</button>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <section className="bg-slate-50 px-6 py-16">
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
               <h3 className="mb-4 text-xs font-black text-slate-900 uppercase tracking-widest px-2">Geographic Scope</h3>
               <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="input-modern bg-slate-50 border-slate-100"
              >
                <option value="">Global Network</option>
                {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="card-modern p-6 bg-white border-slate-200">
               <h3 className="mb-4 text-xs font-black text-slate-900 uppercase tracking-widest px-2">Delivery Type</h3>
               <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="input-modern bg-slate-50 border-slate-100"
              >
                <option value="">All Formats</option>
                {RESOURCE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="card-modern p-8 bg-primary-900 text-white border-none shadow-xl shadow-primary-100">
               <h3 className="text-sm font-black mb-2 uppercase italic tracking-wider">Help expand the hub</h3>
               <p className="text-primary-200 text-xs font-medium mb-6 leading-relaxed">
                 Contributions help thousands of our members. Share verified resources today.
               </p>
               <Link
                href="/resources/submit"
                className="btn-primary bg-white text-primary-900 hover:bg-primary-50 justify-center w-full py-2"
              >
                Submit Data
              </Link>
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1 min-w-0">
            <div className="mb-8 flex items-center justify-between border-b border-slate-200 pb-4">
              <p className="text-[13px] font-black text-slate-400 uppercase tracking-widest px-2">
                {loading ? "Syncing..." : `${resources.length} Verified Entries`}
              </p>
              {hasFilters && (
                <button
                  onClick={() => { setSelectedCategory(""); setSelectedCountry(""); setSelectedType(""); setSearch(""); }}
                  className="text-[11px] font-black text-primary-600 hover:text-primary-700 uppercase tracking-tighter"
                >
                  Reset Dashboard
                </button>
              )}
            </div>

            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-48 animate-pulse rounded-2xl bg-white border border-slate-100" />
                ))}
              </div>
            ) : resources.length === 0 ? (
              <div className="card-modern py-32 bg-white border-dashed border-slate-200 text-center">
                <div className="text-5xl mb-6 opacity-20">📬</div>
                <p className="text-xl font-bold text-slate-900 mb-2">No matching resources</p>
                <p className="text-slate-500 font-medium mb-8">
                  Try adjusting your filters or search terms.
                </p>
                <Link href="/resources/submit" className="btn-primary">Suggest a Resource</Link>
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
