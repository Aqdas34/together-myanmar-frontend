"use client";

import Link from "next/link";
import { useState } from "react";
import { useLanguage } from "@/lib/language-context";
import { subscribeNewsletter, ApiError } from "@/lib/api";

const FOOTER_SECTIONS = {
  en: [
    {
      title: "Platform",
      links: [
        { href: "/forum",       label: "Community Forum" },
        { href: "/news",        label: "News & Updates" },
        { href: "/events",      label: "Events Calendar" },
        { href: "/resources",   label: "Resource Hub" },
      ],
    },
    {
      title: "Community",
      links: [
        { href: "/diaspora",    label: "Community Directory" },
        { href: "/reconnection",label: "Reconnection" },
        { href: "/get-involved",label: "Get Involved" },
        { href: "/contact",     label: "Contact Us" },
      ],
    },
    {
      title: "About",
      links: [
        { href: "/about",       label: "About Us" },
        { href: "/about",       label: "Our Mission" },
        { href: "/privacy",     label: "Privacy Policy" },
        { href: "/terms",       label: "Terms of Service" },
      ],
    },
  ],
  my: [
    {
      title: "ပလက်ဖောင်း",
      links: [
        { href: "/forum",       label: "လူ့အဖွဲ့ ဖိုရမ်" },
        { href: "/news",        label: "သတင်းနှင့် အပ်ဒိတ်" },
        { href: "/events",      label: "ပွဲများ ပြက္ခဒိန်" },
        { href: "/resources",   label: "အရင်းအမြစ် ဗဟိုဌာန" },
      ],
    },
    {
      title: "လူ့အဖွဲ့အစည်း",
      links: [
        { href: "/diaspora",    label: "ဒိုင်ယာစပိုရာ လမ်းညွှန်" },
        { href: "/reconnection",label: "ပြန်ဆုံဆောင်ရွက်ရန်" },
        { href: "/get-involved",label: "ပါဝင်ဆောင်ရွက်ရန်" },
        { href: "/contact",     label: "ဆက်သွယ်ရန်" },
      ],
    },
    {
      title: "အကြောင်းသိရှိရန်",
      links: [
        { href: "/about",       label: "ကျွန်ုပ်တို့အကြောင်း" },
        { href: "/about",       label: "ကျွန်ုပ်တို့ ရည်မှန်းချက်" },
        { href: "/privacy",     label: "ကိုယ်ရေးကိုယ်တာ မူဝါဒ" },
        { href: "/terms",       label: "ဝန်ဆောင်မှု စည်းကမ်းများ" },
      ],
    },
  ],
};

function NewsletterSection({ lang }: { lang: "en" | "my" }) {
  const en = lang === "en";
  const [email, setEmail] = useState("");
  const [submitStatus, setSubmitStatus] = useState<"idle" | "loading" | "success" | "duplicate" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim() || submitStatus === "loading") return;
    setSubmitStatus("loading");
    try {
      await subscribeNewsletter(email.trim());
      setSubmitStatus("success");
      setEmail("");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setSubmitStatus("duplicate");
      } else {
        setSubmitStatus("error");
      }
    }
  }

  return (
    <div className="card-modern mt-12 bg-slate-900 border-none relative overflow-hidden">
      <div className="absolute inset-0 bg-pattern opacity-[0.03]" />
      <div className="relative flex flex-col gap-8 px-8 py-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <h4 className="text-xl font-bold text-white mb-2">
            {en ? "Join our global community" : "ကျွန်ုပ်တို့၏ ကမ္ဘာလုံးဆိုင်ရာ အဖွဲ့အစည်းသို့ ပူးပေါင်းပါ"}
          </h4>
          <p className="text-slate-400 text-[15px] leading-relaxed">
            {en
              ? "Stay updated with the latest news, events, and resources for the Myanmar diaspora. No spam, just community-focused updates."
              : "မြန်မာဒိုင်ယာစပိုရာများအတွက် နောက်ဆုံးရသတင်းများ၊ ပွဲများနှင့် အရင်းအမြစ်များကို ရယူပါ။"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full lg:max-w-md">
          {submitStatus === "success" ? (
            <div className="flex items-center gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3">
              <span className="text-emerald-500 font-bold text-sm">
                {en ? "✓ Subscribed successfully" : "✓ စာရင်းသွင်းမှု အောင်မြင်သည်"}
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setSubmitStatus("idle"); }}
                  placeholder={en ? "Enter your email" : "အီးမေးလ် ထည့်ပါ"}
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-primary-500 transition-colors"
                  disabled={submitStatus === "loading"}
                />
                <button
                  type="submit"
                  disabled={submitStatus === "loading"}
                  className="btn-primary whitespace-nowrap"
                >
                  {submitStatus === "loading" ? "..." : (en ? "Subscribe" : "စာရင်းသွင်း")}
                </button>
              </div>
              {submitStatus === "duplicate" && <p className="text-xs text-amber-500">Already subscribed</p>}
              {submitStatus === "error" && <p className="text-xs text-red-500">An error occurred</p>}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

function DonationSection({ lang }: { lang: "en" | "my" }) {
  const en = lang === "en";
  return (
    <div className="card-modern mt-6 bg-white border-slate-200 shadow-sm p-6 lg:p-8 flex flex-col lg:flex-row items-center justify-between gap-6">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 text-xl font-bold">
          ♥
        </div>
        <div>
          <h4 className="text-lg font-bold text-slate-900">
            {en ? "Support our mission" : "ကျွန်ုပ်တို့၏ ရည်မှန်းချက်ကို ပံ့ပိုးပေးပါ"}
          </h4>
          <p className="text-slate-500 text-sm max-w-lg mt-1">
            {en
              ? "Together Myanmar is a non-profit initiative. Help us keep the platform free and accessible for everyone."
              : "Together Myanmar သည် အကျိုးအမြတ်မယူသော လုပ်ငန်းတစ်ခု ဖြစ်ပါသည်။"}
          </p>
        </div>
      </div>
      <Link href="/donate" className="btn-secondary whitespace-nowrap">
        {en ? "Make a Contribution" : "လှူဒါန်းမှု ပြုလုပ်ရန်"}
      </Link>
    </div>
  );
}

export default function Footer() {
  const { lang, t } = useLanguage();
  const sections = FOOTER_SECTIONS[lang];
  const en = lang === "en";

  return (
    <footer className="bg-slate-50 border-t border-slate-200">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-2 gap-12 lg:grid-cols-5 border-b border-slate-200 pb-16">
          <div className="col-span-2 lg:col-span-2 text-left">
            <Link href="/" className="flex items-center gap-3 mb-6 transition-opacity hover:opacity-90">
              <div className="h-9 w-9 flex items-center justify-center relative">
                 <svg className="h-9 w-9" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#footer-globe-clip)">
                       <path d="M50 50L20 20H50V50Z" fill="#3182CE"/>
                       <path d="M50 50L80 20H50V50Z" fill="#ECC94B"/>
                       <path d="M50 50L20 80H50V50Z" fill="#48BB78"/>
                       <path d="M50 50L80 80H50V50Z" fill="#E53E3E"/>
                    </g>
                    <clipPath id="footer-globe-clip"><circle cx="50" cy="50" r="32"/></clipPath>
                    <circle cx="50" cy="35" r="8" fill="#ECC94B"/>
                    <circle cx="65" cy="50" r="8" fill="#E53E3E"/>
                    <circle cx="50" cy="65" r="8" fill="#48BB78"/>
                    <circle cx="35" cy="50" r="8" fill="#3182CE"/>
                 </svg>
              </div>
              <span className="text-xl font-black text-slate-900 tracking-tight">Together<span className="text-[#D69E2E]">Myanmar</span></span>
            </Link>
            <p className="text-slate-500 text-[14px] leading-relaxed max-w-xs mb-8 font-medium">
              {en
                ? "Connecting & Empowering the Myanmar Diaspora Worldwide through curated resources and secure community infrastructure."
                : "ကမ္ဘာတစ်ဝှမ်းရှိ မြန်မာဒိုင်ယာစပိုရာများကို ချိတ်ဆက်ပေးနေသော ပုံရိပ်မြင့် ပလက်ဖောင်း။"}
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-slate-400 hover:text-primary-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/></svg>
              </a>
              <a href="#" className="text-slate-400 hover:text-primary-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
            </div>
          </div>

          {sections.map((section) => (
            <div key={section.title} className="col-span-1">
              <h4 className="text-sm font-bold text-slate-900 mb-5">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-[14px] text-slate-500 hover:text-primary-600 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <NewsletterSection lang={lang} />
        <DonationSection lang={lang} />

        <div className="mt-16 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[13px] text-slate-500">
            © {new Date().getFullYear()} Together Myanmar. {t("footer.rights")}
          </p>
          <div className="flex gap-6 overflow-hidden">
             <Link href="/privacy" className="text-[13px] text-slate-500 hover:text-slate-900 transition-colors">Privacy Policy</Link>
             <Link href="/terms" className="text-[13px] text-slate-500 hover:text-slate-900 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
