"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import {
  getAdminResources, getResourceCategories, moderateResource, createResourceCategory,
  Resource, ResourceCategory, ApiError,
} from "@/lib/api";

type MainTab = "moderation" | "categories";
type StatusTab = "pending" | "approved" | "rejected" | "all";

const STATUS_TABS: { key: StatusTab; label: string }[] = [
  { key: "pending",  label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "all",      label: "All" },
];

const STATUS_BADGE: Record<string, string> = {
  pending:  "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
};

const CAT_ICONS: Record<string, string> = {
  education: "🎓", employment: "💼", "legal-aid": "⚖️",
  health: "🏥", "community-programs": "🤝",
};

// ─── Categories sub-panel ────────────────────────────────────────────────────
function CategoriesPanel({ token }: { token: string }) {
  const [categories, setCategories] = useState<ResourceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [form, setForm] = useState({ slug: "", name_en: "", name_my: "", display_order: "" });
  const inputCls = "w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200";

  const load = useCallback(() => {
    setLoading(true);
    getResourceCategories()
      .then(setCategories)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  // Auto-generate slug from english name
  function handleNameChange(val: string) {
    setForm((f) => ({
      ...f,
      name_en: val,
      slug: val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.slug || !form.name_en) { setMsg({ text: "Slug and English name are required.", ok: false }); return; }
    setSaving(true);
    try {
      await createResourceCategory(token, {
        slug: form.slug,
        name_en: form.name_en,
        name_my: form.name_my || undefined,
        display_order: form.display_order ? Number(form.display_order) : 0,
      });
      setMsg({ text: `Category "${form.name_en}" created.`, ok: true });
      setForm({ slug: "", name_en: "", name_my: "", display_order: "" });
      load();
    } catch (err) {
      setMsg({ text: err instanceof ApiError ? err.message : "Failed to create category.", ok: false });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Add form */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-bold text-gray-900">Add New Category</h2>
        {msg && (
          <div className={`mb-4 flex items-center justify-between rounded-xl border px-4 py-3 text-sm ${msg.ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"}`}>
            {msg.text}
            <button onClick={() => setMsg(null)} className="ml-2 opacity-50 hover:opacity-100">✕</button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">Name (English) *</label>
            <input value={form.name_en} onChange={(e) => handleNameChange(e.target.value)} required placeholder="e.g. Legal Aid" className={inputCls} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">Slug *</label>
            <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required placeholder="e.g. legal-aid" className={inputCls} />
            <p className="mt-1 text-xs text-gray-400">Auto-generated from name. Lowercase letters and hyphens only.</p>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">Name (Burmese)</label>
            <input value={form.name_my} onChange={(e) => setForm({ ...form, name_my: e.target.value })} placeholder="ဗမာဘာသာ နာမည်" className={inputCls} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">Display Order</label>
            <input type="number" min="0" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: e.target.value })} placeholder="0" className={inputCls} />
            <p className="mt-1 text-xs text-gray-400">Lower number = appears first.</p>
          </div>
          <button type="submit" disabled={saving} className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60">
            {saving ? "Creating…" : "Create Category"}
          </button>
        </form>
      </div>

      {/* Existing categories */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Existing Categories</h2>
          <button onClick={load} className="text-xs text-gray-400 hover:text-gray-600">↻ Refresh</button>
        </div>
        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <div key={i} className="h-12 animate-pulse rounded-xl bg-gray-100" />)}
          </div>
        ) : categories.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-200 py-10 text-center text-sm text-gray-400">
            No categories yet. Add one using the form.
          </div>
        ) : (
          <div className="space-y-2">
            {[...categories].sort((a, b) => a.display_order - b.display_order || a.name_en.localeCompare(b.name_en)).map((cat) => (
              <div key={cat.id} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                <span className="text-xl">{CAT_ICONS[cat.slug] ?? "📁"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{cat.name_en}</p>
                  {cat.name_my && <p className="text-xs text-gray-500">{cat.name_my}</p>}
                  <p className="text-xs text-gray-400">/{cat.slug} · order {cat.display_order}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function AdminResourcesPage() {
  const [mainTab, setMainTab]           = useState<MainTab>("moderation");
  const [resources, setResources]       = useState<Resource[]>([]);
  const [categories, setCategories]     = useState<ResourceCategory[]>([]);
  const [tab, setTab]                   = useState<StatusTab>("pending");
  const [loading, setLoading]           = useState(true);
  const [actionId, setActionId]         = useState<string | null>(null);
  const [rejectingId, setRejectingId]   = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [msg, setMsg]                   = useState<{ text: string; ok: boolean } | null>(null);
  const token = typeof window !== "undefined" ? (localStorage.getItem("access_token") ?? "") : "";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [res, cats] = await Promise.all([
        getAdminResources(token, tab === "all" ? undefined : tab),
        getResourceCategories(),
      ]);
      setResources(res);
      setCategories(cats);
    } catch {
      setResources([]);
    } finally {
      setLoading(false);
    }
  }, [tab, token]);

  useEffect(() => { if (mainTab === "moderation") load(); }, [load, mainTab]);

  async function act(id: string, data: { status?: string; is_verified?: boolean; rejection_reason?: string }) {
    setActionId(id);
    try {
      await moderateResource(token, id, data);
      setMsg({ text: "Updated successfully.", ok: true });
      setRejectingId(null);
      setRejectReason("");
      await load();
    } catch (err) {
      setMsg({ text: err instanceof ApiError ? err.message : "Action failed.", ok: false });
    } finally {
      setActionId(null);
    }
  }

  const catMap = Object.fromEntries(categories.map((c) => [c.id, c]));

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Resource Hub</h1>
        <p className="mt-0.5 text-sm text-gray-500">Manage resources, categories, and moderation.</p>
      </div>

      {/* Main tabs */}
      <div className="mb-6 flex gap-1 border-b border-gray-200">
        <button
          onClick={() => setMainTab("moderation")}
          className={`-mb-px border-b-2 px-5 py-2.5 text-sm font-semibold transition-colors ${mainTab === "moderation" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
        >
          📋 Moderation
        </button>
        <button
          onClick={() => setMainTab("categories")}
          className={`-mb-px border-b-2 px-5 py-2.5 text-sm font-semibold transition-colors ${mainTab === "categories" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
        >
          🗂️ Categories
        </button>
      </div>

      {/* Categories panel */}
      {mainTab === "categories" && <CategoriesPanel token={token} />}

      {/* Moderation panel */}
      {mainTab === "moderation" && (
        <>
          {msg && (
            <div className={`mb-4 flex items-center justify-between rounded-xl border px-4 py-3 text-sm ${msg.ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"}`}>
              {msg.text}
              <button onClick={() => setMsg(null)} className="ml-3 opacity-50 hover:opacity-100">✕</button>
            </div>
          )}

          {/* Status tabs */}
          <div className="mb-6 flex items-center gap-1 border-b border-gray-200">
            {STATUS_TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${tab === t.key ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
              >
                {t.label}
              </button>
            ))}
            <div className="ml-auto">
              <button onClick={load} className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50">
                ↻ Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-gray-200" />)}
            </div>
          ) : resources.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 py-16 text-center">
              <p className="text-lg font-semibold text-gray-400">No {tab === "all" ? "" : tab} resources</p>
            </div>
          ) : (
            <div className="space-y-4">
              {resources.map((r) => (
                <div key={r.id} className="rounded-2xl border border-gray-200 bg-white p-5">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-1.5">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_BADGE[r.status] ?? "bg-gray-100 text-gray-700"}`}>{r.status}</span>
                        {r.is_verified && (
                          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">✓ Verified</span>
                        )}
                        {catMap[r.category_id] && (
                          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600">{catMap[r.category_id].name_en}</span>
                        )}
                        {r.resource_type && <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-500">{r.resource_type}</span>}
                        {r.country && <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-500">📍 {r.country}</span>}
                      </div>
                      <h3 className="truncate font-bold text-gray-900">{r.title_en}</h3>
                      {r.title_my && <p className="truncate text-sm text-gray-500">{r.title_my}</p>}
                      <p className="mt-1 line-clamp-2 text-sm text-gray-600">{r.description_en}</p>
                      <a href={r.external_url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block break-all text-xs text-blue-600 hover:underline">{r.external_url}</a>
                      {r.rejection_reason && (
                        <div className="mt-2 rounded-lg bg-red-50 px-3 py-1.5 text-xs text-red-700">Rejection reason: {r.rejection_reason}</div>
                      )}
                      <p className="mt-2 text-xs text-gray-400">
                        Submitted {new Date(r.created_at).toLocaleDateString()}
                        {r.reviewed_at && ` · Reviewed ${new Date(r.reviewed_at).toLocaleDateString()}`}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-start gap-2 lg:flex-col lg:items-end">
                      {r.status !== "approved" && (
                        <button onClick={() => act(r.id, { status: "approved" })} disabled={actionId === r.id} className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
                          ✓ Approve
                        </button>
                      )}
                      {r.status !== "rejected" && (
                        rejectingId === r.id ? (
                          <div className="flex w-52 flex-col gap-2">
                            <input type="text" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Reason (optional)" className="rounded-xl border border-gray-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-red-400" />
                            <div className="flex gap-1.5">
                              <button onClick={() => act(r.id, { status: "rejected", rejection_reason: rejectReason || undefined })} disabled={actionId === r.id} className="flex-1 rounded-xl bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50">
                                Confirm Reject
                              </button>
                              <button onClick={() => { setRejectingId(null); setRejectReason(""); }} className="rounded-xl border border-gray-300 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50">
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => setRejectingId(r.id)} className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-100">
                            ✕ Reject
                          </button>
                        )
                      )}
                      <button
                        onClick={() => act(r.id, { is_verified: !r.is_verified })}
                        disabled={actionId === r.id}
                        className={`rounded-xl px-4 py-2 text-xs font-semibold disabled:opacity-50 ${r.is_verified ? "border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"}`}
                      >
                        {r.is_verified ? "★ Verified" : "☆ Mark Verified"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
