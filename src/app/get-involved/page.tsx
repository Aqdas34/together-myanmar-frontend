"use client";

import { useState } from "react";
import { submitVolunteerSignup, submitPartnershipInquiry } from "@/lib/api";

const COUNTRIES = [
  "Thailand", "Malaysia", "Singapore", "Japan", "South Korea", "United States",
  "United Kingdom", "Australia", "Canada", "Germany", "France", "Other",
];
const AREAS = [
  "Legal Aid", "Language Teaching", "Mental Health Support",
  "IT / Technology", "Community Events", "Fundraising", "Other",
];

type Banner = { type: "success" | "error"; msg: string } | null;

export default function GetInvolvedPage() {
  // -- Volunteer form state
  const [vol, setVol] = useState({
    full_name: "", email: "", country_of_residence: "", areas_of_interest: [] as string[], message: "",
  });
  const [volBanner, setVolBanner] = useState<Banner>(null);
  const [volLoading, setVolLoading] = useState(false);

  // -- Partnership form state
  const [part, setPart] = useState({
    organization_name: "", contact_name: "", email: "", message: "",
  });
  const [partBanner, setPartBanner] = useState<Banner>(null);
  const [partLoading, setPartLoading] = useState(false);

  function toggleArea(area: string) {
    setVol((prev) => ({
      ...prev,
      areas_of_interest: prev.areas_of_interest.includes(area)
        ? prev.areas_of_interest.filter((a) => a !== area)
        : [...prev.areas_of_interest, area],
    }));
  }

  async function handleVolSubmit(e: React.FormEvent) {
    e.preventDefault();
    setVolLoading(true);
    setVolBanner(null);
    try {
      await submitVolunteerSignup({
        full_name: vol.full_name,
        email: vol.email,
        country: vol.country_of_residence || undefined,
        areas_of_interest: vol.areas_of_interest.join(", ") || undefined,
        message: vol.message || undefined,
      });
      setVolBanner({ type: "success", msg: "Application transmitted. Our team will review your profile." });
      setVol({ full_name: "", email: "", country_of_residence: "", areas_of_interest: [], message: "" });
    } catch {
      setVolBanner({ type: "error", msg: "Transmission failure. Please try again." });
    } finally {
      setVolLoading(false);
    }
  }

  async function handlePartSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPartLoading(true);
    setPartBanner(null);
    try {
      await submitPartnershipInquiry(part);
      setPartBanner({ type: "success", msg: "Inquiry received. A partnership lead will contact you." });
      setPart({ organization_name: "", contact_name: "", email: "", message: "" });
    } catch {
      setPartBanner({ type: "error", msg: "Transmission failure. Please try again." });
    } finally {
      setPartLoading(false);
    }
  }

  return (
    <div className="bg-white min-h-screen">
      {/* HERO */}
      <header className="pt-20 pb-16 border-b border-slate-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-pattern opacity-[0.03] pointer-events-none" />
        <div className="mx-auto max-w-7xl px-6 relative z-10">
          <span className="badge-primary mb-4 py-1 px-3">
             Community Development
          </span>
          <h1 className="hero-title mb-4">Support the Network</h1>
          <p className="text-lg text-slate-500 max-w-2xl leading-relaxed">
             Join our mission as a volunteer, strategic partner, or financial supporter to help scale the impact for the Myanmar diaspora.
          </p>
        </div>
      </header>

      {/* FORMS GRID */}
      <section className="bg-slate-50 px-6 py-16">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2">

          {/* Volunteer Form */}
          <div className="card-modern bg-white p-10 border-slate-200 shadow-xl shadow-slate-200/50">
            <h2 className="text-2xl font-black text-slate-900 mb-2">Volunteer Handshake</h2>
            <p className="text-slate-500 font-medium mb-8 leading-relaxed">Apply to contribute your skills and time to community-led programs.</p>

            {volBanner && (
              <div className={`mb-8 rounded-2xl px-6 py-4 text-sm font-bold ${
                volBanner.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-100"
                  : "bg-red-50 text-red-800 border border-red-100"
              }`}>
                {volBanner.msg}
              </div>
            )}

            <form onSubmit={handleVolSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Legal Name *</label>
                  <input
                    required
                    value={vol.full_name}
                    onChange={(e) => setVol({ ...vol, full_name: e.target.value })}
                    className="input-modern"
                    placeholder="e.g. Aung San"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Digital Mail *</label>
                  <input
                    required
                    type="email"
                    value={vol.email}
                    onChange={(e) => setVol({ ...vol, email: e.target.value })}
                    className="input-modern"
                    placeholder="email@example.com"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jurisdiction</label>
                  <select
                    value={vol.country_of_residence}
                    onChange={(e) => setVol({ ...vol, country_of_residence: e.target.value })}
                    className="input-modern bg-slate-50 border-slate-100"
                  >
                    <option value="">Global Residence...</option>
                    {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Knowledge Domains</label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {AREAS.map((area) => {
                      const isActive = vol.areas_of_interest.includes(area);
                      return (
                        <button
                          key={area}
                          type="button"
                          onClick={() => toggleArea(area)}
                          className={`rounded-full px-4 py-1.5 text-[11px] font-black uppercase tracking-tight transition-all ${
                            isActive 
                              ? "bg-primary-600 text-white shadow-lg shadow-primary-200" 
                              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                          }`}
                        >
                          {area}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Proposal / Motivation</label>
                  <textarea
                    rows={4}
                    value={vol.message}
                    onChange={(e) => setVol({ ...vol, message: e.target.value })}
                    placeholder="Briefly describe your expertise and impact goals..."
                    className="input-modern resize-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={volLoading}
                className="btn-primary w-full justify-center py-4 text-[15px]"
              >
                {volLoading ? "Transmitting..." : "Initialize Volunteer Handshake"}
              </button>
            </form>
          </div>

          {/* Partnership Form */}
          <div className="card-modern bg-white p-10 border-slate-200 shadow-xl shadow-slate-200/50">
            <h2 className="text-2xl font-black text-slate-900 mb-2">Strategic Partnership</h2>
            <p className="text-slate-500 font-medium mb-8 leading-relaxed">Collaborate as an NGO, community group, or institutional partner.</p>

            {partBanner && (
              <div className={`mb-8 rounded-2xl px-6 py-4 text-sm font-bold ${
                partBanner.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-100"
                  : "bg-red-50 text-red-800 border border-red-100"
              }`}>
                {partBanner.msg}
              </div>
            )}

            <form onSubmit={handlePartSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Entity Name *</label>
                  <input
                    required
                    value={part.organization_name}
                    onChange={(e) => setPart({ ...part, organization_name: e.target.value })}
                    className="input-modern"
                    placeholder="Organization or Group Name"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lead Representative *</label>
                  <input
                    required
                    value={part.contact_name}
                    onChange={(e) => setPart({ ...part, contact_name: e.target.value })}
                    className="input-modern"
                    placeholder="Handled by..."
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Corporate Mail *</label>
                  <input
                    required
                    type="email"
                    value={part.email}
                    onChange={(e) => setPart({ ...part, email: e.target.value })}
                    className="input-modern"
                    placeholder="partnership@entity.org"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Collaboration Extract *</label>
                  <textarea
                    required
                    rows={6}
                    value={part.message}
                    onChange={(e) => setPart({ ...part, message: e.target.value })}
                    placeholder="Briefly outline your organization's mission and how we can achieve mutual goals..."
                    className="input-modern resize-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={partLoading}
                className="btn-primary w-full justify-center py-4 text-[15px]"
              >
                {partLoading ? "Processing..." : "Execute Partnership Inquiry"}
              </button>
            </form>
          </div>
        </div>

        {/* Donation Section */}
        <div className="mx-auto mt-20 max-w-7xl">
          <div className="card-modern bg-slate-900 p-12 border-none shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-primary-600/10 skew-x-[-20deg] origin-top translate-x-1/2 pointer-events-none" />
            
            <div className="relative z-10 grid gap-12 lg:grid-cols-3 items-center">
               <div className="lg:col-span-1">
                  <span className="badge-primary bg-primary-500 text-white mb-4 py-1 px-3">
                     Capital Support
                  </span>
                  <h2 className="text-3xl font-black text-white mb-4">Mutual Aid Funding</h2>
                  <p className="text-slate-300 font-medium leading-relaxed">
                    Financial contributions enable us to scale critical infrastructure and community relief programs.
                  </p>
               </div>
               
               <div className="lg:col-span-2 grid gap-6 sm:grid-cols-3">
                  {[
                    { icon: "🏛️", title: "Institutional Hub", desc: "Bank transfers for organizations in Thailand and Malaysia." },
                    { icon: "⚡", title: "Instant Handshake", desc: "Direct support via PromptPay and global P2P networks." },
                    { icon: "💎", title: "Safe Deposit", desc: "Direct credit gateways coming to the platform soon." }
                  ].map((item, i) => (
                    <div key={i} className="card-modern bg-white/5 border-white/10 p-6 hover:bg-white/10 group transition-all">
                       <span className="text-3xl mb-4 block group-hover:scale-110 transition-transform">{item.icon}</span>
                       <h3 className="text-[13px] font-black text-white uppercase tracking-widest mb-2">{item.title}</h3>
                       <p className="text-slate-400 text-[12px] leading-relaxed font-medium">{item.desc}</p>
                    </div>
                  ))}
               </div>
            </div>
            
            <div className="mt-12 pt-8 border-t border-white/10 text-center relative z-10">
               <p className="text-xs font-black text-primary-400 uppercase tracking-widest">Contact donations@togethermyanmar.org for security protocols</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
