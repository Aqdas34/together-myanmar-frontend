"use client";

import { useState, useEffect, useCallback, useRef, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getMe,
  getMyProfile,
  upsertMyProfile,
  uploadAvatar,
  getFamilyRelationships,
  addFamilyRelationship,
  updateFamilyRelationship,
  deleteFamilyRelationship,
  lookupUserByEmail,
  getCountries,
  get2FAStatus,
  setup2FA,
  enable2FA,
  disable2FA,
  ApiError,
  type AuthUser,
  type UserProfile,
  type FamilyRelationship,
  type Country,
} from "@/lib/api"

type Tab = "profile" | "family" | "privacy" | "security";

const RELATIONSHIP_LABELS = [
  "Mother", "Father", "Sister", "Brother", "Daughter", "Son",
  "Grandmother", "Grandfather", "Aunt", "Uncle", "Cousin",
  "Wife", "Husband", "Friend", "Other",
];

export default function UserProfilePage() {
  return (
    <Suspense>
      <UserProfileInner />
    </Suspense>
  );
}

function UserProfileInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isWelcome = searchParams.get("welcome") === "1";

  const [me, setMe] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [family, setFamily] = useState<FamilyRelationship[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("profile");

  // Profile form
  const [fullName, setFullName] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const [countryId, setCountryId] = useState<number | "">("");
  const [showInDirectory, setShowInDirectory] = useState(false);
  const [allowRequests, setAllowRequests] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

  // Avatar
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarMsg, setAvatarMsg] = useState("");

  // Family form
  const [relLabel, setRelLabel] = useState("Mother");
  const [relName, setRelName] = useState("");
  const [relLinkedEmail, setRelLinkedEmail] = useState("");
  const [relLinkedId, setRelLinkedId] = useState<string | null>(null);
  const [relLinkMsg, setRelLinkMsg] = useState("");
  const [relLinkLoading, setRelLinkLoading] = useState(false);
  const [familyAdding, setFamilyAdding] = useState(false);

  // Family edit state
  const [editingRelId, setEditingRelId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editName, setEditName] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  // 2FA
  const [qrCode, setQrCode] = useState("");
  const [totpSecret, setTotpSecret] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [twoFALoading, setTwoFALoading] = useState(false);
  const [twoFAMsg, setTwoFAMsg] = useState("");
  const [twoFAError, setTwoFAError] = useState("");
  const [twoFAPhase, setTwoFAPhase] = useState<"idle" | "setup" | "disable">("idle");

  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const load = useCallback(async () => {
    if (!token) { router.replace("/login?next=/user/profile"); return; }
    try {
      const [user, twofa] = await Promise.all([getMe(token), get2FAStatus(token)]);
      setMe(user);
      setTwoFAEnabled(twofa.enabled);
      try {
        const p = await getMyProfile(token);
        setProfile(p);
        setFullName(p.full_name);
        setCity(p.city || "");
        setBio(p.bio || "");
        setCountryId(p.country_id ?? "");
        setShowInDirectory(p.show_in_diaspora_directory);
        setAllowRequests(p.privacy_allow_connection_requests);
        if (p.avatar_url) setAvatarPreview(`http://localhost:8000${p.avatar_url}`);
      } catch { /* profile not yet created */ }
      try {
        const c = await getCountries();
        setCountries(c);
      } catch { /* non-fatal */ }
      setFamily(await getFamilyRelationships(token));
    } catch { router.replace("/login?next=/user/profile"); }
    finally { setLoading(false); }
  }, [token, router]);

  useEffect(() => { load(); }, [load]);

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setProfileSaving(true);
    setProfileMsg("");
    try {
      const p = await upsertMyProfile(token, {
        full_name: fullName,
        city: city || undefined,
        bio: bio || undefined,
        country_id: countryId !== "" ? countryId : undefined,
        show_in_diaspora_directory: showInDirectory,
        privacy_allow_connection_requests: allowRequests,
      });
      setProfile(p);
      setProfileMsg("Profile saved successfully.");
    } catch (e) {
      setProfileMsg(e instanceof ApiError ? e.message : "Save failed.");
    } finally { setProfileSaving(false); }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setAvatarMsg("");
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarUploading(true);
    try {
      const p = await uploadAvatar(token, file);
      setProfile(p);
      if (p.avatar_url) setAvatarPreview(`http://localhost:8000${p.avatar_url}`);
      setAvatarMsg("Profile picture updated.");
    } catch (err) {
      setAvatarMsg(err instanceof ApiError ? err.message : "Upload failed.");
      setAvatarPreview(profile?.avatar_url ? `http://localhost:8000${profile.avatar_url}` : null);
    } finally {
      setAvatarUploading(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  }

  async function addRelationship(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setFamilyAdding(true);
    try {
      const r = await addFamilyRelationship(token, {
        relationship_label: relLabel,
        related_name_free_text: relName.trim() || undefined,
        related_user_id: relLinkedId || undefined,
      });
      setFamily((prev) => [...prev, r]);
      setRelName("");
      setRelLinkedEmail("");
      setRelLinkedId(null);
      setRelLinkMsg("");
    } catch { /* silent */ }
    finally { setFamilyAdding(false); }
  }

  async function lookupAccount() {
    if (!token || !relLinkedEmail.trim()) return;
    setRelLinkLoading(true);
    setRelLinkMsg("");
    setRelLinkedId(null);
    try {
      const result = await lookupUserByEmail(token, relLinkedEmail.trim());
      setRelLinkedId(result.id);
      setRelLinkMsg(`✓ Found: ${result.masked_email}`);
    } catch (e) {
      setRelLinkMsg(e instanceof ApiError ? e.message : "User not found.");
    } finally { setRelLinkLoading(false); }
  }

  function startEditRel(rel: FamilyRelationship) {
    setEditingRelId(rel.id);
    setEditLabel(rel.relationship_label);
    setEditName(rel.related_name_free_text || "");
  }

  async function saveEditRel(id: string) {
    if (!token) return;
    setEditSaving(true);
    try {
      const updated = await updateFamilyRelationship(token, id, {
        relationship_label: editLabel,
        related_name_free_text: editName.trim() || null,
      });
      setFamily((prev) => prev.map((r) => r.id === id ? updated : r));
      setEditingRelId(null);
    } catch { /* silent */ }
    finally { setEditSaving(false); }
  }

  async function deleteRel(id: string) {
    if (!token) return;
    await deleteFamilyRelationship(token, id);
    setFamily((prev) => prev.filter((r) => r.id !== id));
  }

  async function handleSetup2FA() {
    if (!token) return;
    setTwoFALoading(true); setTwoFAError("");
    try {
      const data = await setup2FA(token);
      setQrCode(data.qr_code); setTotpSecret(data.secret); setTwoFAPhase("setup");
    } catch (e) { setTwoFAError(e instanceof ApiError ? e.message : "Setup failed"); }
    finally { setTwoFALoading(false); }
  }

  async function handleEnable2FA(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setTwoFALoading(true); setTwoFAError("");
    try {
      await enable2FA(token, otpCode);
      setTwoFAEnabled(true); setTwoFAPhase("idle");
      setTwoFAMsg("Two-factor authentication enabled."); setOtpCode(""); setQrCode("");
    } catch (e) { setTwoFAError(e instanceof ApiError ? e.message : "Invalid code"); }
    finally { setTwoFALoading(false); }
  }

  async function handleDisable2FA(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setTwoFALoading(true); setTwoFAError("");
    try {
      await disable2FA(token, otpCode);
      setTwoFAEnabled(false); setTwoFAPhase("idle");
      setTwoFAMsg("Two-factor authentication disabled."); setOtpCode("");
    } catch (e) { setTwoFAError(e instanceof ApiError ? e.message : "Invalid code"); }
    finally { setTwoFALoading(false); }
  }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "profile", label: "Profile", icon: "👤" },
    { id: "family", label: "Family", icon: "👨‍👩‍👧" },
    { id: "privacy", label: "Privacy", icon: "🔒" },
    { id: "security", label: "Security & 2FA", icon: "🛡️" },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      {/* Welcome banner */}
      {isWelcome && (
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white">
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎉</span>
              <div>
                <p className="font-bold">Email verified! Welcome to Together Myanmar.</p>
                <p className="text-sm text-blue-100">Complete your profile below — it helps with reconnection and the community directory.</p>
              </div>
            </div>
            <button onClick={() => router.replace("/user/profile")} className="shrink-0 text-blue-200 hover:text-white text-xl font-bold">✕</button>
          </div>
        </div>
      )}

      {/* Header */}
      <section className="relative overflow-hidden px-6 py-12 text-white"><div className="absolute inset-0 hero-gradient dot-grid" />
        <div className="relative mx-auto flex max-w-4xl items-center gap-6">
          <div className="relative shrink-0">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 text-3xl font-bold overflow-hidden ring-2 ring-white/30">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <span>{fullName ? fullName.charAt(0).toUpperCase() : "U"}</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={avatarUploading}
              title="Change profile picture"
              className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-gray-700 shadow hover:bg-gray-100 disabled:opacity-50"
            >
              {avatarUploading ? (
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                  <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
                </svg>
              )}
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold">{fullName || "Your Profile"}</h1>
            <p className="text-sm" style={{ color: "#93c5fd" }}>{me?.email}</p>
            {profile && (
              <p className="mt-1 text-xs text-green-300">
                {countries.find(c => c.id === profile.country_id)?.name_en}
                {profile.city ? (profile.country_id ? ` · ${profile.city}` : profile.city) : ""}
              </p>
            )}
            {avatarMsg && (
              <p className={`mt-1 text-xs font-semibold ${avatarMsg.includes("updated") ? "text-green-300" : "text-red-300"}`}>{avatarMsg}</p>
            )}
            <p className="mt-1 text-xs" style={{ color: "#93c5fd" }}>Click the pencil icon to change your profile picture</p>
            {me?.id && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs font-mono" style={{ color: "#bfdbfe" }}>ID: {me.id}</span>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(me.id)}
                  title="Copy User ID"
                  className="rounded px-1.5 py-0.5 text-xs font-semibold transition-colors hover:bg-white/20"
                  style={{ color: "#93c5fd" }}
                >
                  Copy
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 px-4 py-10">
        <div className="mx-auto max-w-4xl">
          {/* Tabs */}
          <div className="mb-8 tab-bar">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`tab-item flex items-center gap-2${tab === t.id ? " tab-item-active" : ""}`}>
                <span>{t.icon}</span> {t.label}
              </button>
            ))}
          </div>

          {/* ── Profile ─── */}
          {tab === "profile" && (
            <form onSubmit={saveProfile} className="feature-card p-8">
              <h2 className="mb-6 text-xl font-bold text-gray-900">Account Information</h2>
              {profileMsg && (
                <div className={`mb-5 rounded-xl border px-4 py-3 text-sm ${profileMsg.includes("success") ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>{profileMsg}</div>
              )}
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-900">Full Name <span className="text-red-500">*</span></label>
                  <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
                  <p className="mt-1 text-xs text-gray-400">Stored hashed — not publicly searchable.</p>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-900">Email</label>
                  <input type="email" disabled value={me?.email || ""} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-500 cursor-not-allowed" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-900">Country / Location</label>
                  <select value={countryId} onChange={(e) => setCountryId(e.target.value ? Number(e.target.value) : "")}
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200">
                    <option value="">— Select country —</option>
                    {countries.map((c) => (
                      <option key={c.id} value={c.id}>{c.name_en}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-900">City / Region</label>
                  <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g., Bangkok, Kuala Lumpur"
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-900">Preferred Language</label>
                  <input disabled value={me?.preferred_language || "en"} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-500 cursor-not-allowed" />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-900">Bio</label>
                  <textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} maxLength={500}
                    placeholder="A short introduction (optional)"
                    className="w-full resize-none rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
                  <p className="text-right text-xs text-gray-400">{bio.length}/500</p>
                </div>
              </div>
              <div className="mt-6 flex gap-3 border-t border-gray-100 pt-6">
                <button type="submit" disabled={profileSaving}
                  className="btn-gradient disabled:opacity-50">
                  {profileSaving ? "Saving…" : "Save Profile"}
                </button>
              </div>
            </form>
          )}

          {/* ── Family ─── */}
          {tab === "family" && (
            <div className="feature-card p-8">
              <h2 className="mb-2 text-xl font-bold text-gray-900">Family Relationships</h2>
              <p className="mb-6 text-sm text-gray-500">Record family members to aid reconnection. Names are stored privately.</p>
              <form onSubmit={addRelationship} className="mb-8 space-y-3">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">Relationship</label>
                    <select value={relLabel} onChange={(e) => setRelLabel(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none">
                      {RELATIONSHIP_LABELS.map((l) => <option key={l}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">Name (optional)</label>
                    <input type="text" value={relName} onChange={(e) => setRelName(e.target.value)} placeholder="e.g., Ma Khin"
                      className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none" />
                  </div>
                  <div className="sm:flex sm:items-end">
                    <button type="submit" disabled={familyAdding}
                      className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                      {familyAdding ? "Adding…" : "+ Add"}
                    </button>
                  </div>
                </div>
                {/* Link to existing account */}
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="mb-2 text-xs font-medium text-gray-600">Link to a registered account (optional)</p>
                  <p className="mb-3 text-xs text-gray-400">If this family member is on Together Myanmar, enter their exact email to link accounts.</p>
                  <div className="flex gap-2">
                    <input type="email" value={relLinkedEmail} onChange={(e) => { setRelLinkedEmail(e.target.value); setRelLinkedId(null); setRelLinkMsg(""); }}
                      placeholder="their@email.com"
                      className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                    <button type="button" onClick={lookupAccount} disabled={relLinkLoading || !relLinkedEmail.trim()}
                      className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50">
                      {relLinkLoading ? "…" : "Look up"}
                    </button>
                  </div>
                  {relLinkMsg && (
                    <p className={`mt-2 text-xs font-medium ${relLinkedId ? "text-emerald-600" : "text-red-500"}`}>{relLinkMsg}</p>
                  )}
                </div>
              </form>
              {family.length === 0 ? (
                <p className="py-6 text-center text-sm text-gray-400">No family relationships added yet.</p>
              ) : (
                <div className="space-y-2">
                  {family.map((rel) => (
                    <div key={rel.id} className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                      {editingRelId === rel.id ? (
                        <div className="flex flex-wrap items-end gap-2">
                          <select value={editLabel} onChange={(e) => setEditLabel(e.target.value)}
                            className="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
                            {RELATIONSHIP_LABELS.map((l) => <option key={l}>{l}</option>)}
                          </select>
                          <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Name"
                            className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                          <button onClick={() => saveEditRel(rel.id)} disabled={editSaving}
                            className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                            {editSaving ? "…" : "Save"}
                          </button>
                          <button onClick={() => setEditingRelId(null)}
                            className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-100">
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-semibold text-gray-900">{rel.relationship_label}</span>
                            {rel.related_name_free_text && <span className="ml-2 text-sm text-gray-500">— {rel.related_name_free_text}</span>}
                            {rel.related_user_id && <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">🔗 Account linked</span>}
                          </div>
                          <div className="flex gap-3">
                            <button onClick={() => startEditRel(rel)} className="text-xs font-semibold text-blue-500 hover:text-blue-700">Edit</button>
                            <button onClick={() => deleteRel(rel.id)} className="text-xs font-semibold text-red-500 hover:text-red-700">Remove</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Privacy ─── */}
          {tab === "privacy" && (
            <form onSubmit={saveProfile} className="feature-card p-8">
              <h2 className="mb-2 text-xl font-bold text-gray-900">Privacy Settings</h2>
              <p className="mb-6 text-sm text-gray-500">Control how others can find and contact you.</p>
              {profileMsg && (
                <div className={`mb-5 rounded-xl border px-4 py-3 text-sm ${profileMsg.includes("success") ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>{profileMsg}</div>
              )}
              <div className="space-y-4">
                <label className="flex cursor-pointer items-start gap-4 rounded-xl border border-gray-200 p-4 hover:bg-gray-50">
                  <input type="checkbox" checked={allowRequests} onChange={(e) => setAllowRequests(e.target.checked)} className="mt-0.5 h-4 w-4 rounded accent-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Allow connection requests</p>
                    <p className="text-xs text-gray-500 mt-0.5">Other users can send you connection requests. Only you see who sent them.</p>
                  </div>
                </label>
                <label className="flex cursor-pointer items-start gap-4 rounded-xl border border-gray-200 p-4 hover:bg-gray-50">
                  <input type="checkbox" checked={showInDirectory} onChange={(e) => setShowInDirectory(e.target.checked)} className="mt-0.5 h-4 w-4 rounded accent-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Show in Community Directory</p>
                    <p className="text-xs text-gray-500 mt-0.5">Show your city/bio in the community directory. Your full name stays private.</p>
                  </div>
                </label>
              </div>
              <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4 text-xs text-blue-700">
                <strong>Privacy guarantee:</strong> Full names are stored as one-way hashes and never exposed via search.
              </div>
              <div className="mt-6 flex gap-3 border-t border-gray-100 pt-6">
                <button type="submit" disabled={profileSaving} className="btn-gradient disabled:opacity-50">
                  {profileSaving ? "Saving…" : "Save Privacy Settings"}
                </button>
              </div>
            </form>
          )}

          {/* ── Security ─── */}
          {tab === "security" && (
            <div className="space-y-6">
              <div className="feature-card p-8">
                <h2 className="mb-2 text-xl font-bold text-gray-900">Two-Factor Authentication (2FA)</h2>
                <p className="mb-6 text-sm text-gray-500">Extra security via TOTP apps like Google Authenticator or Authy.</p>
                <div className={`mb-6 flex items-center gap-3 rounded-xl border p-4 ${twoFAEnabled ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"}`}>
                  <span className="text-2xl">{twoFAEnabled ? "✅" : "⚠️"}</span>
                  <div>
                    <p className={`font-semibold text-sm ${twoFAEnabled ? "text-green-800" : "text-amber-800"}`}>2FA is {twoFAEnabled ? "enabled" : "disabled"}</p>
                    <p className={`text-xs ${twoFAEnabled ? "text-green-600" : "text-amber-600"}`}>
                      {twoFAEnabled ? "Your account is protected by two-factor authentication." : "Enable 2FA for stronger account security."}
                    </p>
                  </div>
                </div>
                {twoFAMsg && <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{twoFAMsg}</div>}
                {twoFAError && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{twoFAError}</div>}

                {twoFAPhase === "setup" && (
                  <div className="mb-6 space-y-4">
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 text-center">
                      <p className="mb-3 text-sm font-medium text-gray-700">Scan this QR code with your authenticator app</p>
                      {qrCode && <img src={qrCode} alt="2FA QR Code" className="mx-auto mb-3 h-48 w-48 rounded-xl border border-gray-300" />}
                      <p className="text-xs text-gray-500">Or enter this secret manually:</p>
                      <code className="mt-1 block rounded border border-gray-200 bg-white px-3 py-2 text-sm font-mono text-gray-800">{totpSecret}</code>
                    </div>
                    <form onSubmit={handleEnable2FA} className="flex gap-3">
                      <input type="text" required pattern="\d{6}" maxLength={6} value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="6-digit code"
                        className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-center font-mono text-lg tracking-widest focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
                      <button type="submit" disabled={twoFALoading || otpCode.length !== 6} className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                        {twoFALoading ? "Verifying…" : "Enable 2FA"}
                      </button>
                    </form>
                    <button onClick={() => { setTwoFAPhase("idle"); setQrCode(""); setTotpSecret(""); }} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
                  </div>
                )}

                {twoFAPhase === "disable" && (
                  <form onSubmit={handleDisable2FA} className="mb-6 space-y-4">
                    <p className="text-sm text-gray-600">Enter your current TOTP code to confirm:</p>
                    <div className="flex gap-3">
                      <input type="text" required pattern="\d{6}" maxLength={6} value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="6-digit code"
                        className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-center font-mono text-lg tracking-widest focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
                      <button type="submit" disabled={twoFALoading || otpCode.length !== 6} className="rounded-xl bg-red-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50">
                        {twoFALoading ? "…" : "Disable 2FA"}
                      </button>
                    </div>
                    <button onClick={() => { setTwoFAPhase("idle"); setOtpCode(""); }} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
                  </form>
                )}

                {twoFAPhase === "idle" && (twoFAEnabled ? (
                  <button onClick={() => { setTwoFAPhase("disable"); setTwoFAMsg(""); setTwoFAError(""); }}
                    className="rounded-xl border border-red-200 bg-red-50 px-6 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100">Disable 2FA</button>
                ) : (
                  <button onClick={handleSetup2FA} disabled={twoFALoading}
                    className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                    {twoFALoading ? "Loading…" : "Set Up 2FA"}
                  </button>
                ))}
              </div>
              <div className="feature-card p-8">
                <h2 className="mb-2 text-xl font-bold text-gray-900">Password</h2>
                <p className="text-sm text-gray-500">To change your password, sign out and use the &quot;Forgot Password&quot; flow on the login page.</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
