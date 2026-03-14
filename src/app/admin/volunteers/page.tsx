"use client";

import { useState, useEffect } from "react";
import {
  adminListVolunteers, adminListPartnerships,
  type VolunteerSignup, type PartnershipInquiry,
} from "@/lib/api";

type Tab = "volunteers" | "partnerships";

export default function AdminVolunteersPage() {
  const [token, setToken] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("volunteers");
  const [volunteers, setVolunteers] = useState<VolunteerSignup[]>([]);
  const [partnerships, setPartnerships] = useState<PartnershipInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => { setToken(localStorage.getItem("access_token")); }, []);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    Promise.all([adminListVolunteers(token), adminListPartnerships(token)])
      .then(([v, p]) => { setVolunteers(v); setPartnerships(p); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const filteredVols = volunteers.filter(
    (v) =>
      !search ||
      v.full_name.toLowerCase().includes(search.toLowerCase()) ||
      v.email.toLowerCase().includes(search.toLowerCase()),
  );

  const filteredParts = partnerships.filter(
    (p) =>
      !search ||
      p.organization_name.toLowerCase().includes(search.toLowerCase()) ||
      p.contact_name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Volunteers &amp; Partnerships</h1>
        <p className="text-sm text-gray-500">
          {volunteers.length} volunteers / {partnerships.length} partnerships
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {(["volunteers", "partnerships"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`border-b-2 px-4 py-2 text-sm font-semibold capitalize transition-colors ${
              tab === t
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t} ({t === "volunteers" ? volunteers.length : partnerships.length})
          </button>
        ))}
      </div>

      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={tab === "volunteers" ? "Search by name or email..." : "Search by organization or contact..."}
        className="w-full max-w-sm rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
      />

      {loading ? (
        <div className="flex h-32 items-center justify-center text-gray-400">Loading...</div>
      ) : tab === "volunteers" ? (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          {filteredVols.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-gray-400">No volunteers found.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Email</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Country</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Areas</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredVols.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{v.full_name}</td>
                    <td className="px-4 py-3 text-gray-600">{v.email}</td>
                    <td className="px-4 py-3 text-gray-600">{v.country ?? "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(v.areas_of_interest?.split(",").map((a) => a.trim()).filter(Boolean) ?? []).map((area: string) => (
                          <span key={area} className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                            {area}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {new Date(v.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          {filteredParts.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-gray-400">No partnerships found.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Organization</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Contact</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Email</th>

                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredParts.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{p.organization_name}</td>
                    <td className="px-4 py-3 text-gray-600">{p.contact_name}</td>
                    <td className="px-4 py-3 text-gray-600">{p.email}</td>

                    <td className="px-4 py-3 text-gray-400">
                      {new Date(p.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
