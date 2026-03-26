"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getPrograms, type Program, IMAGE_BASE } from "@/lib/api";
import { useLanguage } from "@/lib/language-context";

export default function ProgramsPage() {
  const { lang, t } = useLanguage();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "youth" | "women">("all");

  useEffect(() => {
    setLoading(true);
    getPrograms(activeTab === "all" ? undefined : (activeTab as any))
      .then(setPrograms)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeTab]);

  function getTitle(p: Program) {
    if (lang === "my" && p.title_my) return p.title_my;
    // Current Lang type only supports "en" and "my"
    return p.title_en;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 py-24 text-center">
        <div className="absolute inset-0 bg-pattern opacity-[0.05]" />
        <div className="relative z-10 mx-auto max-w-4xl px-6">
          <span className="badge-primary mb-6 inline-block bg-primary-500 py-1.5 px-4 text-white">
            Community Initiatives
          </span>
          <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl mb-6">
            Programs & Support
          </h1>
          <p className="mx-auto max-w-2xl text-lg font-medium text-slate-400 leading-relaxed">
            Discover tailored initiatives focusing on youth development and women's empowerment within the Myanmar diaspora.
          </p>
        </div>
      </section>

      {/* Tabs */}
      <nav className="sticky top-[64px] z-30 bg-white border-b border-slate-100 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 p-4">
          {(["all", "youth", "women"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-8 py-2.5 text-[13px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab
                  ? "bg-primary-600 text-white shadow-lg shadow-primary-200"
                  : "bg-slate-50 text-slate-500 hover:bg-slate-100"
              }`}
            >
              {tab === "all" ? "All Programs" : tab === "youth" ? "Youth Outreach" : "Women's Empowerment"}
            </button>
          ))}
        </div>
      </nav>

      {/* Programs Grid */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        {loading ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 animate-pulse rounded-3xl bg-slate-50" />
            ))}
          </div>
        ) : programs.length === 0 ? (
          <div className="card-modern border-dashed border-slate-200 py-32 text-center">
            <div className="text-6xl mb-6">🎓</div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">No programs currently active.</h3>
            <p className="text-slate-500 font-medium">Please check back soon or contact us to suggest a new initiative.</p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {programs
              .sort((a, b) => a.display_order - b.display_order)
              .map((p) => (
                <div 
                  key={p.id} 
                  className="card-modern group flex flex-col overflow-hidden bg-white border-slate-200 hover:border-primary-200 transition-all hover:shadow-2xl hover:shadow-primary-100/50"
                >
                  <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                    {p.image_url ? (
                      <img 
                        src={p.image_url.startsWith("http") ? p.image_url : `${IMAGE_BASE}${p.image_url}`} 
                        alt={p.title_en}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-5xl opacity-20 grayscale">
                        {p.category === "youth" ? "🎯" : "💪"}
                      </div>
                    )}
                    <div className={`absolute left-4 top-4 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider shadow-sm ${
                      p.category === "youth" ? "bg-blue-600 text-white" : "bg-primary-600 text-white"
                    }`}>
                      {p.category}
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-8">
                    <h3 className="mb-3 text-xl font-black text-slate-900 leading-tight group-hover:text-primary-600 transition-colors">
                      {getTitle(p)}
                    </h3>
                    <p className="mb-8 text-[15px] font-medium leading-relaxed text-slate-500 line-clamp-3">
                      {p.description_en}
                    </p>
                    
                    <div className="mt-auto space-y-3">
                      {p.event_id && (
                        <Link 
                          href={`/events`}
                          className="flex items-center justify-center gap-2 w-full rounded-2xl bg-slate-900 py-3.5 text-[13px] font-black text-white hover:bg-slate-800 transition-all active:scale-95"
                        >
                          📅 View Linked Event
                        </Link>
                      )}
                      
                      {p.external_url && (
                        <a 
                          href={p.external_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full rounded-2xl border-2 border-slate-100 py-3 text-[13px] font-black text-slate-600 hover:bg-slate-50 hover:border-slate-200 transition-all active:scale-95"
                        >
                          🌐 Program Website
                        </a>
                      )}
                      
                      {!p.event_id && !p.external_url && (
                        <div className="text-[11px] font-black uppercase tracking-widest text-slate-400 italic text-center py-2">
                          More info coming soon
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </section>

      {/* Suggestion Section */}
      <section className="bg-slate-50 py-24 px-6 border-t border-slate-100">
        <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-black text-slate-900 mb-6">Have an Initiative in Mind?</h2>
            <p className="text-lg text-slate-500 mb-10 leading-relaxed font-medium">
              We are constantly looking for new ways to support our youth and women. If you represent an organization or have a program you'd like to feature, get in touch.
            </p>
            <Link href="/contact" className="btn-primary py-4 px-10">
              Propose a Program
            </Link>
        </div>
      </section>
    </div>
  );
}
