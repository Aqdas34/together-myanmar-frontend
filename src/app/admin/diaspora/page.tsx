"use client";

import { useState, useEffect } from "react";
import {
  adminGetAllListings,
  adminApproveListing,
  adminRejectListing,
  adminDeleteDiasporaListing,
  type DiasporaListing,
} from "@/lib/api";

type Tab = "pending" | "approved" | "all";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-600",
};
const TYPE_COLORS: Record<string, string> = {
  individual: "bg-blue-100 text-blue-700",
  organization: "bg-purple-100 text-purple-700",
};

export default function AdminDiasporaPage() {
  const [token, setToken] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("pending");
  const [allListings, setAllListings] = useState<DiasporaListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setToken(localStorage.getItem("access_token"));
  }, []);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setMsg("");
    adminGetAllListings(token)
      .then(setAllListings)
      .catch((err: unknown) => setMsg((err as Error).message || "Failed to load listings"))
      .finally(() => setLoading(false));
  }, [token]);

  function updateListing(updated: DiasporaListing) {
    setAllListings((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
  }

  async function handleApprove(id: string) {
    if (!token) return;
    setMsg("");
    try {
      const updated = await adminApproveListing(token, id);
      updateListing(updated);
      setMsg("Listing approved.");
    } catch (err: unknown) {
      setMsg((err as Error).message || "Failed to approve");
    }
  }

  async function handleReject(id: string) {
    if (!token) return;
    setMsg("");
    try {
      const updated = await adminRejectListing(token, id);
      updateListing(updated);
      setMsg("Listing rejected.");
    } catch (err: unknown) {
      setMsg((err as Error).message || "Failed to reject");
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!token || !confirm(`Delete listing "${name}"? This cannot be undone.`)) return;
    setMsg("");
    try {
      await adminDeleteDiasporaListing(token, id);
      setAllListings((prev) => prev.filter((l) => l.id !== id));
      setMsg("Listing deleted.");
    } catch (err: unknown) {
      setMsg((err as Error).message || "Failed to delete");
    }
  }

  const pendingListings = allListings.filter((l) => l.status === "pending");
  const approvedListings = allListings.filter((l) => l.status === "approved");

  function getTabData(): DiasporaListing[] {
    const base =
      tab === "pending" ? pendingListings : tab === "approved" ? approvedListings : allListings;
    if (!search) return base;
    const q = search.toLowerCase();
    return base.filter(
      (l) => l.name.toLowerCase().includes(q) || (l.city ?? "").toLowerCase().includes(q)
    );
  }

  const displayed = getTabData();

  const tabConfig: { key: Tab; label: string }[] = [
    { key: "pending", label: "Pending" },
    { key: "approved", label: "Approved" },
    { key: "all", label: "All" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Community Directory</h2>
        <p className="text-sm text-gray-500">
          {pendingListings.length} pending approval &middot; {approvedListings.length} approved
        </p>
      </div>

      {msg && (
        <div
          className={`rounded-xl px-4 py-2.5 text-sm ${
            msg.includes("Failed") ? "bg-red-50 text-red-700" : "bg-teal-50 text-teal-700"
          }`}
        >
          {msg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-0 border-b border-gray-200">
        {tabConfig.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`-mb-px px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === key
                ? "border-teal-600 text-teal-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {label}
            {key === "pending" && pendingListings.length > 0 && (
              <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">
                {pendingListings.length}
              </span>
            )}
            {key !== "pending" && (
              <span className="ml-2 text-xs text-gray-400">
                ({key === "approved" ? approvedListings.length : allListings.length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by name or city..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-200"
      />

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        {loading ? (
          <div className="flex h-32 items-center justify-center text-gray-400">Loading...</div>
        ) : displayed.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-gray-400">
            {tab === "pending" ? "No pending listings." : "No listings found."}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-600">Listing</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Type</th>
                <th className="px-4 py-3 font-semibold text-gray-600">City</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Contact</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayed.map((listing) => (
                <tr key={listing.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{listing.name}</div>
                    {listing.description && (
                      <div className="line-clamp-1 max-w-xs text-xs text-gray-400">
                        {listing.description}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                        TYPE_COLORS[listing.listing_type] ?? "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {listing.listing_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{listing.city ?? "\u2014"}</td>
                  <td className="px-4 py-3">
                    {listing.contact_email ? (
                      <a
                        href={`mailto:${listing.contact_email}`}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        {listing.contact_email}
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400">\u2014</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                        STATUS_COLORS[listing.status] ?? "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {listing.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {listing.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleApprove(listing.id)}
                            className="rounded-lg bg-green-50 px-3 py-1 text-xs font-medium text-green-700 hover:bg-green-100"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(listing.id)}
                            className="rounded-lg bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(listing.id, listing.name)}
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
