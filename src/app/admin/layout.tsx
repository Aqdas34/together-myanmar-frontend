"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getMe } from "@/lib/api";

type NavItem = { href: string; label: string; icon: string; exact?: boolean };

const navItems: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: "📊", exact: true },
  { href: "/admin/users", label: "Users", icon: "👥" },
  { href: "/admin/news", label: "News & Posts", icon: "📰" },
  { href: "/admin/resources", label: "Resources", icon: "📚" },
  { href: "/admin/messages", label: "Messages", icon: "✉️" },
  { href: "/admin/volunteers", label: "Volunteers", icon: "🙋" },
  { href: "/admin/newsletter", label: "Newsletter", icon: "📧" },
  { href: "/admin/content", label: "Page Content", icon: "✏️" },
  { href: "/admin/settings", label: "Settings", icon: "⚙️" },
];

const communityNavItems: NavItem[] = [
  { href: "/admin/forum", label: "Forum", icon: "💬" },
  { href: "/admin/events", label: "Events", icon: "📅" },
  { href: "/admin/programs", label: "Programs", icon: "🎓" },
  { href: "/admin/diaspora", label: "Community Dir.", icon: "🌍" },
];

const allNavItems = [...navItems, ...communityNavItems];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
      if (!token) { router.replace("/login?next=/admin"); return; }
      try {
        const me = await getMe(token);
        if (me.role !== "admin" && me.role !== "moderator") {
          router.replace("/");
          return;
        }
        setAdminEmail(me.email);
      } catch {
        router.replace("/login?next=/admin");
      } finally {
        setChecking(false);
      }
    }
    checkAuth();
  }, [router]);

  function handleSignOut() {
    localStorage.removeItem("access_token");
    router.push("/login");
  }

  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-sm text-gray-500">Verifying access…</p>
        </div>
      </div>
    );
  }

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-gray-900 transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-gray-800 px-5">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
            style={{ background: "linear-gradient(135deg, #dc2626 0%, #facc15 50%, #16a34a 100%)" }}
          >
            <span className="text-xs font-black text-white">TM</span>
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">Together Myanmar</p>
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive(item.href, item.exact)
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
          <div className="mt-4 px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Community
          </div>
          {communityNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? "bg-purple-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User footer */}
        <div className="border-t border-gray-800 p-4">
          <div className="mb-3 rounded-xl bg-gray-800 px-3 py-2">
            <p className="text-xs text-gray-400 truncate">{adminEmail}</p>
            <p className="text-xs font-medium text-blue-400">Administrator</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/"
              className="flex-1 rounded-lg bg-gray-800 py-2 text-center text-xs font-medium text-gray-300 transition-colors hover:bg-gray-700"
            >
              ← Site
            </Link>
            <button
              onClick={handleSignOut}
              className="flex-1 rounded-lg bg-red-900/50 py-2 text-xs font-medium text-red-400 transition-colors hover:bg-red-900"
            >
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
            aria-label="Toggle sidebar"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-gray-900 lg:ml-0 ml-3">
            {allNavItems.find((n) => isActive(n.href, n.exact))?.label ?? "Admin"}
          </h1>
          <Link
            href="/"
            className="hidden text-sm text-gray-500 hover:text-gray-900 sm:block"
          >
            View site →
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
