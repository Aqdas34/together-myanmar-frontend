"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { getMe, getUnreadNotificationCount } from "@/lib/api";
import { useLanguage } from "@/lib/language-context";

const NAV_LINKS = [
  { href: "/reconnection", key: "nav.reconnection" },
  { href: "/resources",    key: "nav.resources" },
  { href: "/events",       key: "nav.events" },
  { href: "/diaspora",     key: "nav.diaspora" },
  { href: "/news",         key: "nav.news" },
  { href: "/forum",        key: "nav.forum" },
  { href: "/donate",       key: "nav.donations" },
  { href: "/contact",      key: "nav.contact" },
];

export default function Navigation() {
  const router   = useRouter();
  const pathname = usePathname();
  const { lang, setLang, t } = useLanguage();
  const [isOpen,    setIsOpen]    = useState(false);
  const [scrolled,  setScrolled]  = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail,  setUserEmail]  = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Close mobile menu on route change
  useEffect(() => { setIsOpen(false); }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) { setIsLoggedIn(false); setUserEmail(""); return; }

    getMe(token)
      .then((user) => {
        setIsLoggedIn(true);
        setUserEmail(user.email);
        getUnreadNotificationCount(token).then((n) => setUnreadCount(n)).catch(() => {});
        pollRef.current = setInterval(() => {
          getUnreadNotificationCount(token).then((n) => setUnreadCount(n)).catch(() => {});
        }, 30_000);
      })
      .catch(() => {
        localStorage.removeItem("access_token");
        setIsLoggedIn(false);
        setUserEmail("");
      });

    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [pathname]);

  function handleSignOut() {
    localStorage.removeItem("access_token");
    setIsLoggedIn(false);
    setUnreadCount(0);
    if (pollRef.current) clearInterval(pollRef.current);
    router.push("/");
  }

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "nav-blur shadow-soft"
          : "border-b border-slate-100 bg-white"
      }`}
    >
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-[64px] items-center justify-between gap-4">

          {/* ── Logo ─────────────────────────────────────── */}
          <Link
            href="/"
            className="group flex shrink-0 items-center gap-3 transition-opacity hover:opacity-90"
          >
            {/* The OG Puzzle Globe Logo Concept */}
            <div className="relative flex h-10 w-10 items-center justify-center transition-transform group-hover:scale-105">
               <svg className="h-9 w-9" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Four interlocking puzzle pieces representing community units */}
                  <path d="M50 10C27.9 10 10 27.9 10 50C10 72.1 27.9 90 50 90C72.1 90 90 72.1 90 50C90 27.9 72.1 10 50 10ZM50 82C32.3 82 18 67.7 18 50C18 32.3 32.3 18 50 18C67.7 18 82 32.3 82 50C82 67.7 67.7 82 50 82Z" fill="#CBD5E0" opacity="0.2"/>
                  <path d="M50 18C32.3 18 18 32.3 18 50C18 52.1 18.2 54.1 18.6 56.1C21.6 55.4 24.3 56.6 25.8 59C27.3 61.4 27.2 64.4 25.5 66.8C31.5 76.5 41.5 82 52.8 82C53.7 82 54.7 81.9 55.6 81.8C55.2 78.8 56.7 75.8 59.4 74.3C62.1 72.8 65.4 73.1 67.9 75.2C76.8 69.8 82 59.8 82 49.2C82 32 67.7 18 50 18Z" fill="#CBD5E0" opacity="0.1"/>
                  {/* Puzzle Quadrants */}
                  <path d="M50 18C37.3 18 26.1 24.3 19.4 33.9C21.9 36 23.2 39 22.8 42C22.4 45 20.3 47.3 17.5 48.1C17.1 50.7 17 53.3 17.1 56C20.1 55.3 22.8 56.5 24.3 58.9C25.8 61.3 25.7 64.3 24 66.7C30 76.4 40 82 51.3 82C53.9 82 56.4 81.6 58.8 80.8C58.4 77.8 59.9 74.8 62.6 73.3C65.3 71.8 68.6 72.1 71.1 74.2C78.4 68.2 82.5 59.3 82.1 50C82.1 32.3 67.7 18 50 18Z" fill="url(#logo-gradient)" opacity="0.1"/>
                  
                  {/* Simple Multi-Color Puzzle Globe */}
                  <path d="M50 20C33.4 20 20 33.4 20 50C20 52.8 20.4 55.5 21 58.1C24 57.3 26.7 58.5 28.2 60.9C29.7 63.3 29.6 66.3 27.9 68.7C33.6 77 42.7 82 52.8 82C64.9 82 75.2 75 79.8 64.9C77 62.8 75.7 59.8 76.1 56.8C76.5 53.8 78.6 51.5 81.4 50.7C81.8 50.5 82 50.2 82 50C82 33.4 68.6 20 50 20Z" fill="url(#puzzle-pieces)"/>
                  
                  <defs>
                    <pattern id="puzzle-pieces" width="1" height="1" patternContentUnits="objectBoundingBox">
                       <rect width="0.5" height="0.5" fill="#3182CE"/> {/* Blue - Top Left */}
                       <rect x="0.5" width="0.5" height="0.5" fill="#ECC94B"/> {/* Yellow - Top Right */}
                       <rect y="0.5" width="0.5" height="0.5" fill="#48BB78"/> {/* Green - Bottom Left */}
                       <rect x="0.5" y="0.5" width="0.5" height="0.5" fill="#E53E3E"/> {/* Red - Bottom Right */}
                    </pattern>
                  </defs>
                  
                  {/* Better Representation of the puzzle globe icon */}
                  <g clipPath="url(#globe-clip)">
                    <path d="M50 50L20 20H50V50Z" fill="#3182CE"/> {/* Blue */}
                    <path d="M50 50L80 20H50V50Z" fill="#ECC94B"/> {/* Yellow */}
                    <path d="M50 50L20 80H50V50Z" fill="#48BB78"/> {/* Green */}
                    <path d="M50 50L80 80H50V50Z" fill="#E53E3E"/> {/* Red */}
                  </g>
                  <clipPath id="globe-clip">
                    <circle cx="50" cy="50" r="32"/>
                  </clipPath>
                  
                  {/* Interlocking puzzle-like curves */}
                  <circle cx="50" cy="35" r="8" fill="#ECC94B"/>
                  <circle cx="65" cy="50" r="8" fill="#E53E3E"/>
                  <circle cx="50" cy="65" r="8" fill="#48BB78"/>
                  <circle cx="35" cy="50" r="8" fill="#3182CE"/>
               </svg>
            </div>
            <div className="flex flex-col -space-y-1 ml-1">
               <span className="text-[17px] font-black tracking-tight text-slate-900 leading-none">
                 Together
               </span>
               <span className="text-[17px] font-black tracking-tight text-[#D69E2E] leading-none">
                 Myanmar
               </span>
            </div>
          </Link>

          {/* ── Desktop nav links ─────────────────────────── */}
          <div className="hidden items-center gap-2 lg:flex">
            {NAV_LINKS.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative whitespace-nowrap rounded-md px-3 py-2 text-[13.5px] font-medium transition-all duration-150 ${
                    active
                      ? "text-primary-600 bg-primary-50"
                      : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                  }`}
                >
                  {t(link.key)}
                </Link>
              );
            })}
          </div>

          {/* ── Desktop actions ───────────────────────────── */}
          <div className="hidden shrink-0 items-center gap-3 lg:flex">
            {/* Language toggle */}
            <button
              onClick={() => setLang(lang === "en" ? "my" : "en")}
              className="group flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-600 transition-all hover:bg-slate-50 hover:border-slate-300"
            >
              <span>{lang === "en" ? "မြန်မာ" : "English"}</span>
              <span className="text-sm opacity-80 group-hover:opacity-100">{lang === "en" ? "🇲🇲" : "🇬🇧"}</span>
            </button>

            <div className="h-4 w-px bg-slate-200" />

            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/reconnection"
                  className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-800"
                >
                  <svg className="h-[20px] w-[20px]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7a6 6 0 10-12 0v.7c0 2.123-.733 4.05-1.957 5.552a23.909 23.909 0 005.454 1.31m5.454 0a17.45 17.45 0 01-10.908 0M15 19.128a3 3 0 11-6 0" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute right-1.5 top-1.5 flex h-[16px] w-[16px] items-center justify-center rounded-full bg-primary-600 text-[9px] font-bold text-white ring-2 ring-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>

                <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50/50 p-1 pr-3">
                   <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white">
                      {userEmail.slice(0, 1).toUpperCase()}
                   </div>
                   <Link href="/user/profile" className="text-[13px] font-semibold text-slate-700 hover:text-primary-600">
                      {t("nav.profile")}
                   </Link>
                </div>

                <button
                  onClick={handleSignOut}
                  className="text-[13px] font-semibold text-slate-500 hover:text-slate-900"
                >
                  {t("nav.signout")}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="rounded-lg px-4 py-2 text-[13.5px] font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                >
                  {t("nav.signin")}
                </Link>
                <Link
                  href="/register"
                  className="btn-primary py-2 text-[13.5px]"
                >
                  {t("nav.join")}
                </Link>
              </div>
            )}
          </div>

          {/* ── Mobile hamburger ──────────────────────────── */}
          <button
            type="button"
            onClick={() => setIsOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
          >
            <div className="relative h-5 w-5">
              <span className={`absolute block h-0.5 w-5 bg-current transition-all duration-300 ${isOpen ? "top-2 rotate-45" : "top-0.5"}`} />
              <span className={`absolute block h-0.5 w-5 bg-current transition-all duration-300 top-2 ${isOpen ? "opacity-0" : "opacity-100"}`} />
              <span className={`absolute block h-0.5 w-5 bg-current transition-all duration-300 ${isOpen ? "top-2 -rotate-45" : "top-3.5"}`} />
            </div>
          </button>
        </div>
      </div>

      {/* ── Mobile menu ──────────────────────────────────── */}
      {isOpen && (
        <div className="animate-fade-in border-t border-slate-100 bg-white px-4 pb-8 pt-4 lg:hidden">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                    active
                      ? "bg-primary-50 text-primary-700"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {t(link.key)}
                </Link>
              );
            })}
          </div>

          <div className="mt-6 flex flex-col gap-4 border-t border-slate-100 pt-6">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { setLang("en"); setIsOpen(false); }}
                className={`rounded-lg border px-4 py-2.5 text-sm font-semibold transition-all ${
                  lang === "en" ? "bg-primary-50 border-primary-200 text-primary-700" : "border-slate-200 text-slate-600"
                }`}
              >
                🇬🇧 English
              </button>
              <button
                onClick={() => { setLang("my"); setIsOpen(false); }}
                className={`rounded-lg border px-4 py-2.5 text-sm font-semibold transition-all ${
                  lang === "my" ? "bg-primary-50 border-primary-200 text-primary-700" : "border-slate-200 text-slate-600"
                }`}
              >
                🇲🇲 မြန်မာ
              </button>
            </div>

            {isLoggedIn ? (
              <div className="flex flex-col gap-2">
                <Link
                  href="/user/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-800"
                >
                  {t("nav.profile")}
                </Link>
                <button
                  onClick={() => { setIsOpen(false); handleSignOut(); }}
                  className="rounded-xl bg-slate-100 py-3 text-sm font-bold text-slate-700"
                >
                  {t("nav.signout")}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-700"
                >
                  {t("nav.signin")}
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsOpen(false)}
                  className="btn-primary py-3 text-center text-sm font-bold"
                >
                  {t("nav.join")}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
