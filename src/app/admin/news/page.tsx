"use client";

import { useState, useEffect, useRef } from "react";
import {
  adminListAllNews, adminCreateNews, adminUpdateNews, adminDeleteNews,
  getNewsCategories, adminCreateNewsCategory, adminUpdateNewsCategory, adminDeleteNewsCategory,
  type NewsPost, type NewsCategory,
} from "@/lib/api";

type MainTab = "posts" | "categories";
type StatusFilter = "all" | "published" | "draft" | "archived";
type LangTab = "en" | "my" | "th" | "ms";

const LANG_LABELS: Record<LangTab, string> = {
  en: "English", my: "Myanmar", th: "Thai", ms: "Malay",
};

const STATUS_COLORS: Record<string, string> = {
  published: "bg-green-100 text-green-700",
  draft: "bg-yellow-100 text-yellow-700",
  archived: "bg-gray-100 text-gray-500",
};

const EMPTY_FORM = {
  title_en: "", title_my: "", title_th: "", title_ms: "",
  body_en: "", body_my: "", body_th: "", body_ms: "",
  slug: "", status: "draft" as string, category_ids: [] as number[],
};

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function AdminNewsPage() {
  const [token, setToken] = useState<string | null>(null);
  const [mainTab, setMainTab] = useState<MainTab>("posts");
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [langTab, setLangTab] = useState<LangTab>("en");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const autoSaveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Category management state
  const [catForm, setCatForm] = useState({ name_en: "", name_my: "", name_th: "", name_ms: "", slug: "", display_order: 0 });
  const [editCatId, setEditCatId] = useState<number | null>(null);
  const [showCatForm, setShowCatForm] = useState(false);
  const [confirmDeleteCat, setConfirmDeleteCat] = useState<number | null>(null);

  useEffect(() => { setToken(localStorage.getItem("access_token")); }, []);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    Promise.all([adminListAllNews(token), getNewsCategories()])
      .then(([p, c]) => { setPosts(p); setCategories(c); })
      .catch((err: any) => setError(err?.message ?? "Failed to load data"))
      .finally(() => setLoading(false));
  }, [token]);

  // Auto-save draft every 60s when form is open and editing
  useEffect(() => {
    if (!showForm || !token) return;
    autoSaveRef.current = setInterval(async () => {
      if (form.status !== "draft" && !editId) return;
      try {
        if (editId) {
          await adminUpdateNews(token, editId, { ...form, status: "draft" });
        }
      } catch {}
    }, 60_000);
    return () => { if (autoSaveRef.current) clearInterval(autoSaveRef.current); };
  }, [showForm, token, editId, form]);

  const filtered = posts.filter((p) => {
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (search && !p.title_en.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  function openCreate() {
    setEditId(null);
    setForm(EMPTY_FORM);
    setLangTab("en");
    setSlugManuallyEdited(false);
    setShowForm(true);
    setError(null);
  }

  function openEdit(post: NewsPost) {
    setEditId(post.id);
    setForm({
      title_en: post.title_en,
      title_my: post.title_my ?? "",
      title_th: post.title_th ?? "",
      title_ms: post.title_ms ?? "",
      body_en: post.body_en,
      body_my: (post as any).body_my ?? "",
      body_th: (post as any).body_th ?? "",
      body_ms: (post as any).body_ms ?? "",
      slug: post.slug,
      status: post.status,
      category_ids: post.categories.map((c) => c.id),
    });
    setLangTab("en");
    setSlugManuallyEdited(true); // existing slug should not auto-update
    setShowForm(true);
    setError(null);
  }

  function toggleCat(id: number) {
    setForm((f) => ({
      ...f,
      category_ids: f.category_ids.includes(id)
        ? f.category_ids.filter((x) => x !== id)
        : [...f.category_ids, id],
    }));
  }

  async function handleSave(targetStatus: NewsPost["status"]) {
    if (!token) return;
    setSaving(true);
    setError(null);
    const payload = { ...form, status: targetStatus };
    try {
      if (editId) {
        const updated = await adminUpdateNews(token, editId, payload);
        setPosts((prev) => prev.map((p) => (p.id === editId ? updated : p)));
      } else {
        const created = await adminCreateNews(token, payload);
        setPosts((prev) => [created, ...prev]);
      }
      setShowForm(false);
    } catch (err: any) {
      setError(err?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!token) return;
    try {
      await adminDeleteNews(token, id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      setError("Delete failed");
    } finally {
      setConfirmDelete(null);
    }
  }

  async function setPostStatus(post: NewsPost, newStatus: NewsPost["status"]) {
    if (!token) return;
    try {
      const updated = await adminUpdateNews(token, post.id, { status: newStatus });
      setPosts((prev) => prev.map((p) => (p.id === post.id ? updated : p)));
    } catch {
      setError("Status update failed");
    }
  }

  async function handleSaveCat() {
    if (!token || !catForm.name_en || !catForm.slug) return;
    setSaving(true);
    try {
      if (editCatId !== null) {
        const updated = await adminUpdateNewsCategory(token, editCatId, catForm);
        setCategories((prev) => prev.map((c) => (c.id === editCatId ? updated : c)));
      } else {
        const created = await adminCreateNewsCategory(token, catForm);
        setCategories((prev) => [...prev, created]);
      }
      setShowCatForm(false);
      setCatForm({ name_en: "", name_my: "", name_th: "", name_ms: "", slug: "", display_order: 0 });
      setEditCatId(null);
    } catch (err: any) {
      setError(err?.message ?? "Category save failed");
    } finally {
      setSaving(false);
    }
  }

  function openEditCat(cat: NewsCategory) {
    setEditCatId(cat.id);
    setCatForm({ name_en: cat.name_en, name_my: cat.name_my, name_th: cat.name_th, name_ms: cat.name_ms, slug: cat.slug, display_order: cat.display_order });
    setShowCatForm(true);
  }

  async function handleDeleteCat(id: number) {
    if (!token) return;
    try {
      await adminDeleteNewsCategory(token, id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch {
      setError("Category delete failed");
    } finally {
      setConfirmDeleteCat(null);
    }
  }

  const bodyKey = `body_${langTab}` as keyof typeof form;
  const titleKey = `title_${langTab}` as keyof typeof form;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">News Management</h1>
          <p className="text-sm text-gray-500">{posts.length} total posts · {categories.length} categories</p>
        </div>
        {mainTab === "posts" ? (
          <button
            onClick={openCreate}
            className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            + New Post
          </button>
        ) : (
          <button
            onClick={() => { setShowCatForm(true); setEditCatId(null); setCatForm({ name_en: "", name_my: "", name_th: "", name_ms: "", slug: "", display_order: 0 }); }}
            className="rounded-xl bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-700"
          >
            + New Category
          </button>
        )}
      </div>

      {/* Main tabs */}
      <div className="flex gap-0 border-b border-gray-200">
        {(["posts", "categories"] as MainTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setMainTab(tab)}
            className={`-mb-px px-5 py-2 text-sm font-semibold border-b-2 capitalize transition-colors ${
              mainTab === tab ? "border-blue-600 text-blue-700" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab === "posts" ? "Posts" : "Categories"}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ── Posts tab ── */}
      {mainTab === "posts" && (
        <>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search posts..."
          className="rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
        {(["all", "published", "draft", "archived"] as StatusFilter[]).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
              statusFilter === s ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
          <h2 className="mb-4 font-bold text-blue-900">{editId ? "Edit Post" : "Create Post"}</h2>

          {/* Language tabs */}
          <div className="mb-4 flex gap-0 border-b border-blue-200">
            {(["en", "my", "th", "ms"] as LangTab[]).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setLangTab(lang)}
                className={`-mb-px px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  langTab === lang
                    ? "border-blue-600 text-blue-700"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {LANG_LABELS[lang]}
                {lang !== "en" && !form[titleKey] && (
                  <span className="ml-1 text-xs text-gray-400">(fallback)</span>
                )}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {/* Title for active language */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Title ({LANG_LABELS[langTab]}){langTab === "en" && " *"}
              </label>
              <input
                required={langTab === "en"}
                value={form[titleKey] as string}
                onChange={(e) => {
                  const v = e.target.value;
                  setForm((f) => {
                    const next = { ...f, [titleKey]: v };
                    // Auto-generate slug from EN title only when not manually set
                    if (langTab === "en" && !slugManuallyEdited) {
                      next.slug = slugify(v);
                    }
                    return next;
                  });
                }}
                className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
              />
            </div>

            {/* Body for active language */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Body ({LANG_LABELS[langTab]}){langTab === "en" && " *"}
              </label>
              <textarea
                required={langTab === "en"}
                rows={8}
                value={form[bodyKey] as string}
                onChange={(e) => setForm((f) => ({ ...f, [bodyKey]: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
              />
              <p className="mt-1 text-right text-xs text-gray-400">
                {(form[bodyKey] as string).length} characters
              </p>
            </div>

            {/* Slug + Categories (always visible) */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Slug *</label>
                <input
                  required
                  value={form.slug}
                  onChange={(e) => { setForm({ ...form, slug: e.target.value }); setSlugManuallyEdited(true); }}
                  className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
                />
              </div>
              {categories.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Categories</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => toggleCat(cat.id)}
                        className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                          form.category_ids.includes(cat.id)
                            ? "bg-blue-600 text-white"
                            : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {cat.name_en}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 border-t border-blue-200 pt-4">
              <button
                type="button"
                disabled={saving || !form.title_en || !form.body_en || !form.slug}
                onClick={() => handleSave("draft")}
                className="rounded-xl border border-blue-400 bg-white px-5 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Draft"}
              </button>
              <button
                type="button"
                disabled={saving || !form.title_en || !form.body_en || !form.slug}
                onClick={() => handleSave("published")}
                className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Publish Now"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-xl border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        {loading ? (
          <div className="flex h-32 items-center justify-center text-gray-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-gray-400">No posts found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Title</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Categories</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Published</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">
                    {post.title_en}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {post.categories.map((c) => (
                        <span key={c.id} className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                          {c.name_en}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${STATUS_COLORS[post.status] ?? "bg-gray-100 text-gray-500"}`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {post.published_at
                      ? new Date(post.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(post)}
                        className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-200"
                      >
                        Edit
                      </button>
                      {post.status === "draft" && (
                        <button
                          onClick={() => setPostStatus(post, "published")}
                          className="rounded-lg bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 hover:bg-green-200"
                        >
                          Publish
                        </button>
                      )}
                      {post.status === "published" && (
                        <>
                          <button
                            onClick={() => setPostStatus(post, "draft")}
                            className="rounded-lg bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700 hover:bg-yellow-200"
                          >
                            Unpublish
                          </button>
                          <button
                            onClick={() => setPostStatus(post, "archived")}
                            className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-200"
                          >
                            Archive
                          </button>
                        </>
                      )}
                      {post.status === "archived" && (
                        <button
                          onClick={() => setPostStatus(post, "published")}
                          className="rounded-lg bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 hover:bg-green-200"
                        >
                          Restore
                        </button>
                      )}
                      {confirmDelete === post.id ? (
                        <>
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="rounded-lg bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-200"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setConfirmDelete(post.id)}
                          className="rounded-lg bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-100"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
        </>
      )}

      {/* ── Categories tab ── */}
      {mainTab === "categories" && (
        <div className="space-y-4">
          {showCatForm && (
            <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
              <h2 className="mb-4 font-bold text-green-900">{editCatId !== null ? "Edit Category" : "New Category"}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name (English) *</label>
                  <input
                    value={catForm.name_en}
                    onChange={(e) => setCatForm((f) => ({ ...f, name_en: e.target.value, slug: editCatId !== null ? f.slug : e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") }))}
                    className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-green-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Slug *</label>
                  <input
                    value={catForm.slug}
                    onChange={(e) => setCatForm((f) => ({ ...f, slug: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-green-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name (Myanmar)</label>
                  <input value={catForm.name_my} onChange={(e) => setCatForm((f) => ({ ...f, name_my: e.target.value }))} className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-green-400 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name (Thai)</label>
                  <input value={catForm.name_th} onChange={(e) => setCatForm((f) => ({ ...f, name_th: e.target.value }))} className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-green-400 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name (Malay)</label>
                  <input value={catForm.name_ms} onChange={(e) => setCatForm((f) => ({ ...f, name_ms: e.target.value }))} className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-green-400 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Display Order</label>
                  <input
                    type="number"
                    value={catForm.display_order}
                    onChange={(e) => setCatForm((f) => ({ ...f, display_order: Number(e.target.value) }))}
                    className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-green-400 focus:outline-none"
                  />
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={handleSaveCat}
                  disabled={saving || !catForm.name_en || !catForm.slug}
                  className="rounded-xl bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
                >
                  {saving ? "Saving..." : editCatId !== null ? "Save Changes" : "Create Category"}
                </button>
                <button
                  onClick={() => { setShowCatForm(false); setEditCatId(null); }}
                  className="rounded-xl border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            {categories.length === 0 ? (
              <div className="flex h-24 items-center justify-center text-gray-400">No categories yet. Create one above.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b border-gray-100 bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Slug</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Order</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Posts</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[...categories].sort((a, b) => a.display_order - b.display_order || a.name_en.localeCompare(b.name_en)).map((cat) => (
                    <tr key={cat.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{cat.name_en}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{cat.slug}</td>
                      <td className="px-4 py-3 text-gray-500">{cat.display_order}</td>
                      <td className="px-4 py-3 text-gray-500">{cat.post_count ?? 0}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditCat(cat)}
                            className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-200"
                          >
                            Edit
                          </button>
                          {confirmDeleteCat === cat.id ? (
                            <>
                              <button
                                onClick={() => handleDeleteCat(cat.id)}
                                className="rounded-lg bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setConfirmDeleteCat(null)}
                                className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-200"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteCat(cat.id)}
                              className="rounded-lg bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-100"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
