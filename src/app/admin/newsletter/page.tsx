"use client";

import { useState, useEffect, useCallback } from "react";
import {
  adminListNewsletterSubscribers,
  adminDeleteNewsletterSubscriber,
  type NewsletterSubscriber,
  ApiError,
} from "@/lib/api";

export default function AdminNewsletterPage() {
  const [token, setToken] = useState<string | null>(null);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setToken(localStorage.getItem("access_token"));
  }, []);

  const fetchSubscribers = useCallback(
    async (searchTerm?: string) => {
      if (!token) return;
      setLoading(true);
      setError("");
      try {
        const data = await adminListNewsletterSubscribers(token, searchTerm);
        setSubscribers(data);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Failed to load subscribers.");
      } finally {
        setLoading(false);
      }
    },
    [token],
  );

  // Initial load
  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  // Debounced search — re-fetch 400 ms after the user stops typing
  useEffect(() => {
    const timer = setTimeout(() => fetchSubscribers(search || undefined), 400);
    return () => clearTimeout(timer);
  }, [search, fetchSubscribers]);

  async function handleDelete(id: number, email: string) {
    if (!token) return;
    if (!window.confirm(`Remove "${email}" from the newsletter list?`)) return;
    setDeletingId(id);
    try {
      await adminDeleteNewsletterSubscriber(token, id);
      setSubscribers((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Delete failed.");
    } finally {
      setDeletingId(null);
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Newsletter Subscribers</h1>
          <p className="text-sm text-gray-500">
            {loading ? "Loading…" : `${subscribers.length} subscriber${subscribers.length !== 1 ? "s" : ""}`}
            {search ? " matching your search" : ""}
          </p>
        </div>

        {/* Export link — downloads as CSV via simple client-side conversion */}
        {subscribers.length > 0 && !search && (
          <button
            onClick={() => {
              const rows = ["id,email,subscribed_at", ...subscribers.map((s) => `${s.id},${s.email},${s.created_at}`)];
              const blob = new Blob([rows.join("\n")], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "newsletter_subscribers.csv";
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
          >
            ⬇️ Export CSV
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* Summary card */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Subscribers</p>
          <p className="mt-1 text-3xl font-extrabold text-blue-600">{subscribers.length}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Most Recent</p>
          <p className="mt-1 text-sm font-semibold text-gray-800">
            {subscribers.length > 0 ? formatDate(subscribers[0].created_at) : "—"}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Oldest Entry</p>
          <p className="mt-1 text-sm font-semibold text-gray-800">
            {subscribers.length > 0 ? formatDate(subscribers[subscribers.length - 1].created_at) : "—"}
          </p>
        </div>
      </div>

      {/* Search */}
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by email address…"
        className="w-full max-w-sm rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
      />

      {/* Table */}
      {loading ? (
        <div className="flex h-40 items-center justify-center text-gray-400">Loading subscribers…</div>
      ) : subscribers.length === 0 ? (
        <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-gray-300 text-gray-400">
          {search ? "No subscribers match your search." : "No subscribers yet."}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                <th className="px-5 py-3">ID</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Subscribed On</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {subscribers.map((sub) => (
                <tr key={sub.id} className="transition-colors hover:bg-gray-50">
                  <td className="px-5 py-3 text-gray-400">#{sub.id}</td>
                  <td className="px-5 py-3 font-medium text-gray-800">{sub.email}</td>
                  <td className="px-5 py-3 text-gray-500">{formatDate(sub.created_at)}</td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => handleDelete(sub.id, sub.email)}
                      disabled={deletingId === sub.id}
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
                    >
                      {deletingId === sub.id ? "Removing…" : "Remove"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
