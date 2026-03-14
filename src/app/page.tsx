"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getContentBlocks, type ContentBlock } from "@/lib/api";
import { useLanguage } from "@/lib/language-context";

// ── Feature data ─────────────────────────────────────────────────────────────
const features = [
  {
    title: "Community Forum",
    desc: "Connect and engage with thousands of members in moderated discussion spaces.",
    icon: "💬",
    href: "/forum",
    accent: "from-blue-500 to-blue-600",
    light: "bg-blue-50",
    iconBg: "bg-blue-100",
    tag: "Open to all",
    tagColor: "text-blue-700 bg-blue-50 border-blue-200",
  },
  {
    title: "Resource Hub",
    desc: "Verified, multilingual information on education, employment, health, and legal aid.",
    icon: "📚",
    href: "/resources",
    accent: "from-emerald-500 to-teal-600",
    light: "bg-emerald-50",
    iconBg: "bg-emerald-100",
    tag: "Verified",
    tagColor: "text-emerald-700 bg-emerald-50 border-emerald-200",
  },
  {
    title: "Reconnection",
    desc: "Secure tools to help families reconnect across borders with full privacy controls.",
    icon: "🤝",
    href: "/reconnection",
    accent: "from-violet-500 to-purple-600",
    light: "bg-purple-50",
    iconBg: "bg-purple-100",
    tag: "Privacy-first",
    tagColor: "text-purple-700 bg-purple-50 border-purple-200",
  },
  {
    title: "Events Calendar",
    desc: "Discover upcoming conferences, webinars, and community gatherings near you.",
    icon: "📅",
    href: "/events",
    accent: "from-amber-500 to-orange-500",
    light: "bg-amber-50",
    iconBg: "bg-amber-100",
    tag: "Community-led",
    tagColor: "text-amber-700 bg-amber-50 border-amber-200",
  },
  {
    title: "Community Directory",
    desc: "Connect with individuals and organisations within the Myanmar diaspora worldwide.",
    icon: "🌐",
    href: "/diaspora",
    accent: "from-rose-500 to-red-500",
    light: "bg-rose-50",
    iconBg: "bg-rose-100",
    tag: "Global network",
    tagColor: "text-rose-700 bg-rose-50 border-rose-200",
  },
  {
    title: "Latest News",
    desc: "Stay updated with news and announcements relevant to Myanmar communities.",
    icon: "📰",
    href: "/news",
    accent: "from-sky-500 to-cyan-500",
    light: "bg-sky-50",
    iconBg: "bg-sky-100",
    tag: "Trusted sources",
    tagColor: "text-sky-700 bg-sky-50 border-sky-200",
  },
];

const announcements = [
  {
    date: "Mar 2026",
    title: "Platform Beta Launch",
    desc: "Together Myanmar is now open to early community members for testing and feedback.",
    badge: "New",
    badgeCls: "bg-blue-100 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
  },
  {
    date: "Feb 2026",
    title: "Resource Hub Now Live",
    desc: "Browse verified resources across education, legal aid, health, and employment.",
    badge: "Live",
    badgeCls: "bg-emerald-100 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  {
    date: "Jan 2026",
    title: "Community Forum Opened",
    desc: "Join moderated discussion spaces in English and Burmese.",
    badge: "Active",
    badgeCls: "bg-purple-100 text-purple-700 border-purple-200",
    dot: "bg-purple-500",
  },
  {
    date: "Dec 2025",
    title: "Reconnection Module Added",
    desc: "Secure tools to help families reconnect across borders with privacy controls.",
    badge: "Update",
    badgeCls: "bg-amber-100 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
];

const stats = [
  { value: "4+", label: "Languages" },
  { value: "6",  label: "Core Features" },
  { value: "100%", label: "Privacy-First" },
  { value: "24/7", label: "Access" },
];

const trustItems = [
  { icon: "🔒", label: "End-to-end encrypted messages" },
  { icon: "🌐", label: "Available in English & Burmese" },
  { icon: "✅", label: "Verified resources only" },
  { icon: "🤝", label: "Built with community leaders" },
];

// ── CMS defaults ─────────────────────────────────────────────────────────────
const DEFAULTS: Record<string, string> = {
  home_hero_badge:        "Together Myanmar Platform · Phase 1",
  home_hero_title:        "Connecting Myanmar communities,\nsafely across borders.",
  home_hero_subtitle:     "A secure, multilingual platform to help Myanmar diaspora communities access verified resources, reconnect with loved ones, and engage in safe civic life.",
  home_mission_title:     "Our Mission",
  home_mission_body:      "To provide trustworthy information, tools, and spaces centered on safety, dignity, and community for Myanmar people everywhere.\n\nBuilt in partnership with diaspora communities and advisors.",
  home_features_title:    "Everything your community needs",
  home_features_subtitle: "Six core modules built with privacy and safety at the center.",
  home_cta_title:         "Ready to join the community?",
  home_cta_subtitle:      "Connect, share resources, and grow with thousands of members worldwide.",
};

export default function HomePage() {
  const [blocks, setBlocks]       = useState<ContentBlock[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { lang, t } = useLanguage();

  useEffect(() => {
    getContentBlocks().then(setBlocks).catch(() => {});
    setIsLoggedIn(!!localStorage.getItem("access_token"));
  }, []);

  function b(key: string): string {
    const blk  = blocks.find((blk) => blk.key === key);
    const text = lang === "my" ? blk?.body_my : blk?.body_en;
    return text?.trim() || DEFAULTS[key] || "";
  }

  const heroTitle = b("home_hero_title").split("\n");
  const [missionMain, missionSub] = b("home_mission_body").split("\n\n");

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white pt-20 pb-24 lg:pt-32 lg:pb-40 border-b border-slate-100">
        <div className="absolute inset-0 bg-pattern opacity-[0.05] pointer-events-none" />
        <div className="mx-auto max-w-7xl px-6 relative z-10">
          <div className="max-w-4xl">
            <div className="animate-fade-in-up">
              <span className="badge-primary mb-6 py-1 px-3">
                {b("home_hero_badge")}
              </span>
              <h1 className="hero-title mb-8">
                {heroTitle.join(" ")}
              </h1>
              <p className="text-lg md:text-xl text-slate-500 max-w-2xl leading-relaxed mb-10">
                {b("home_hero_subtitle")}
              </p>
              <div className="flex flex-wrap gap-4">
                {isLoggedIn ? (
                  <Link href="/user/profile" className="btn-primary">
                    {t("nav.profile")}
                  </Link>
                ) : (
                  <Link href="/register" className="btn-primary">
                    {t("hero.join")}
                  </Link>
                )}
                <Link href="/resources" className="btn-secondary">
                  {t("hero.explore")}
                </Link>
              </div>
            </div>
            
            <div className="mt-16 flex flex-wrap gap-8 animate-fade-in-up [animation-delay:200ms]">
              {trustItems.map((item) => (
                <div key={item.label} className="flex items-center gap-2.5">
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm font-semibold text-slate-600">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ───────────────────────────────────────────────────────── */}
      <section className="px-6 py-24 bg-slate-50">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl mb-16 px-2">
            <h2 className="section-title mb-4">
              {b("home_features_title")}
            </h2>
            <p className="text-slate-500 text-lg leading-relaxed">
              {b("home_features_subtitle")}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <Link
                key={f.title}
                href={f.href}
                className="card-modern group p-8 flex flex-col justify-between h-full bg-white border-slate-200 shadow-sm"
              >
                <div>
                  <div className="h-12 w-12 rounded-xl bg-primary-50 flex items-center justify-center text-2xl mb-6 shadow-sm ring-1 ring-primary-100 transition-transform group-hover:scale-110">
                    {f.icon}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
                  <p className="text-slate-500 text-[15px] leading-relaxed mb-6">{f.desc}</p>
                </div>
                
                <div className="flex items-center text-primary-600 font-bold text-sm">
                  {t("features.explore")}
                  <svg className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── MISSION & ANNOUNCEMENTS ───────────────────────────────────────────── */}
      <section className="px-6 py-24 bg-white border-y border-slate-100 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-50 -skew-x-12 translate-x-20" />
        <div className="mx-auto max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="badge-modern mb-4 bg-primary-50 text-primary-700 border-none px-3 py-1">Community Values</span>
              <h2 className="section-title mb-6">{b("home_mission_title")}</h2>
              <div className="prose prose-slate max-w-none">
                <p className="text-slate-600 text-lg leading-relaxed mb-6">{missionMain}</p>
                <p className="text-slate-500 leading-relaxed italic">{missionSub}</p>
              </div>
              <div className="mt-10 grid grid-cols-2 gap-4">
                 {stats.map((s) => (
                   <div key={s.label} className="card-modern p-6 bg-slate-50 border-none shadow-none">
                      <p className="text-3xl font-black text-primary-600 mb-1">{s.value}</p>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{s.label}</p>
                   </div>
                 ))}
              </div>
            </div>
            
            <div className="relative group">
              <div className="absolute -inset-4 bg-primary-600/5 rounded-[2rem] blur-2xl group-hover:bg-primary-600/10 transition-colors" />
              <div className="card-modern p-8 relative bg-white border-slate-200">
                <h4 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                   <span className="h-2 w-2 rounded-full bg-primary-600" />
                   Recent Announcements
                </h4>
                <div className="space-y-8 relative">
                   <div className="absolute left-1 top-0 bottom-0 w-px bg-slate-100" />
                   {announcements.slice(0, 3).map((a) => (
                     <div key={a.title} className="relative pl-8">
                        <div className="absolute left-0 top-2 h-2 w-2 rounded-full bg-white border-2 border-primary-600 ring-4 ring-slate-50" />
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                           <span className="text-[11px] font-bold text-slate-400">{a.date}</span>
                           <span className="text-[10px] font-black uppercase tracking-tighter bg-primary-50 text-primary-700 px-1.5 py-0.5 rounded-sm">{a.badge}</span>
                        </div>
                        <h5 className="text-[15px] font-bold text-slate-900 mb-1">{a.title}</h5>
                        <p className="text-sm text-slate-500 line-clamp-2">{a.desc}</p>
                     </div>
                   ))}
                </div>
                <Link href="/news" className="btn-ghost w-full justify-center mt-8 text-sm">
                   View full newsroom →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────────────── */}
      <section className="px-6 py-24 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-pattern opacity-[0.03]" />
        <div className="mx-auto max-w-4xl text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-6">
            {b("home_cta_title")}
          </h2>
          <p className="text-slate-400 text-lg md:text-xl leading-relaxed mb-10 max-w-2xl mx-auto">
            {b("home_cta_subtitle")}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/get-involved" className="btn-primary bg-white text-slate-900 hover:bg-slate-50">
              {t("cta.volunteer")}
            </Link>
            <Link href="/contact" className="btn-secondary bg-transparent border-white/20 text-white hover:bg-white/10 hover:border-white/40">
              {t("cta.contact")}
            </Link>
          </div>
          
          <div className="mt-16 flex flex-wrap justify-center items-center gap-y-4 gap-x-12 opacity-40 border-t border-white/10 pt-12">
             {[
               "🇲🇲 Myanmar-led",
               "🔒 Secure & Private",
               "🌐 Global Network",
               "💙 Support Non-profit"
             ].map((text) => (
                <span key={text} className="text-[13px] font-bold text-white tracking-wide uppercase italic">{text}</span>
             ))}
          </div>
        </div>
      </section>
    </>
  );
}
