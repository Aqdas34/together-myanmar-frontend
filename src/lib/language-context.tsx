"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type Lang = "en" | "my";

interface LangContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

// ── Static UI translations ────────────────────────────────────────────────────
export const TRANSLATIONS: Record<string, Record<Lang, string>> = {
  // Navigation
  "nav.forum": { en: "Forum", my: "ဖိုရမ်" },
  "nav.news": { en: "News", my: "သတင်း" },
  "nav.events": { en: "Create Event", my: "ပွဲဖန်တီးရန်" },
  "nav.programs": { en: "Programs", my: "အစီအစဉ်များ" },
  "nav.resources": { en: "Resource", my: "အရင်းအမြစ်" },
  "nav.diaspora": { en: "Community", my: "ဒိုင်ယာစပိုရာ" },
  "nav.reconnection": { en: "Reconnection", my: "ပြန်ဆုံဆောင်ရွက်ရန်" },
  "nav.contact": { en: "Contact", my: "ဆက်သွယ်ရန်" },
  "nav.donations": { en: "Donations", my: "လှူဒါန်းမှုများ" },
  "nav.signin": { en: "Sign In", my: "ဝင်ရောက်ရန်" },
  "nav.join": { en: "Join Free →", my: "အခမဲ့ ပါဝင်ရန် →" },
  "nav.signout": { en: "Sign Out", my: "ထွက်ရန်" },
  "nav.profile": { en: "My Profile", my: "ကျွန်ုပ်ပရိုဖိုင်" },
  "nav.notifications": { en: "Notifications", my: "အကြောင်းကြားချက်များ" },

  // Homepage hero
  "hero.join": { en: "Join Now →", my: "ယခုပါဝင်ရန် →" },
  "hero.explore": { en: "Explore Resources", my: "အရင်းအမြစ်များ ကြည့်ရှုရန်" },

  // Features section badge
  "features.badge": { en: "Phase 1 Launch", my: "အဆင့် ၁ စတင်ပြီ" },
  "features.explore": { en: "Explore →", my: "ကြည့်ရှုရန် →" },

  // Announcements section
  "announcements.badge": { en: "Verified Updates", my: "အတည်ပြုထားသော အပ်ဒိတ်များ" },
  "announcements.title": { en: "Latest announcements", my: "နောက်ဆုံး ကြေညာချက်များ" },
  "announcements.more": { en: "View all news →", my: "သတင်းအားလုံး ကြည့်ရှုရန် →" },

  // CTA section
  "cta.volunteer": { en: "Volunteer or Partner", my: "စေတနာ့ဝန်ထမ်း / ပူးတွဲလုပ်ဆောင်ရန်" },
  "cta.contact": { en: "Contact Us", my: "ဆက်သွယ်ရန်" },

  // Footer
  "footer.platform": { en: "Platform", my: "ပလက်ဖောင်း" },
  "footer.community": { en: "Community", my: "လူ့အဖွဲ့အစည်း" },
  "footer.about": { en: "About", my: "အကြောင်းသိရှိရန်" },
  "footer.lang_label": { en: "Switch Language", my: "ဘာသာစကား ပြောင်းရန်" },
  "footer.rights": { en: "© 2026 Together Myanmar. All rights reserved.", my: "© ၂၀၂၆ Together Myanmar. မူပိုင်ခွင့် အားလုံး သိမ်းဆည်းထား။" },
  "footer.privacy": { en: "Privacy", my: "ကိုယ်ရေးကိုယ်တာ" },
  "footer.terms": { en: "Terms", my: "စည်းကမ်းချက်များ" },
  "footer.systems": { en: "All systems operational", my: "စနစ်အားလုံး ကောင်းမွန်နေသည်" },

  // Feature card names
  "feature.forum": { en: "Community Forum", my: "ชุมชน ဖိုရမ်" },
  "feature.resources": { en: "Resource Hub", my: "အရင်းအမြစ် ဗဟိုဌာန" },
  "feature.reconnection": { en: "Reconnection", my: "ပြန်ဆုံဆောင်ရွက်ရန်" },
  "feature.events": { en: "Events Calendar", my: "ပွဲများ ပြက္ခဒိန်" },
  "feature.diaspora": { en: "Community Directory", my: "ဒိုင်ယာစပိုရာ လမ်းညွှန်" },
  "feature.news": { en: "Latest News", my: "နောက်ဆုံး သတင်းများ" },
};

const LangCtx = createContext<LangContextType>({
  lang: "en",
  setLang: () => { },
  t: (key) => TRANSLATIONS[key]?.en ?? key,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = localStorage.getItem("tm_lang") as Lang | null;
    if (saved === "en" || saved === "my") setLangState(saved);
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem("tm_lang", l);
  }

  function t(key: string): string {
    return TRANSLATIONS[key]?.[lang] ?? key;
  }

  return <LangCtx.Provider value={{ lang, setLang, t }}>{children}</LangCtx.Provider>;
}

export function useLanguage(): LangContextType {
  return useContext(LangCtx);
}
