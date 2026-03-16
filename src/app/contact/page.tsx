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
      <header className="pt-20 pb-16 border-b border-slate-100 relative overflow-hidden bg-slate-50">
        <div className="absolute inset-0 bg-pattern opacity-[0.03] pointer-events-none" />
        <div className="mx-auto max-w-7xl px-6 relative z-10 flex flex-col items-center text-center">
          <span className="badge-primary mb-4 py-1 px-3 inline-block">
             Get in Touch
          </span>
          <h1 className="hero-title mb-4 bg-gradient-to-r from-slate-900 via-primary-900 to-slate-900 text-transparent bg-clip-text">Contact Us</h1>
          <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
             Have questions, feedback, or need support? Reach out to the Together Myanmar team, and we will get back to you as soon as possible.
          </p>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <section className="bg-slate-50 px-6 py-20 min-h-[500px]">
        <div className="mx-auto max-w-7xl grid lg:grid-cols-12 gap-12">

          {/* Contact Information Cards */}
          <div className="lg:col-span-4 flex flex-col gap-6 order-2 lg:order-1">
             <div className="card-modern group p-8 bg-white border-slate-200">
                <h3 className="text-[12px] font-black text-primary-600 uppercase tracking-widest mb-6">Contact Options</h3>
                <ul className="space-y-8">
                   <li className="flex gap-4">
                      <div className="h-10 w-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center text-xl shrink-0">📧</div>
                      <div>
                         <p className="text-[14px] font-black text-slate-900 mb-1 tracking-tight">Email Support</p>
                         <p className="text-sm font-medium text-slate-500">info@togethermyanmar.org</p>
                      </div>
                   </li>
                   <li className="flex gap-4">
                      <div className="h-10 w-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center text-xl shrink-0">⚡</div>
                      <div>
                         <p className="text-[14px] font-black text-slate-900 mb-1 tracking-tight">Response Time</p>
                         <p className="text-sm font-medium text-slate-500">Within 24-48 hours</p>
                      </div>
                   </li>
                   <li className="flex gap-4">
                      <div className="h-10 w-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center text-xl shrink-0">🌏</div>
                      <div>
                         <p className="text-[14px] font-black text-slate-900 mb-1 tracking-tight">Regional Community Support</p>
                         <p className="text-sm font-medium text-slate-500">North America, Europe, Asia Hubs</p>
                      </div>
                   </li>
                </ul>
                <div className="mt-8 pt-6 border-t border-slate-100 flex gap-4 text-slate-400">
                    <a href="#" className="hover:text-primary-600 transition-colors" title="Facebook"><span className="text-xl">👤</span></a>
                    <a href="#" className="hover:text-primary-600 transition-colors" title="Twitter"><span className="text-xl">🐦</span></a>
                    <a href="#" className="hover:text-primary-600 transition-colors" title="LinkedIn"><span className="text-xl">💼</span></a>
                    <a href="#faq" className="mt-1 text-sm font-bold text-slate-500 hover:text-primary-600 underline ml-auto">Read FAQs</a>
                </div>
             </div>

             <div className="card-modern p-8 bg-amber-50 border border-amber-200 relative overflow-hidden shadow-sm">
                <div className="relative z-10">
                   <div className="flex items-center gap-2 mb-4">
                     <span className="text-xl">🚨</span>
                     <h3 className="text-[12px] font-black text-amber-800 uppercase tracking-widest">Urgent Assistance</h3>
                   </div>
                   <p className="text-sm font-medium text-amber-800/80 leading-relaxed mb-4">
                     If you or someone in your community needs immediate emergency help, please contact your local emergency services or dedicated crisis hotlines directly. Our team cannot provide immediate physical assistance.
                   </p>
                </div>
             </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-8 order-1 lg:order-2">
            <div className="card-modern p-10 bg-white border-slate-200 shadow-xl shadow-slate-200/50">
              <h2 className="text-2xl font-black text-slate-900 mb-2">Send us a Message</h2>
              <p className="text-slate-500 font-medium mb-10 leading-relaxed">
                Fill out the form below and we'll route your message to the right team member.
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
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Name *</label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="input-modern border-slate-200 focus:border-primary-300"
                      placeholder="e.g. Aung San"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address *</label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="input-modern border-slate-200 focus:border-primary-300"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Inquiry Category *</label>
                  <select
                    required
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="input-modern border-slate-200 focus:border-primary-300 bg-white"
                  >
                     <option value="" disabled>Select a category...</option>
                     <option value="General Inquiry">General Inquiry</option>
                     <option value="Platform Support">Platform Support</option>
                     <option value="Partnership Request">Partnership Request</option>
                     <option value="Security Feedback">Security Feedback</option>
                     <option value="Community Programs">Community Programs</option>
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Message *</label>
                  <textarea
                    required
                    rows={6}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="How can we help you?"
                    className="input-modern resize-none border-slate-200 focus:border-primary-300"
                  />
                </div>
                
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start gap-3">
                   <span className="text-lg opacity-80">🛡️</span>
                   <p className="text-[14px] font-medium text-slate-500 leading-relaxed">
                     <strong className="text-slate-700">Privacy Assurance:</strong> Your information is kept secure and will only be used to respond to your inquiry.
                   </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex flex-col items-center gap-4">
                   <button
                     type="submit"
                     disabled={loading}
                     className="btn-primary w-full sm:w-auto px-12 py-3.5 text-[15px] justify-center"
                   >
                     {loading ? "Sending..." : "Send Message"}
                   </button>
                   <p className="text-[13px] font-medium text-slate-400 text-center italic">
                     Thank you for reaching out to Together Myanmar.
                   </p>
                </div>
              </form>
            </div>
          </div>

        </div>

        {/* FAQ Section */}
        {faqs.length > 0 && (
          <div id="faq" className="mx-auto mt-24 max-w-4xl scroll-mt-24">
            <div className="text-center mb-12">
               <h2 className="text-3xl font-black text-slate-900 mb-2">Frequently Asked Questions</h2>
               <p className="text-slate-500 font-medium tracking-wide">Quick answers to common inquiries.</p>
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
