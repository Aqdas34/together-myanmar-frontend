"use client";

import { useState, useEffect, useCallback } from "react";
import { getAdminUsers, getAdminUserProfile, adminUpdateUser, AdminUser, AdminUserProfile } from "@/lib/api";

const roleBadge: Record<string, string> = {
  admin: "bg-red-100 text-red-700",
  moderator: "bg-purple-100 text-purple-700",
  user: "bg-gray-100 text-gray-600",
};

const langLabel: Record<string, string> = {
  en: "English", my: "Burmese", th: "Thai", ms: "Malay",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Profile detail panel
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [profileDetail, setProfileDetail] = useState<AdminUserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Inline update state
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState("");

  async function handleUpdateUser(userId: string, patch: { is_active?: boolean; role?: string }) {
    const token = localStorage.getItem("access_token") ?? "";
    setUpdatingUserId(userId);
    setUpdateError("");
    try {
      const updated = await adminUpdateUser(token, userId, patch);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, role: updated.role, is_active: updated.is_active }
            : u
        )
      );
      if (selectedUser?.id === userId) {
        setSelectedUser((prev) => prev ? { ...prev, role: updated.role, is_active: updated.is_active } : prev);
      }
    } catch (e: unknown) {
      setUpdateError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setUpdatingUserId(null);
    }
  }

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchUsers = useCallback(async () => {
    const token = localStorage.getItem("access_token") ?? "";
    if (!token) { setError("Not authenticated"); setLoading(false); return; }
    setLoading(true);
    setError("");
    try {
      const data = await getAdminUsers(token, {
        limit: 100,
        search: debouncedSearch,
        role: roleFilter,
      });
      setUsers(data.users);
      setTotal(data.total);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, roleFilter]);

  async function viewProfile(user: AdminUser) {
    setSelectedUser(user);
    setProfileDetail(null);
    setProfileLoading(true);
    const token = localStorage.getItem("access_token") ?? "";
    try {
      const data = await getAdminUserProfile(token, user.id);
      setProfileDetail(data);
    } catch { /* show empty */ }
    finally { setProfileLoading(false); }
  }

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Users</h2>
          <p className="text-sm text-gray-500">{loading ? "Loading…" : `${total} registered members`}</p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}
      {updateError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{updateError}</div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 sm:flex-row">
        <input
          type="text"
          placeholder="Search by email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="moderator">Moderator</option>
          <option value="user">User</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Email</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Role</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Language</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Verified</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Joined</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Profile</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-sm text-gray-400">Loading…</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-sm text-gray-400">No users found.</td>
                </tr>
              ) : users.map((u) => (
                <tr key={u.id} className={`transition-colors hover:bg-gray-50 ${selectedUser?.id === u.id ? "bg-blue-50" : ""}`}>
                  <td className="px-5 py-4 font-medium text-gray-900">{u.email}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${roleBadge[u.role] ?? "bg-gray-100 text-gray-600"}`}>{u.role}</span>
                  </td>
                  <td className="px-5 py-4 text-gray-600">{langLabel[u.preferred_language] ?? u.preferred_language}</td>
                  <td className="px-5 py-4">
                    {u.is_email_verified
                      ? <span className="text-emerald-600 font-medium">✓ Yes</span>
                      : <span className="text-gray-400">No</span>}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${u.is_active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${u.is_active ? "bg-emerald-500" : "bg-red-500"}`} />
                      {u.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-500">{u.created_at ?? "—"}</td>
                  <td className="px-5 py-4">
                    <button onClick={() => viewProfile(u)} className="text-xs font-semibold text-blue-600 hover:text-blue-800">View</button>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        disabled={updatingUserId === u.id}
                        onClick={() => handleUpdateUser(u.id, { is_active: !u.is_active })}
                        className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors disabled:opacity-50 ${
                          u.is_active
                            ? "bg-red-100 text-red-700 hover:bg-red-200"
                            : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                        }`}
                      >
                        {updatingUserId === u.id ? "…" : u.is_active ? "Deactivate" : "Activate"}
                      </button>
                      <select
                        disabled={updatingUserId === u.id}
                        value={u.role}
                        onChange={(e) => handleUpdateUser(u.id, { role: e.target.value })}
                        className="rounded-lg border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-50"
                      >
                        <option value="user">User</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Profile Detail Panel ── */}
      {selectedUser && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">User Profile — {selectedUser.email}</h3>
            <button onClick={() => { setSelectedUser(null); setProfileDetail(null); }} className="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
          </div>
          {profileLoading ? (
            <p className="text-sm text-gray-400">Loading profile…</p>
          ) : !profileDetail?.profile ? (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">This user has not yet completed their profile.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Full Name</p>
                  <p className="mt-1 text-sm font-semibold text-gray-900">{profileDetail.profile.full_name}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Location</p>
                  <p className="mt-1 text-sm text-gray-700">
                    {profileDetail.profile.country_id ? `Country ID: ${profileDetail.profile.country_id}` : "—"}
                    {profileDetail.profile.city ? ` · ${profileDetail.profile.city}` : ""}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Bio</p>
                  <p className="mt-1 text-sm text-gray-700">{profileDetail.profile.bio || "—"}</p>
                </div>
                <div className="flex gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Community Dir.</p>
                    <p className="mt-1 text-sm">{profileDetail.profile.show_in_diaspora_directory ? <span className="text-emerald-600 font-medium">Opted in</span> : <span className="text-gray-400">Hidden</span>}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Allow Requests</p>
                    <p className="mt-1 text-sm">{profileDetail.profile.privacy_allow_connection_requests ? <span className="text-emerald-600 font-medium">Yes</span> : <span className="text-gray-400">No</span>}</p>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Family Relationships ({profileDetail.family.length})</p>
                {profileDetail.family.length === 0 ? (
                  <p className="text-sm text-gray-400">None declared.</p>
                ) : (
                  <div className="space-y-2">
                    {profileDetail.family.map((r) => (
                      <div key={r.id} className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
                        <span className="text-xs font-semibold text-gray-700">{r.relationship_label}</span>
                        {r.related_name_free_text && <span className="text-xs text-gray-500">— {r.related_name_free_text}</span>}
                        {r.related_user_id && <span className="ml-auto rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">🔗 Linked</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
