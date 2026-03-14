"use client";

import { useState } from "react";
import Link from "next/link";

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <button
      onClick={copy}
      title={`Copy ${label}`}
      className="ml-2 inline-flex items-center gap-1 rounded-md border border-gray-300 bg-gray-50 px-2 py-0.5 text-xs text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-800"
    >
      {copied ? (
        <>
          <svg className="h-3 w-3 text-green-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-green-600 font-semibold">Copied!</span>
        </>
      ) : (
        <>
          <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
          <span>Copy</span>
        </>
      )}
    </button>
  );
}

const IMPACT_ITEMS = [
  { amount: "$10", icon: "📚", desc: "Covers hosting costs for one week, keeping the platform online for thousands." },
  { amount: "$25", icon: "🛡️", desc: "Funds security updates that protect member privacy and data for a month." },
  { amount: "$50", icon: "🌏", desc: "Supports moderation and community management for one month." },
  { amount: "$100", icon: "🚀", desc: "Funds a new feature — helping more families reconnect and access resources." },
];

const BANK_DETAILS = [
  { label: "Bank Name",      value: "KBZ Bank Myanmar",             copy: "KBZ Bank Myanmar" },
  { label: "Account Name",   value: "Together Myanmar Foundation",  copy: "Together Myanmar Foundation" },
  { label: "Account Number", value: "0974 1000 5566 3300",          copy: "0974100055663300" },
  { label: "Reference",      value: "DONATION-TM",                  copy: "DONATION-TM", highlight: true },
];

const WIRE_DETAILS = [
  { label: "Beneficiary",   value: "Together Myanmar Org",          copy: "Together Myanmar Org" },
  { label: "IBAN",          value: "GB29 NWBK 6016 1331 9268 19",  copy: "GB29NWBK60161331926819" },
  { label: "SWIFT / BIC",   value: "NWBKGB2L",                     copy: "NWBKGB2L" },
  { label: "Bank Address",  value: "NatWest Bank, 250 Bishopsgate, London EC2M 4AA, UK", copy: "NatWest Bank, 250 Bishopsgate, London EC2M 4AA, UK" },
];

type Method = "bank" | "wire" | "digital";

export default function DonatePage() {
  const [activeMethod, setActiveMethod] = useState<Method>("bank");

  const methods: { id: Method; icon: string; label: string; sub: string }[] = [
    { id: "bank",    icon: "🏦", label: "Local Bank",       sub: "Myanmar Transfers" },
    { id: "wire",    icon: "🌐", label: "International",    sub: "IBAN / SWIFT" },
    { id: "digital", icon: "📱", label: "Digital Pay",      sub: "PayPal / Apps" },
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <header className="pt-24 pb-16 border-b border-slate-100 relative overflow-hidden bg-slate-900 text-white">
        <div className="absolute inset-0 bg-pattern opacity-[0.05] pointer-events-none" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary-600/20 to-transparent pointer-events-none" />
        
        <div className="mx-auto max-w-7xl px-6 relative z-10">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 text-3xl shadow-2xl">
              ❤️
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 leading-tight">
              Support Our <span className="text-primary-400">Mission</span>
            </h1>
            <p className="text-lg text-slate-300 mb-10 leading-relaxed font-medium">
              Your donation keeps Together Myanmar free, safe, and growing for every diaspora member.
              We operate as a non-profit initiative dedicated to community empowerment.
            </p>
            
            <div className="flex flex-wrap justify-center gap-3">
              {["100% Community Focus", "Tax-Deductible Receipts", "Quarterly Impact Reports"].map((item) => (
                <div key={item} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[13px] font-bold tracking-tight">
                   <span className="h-1.5 w-1.5 rounded-full bg-primary-400" />
                   {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <section className="bg-slate-50 px-6 py-20">
        <div className="mx-auto max-w-4xl space-y-16">

          {/* Impact Metrics */}
          <div>
            <div className="flex items-center gap-4 mb-8">
               <div className="h-0.5 w-12 bg-primary-600 rounded-full" />
               <h2 className="text-[11px] font-black text-primary-600 uppercase tracking-widest">Tangible Impact</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {IMPACT_ITEMS.map((item) => (
                <div key={item.amount} className="card-modern group hover:border-primary-200 transition-all bg-white p-6 border-slate-200 shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-2xl mb-4 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <p className="text-2xl font-black text-slate-900 mb-2">{item.amount}</p>
                  <p className="text-[12px] leading-relaxed text-slate-500 font-medium">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Donation Matrix */}
          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit space-y-4">
               <div className="mb-6">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Donation Matrix</h2>
                  <p className="text-sm text-slate-500 font-medium mt-1">Select your preferred method</p>
               </div>
               {methods.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setActiveMethod(m.id)}
                  className={`w-full flex items-center gap-4 p-5 rounded-2xl border transition-all text-left ${
                    activeMethod === m.id
                      ? "border-primary-600 bg-white shadow-xl shadow-primary-200/40 ring-1 ring-primary-600"
                      : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:shadow-md"
                  }`}
                >
                  <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl ${activeMethod === m.id ? "bg-primary-50" : "bg-slate-50"}`}>
                    {m.icon}
                  </span>
                  <div>
                     <p className={`text-[15px] font-bold ${activeMethod === m.id ? "text-slate-900" : "text-slate-700"}`}>{m.label}</p>
                     <p className="text-[11px] font-medium text-slate-400 mt-0.5">{m.sub}</p>
                  </div>
                </button>
              ))}
            </div>

            <main className="lg:col-span-8">
              {/* Bank Transfer */}
              {activeMethod === "bank" && (
                <div className="card-modern bg-white p-8 border-slate-200 shadow-xl shadow-slate-200/40 animate-fade-in">
                  <div className="mb-8 flex items-center justify-between border-b border-slate-100 pb-6">
                    <div className="flex items-center gap-4">
                       <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-2xl shadow-sm">🏦</div>
                       <div>
                         <h3 className="text-xl font-black text-slate-900 tracking-tight">Local Bank Transfer</h3>
                         <p className="text-xs text-slate-400 font-medium">For transfers within Myanmar</p>
                       </div>
                    </div>
                    <span className="badge-modern bg-blue-50 text-blue-700">Recommended</span>
                  </div>
                  
                  <div className="space-y-1">
                    {BANK_DETAILS.map(({ label, value, copy, highlight }) => (
                      <div key={label} className="group flex items-center justify-between py-4 border-b border-slate-50 last:border-none">
                        <dt className="text-[11px] font-black text-slate-400 uppercase tracking-widest w-32 shrink-0">{label}</dt>
                        <dd className="flex flex-1 items-center justify-end font-mono text-sm">
                          <span className={`${highlight ? "font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded" : "text-slate-700"}`}>
                             {value}
                          </span>
                          <CopyButton value={copy} label={label} />
                        </dd>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/50 p-5 flex items-start gap-4">
                    <span className="text-xl">⚠️</span>
                    <p className="text-[13px] text-amber-800 font-medium leading-relaxed">
                      Please include <strong className="font-black">DONATION-TM</strong> as the payment reference to ensure we can acknowledge your gift and generate a receipt.
                    </p>
                  </div>
                </div>
              )}

              {/* International Wire */}
              {activeMethod === "wire" && (
                <div className="card-modern bg-white p-8 border-slate-200 shadow-xl shadow-slate-200/40 animate-fade-in">
                  <div className="mb-8 flex items-center justify-between border-b border-slate-100 pb-6">
                    <div className="flex items-center gap-4">
                       <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-2xl shadow-sm">🌐</div>
                       <div>
                         <h3 className="text-xl font-black text-slate-900 tracking-tight">International SWIFT</h3>
                         <p className="text-xs text-slate-400 font-medium">For donors outside of Myanmar</p>
                       </div>
                    </div>
                    <span className="badge-modern bg-purple-50 text-purple-700">Secure Node</span>
                  </div>
                  
                  <div className="space-y-1">
                    {WIRE_DETAILS.map(({ label, value, copy }) => (
                      <div key={label} className="group flex items-start justify-between py-4 border-b border-slate-50 last:border-none">
                        <dt className="text-[11px] font-black text-slate-400 uppercase tracking-widest shrink-0 w-32 pt-1">{label}</dt>
                        <dd className="flex flex-1 items-start justify-end font-mono text-[13px] text-slate-700 text-right">
                          <span className="break-all">{value}</span>
                          <CopyButton value={copy} label={label} />
                        </dd>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50/30 p-5 flex items-start gap-4">
                    <span className="text-xl">ℹ️</span>
                    <p className="text-[13px] text-blue-700 font-medium leading-relaxed">
                      International transfers typically clear within 2–5 business days. We will dispatch a confirmation email once the node validates the transaction.
                    </p>
                  </div>
                </div>
              )}

              {/* Digital Payments */}
              {activeMethod === "digital" && (
                <div className="card-modern bg-white p-8 border-slate-200 shadow-xl shadow-slate-200/40 animate-fade-in">
                  <div className="mb-8 flex items-center justify-between border-b border-slate-100 pb-6">
                    <div className="flex items-center gap-4">
                       <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-2xl shadow-sm">📱</div>
                       <div>
                         <h3 className="text-xl font-black text-slate-900 tracking-tight">Digital Ecosystem</h3>
                         <p className="text-xs text-slate-400 font-medium">Instant verification available</p>
                       </div>
                    </div>
                  </div>
                  
                  <div className="grid gap-4">
                    {/* PayPal */}
                    <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 group hover:bg-white hover:shadow-md transition-all">
                      <div className="mb-4 flex items-center justify-between">
                         <div className="flex items-center gap-2">
                           <span className="h-8 w-8 flex items-center justify-center rounded-lg bg-white shadow-sm text-lg">🅿️</span>
                           <span className="font-black text-slate-900 text-[14px] uppercase tracking-tight">PayPal Global</span>
                         </div>
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Instant</span>
                      </div>
                      <div className="flex items-center justify-between bg-white px-4 py-2 rounded-xl border border-slate-100">
                        <span className="font-mono text-[13px] text-slate-600">donate@togethermyanmar.org</span>
                        <CopyButton value="donate@togethermyanmar.org" label="PayPal" />
                      </div>
                    </div>

                    {/* Wave Money */}
                    <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 group hover:bg-white hover:shadow-md transition-all">
                      <div className="mb-4 flex items-center justify-between">
                         <div className="flex items-center gap-2">
                           <span className="h-8 w-8 flex items-center justify-center rounded-lg bg-white shadow-sm text-lg">🌊</span>
                           <span className="font-black text-slate-900 text-[14px] uppercase tracking-tight">Wave Money</span>
                         </div>
                      </div>
                      <div className="flex items-center justify-between bg-white px-4 py-2 rounded-xl border border-slate-100 mb-2">
                        <span className="font-mono text-[13px] text-slate-600">09 7654 3210 0</span>
                        <CopyButton value="09765432100" label="Wave number" />
                      </div>
                      <p className="text-[11px] font-medium text-slate-400 ml-1 italic text-center">Together Myanmar Foundation</p>
                    </div>

                    {/* KBZ Pay */}
                    <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 group hover:bg-white hover:shadow-md transition-all">
                      <div className="mb-4 flex items-center justify-between">
                         <div className="flex items-center gap-2">
                           <span className="h-8 w-8 flex items-center justify-center rounded-lg bg-white shadow-sm text-lg">💳</span>
                           <span className="font-black text-slate-900 text-[14px] uppercase tracking-tight">KBZ Pay</span>
                         </div>
                      </div>
                      <div className="flex items-center justify-between bg-white px-4 py-2 rounded-xl border border-slate-100 mb-2">
                        <span className="font-mono text-[13px] text-slate-600">09 4500 7788 12</span>
                        <CopyButton value="094500778812" label="KPay number" />
                      </div>
                      <p className="text-[11px] font-medium text-slate-400 ml-1 italic text-center">Together Myanmar Foundation</p>
                    </div>
                  </div>
                </div>
              )}
            </main>
          </div>

          {/* Post-Donation Protocol */}
          <div className="card-modern bg-slate-900 p-8 border-none relative overflow-hidden text-white">
            <div className="absolute inset-0 bg-pattern opacity-[0.03]" />
            <div className="relative flex flex-col md:flex-row gap-8 items-center">
               <div className="h-20 w-20 shrink-0 flex items-center justify-center rounded-3xl bg-primary-600 text-3xl shadow-2xl">🙏</div>
               <div>
                  <h3 className="text-xl font-black tracking-tight mb-2">Acknowledgement Protocol</h3>
                  <p className="text-slate-400 text-[14px] font-medium leading-relaxed mb-4">
                     After performing a transaction, please dispatch an email to <a href="mailto:donate@togethermyanmar.org" className="text-primary-400 font-bold hover:underline">donate@togethermyanmar.org</a> with your transaction reference. 
                  </p>
                  <p className="text-slate-300 text-[13px] font-bold">
                     All contributors receive a consolidated quarterly utility report.
                  </p>
               </div>
            </div>
          </div>

          {/* Alternative Contributions */}
          <div className="space-y-8">
            <div className="flex items-center gap-4">
               <div className="h-0.5 w-12 bg-slate-200 rounded-full" />
               <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Alternative Options</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { href: "/get-involved", icon: "🤝", label: "Volunteer", sub: "Donate your time" },
                { href: "/get-involved", icon: "🏢", label: "Partnership", sub: "Org support" },
                { href: "/resources", icon: "📚", label: "Resources", sub: "Share knowledge" },
                { href: "/contact", icon: "✉️", label: "Contact Us", sub: "General inquiries" }
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="card-modern p-6 bg-white border-slate-200 hover:border-primary-300 hover:shadow-lg transition-all"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-xl mb-4">{link.icon}</span>
                  <p className="text-[14px] font-black text-slate-900 uppercase tracking-tight">{link.label}</p>
                  <p className="text-[11px] font-medium text-slate-400 mt-1">{link.sub}</p>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}

