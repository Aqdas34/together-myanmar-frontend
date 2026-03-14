"use client";

import { useState, useEffect, FormEvent } from "react";
import {
  getForumCategories,
  adminCreateForumCategory,
  adminUpdateForumCategory,
  adminGetForumReports,
  adminReviewForumReport,
  type ForumCategory,
  type ForumReport,
} from "@/lib/api";

type Tab = "categories" | "reports";

const emptyForm = {
  name_en: "",
  name_my: "",
  name_th: "",
  name_ms: "",
  description_en: "",
  slug: "",
  display_order: 0,
};

export default function AdminForumPage() {
  const [token, setToken] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("categories");

  // Categories
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [catsLoading, setCatsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editCat, setEditCat] = useState<ForumCategory | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [catMsg, setCatMsg] = useState("");

  // Reports
  const [reports, setReports] = useState<ForumReport[]>([]);
  const [repsLoading, setRepsLoading] = useState(false);
  const [pendingOnly, setPendingOnly] = useState(true);
  const [repMsg, setRepMsg] = useState("");

  useEffect(() => {
    setToken(localStorage.getItem("access_token"));
  }, []);

  useEffect(() => {
    getForumCategories()
      .then(setCategories)
      .catch(() => {})
      .finally(() => setCatsLoading(false));
  }, []);

  useEffect(() => {
    if (tab !== "reports" || !token) return;
    setRepsLoading(true);
    adminGetForumReports(token, pendingOnly)
      .then(setReports)
      .catch(() => {})
      .finally(() => setRepsLoading(false));
  }, [tab, token, pendingOnly]);

  function openCreate() {
    setEditCat(null);
    setForm(emptyForm);
    setCatMsg("");
    setShowForm(true);
  }

  function openEdit(cat: ForumCategory) {
    setEditCat(cat);
    setForm({
      name_en: cat.name_en,
      name_my: cat.name_my ?? "",
      name_th: cat.name_th ?? "",
      name_ms: cat.name_ms ?? "",
      description_en: cat.description_en ?? "",
      slug: cat.slug,
      display_order: cat.display_order,
    });
    setCatMsg("");
    setShowForm(true);
  }

  async function handleSaveCat(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setCatMsg("");
    try {
      if (editCat) {
        const updated = await adminUpdateForumCategory(token, editCat.id, form);
        setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        setCatMsg("Category updated.");
      } else {
        const created = await adminCreateForumCategory(token, form);
        setCategories((prev) => [...prev, created]);
        setCatMsg("Category created.");
      }
      setShowForm(false);
    } catch (err: unknown) {
      setCatMsg((err as Error).message || "Failed to save category");
    }
  }

  async function toggleActive(cat: ForumCategory) {
    if (!token) return;
    try {
      const updated = await adminUpdateForumCategory(token, cat.id, { is_active: !cat.is_active });
      setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    } catch {}
  }

  async function handleReview(reportId: string, status: "reviewed" | "dismissed") {
    if (!token) return;
    setRepMsg("");
    try {
      const updated = await adminReviewForumReport(token, reportId, status);
      setReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setRepMsg(status === "reviewed" ? "Content removed and report closed." : "Report dismissed.");
    } catch (err: unknown) {
      setRepMsg((err as Error).message || "Action failed");
    }
  }

  const pendingCount = reports.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Forum Management</h2>
          <p className="text-sm text-gray-500">
            {categories.length} categories
            {tab === "reports" && ` \u00b7 ${pendingCount} pending reports`}
          </p>
        </div>
        {tab === "categories" && (
          <button
            onClick={openCreate}
            className="rounded-xl bg-purple-600 px-5 py-2 text-sm font-semibold text-white hover:bg-purple-700"
          >
            + New Category
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-gray-200">
        {(["categories", "reports"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`-mb-px px-5 py-2.5 text-sm font-medium capitalize border-b-2 transition-colors ${
              tab === t
                ? "border-purple-600 text-purple-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t}
            {t === "reports" && pendingCount > 0 && (
              <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── CATEGORIES ── */}
      {tab === "categories" && (
        <div className="space-y-4">
          {catMsg && (
            <div
              className={`rounded-xl px-4 py-2.5 text-sm ${
                catMsg.includes("Failed") ? "bg-red-50 text-red-700" : "bg-purple-50 text-purple-700"
              }`}
            >
              {catMsg}
            </div>
          )}

          {showForm && (
            <form
              onSubmit={handleSaveCat}
              className="rounded-2xl border border-purple-200 bg-purple-50 p-6 space-y-4"
            >
              <h3 className="font-bold text-gray-900">{editCat ? "Edit Category" : "New Category"}</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">Name (English) *</label>
                  <input
                    required
                    value={form.name_en}
                    onChange={(e) => setForm({ ...form, name_en: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">Name (Burmese)</label>
                  <input
                    value={form.name_my}
                    onChange={(e) => setForm({ ...form, name_my: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">Name (Thai)</label>
                  <input
                    value={form.name_th}
                    onChange={(e) => setForm({ ...form, name_th: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">Name (Malay)</label>
                  <input
                    value={form.name_ms}
                    onChange={(e) => setForm({ ...form, name_ms: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">Slug *</label>
                  <input
                    required
                    value={form.slug}
                    onChange={(e) =>
                      setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })
                    }
                    placeholder="my-category"
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">Display Order</label>
                  <input
                    type="number"
                    value={form.display_order}
                    onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Description (English)</label>
                <textarea
                  rows={2}
                  value={form.description_en}
                  onChange={(e) => setForm({ ...form, description_en: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="rounded-xl bg-purple-600 px-5 py-2 text-sm font-semibold text-white hover:bg-purple-700"
                >
                  {editCat ? "Save Changes" : "Create Category"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl bg-gray-200 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            {catsLoading ? (
              <div className="flex h-32 items-center justify-center text-gray-400">Loading...</div>
            ) : categories.length === 0 ? (
              <div className="flex h-32 items-center justify-center text-gray-400">
                No categories yet. Create one above.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-gray-600">Name</th>
                    <th className="px-4 py-3 font-semibold text-gray-600">Slug</th>
                    <th className="px-4 py-3 font-semibold text-gray-600">Order</th>
                    <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
                    <th className="px-4 py-3 font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{cat.name_en}</div>
                        {cat.name_my && <div className="text-xs text-gray-400">{cat.name_my}</div>}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{cat.slug}</td>
                      <td className="px-4 py-3 text-gray-600">{cat.display_order}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            cat.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {cat.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEdit(cat)}
                            className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => toggleActive(cat)}
                            className={`rounded-lg px-3 py-1 text-xs font-medium ${
                              cat.is_active
                                ? "bg-red-50 text-red-600 hover:bg-red-100"
                                : "bg-green-50 text-green-600 hover:bg-green-100"
                            }`}
                          >
                            {cat.is_active ? "Deactivate" : "Activate"}
                          </button>
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

      {/* ── REPORTS ── */}
      {tab === "reports" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={pendingOnly}
                onChange={(e) => setPendingOnly(e.target.checked)}
                className="rounded"
              />
              Show pending only
            </label>
            {repMsg && (
              <div className="rounded-xl bg-purple-50 px-4 py-1.5 text-sm text-purple-700">{repMsg}</div>
            )}
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            {repsLoading ? (
              <div className="flex h-32 items-center justify-center text-gray-400">Loading reports...</div>
            ) : reports.length === 0 ? (
              <div className="flex h-32 items-center justify-center text-gray-400">
                {pendingOnly ? "No pending reports." : "No reports found."}
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-gray-600">Content Type</th>
                    <th className="px-4 py-3 font-semibold text-gray-600">Reason</th>
                    <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
                    <th className="px-4 py-3 font-semibold text-gray-600">Date</th>
                    <th className="px-4 py-3 font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reports.map((rep) => (
                    <tr key={rep.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            rep.thread_id ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {rep.thread_id ? "Thread" : "Reply"}
                        </span>
                      </td>
                      <td className="max-w-xs px-4 py-3">
                        <p className="line-clamp-2 text-gray-700">{rep.reason}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                            rep.status === "pending"
                              ? "bg-amber-100 text-amber-700"
                              : rep.status === "reviewed"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {rep.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(rep.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        {rep.status === "pending" ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleReview(rep.id, "reviewed")}
                              className="rounded-lg bg-red-50 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-100"
                            >
                              Remove Content
                            </button>
                            <button
                              onClick={() => handleReview(rep.id, "dismissed")}
                              className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200"
                            >
                              Dismiss
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Closed</span>
                        )}
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
