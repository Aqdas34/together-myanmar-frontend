"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getContentBlocks, getAdvisoryMembers, getTestimonials,
  type ContentBlock, type AdvisoryMember, type Testimonial,
} from "@/lib/api";

const DEFAULT_BLOCKS: Record<string, { title: string; body: string }> = {
  about_mission: {
    title: "Our Mission",
    body: "Together Myanmar is dedicated to strengthening connections within Myanmar diaspora communities by providing a secure, multilingual platform where individuals can safely connect, share resources, and support one another across borders.",
  },
  about_vision: {
    title: "Our Vision",
    body: "We envision a connected global Myanmar diaspora that supports one another through civic engagement, cultural exchange, and mutual aid — while maintaining the highest standards of privacy, security, and cultural respect.",
  },
  about_story: {
    title: "The Project Genesis",
    body: "Together Myanmar was born from years of witnessing Myanmar communities abroad struggle to find reliable, safe spaces for connection and information. Following the 2021 crisis, diaspora groups across Thailand, Malaysia, Australia, the UK, and beyond found themselves scattered and under-resourced.\n\nA coalition of engineers, community organisers, and digital rights advocates came together with one goal: build a platform that puts community safety first. Every feature was designed with input from real diaspora members — because the people who use it know best what they need.\n\nToday, thousands of Myanmar people in over 20 countries use Together Myanmar to find legal aid, reconnect with family, and engage in safe civic life.",
  },
};

const DEFAULT_ADVISORY: AdvisoryMember[] = [
  { id: 1, name: "Daw Aye Thida", role: "Community Advisor", bio: "20 years of community organising across Thailand and the UK. Former coordinator at the Burma Campaign.", image_url: null, category: "advisor", display_order: 0, is_active: true },
  { id: 2, name: "Ko Myo Thant", role: "Digital Rights Advisor", bio: "Security researcher and digital rights specialist. Advises on platform safety architecture and threat modelling.", image_url: null, category: "advisor", display_order: 1, is_active: true },
  { id: 3, name: "Ma Wai Phyo", role: "Legal Aid Consultant", bio: "Human rights lawyer specialising in refugee and asylum law. Guides our legal resource library.", image_url: null, category: "advisor", display_order: 2, is_active: true },
  { id: 4, name: "AAPP Burma", role: "Partner Organisation", bio: "Assistance Association for Political Prisoners — documenting abuses and supporting political prisoners and their families.", image_url: null, category: "partner", display_order: 3, is_active: true },
  { id: 5, name: "Fortify Rights", role: "Partner Organisation", bio: "Human rights organisation dedicated to investigating and exposing abuses — providing evidence and expertise to inform our content.", image_url: null, category: "partner", display_order: 4, is_active: true },
  { id: 6, name: "Burma Link", role: "Partner Organisation", bio: "Amplifying the voices of marginalised communities with a focus on ethnic minority rights and media freedom.", image_url: null, category: "partner", display_order: 5, is_active: true },
];

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  { id: 1, author_name: "Kyaw Zin Thant", author_location: "Chiang Mai, Thailand", quote_en: "Before Together Myanmar I had no way to safely contact my family back home. The reconnection module changed everything for us.", quote_my: "", is_active: true, display_order: 0 },
  { id: 2, author_name: "Su Su Htwe", author_location: "Kuala Lumpur, Malaysia", quote_en: "The legal aid resources are the most comprehensive I have found in Burmese. It helped me understand my rights as a refugee.", quote_my: "", is_active: true, display_order: 1 },
  { id: 3, author_name: "Aung Myo", author_location: "Melbourne, Australia", quote_en: "I found my community here. The forum is respectful, safe, and genuinely multilingual — something very rare.", quote_my: "", is_active: true, display_order: 2 },
];

const VALUES = [
  { icon: "🛡️", title: "Safety First", desc: "Privacy and security are foundational to every decision we make." },
  { icon: "🌍", title: "Inclusivity", desc: "Welcoming all Myanmar voices while respecting cultural and linguistic diversity." },
  { icon: "❤️", title: "Community-Driven", desc: "Designed with and for diaspora communities — not for them." },
  { icon: "🔍", title: "Transparency", desc: "Clear governance and policies that respect user rights." },
  { icon: "📖", title: "Verified Hub", desc: "Curated, fact-checked resources to combat misinformation." },
  { icon: "💪", title: "Empowerment", desc: "Tools that enable communities to support each other across borders." },
];

const WHO_WE_SERVE = [
  { flag: "🇹🇭", country: "Thailand", desc: "The largest Myanmar diaspora community — over 2 million people in border regions and urban centres." },
  { flag: "🇲🇾", country: "Malaysia", desc: "Significant displaced populations seeking safety, employment, and legal support." },
  { flag: "🇸🇬", country: "Singapore", desc: "Professional diaspora and students navigating documentation and community connection." },
  { flag: "🇦🇺", country: "Australia", desc: "Resettled refugee communities and established diaspora groups actively engaged in advocacy." },
  { flag: "🇬🇧", country: "United Kingdom", desc: "Political exiles, activists, and long-established community organisations." },
  { flag: "🇺🇸", country: "United States", desc: "Large resettled communities across major cities, including significant Karen and Chin populations." },
  { flag: "🇯🇵", country: "Japan", desc: "Growing community of workers and students with increasing need for multilingual resources." },
  { flag: "🌐", country: "Global Network", desc: "Anyone in the Myanmar diaspora, wherever they are in the world." },
];

const STORY_TIMELINE = [
  { year: "2021", label: "The Need Identified", desc: "Following the February coup, diaspora groups identified a critical gap: no safe, multilingual platform existed for community coordination." },
  { year: "2022", label: "Global Consultations", desc: "Hundreds of interviews with diaspora members in 8 countries shaped the priorities and safety requirements." },
  { year: "2023", label: "Platform Design", desc: "Engineers and digital rights specialists collaborated to design a privacy-first architecture." },
  { year: "2024", label: "Beta Deployment", desc: "The platform was built in close partnership with community advisors, reviewed against lived experience." },
  { year: "2025", label: "Full Infrastructure Launch", desc: "Together Myanmar opened to the wider diaspora community with six core modules and multilingual support." },
];

function getBlock(blocks: ContentBlock[], key: string): { title: string; body: string } {
  const b = blocks.find((x) => x.key === key);
  if (b) return { title: b.title, body: b.body_en };
  return DEFAULT_BLOCKS[key] ?? { title: "", body: "" };
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

export default function AboutPage() {
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [advisory, setAdvisory] = useState<AdvisoryMember[]>(DEFAULT_ADVISORY);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(DEFAULT_TESTIMONIALS);

  useEffect(() => {
    getContentBlocks().then(setBlocks).catch(() => {});
    getAdvisoryMembers().then((d) => { if (d.length > 0) setAdvisory(d); }).catch(() => {});
    getTestimonials().then((d) => { if (d.length > 0) setTestimonials(d); }).catch(() => {});
  }, []);

  const mission = getBlock(blocks, "about_mission");
  const vision = getBlock(blocks, "about_vision");
  const story = getBlock(blocks, "about_story");

  const advisors = advisory.filter((m) => m.category === "advisor");
  const partners = advisory.filter((m) => m.category === "partner");

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <header className="pt-20 pb-16 border-b border-slate-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-pattern opacity-[0.03] pointer-events-none" />
        <div className="mx-auto max-w-7xl px-6 relative z-10 text-center">
          <span className="badge-primary mb-4 py-1 px-3">
             Project Identity
          </span>
          <h1 className="hero-title mb-4">About Together Myanmar</h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
             Building digital infrastructure for the global Myanmar diaspora since 2021.
          </p>
        </div>
      </header>

      {/* Mission & Vision */}
      <section className="bg-slate-50 px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="card-modern bg-white p-10 border-slate-200 shadow-xl shadow-slate-200/50">
              <div className="mb-6 h-14 w-14 rounded-2xl bg-primary-100 flex items-center justify-center text-3xl">🎯</div>
              <h2 className="text-2xl font-black text-slate-900 mb-4">{mission.title}</h2>
              <p className="text-slate-500 font-medium leading-relaxed">{mission.body}</p>
            </div>
            <div className="card-modern bg-slate-900 border-none p-10 shadow-2xl relative overflow-hidden">
               <div className="absolute inset-x-0 bottom-0 h-1 bg-primary-500" />
               <div className="relative z-10">
                  <div className="mb-6 h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center text-3xl">✨</div>
                  <h2 className="text-2xl font-black text-white mb-4">{vision.title}</h2>
                  <p className="text-slate-400 font-medium leading-relaxed">{vision.body}</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Narrative Section */}
      <section className="px-6 py-24 bg-white">
        <div className="mx-auto max-w-7xl grid lg:grid-cols-12 gap-16 items-start">
           <div className="lg:col-span-7">
              <span className="text-[11px] font-black text-primary-600 uppercase tracking-widest block mb-4">Historical Context</span>
              <h2 className="text-4xl font-black text-slate-900 mb-8 leading-tight">{story.title}</h2>
              <div className="space-y-6 text-[17px] text-slate-500 font-medium leading-relaxed">
                {story.body.split("\n\n").map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
           </div>

           <div className="lg:col-span-5">
              <div className="card-modern bg-slate-50 border-slate-100 p-8">
                 <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-8">Development Milestones</h3>
                 <div className="space-y-0 relative">
                    <div className="absolute left-5 top-2 bottom-6 w-px bg-slate-200" />
                    {STORY_TIMELINE.map((item, i) => (
                      <div key={i} className="relative pl-12 pb-8 last:pb-0">
                         <div className="absolute left-0 top-0 h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center z-10 group-hover:border-primary-500 transition-colors shadow-sm">
                            <span className="text-[10px] font-black text-primary-600">{item.year.slice(2)}</span>
                         </div>
                         <p className="text-[11px] font-black text-primary-600 uppercase tracking-widest mb-1 leading-none">{item.year}</p>
                         <h4 className="text-[15px] font-bold text-slate-900 mb-2">{item.label}</h4>
                         <p className="text-[13px] font-medium text-slate-500 leading-relaxed">{item.desc}</p>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-slate-50 px-6 py-24">
        <div className="mx-auto max-w-7xl">
           <div className="text-center mb-16">
              <h2 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tight">Governance Pillars</h2>
              <p className="text-slate-500 font-medium max-w-xl mx-auto">Foundational principles that dictate our architecture and operations.</p>
           </div>
           <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {VALUES.map((v) => (
              <div key={v.title} className="card-modern bg-white p-8 border-slate-200 hover:border-primary-200 hover:-translate-y-1 transition-all">
                <span className="mb-6 block text-4xl">{v.icon}</span>
                <h3 className="mb-2 text-lg font-black text-slate-900 uppercase tracking-tight">{v.title}</h3>
                <p className="text-sm font-medium leading-relaxed text-slate-500">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Advisory Board */}
      <section className="bg-white px-6 py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16">
              <span className="badge-primary mb-4 py-1 px-3">Verified Guidance</span>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">Advisory Board</h2>
              <p className="mt-4 text-lg text-slate-500 max-w-xl font-medium">
                Leading community voices and technical experts who guide our strategic direction.
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {advisors.map((m) => (
                <div key={m.id} className="card-modern group p-8 bg-white border-slate-200 hover:border-primary-200 transition-all">
                  <div className="flex items-center gap-5 mb-6">
                    {m.image_url ? (
                      <img src={m.image_url} alt={m.name} className="h-16 w-16 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary-600 text-white text-xl font-black italic shadow-lg">
                        {initials(m.name)}
                      </div>
                    )}
                    <div>
                      <p className="text-lg font-black text-slate-900 leading-tight">{m.name}</p>
                      <p className="text-[11px] font-black text-primary-600 uppercase tracking-widest mt-1">{m.role}</p>
                    </div>
                  </div>
                  {m.bio && <p className="text-[14px] font-medium text-slate-500 leading-relaxed">{m.bio}</p>}
                </div>
              ))}
            </div>
          </div>
      </section>

      {/* Who We Serve */}
      <section className="bg-slate-900 px-6 py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-pattern opacity-[0.05] pointer-events-none" />
        <div className="mx-auto max-w-7xl relative z-10 text-center mb-16">
           <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-4">Global Reach</h2>
           <p className="text-slate-400 font-medium max-w-2xl mx-auto">We provide critical infrastructure for diaspora nodes across 20+ sovereign jurisdictions.</p>
        </div>
        <div className="mx-auto max-w-7xl grid gap-4 sm:grid-cols-2 lg:grid-cols-4 relative z-10">
          {WHO_WE_SERVE.map((c) => (
            <div key={c.country} className="card-modern bg-white/5 border-white/10 p-6 hover:bg-white/10 transition-colors">
              <p className="mb-4 text-3xl">{c.flag}</p>
              <p className="text-sm font-black text-white uppercase tracking-wide mb-2">{c.country}</p>
              <p className="text-[12px] font-medium text-slate-400 leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white px-6 py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Community Impact</h2>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {testimonials.map((t) => (
                <div key={t.id} className="card-modern p-10 bg-slate-50 border-slate-100 flex flex-col justify-between">
                  <div className="mb-8">
                     <span className="text-primary-600/20 text-6xl leading-none font-serif absolute -top-2 left-6">“</span>
                     <p className="text-[15px] font-medium text-slate-700 leading-relaxed italic relative z-10">
                        {t.quote_en}
                     </p>
                  </div>
                  <div className="flex items-center gap-4 pt-6 border-t border-slate-200">
                    <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                       {initials(t.author_name)}
                    </div>
                    <div>
                      <p className="text-[13px] font-black text-slate-900 uppercase leading-none mb-1">{t.author_name}</p>
                      <p className="text-[11px] font-bold text-slate-400">{t.author_location}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
      </section>

      {/* CTA */}
      <section className="bg-slate-50 py-24 px-6 border-t border-slate-100">
        <div className="mx-auto max-w-4xl text-center">
           <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-6">Join the Global Network</h2>
           <p className="text-lg text-slate-500 font-medium mb-10 leading-relaxed">
             Secure your digital identity and connect with the global Myanmar diaspora community.
           </p>
           <div className="flex flex-wrap justify-center gap-4">
              <Link href="/register" className="btn-primary py-4 px-10 text-[16px]">Create Account</Link>
              <Link href="/get-involved" className="btn-secondary py-4 px-10 text-[16px] border-slate-300">Volunteer or Partner</Link>
           </div>
        </div>
      </section>
    </div>
  );
}
