"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAdminStats, type AdminStats, ApiError } from "@/lib/api";

const quickActions = [
  { label: "Create News Post",    href: "/admin/news",       icon: "📝", color: "bg-blue-600 hover:bg-blue-700" },
  { label: "Add Resource",        href: "/admin/resources",  icon: "➕", color: "bg-emerald-600 hover:bg-emerald-700" },
  { label: "View Messages",       href: "/admin/messages",   icon: "✉️", color: "bg-purple-600 hover:bg-purple-700" },
  { label: "Manage Volunteers",   href: "/admin/volunteers", icon: "🙋", color: "bg-amber-600 hover:bg-amber-700" },
  { label: "Create Event",        href: "/admin/events",     icon: "📅", color: "bg-cyan-600 hover:bg-cyan-700" },
  { label: "Approve Listings",    href: "/admin/diaspora",   icon: "🌍", color: "bg-teal-600 hover:bg-teal-700" },
];

const sections = [
  { title: "Users",              desc: "Manage registered members, roles, and account status.",               href: "/admin/users",      icon: "👥", badge: "Active" },
  { title: "News & Posts",       desc: "Create, edit, and publish news articles and announcements.",          href: "/admin/news",       icon: "📰", badge: "Content" },
  { title: "Resource Hub",       desc: "Review and approve submitted resources across all categories.",       href: "/admin/resources",  icon: "📚", badge: "Moderation" },
  { title: "Contact Messages",   desc: "View and manage inbound contact form submissions.",                   href: "/admin/messages",   icon: "✉️", badge: "Inbox" },
  { title: "Volunteers",         desc: "Review volunteer sign-ups and partnership inquiries.",                href: "/admin/volunteers", icon: "🙋", badge: "Community" },
  { title: "Forum",              desc: "Manage categories, review abuse reports, moderate threads.",          href: "/admin/forum",      icon: "💬", badge: "Moderation" },
  { title: "Events",             desc: "Create and manage online and in-person events.",                      href: "/admin/events",     icon: "📅", badge: "Community" },
  { title: "Programs",           desc: "Manage Youth and Women program pages linked to events or resources.", href: "/admin/programs",   icon: "🎓", badge: "Community" },
  { title: "Community Directory", desc: "Approve or reject user-submitted community listings.",                href: "/admin/diaspora",   icon: "🌍", badge: "Approval" },
];

function fmt(n: number | undefined) {
  if (n === undefined) return "—";
  return n.toLocaleString();
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) { setError("Not authenticated"); return; }
    getAdminStats(token)
      .then(setStats)
      .catch((err) => {
        if (err instanceof ApiError) setError(err.message);
        else setError("Could not load stats");
      });
  }, []);

  const statCards = [
    {
      label: "Total Users",
      value: fmt(stats?.users.total),
      sub: stats ? `${fmt(stats.users.verified)} verified` : "",
      icon: "👥",
      color: "bg-blue-50 border-blue-200",
      iconBg: "bg-blue-100",
      href: "/admin/users",
    },
    {
      label: "News Posts",
      value: fmt(stats?.news.total),
      sub: stats ? `${fmt(stats.news.published)} published` : "",
      icon: "📰",
      color: "bg-emerald-50 border-emerald-200",
      iconBg: "bg-emerald-100",
      href: "/admin/news",
    },
    {
      label: "Resources",
      value: fmt(stats?.resources.total),
      sub: stats ? `${fmt(stats.resources.pending)} pending review` : "",
      icon: "📚",
      color: "bg-purple-50 border-purple-200",
      iconBg: "bg-purple-100",
      href: "/admin/resources",
    },
    {
      label: "Messages",
      value: fmt(stats?.messages.total),
      sub: stats ? `${fmt(stats.volunteers.total)} volunteers` : "",
      icon: "✉️",
      color: "bg-amber-50 border-amber-200",
      iconBg: "bg-amber-100",
      href: "/admin/messages",
    },
    {
      label: "Forum Threads",
      value: fmt(stats?.forum.threads),
      sub: "",
      icon: "💬",
      color: "bg-cyan-50 border-cyan-200",
      iconBg: "bg-cyan-100",
      href: "/admin/forum",
    },
    {
      label: "Events",
      value: fmt(stats?.events.total),
      sub: "",
      icon: "📅",
      color: "bg-rose-50 border-rose-200",
      iconBg: "bg-rose-100",
      href: "/admin/events",
    },
    {
      label: "Community (pending)",
      value: fmt(stats?.diaspora.pending),
      sub: "",
      icon: "🌍",
      color: "bg-teal-50 border-teal-200",
      iconBg: "bg-teal-100",
      href: "/admin/diaspora",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div
        className="rounded-2xl p-6 text-white"
        style={{ background: "linear-gradient(135deg, #1d4ed8 0%, #4338ca 100%)" }}
      >
        <h2 className="text-2xl font-extrabold">Welcome to the Admin Panel</h2>
        <p className="mt-1 text-sm" style={{ color: "#bfdbfe" }}>
          Manage content, users, and platform settings for Together Myanmar.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {quickActions.map((a) => (
            <Link
              key={a.label}
              href={a.href}
              className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-colors ${a.color}`}
            >
              <span>{a.icon}</span>
              {a.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Could not load stats: {error}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className={`block rounded-2xl border-2 ${s.color} p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md`}
          >
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl text-xl ${s.iconBg}`}>
              {s.icon}
            </div>
            <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
            <p className="mt-0.5 text-sm font-medium text-gray-500">{s.label}</p>
            {s.sub && <p className="mt-1 text-xs text-gray-400">{s.sub}</p>}
          </Link>
        ))}
      </div>

      {/* Sections overview */}
      <div>
        <h3 className="mb-4 text-lg font-bold text-gray-900">Management Sections</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((s) => (
            <Link
              key={s.title}
              href={s.href}
              className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="mb-3 flex items-start justify-between">
                <span className="text-3xl">{s.icon}</span>
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                  {s.badge}
                </span>
              </div>
              <h4 className="mb-1 font-bold text-gray-900">{s.title}</h4>
              <p className="text-sm leading-relaxed text-gray-500">{s.desc}</p>
              <p className="mt-4 text-sm font-semibold text-blue-600 group-hover:underline">Open →</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Platform info */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-base font-bold text-gray-900">Platform Info</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: "API Endpoint", value: "http://localhost:8000/api/v1" },
            { label: "Languages",    value: "English, Burmese, Thai, Malay" },
            { label: "Version",      value: "Phase 1 — Beta" },
          ].map((item) => (
            <div key={item.label} className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{item.label}</p>
              <p className="mt-1 text-sm font-medium text-gray-800">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
