"use client";

import { useState, useEffect } from "react";
import { submitContactMessage, getFAQs, type FAQ } from "@/lib/api";

type Banner = { type: "success" | "error"; msg: string } | null;

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [trap, setTrap] = useState(""); // honeypot – must stay empty
  const [banner, setBanner] = useState<Banner>(null);
  const [loading, setLoading] = useState(false);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    getFAQs().then(setFaqs).catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setBanner(null);
    // Honeypot: if the hidden trap field is filled, it's a bot — silently pretend to succeed
    if (trap) {
      setBanner({ type: "success", msg: "Transmission successful. We will respond within 48 hours." });
      setForm({ name: "", email: "", subject: "", message: "" });
      setLoading(false);
      return;
    }
    try {
      await submitContactMessage(form);
      setBanner({ type: "success", msg: "Transmission successful. We will respond within 48 hours." });
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      setBanner({ type: "error", msg: "Failed to transmit message. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white min-h-screen">
      {/* HERO */}
      <header className="pt-20 pb-16 border-b border-slate-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-pattern opacity-[0.03] pointer-events-none" />
        <div className="mx-auto max-w-7xl px-6 relative z-10">
          <span className="badge-primary mb-4 py-1 px-3">
             Support Interface
          </span>
          <h1 className="hero-title mb-4">Contact the Network</h1>
          <p className="text-lg text-slate-500 max-w-2xl leading-relaxed">
             Have questions about the platform, security protocols, or community access? Our team is available for authenticated inquiries.
          </p>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <section className="bg-slate-50 px-6 py-20 min-h-[500px]">
        <div className="mx-auto max-w-7xl grid lg:grid-cols-12 gap-12">

          {/* Contact Information Cards */}
          <div className="lg:col-span-4 flex flex-col gap-6 order-2 lg:order-1">
             <div className="card-modern group p-8 bg-white border-slate-200">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6">Contact Protocol</h3>
                <ul className="space-y-8">
                   <li className="flex gap-4">
                      <div className="h-10 w-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center text-xl shrink-0">📧</div>
                      <div>
                         <p className="text-[13px] font-black text-slate-900 uppercase tracking-tight mb-1">Electronic Mail</p>
                         <p className="text-sm font-medium text-slate-500">info@togethermyanmar.org</p>
                      </div>
                   </li>
                   <li className="flex gap-4">
                      <div className="h-10 w-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center text-xl shrink-0">⚡</div>
                      <div>
                         <p className="text-[13px] font-black text-slate-900 uppercase tracking-tight mb-1">Standard Latency</p>
                         <p className="text-sm font-medium text-slate-500">Within 48 Business Hours</p>
                      </div>
                   </li>
                   <li className="flex gap-4">
                      <div className="h-10 w-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center text-xl shrink-0">🌏</div>
                      <div>
                         <p className="text-[13px] font-black text-slate-900 uppercase tracking-tight mb-1">Global Nodes</p>
                         <p className="text-sm font-medium text-slate-500">SEA, UK, US, AU Regional Hubs</p>
                      </div>
                   </li>
                </ul>
             </div>

             <div className="card-modern p-8 bg-slate-900 border-none relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-primary-500/10 skew-x-[-20deg] origin-top translate-x-1/2 pointer-events-none" />
                <div className="relative z-10">
                   <h3 className="text-[11px] font-black text-primary-400 uppercase tracking-widest mb-4">Urgent Assistance</h3>
                   <p className="text-sm font-medium text-slate-300 leading-relaxed mb-6">
                     For critical safety or security concerns, include <strong>"PRIORITY"</strong> in your subject. Our triage team monitors these channels 24/7.
                   </p>
                   <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-500 w-1/3 animate-pulse" />
                   </div>
                </div>
             </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-8 order-1 lg:order-2">
            <div className="card-modern p-10 bg-white border-slate-200 shadow-xl shadow-slate-200/50">
              <h2 className="text-2xl font-black text-slate-900 mb-2">Execute Inquiry</h2>
              <p className="text-slate-500 font-medium mb-10 leading-relaxed">
                Submit your encrypted inquiry below. All communications are subject to our privacy and security protocols.
              </p>

              {banner && (
                <div className={`mb-10 rounded-2xl px-6 py-4 text-sm font-bold ${
                  banner.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-100"
                    : "bg-red-50 text-red-800 border border-red-100"
                }`}>
                  {banner.msg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Honeypot field */}
                <div aria-hidden="true" style={{ display: "none" }}>
                  <label>Leave this empty</label>
                  <input
                    type="text"
                    value={trap}
                    onChange={(e) => setTrap(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>
                
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identity Name *</label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="input-modern"
                      placeholder="e.g. Aung San"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Digital Mail *</label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="input-modern"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Inquiry Subject *</label>
                  <input
                    required
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="input-modern"
                    placeholder="General Inquiry / Security Feedback / Partnership"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Inquiry Payload *</label>
                  <textarea
                    required
                    rows={6}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="How can our infrastructure team assist you?"
                    className="input-modern resize-none"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center py-4 text-[15px]"
                >
                  {loading ? "Transmitting..." : "Execute Inquiry Submission"}
                </button>
              </form>
            </div>
          </div>

        </div>

        {/* FAQ Section */}
        {faqs.length > 0 && (
          <div className="mx-auto mt-24 max-w-4xl">
            <div className="text-center mb-12">
               <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-2">Knowledge Base</h2>
               <p className="text-slate-500 font-medium lowercase tracking-wide">Quick resolution for common inquiries.</p>
            </div>
            
            <div className="space-y-4">
              {faqs.map((faq) => {
                const isOpen = openFaq === faq.id;
                return (
                  <div
                    key={faq.id}
                    className={`card-modern overflow-hidden bg-white border-slate-200 transition-all duration-300 ${isOpen ? "shadow-xl shadow-slate-200 border-primary-200 ring-4 ring-primary-500/5 translate-x-2" : "hover:border-slate-300"}`}
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                      className="flex w-full items-center justify-between px-8 py-5 text-left transition-colors"
                      aria-expanded={isOpen}
                    >
                      <span className={`text-[15px] font-black transition-colors ${isOpen ? "text-primary-600" : "text-slate-900"}`}>
                         {faq.question_en}
                      </span>
                      <span className={`ml-4 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 text-primary-600" : "text-slate-300"}`}>
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </button>
                    <div className={`transition-all duration-300 ease-in-out ${isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
                      <div className="border-t border-slate-50 px-8 py-6 text-[15px] font-medium leading-relaxed text-slate-500 bg-slate-50/50">
                        {faq.answer_en}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
