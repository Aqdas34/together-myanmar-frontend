"use client";

import { useState, useEffect, FormEvent } from "react";
import {
  adminListAllEvents,
  adminListPendingEvents,
  adminCreateEvent,
  adminUpdateEvent,
  adminDeleteEvent,
  adminApproveEvent,
  type CommunityEvent,
} from "@/lib/api";

const TYPE_LABELS: Record<string, string> = {
  online: "Online",
  in_person: "In-Person",
  hybrid: "Hybrid",
};
const TYPE_COLORS: Record<string, string> = {
  online: "bg-green-100 text-green-700",
  in_person: "bg-blue-100 text-blue-700",
  hybrid: "bg-purple-100 text-purple-700",
};

const STATUS_COLORS: Record<string, string> = {
  pending:  "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-600",
};

function toLocal(iso: string) {
  if (!iso) return "";
  return iso.slice(0, 16);
}

const emptyForm = {
  title_en: "",
  title_my: "",
  title_th: "",
  title_ms: "",
  description_en: "",
  event_type: "in_person" as "online" | "in_person" | "hybrid",
  starts_at: "",
  ends_at: "",
  location_name: "",
  location_address: "",
  online_url: "",
  is_published: false,
};

export default function AdminEventsPage() {
  const [token, setToken] = useState<string | null>(null);
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [pendingEvents, setPendingEvents] = useState<CommunityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"all" | "pending">("all");
  const [showForm, setShowForm] = useState(false);
  const [editEvent, setEditEvent] = useState<CommunityEvent | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [msg, setMsg] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setToken(localStorage.getItem("access_token"));
  }, []);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    // Load independently — pending failing must NOT stop all events from loading
    const loadAll = adminListAllEvents(token)
      .then(setEvents)
      .catch((err: unknown) => setMsg((err as Error).message || "Failed to load events"));
    const loadPending = adminListPendingEvents(token)
      .then(setPendingEvents)
      .catch(() => {}); // pending endpoint failure is non-critical
    Promise.all([loadAll, loadPending]).finally(() => setLoading(false));
  }, [token, refreshKey]);

  function refresh() {
    setMsg("");
    setRefreshKey((k) => k + 1);
  }

  function openCreate() {
    setEditEvent(null);
    setForm(emptyForm);
    setMsg("");
    setShowForm(true);
  }

  function openEdit(ev: CommunityEvent) {
    setEditEvent(ev);
    setForm({
      title_en: ev.title_en,
      title_my: ev.title_my ?? "",
      title_th: ev.title_th ?? "",
      title_ms: ev.title_ms ?? "",
      description_en: ev.description_en ?? "",
      event_type: ev.event_type,
      starts_at: toLocal(ev.starts_at),
      ends_at: toLocal(ev.ends_at ?? ""),
      location_name: ev.location_name ?? "",
      location_address: ev.location_address ?? "",
      online_url: ev.online_url ?? "",
      is_published: ev.is_published,
    });
    setMsg("");
    setShowForm(true);
  }

  async function handleApprove(ev: CommunityEvent, newStatus: "approved" | "rejected") {
    if (!token) return;
    try {
      const updated = await adminApproveEvent(token, ev.id, newStatus);
      setPendingEvents((prev) => prev.filter((e) => e.id !== updated.id));
      setEvents((prev) => {
        const exists = prev.some((e) => e.id === updated.id);
        return exists ? prev.map((e) => (e.id === updated.id ? updated : e)) : [updated, ...prev];
      });
      setMsg(`Event "${ev.title_en}" ${newStatus}.`);
    } catch (err: unknown) {
      setMsg((err as Error).message || "Failed to update approval");
    }
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setMsg("");
    const payload = {
      ...form,
      ends_at: form.ends_at || undefined,
      location_name: form.location_name || undefined,
      location_address: form.location_address || undefined,
      online_url: form.online_url || undefined,
    };
    try {
      if (editEvent) {
        const updated = await adminUpdateEvent(token, editEvent.id, payload);
        setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
        setMsg("Event updated.");
      } else {
        const created = await adminCreateEvent(token, payload);
        setEvents((prev) => [created, ...prev]);
        setMsg("Event created.");
      }
      setShowForm(false);
    } catch (err: unknown) {
      setMsg((err as Error).message || "Failed to save event");
    }
  }

  async function togglePublish(ev: CommunityEvent) {
    if (!token) return;
    try {
      const updated = await adminUpdateEvent(token, ev.id, { is_published: !ev.is_published });
      setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    } catch {}
  }

  async function handleDelete(ev: CommunityEvent) {
    if (!token || !confirm(`Delete "${ev.title_en}"? This cannot be undone.`)) return;
    try {
      await adminDeleteEvent(token, ev.id);
      setEvents((prev) => prev.filter((e) => e.id !== ev.id));
    } catch (err: unknown) {
      setMsg((err as Error).message || "Failed to delete");
    }
  }

  const filtered = events.filter((ev) => {
    const q = search.toLowerCase();
    const matchSearch = ev.title_en.toLowerCase().includes(q) || (ev.location_name ?? "").toLowerCase().includes(q);
    const matchFilter =
      filter === "all" || (filter === "published" ? ev.is_published : !ev.is_published);
    return matchSearch && matchFilter;
  });

  const publishedCount = events.filter((e) => e.is_published).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Events Management</h2>
          <p className="text-sm text-gray-500">
            {events.length} total &middot; {publishedCount} published &middot;{" "}
            <span className={pendingEvents.length > 0 ? "text-yellow-600 font-medium" : ""}>
              {pendingEvents.length} pending approval
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={refresh}
            disabled={loading}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? "Loading..." : "↻ Refresh"}
          </button>
          <button
            onClick={openCreate}
            className="rounded-xl bg-amber-600 px-5 py-2 text-sm font-semibold text-white hover:bg-amber-700"
          >
            + New Event
          </button>
        </div>
      </div>

      {msg && (
        <div
          className={`rounded-xl px-4 py-2.5 text-sm ${
            msg.includes("Failed") ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"
          }`}
        >
          {msg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setTab("all")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === "all"
              ? "border-amber-600 text-amber-700"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          All Events
        </button>
        <button
          onClick={() => setTab("pending")}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === "pending"
              ? "border-yellow-500 text-yellow-700"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Pending Approval
          {pendingEvents.length > 0 && (
            <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-bold text-yellow-700">
              {pendingEvents.length}
            </span>
          )}
        </button>
      </div>

      {/* ---- PENDING APPROVAL TAB ---- */}
      {tab === "pending" && (
        <div className="space-y-4">
          {loading ? (
            <div className="flex h-32 items-center justify-center text-gray-400">Loading...</div>
          ) : pendingEvents.length === 0 ? (
            <div className="flex h-32 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-400">
              No events pending approval.
            </div>
          ) : (
            pendingEvents.map((ev) => (
              <div key={ev.id} className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-gray-900">{ev.title_en}</h3>
                    {ev.title_my && <p className="text-xs text-gray-400">{ev.title_my}</p>}
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${TYPE_COLORS[ev.event_type]}`}>
                    {TYPE_LABELS[ev.event_type]}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <span>
                    Starts: {new Date(ev.starts_at).toLocaleDateString("en-GB", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </span>
                  {ev.location_name && <span>Location: {ev.location_name}</span>}
                  {ev.online_url && (
                    <a href={ev.online_url} target="_blank" rel="noopener noreferrer" className="text-cyan-600 underline">
                      Online link
                    </a>
                  )}
                </div>
                {ev.description_en && (
                  <p className="text-sm text-gray-500 line-clamp-3">{ev.description_en}</p>
                )}
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => handleApprove(ev, "approved")}
                    className="rounded-xl bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleApprove(ev, "rejected")}
                    className="rounded-xl bg-red-50 px-5 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 border border-red-200"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => { openEdit(ev); setTab("all"); }}
                    className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ---- ALL EVENTS TAB ---- */}
      {tab === "all" && (
        <>
          {/* Create / Edit form */}
          {showForm && (
        <form
          onSubmit={handleSave}
          className="rounded-2xl border border-amber-200 bg-amber-50 p-6 space-y-4"
        >
          <h3 className="font-bold text-gray-900">{editEvent ? "Edit Event" : "New Event"}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Title (English) *</label>
              <input
                required
                value={form.title_en}
                onChange={(e) => setForm({ ...form, title_en: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Title (Burmese)</label>
              <input
                value={form.title_my}
                onChange={(e) => setForm({ ...form, title_my: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Title (Thai)</label>
              <input
                value={form.title_th}
                onChange={(e) => setForm({ ...form, title_th: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Title (Malay)</label>
              <input
                value={form.title_ms}
                onChange={(e) => setForm({ ...form, title_ms: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Event Type</label>
              <select
                value={form.event_type}
                onChange={(e) =>
                  setForm({ ...form, event_type: e.target.value as typeof form.event_type })
                }
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="in_person">In-Person</option>
                <option value="online">Online</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Starts At *</label>
              <input
                required
                type="datetime-local"
                value={form.starts_at}
                onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Ends At</label>
              <input
                type="datetime-local"
                value={form.ends_at}
                onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Location Name</label>
              <input
                value={form.location_name}
                onChange={(e) => setForm({ ...form, location_name: e.target.value })}
                placeholder="e.g. Community Centre Bangkok"
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Location Address</label>
              <input
                value={form.location_address}
                onChange={(e) => setForm({ ...form, location_address: e.target.value })}
                placeholder="Street, City, Country"
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Online URL</label>
              <input
                type="url"
                value={form.online_url}
                onChange={(e) => setForm({ ...form, online_url: e.target.value })}
                placeholder="https://zoom.us/j/..."
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Description (English)</label>
            <textarea
              rows={3}
              value={form.description_en}
              onChange={(e) => setForm({ ...form, description_en: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
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
              className="rounded-xl bg-amber-600 px-5 py-2 text-sm font-semibold text-white hover:bg-amber-700"
            >
              {editEvent ? "Save Changes" : "Create Event"}
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

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 sm:flex-row">
        <input
          type="text"
          placeholder="Search events..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-xl border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
          className="rounded-xl border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
        >
          <option value="all">All</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        {loading ? (
          <div className="flex h-32 items-center justify-center text-gray-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-gray-400">No events found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-600">Title</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Type</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Starts</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered
                .sort((a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime())
                .map((ev) => (
                  <tr key={ev.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{ev.title_en}</div>
                      {ev.location_name && (
                        <div className="text-xs text-gray-400">{ev.location_name}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          TYPE_COLORS[ev.event_type]
                        }`}
                      >
                        {TYPE_LABELS[ev.event_type]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(ev.starts_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          STATUS_COLORS[ev.status] ?? "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {ev.status.charAt(0).toUpperCase() + ev.status.slice(1)}
                        {ev.status === "approved" && (ev.is_published ? " · Live" : " · Draft")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => openEdit(ev)}
                          className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200"
                        >
                          Edit
                        </button>
                        {ev.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(ev, "approved")}
                              className="rounded-lg bg-green-50 px-3 py-1 text-xs font-medium text-green-600 hover:bg-green-100"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleApprove(ev, "rejected")}
                              className="rounded-lg bg-red-50 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-100"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {ev.status === "approved" && (
                          <button
                            onClick={() => togglePublish(ev)}
                            className={`rounded-lg px-3 py-1 text-xs font-medium ${
                              ev.is_published
                                ? "bg-amber-50 text-amber-600 hover:bg-amber-100"
                                : "bg-green-50 text-green-600 hover:bg-green-100"
                            }`}
                          >
                            {ev.is_published ? "Unpublish" : "Publish"}
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(ev)}
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
        </>
      )}
    </div>
  );
}
