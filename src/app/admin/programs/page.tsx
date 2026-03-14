"use client";

import { useState, useEffect, FormEvent } from "react";
import {
  adminListAllPrograms,
  adminCreateProgram,
  adminUpdateProgram,
  adminDeleteProgram,
  adminListAllEvents,
  type Program,
  type CommunityEvent,
} from "@/lib/api";

const emptyForm = {
  category: "youth" as "youth" | "women",
  title_en: "",
  title_my: "",
  title_th: "",
  title_ms: "",
  description_en: "",
  image_url: "",
  event_id: "",
  external_url: "",
  display_order: 0,
  is_published: false,
};

type CatFilter = "all" | "youth" | "women";

export default function AdminProgramsPage() {
  const [token, setToken] = useState<string | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [catFilter, setCatFilter] = useState<CatFilter>("all");
  const [showForm, setShowForm] = useState(false);
  const [editProg, setEditProg] = useState<Program | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    setToken(localStorage.getItem("access_token"));
  }, []);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    Promise.all([adminListAllPrograms(token), adminListAllEvents(token)])
      .then(([progs, evs]) => {
        setPrograms(progs);
        setEvents(evs);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  function openCreate() {
    setEditProg(null);
    setForm(emptyForm);
    setMsg("");
    setShowForm(true);
  }

  function openEdit(prog: Program) {
    setEditProg(prog);
    setForm({
      category: prog.category as "youth" | "women",
      title_en: prog.title_en,
      title_my: prog.title_my ?? "",
      title_th: prog.title_th ?? "",
      title_ms: prog.title_ms ?? "",
      description_en: prog.description_en ?? "",
      image_url: prog.image_url ?? "",
      event_id: prog.event_id ?? "",
      external_url: prog.external_url ?? "",
      display_order: prog.display_order,
      is_published: prog.is_published,
    });
    setMsg("");
    setShowForm(true);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setMsg("");
    const payload = {
      ...form,
      event_id: form.event_id !== "" ? form.event_id : undefined,
      external_url: form.external_url || undefined,
      image_url: form.image_url || undefined,
    };
    try {
      if (editProg) {
        const updated = await adminUpdateProgram(token, editProg.id, payload);
        setPrograms((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        setMsg("Program updated.");
      } else {
        const created = await adminCreateProgram(token, payload);
        setPrograms((prev) => [created, ...prev]);
        setMsg("Program created.");
      }
      setShowForm(false);
    } catch (err: unknown) {
      setMsg((err as Error).message || "Failed to save program");
    }
  }

  async function togglePublish(prog: Program) {
    if (!token) return;
    try {
      const updated = await adminUpdateProgram(token, prog.id, { is_published: !prog.is_published });
      setPrograms((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } catch {}
  }

  async function handleDelete(prog: Program) {
    if (!token || !confirm(`Delete "${prog.title_en}"? This cannot be undone.`)) return;
    try {
      await adminDeleteProgram(token, prog.id);
      setPrograms((prev) => prev.filter((p) => p.id !== prog.id));
    } catch (err: unknown) {
      setMsg((err as Error).message || "Failed to delete");
    }
  }

  const filtered = programs.filter((p) => catFilter === "all" || p.category === catFilter);
  const youthCount = programs.filter((p) => p.category === "youth").length;
  const womenCount = programs.filter((p) => p.category === "women").length;
  const tabCounts: Record<CatFilter, number> = { all: programs.length, youth: youthCount, women: womenCount };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Programs Management</h2>
          <p className="text-sm text-gray-500">
            {youthCount} youth &middot; {womenCount} women
          </p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          + New Program
        </button>
      </div>

      {msg && (
        <div
          className={`rounded-xl px-4 py-2.5 text-sm ${
            msg.includes("Failed") ? "bg-red-50 text-red-700" : "bg-indigo-50 text-indigo-700"
          }`}
        >
          {msg}
        </div>
      )}

      {/* Create / Edit form */}
      {showForm && (
        <form
          onSubmit={handleSave}
          className="rounded-2xl border border-indigo-200 bg-indigo-50 p-6 space-y-4"
        >
          <h3 className="font-bold text-gray-900">{editProg ? "Edit Program" : "New Program"}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Category *</label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value as "youth" | "women" })
                }
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="youth">Youth</option>
                <option value="women">Women</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Display Order</label>
              <input
                type="number"
                value={form.display_order}
                onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Title (English) *</label>
              <input
                required
                value={form.title_en}
                onChange={(e) => setForm({ ...form, title_en: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Title (Burmese)</label>
              <input
                value={form.title_my}
                onChange={(e) => setForm({ ...form, title_my: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Title (Thai)</label>
              <input
                value={form.title_th}
                onChange={(e) => setForm({ ...form, title_th: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Title (Malay)</label>
              <input
                value={form.title_ms}
                onChange={(e) => setForm({ ...form, title_ms: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Link to Event (optional)</label>
              <select
                value={form.event_id}
                onChange={(e) => setForm({ ...form, event_id: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="">None</option>
                {events.map((ev) => (
                  <option key={ev.id} value={String(ev.id)}>
                    {ev.title_en}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">External URL (optional)</label>
              <input
                type="url"
                value={form.external_url}
                onChange={(e) => setForm({ ...form, external_url: e.target.value })}
                placeholder="https://..."
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-gray-700">Image URL (optional)</label>
              <input
                type="url"
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                placeholder="https://..."
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Description (English)</label>
            <textarea
              rows={3}
              value={form.description_en}
              onChange={(e) => setForm({ ...form, description_en: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.is_published}
              onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
              className="rounded"
            />
            Publish immediately
          </label>
          <div className="flex gap-3">
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              {editProg ? "Save Changes" : "Create Program"}
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

      {/* Category tabs */}
      <div className="flex gap-0 border-b border-gray-200">
        {(["all", "youth", "women"] as CatFilter[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setCatFilter(cat)}
            className={`-mb-px px-5 py-2.5 text-sm font-medium capitalize border-b-2 transition-colors ${
              catFilter === cat
                ? "border-indigo-600 text-indigo-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {cat === "all" ? "All Programs" : cat.charAt(0).toUpperCase() + cat.slice(1)}
            <span className="ml-2 text-xs text-gray-400">({tabCounts[cat]})</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        {loading ? (
          <div className="flex h-32 items-center justify-center text-gray-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-gray-400">No programs found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-600">Title</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Category</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Order</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered
                .sort((a, b) => a.display_order - b.display_order)
                .map((prog) => (
                  <tr key={prog.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{prog.title_en}</div>
                      {prog.external_url && (
                        <div className="max-w-xs truncate text-xs text-blue-500">{prog.external_url}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                          prog.category === "youth"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-pink-100 text-pink-700"
                        }`}
                      >
                        {prog.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{prog.display_order}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          prog.is_published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {prog.is_published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(prog)}
                          className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => togglePublish(prog)}
                          className={`rounded-lg px-3 py-1 text-xs font-medium ${
                            prog.is_published
                              ? "bg-amber-50 text-amber-600 hover:bg-amber-100"
                              : "bg-green-50 text-green-600 hover:bg-green-100"
                          }`}
                        >
                          {prog.is_published ? "Unpublish" : "Publish"}
                        </button>
                        <button
                          onClick={() => handleDelete(prog)}
                          className="rounded-lg bg-red-50 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-100"
                        >
                          Delete
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
  );
}
