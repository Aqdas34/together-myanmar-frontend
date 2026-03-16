"use client";

import { useState, useEffect, useCallback, useRef, FormEvent, Suspense } from "react";
import Link from "next/link";
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
} from "@/lib/api";

type Tab = "profile" | "family" | "privacy" | "security";

const RELATIONSHIP_LABELS = [
  "Mother", "Father", "Sister", "Brother", "Daughter", "Son",
  "Grandmother", "Grandfather", "Aunt", "Uncle", "Cousin",
  "Wife", "Husband", "Friend", "Other",
];

export default function UserProfilePage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" /></div>}>
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
  const [preferredLanguage, setPreferredLanguage] = useState("en");
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
        setFullName(p.full_name || "");
        setCity(p.city || "");
        setBio(p.bio || "");
        setCountryId(p.country_id ?? "");
        setPreferredLanguage(p.preferred_language || user.preferred_language || "en");
        setShowInDirectory(p.show_in_diaspora_directory);
        setAllowRequests(p.privacy_allow_connection_requests);
        if (p.avatar_url) setAvatarPreview(`http://localhost:8000${p.avatar_url}`);
      } catch (err) {
        console.log("Profile load failed, likely initial setup", err);
      }
      
      try {
        const c = await getCountries();
        setCountries(c);
      } catch (err) {
        console.error("Country load failed", err);
      }
      
      try {
        const fam = await getFamilyRelationships(token);
        setFamily(fam);
      } catch (err) {
        console.error("Family load failed", err);
      }
      
    } catch (err) {
      console.error("Critical load failure", err);
      router.replace("/login?next=/user/profile");
    } finally {
      setLoading(false);
    }
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
        preferred_language: preferredLanguage,
        show_in_diaspora_directory: showInDirectory,
        privacy_allow_connection_requests: allowRequests,
      });
      setProfile(p);
      setProfileMsg("Profile saved successfully.");
      // Optional: scroll to message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setProfileMsg(err instanceof ApiError ? err.message : "Save failed.");
    } finally {
      setProfileSaving(false);
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setAvatarMsg("");
    const localUrl = URL.createObjectURL(file);
    setAvatarPreview(localUrl);
    setAvatarUploading(true);
    try {
      const p = await uploadAvatar(token, file);
      setProfile(p);
      if (p.avatar_url) {
        setAvatarPreview(`http://localhost:8000${p.avatar_url}`);
      }
      setAvatarMsg("Profile picture updated.");
    } catch (err) {
      setAvatarMsg(err instanceof ApiError ? err.message : "Upload failed.");
      setAvatarPreview(profile?.avatar_url ? `http://localhost:8000${profile.avatar_url}` : localUrl);
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
    } catch (err) {
      console.error("Add rel failed", err);
    } finally {
      setFamilyAdding(false);
    }
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
    } catch (err) {
      console.error("Save edit rel failed", err);
    } finally { setEditSaving(false); }
  }

  async function deleteRel(id: string) {
    if (!token) return;
    try {
      await deleteFamilyRelationship(token, id);
      setFamily((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Delete rel failed", err);
    }
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
          <div className="mx-auto max-w-4xl flex items-center justify-between gap-4">
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

      {/* Header Section */}
      <section className="bg-white border-b border-slate-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 to-white pointer-events-none" />
        <div className="absolute top-0 right-0 p-20 opacity-[0.03] pointer-events-none">
           <svg className="h-64 w-64" viewBox="0 0 100 100" fill="currentColor"><path d="M50 0 C22.4 0 0 22.4 0 50 C0 77.6 22.4 100 50 100 C77.6 100 100 77.6 100 50 C100 22.4 77.6 0 50 0 Z M50 90 C27.9 90 10 72.1 10 50 C10 27.9 27.9 10 50 10 C72.1 10 90 27.9 90 50 C90 72.1 72.1 90 50 90 Z" /></svg>
        </div>
        
        <div className="mx-auto max-w-4xl px-6 py-14 flex flex-col md:flex-row items-center gap-12 relative z-10">
          <div className="relative group shrink-0">
            <div className="h-36 w-36 rounded-[2.5rem] bg-white flex items-center justify-center text-6xl font-black overflow-hidden ring-1 ring-slate-200 shadow-2xl transition-all group-hover:scale-[1.02]">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <span className="text-slate-200">{fullName ? fullName.charAt(0).toUpperCase() : "U"}</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={avatarUploading}
              className="absolute -bottom-1 -right-1 flex h-11 w-11 items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-600 shadow-lg hover:text-primary-600 hover:scale-110 active:scale-95 transition-all disabled:opacity-50"
            >
              {avatarUploading ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary-100 border-t-primary-600" /> : "📷"}
            </button>
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>

          <div className="flex-1 text-center md:text-left space-y-5">
            <div>
              <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-tight mb-2">{fullName || "Anonymous Member"}</h1>
              <p className="text-[18px] font-bold text-slate-500 flex items-center justify-center md:justify-start gap-2.5">
                <span className="opacity-30">✉️</span> {me?.email}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              <span className="bg-white border border-slate-200 px-5 py-2.5 rounded-2xl text-[13px] font-black text-slate-700 flex items-center gap-2.5 shadow-sm">
                <span className="text-lg">📍</span>
                {countries.find(c => c.id === countryId)?.name_en || (profile?.country_id ? countries.find(c => c.id === profile.country_id)?.name_en : "Global Network")}
                {(city || profile?.city) && <span className="text-slate-300 mx-1">/</span>}
                {city || profile?.city}
              </span>
              {me?.id && (
                <div className="flex items-center gap-2.5 bg-white border border-slate-200 px-5 py-2.5 rounded-2xl h-[46px] shadow-sm">
                  <span className="text-[10px] font-black text-slate-400 tracking-[0.15em] uppercase">ID:</span>
                  <span className="text-[13px] font-mono font-bold text-slate-900">{me.id}</span>
                  <button type="button" onClick={() => { navigator.clipboard.writeText(me.id); setProfileMsg("Member ID copied!"); }} className="ml-2 text-slate-300 hover:text-primary-600 transition-colors">📋</button>
                </div>
              )}
            </div>
            {avatarMsg && <p className="text-[11px] font-black uppercase tracking-widest px-4 py-1 rounded-full inline-block bg-blue-50 text-blue-600">{avatarMsg}</p>}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 px-4 py-10">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 tab-bar">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)} className={`tab-item flex items-center gap-2${tab === t.id ? " tab-item-active" : ""}`}>
                <span>{t.icon}</span> {t.label}
              </button>
            ))}
          </div>

          {tab === "profile" && (
            <form onSubmit={saveProfile} className="feature-card p-8">
              <h2 className="mb-6 text-xl font-bold text-gray-900">Account Information</h2>
              {profileMsg && <div className={`mb-5 rounded-xl border px-4 py-3 text-sm ${profileMsg.includes("success") ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>{profileMsg}</div>}
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-900">Full Name <span className="text-red-500">*</span></label>
                  <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-900">Email</label>
                  <input type="email" disabled value={me?.email || ""} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-500" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-900">Country</label>
                  <select value={countryId} onChange={(e) => setCountryId(e.target.value ? Number(e.target.value) : "")} className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none">
                    <option value="">— Select country —</option>
                    {countries.map((c) => <option key={c.id} value={c.id}>{c.name_en}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-900">City</label>
                  <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Your city" className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none" />
                </div>
                <div>
                   <label className="mb-1 block text-sm font-medium text-gray-900">Preferred Language</label>
                   <select value={preferredLanguage} onChange={(e) => setPreferredLanguage(e.target.value)} className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500">
                     <option value="en">English</option>
                     <option value="my">Burmese</option>
                   </select>
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-900">Bio</label>
                  <textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} maxLength={500} className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500" />
                </div>
              </div>
              <div className="mt-8">
                <button type="submit" disabled={profileSaving} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all">
                  {profileSaving ? "Saving..." : "Save Profile Data"}
                </button>
              </div>
            </form>
          )}

          {tab === "family" && (
            <div className="feature-card p-8">
              <h2 className="mb-4 text-xl font-bold text-gray-900">Family Relationships</h2>
              <form onSubmit={addRelationship} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <select value={relLabel} onChange={(e) => setRelLabel(e.target.value)} className="rounded-xl border border-gray-300 px-4 py-2">
                   {RELATIONSHIP_LABELS.map(l => <option key={l}>{l}</option>)}
                </select>
                <input value={relName} onChange={(e) => setRelName(e.target.value)} placeholder="Member Name" className="rounded-xl border border-gray-300 px-4 py-2" />
                <button type="submit" disabled={familyAdding} className="bg-blue-600 text-white rounded-xl py-2">Add Member</button>
              </form>
              <div className="space-y-4">
                 {family.map(rel => (
                   <div key={rel.id} className="flex justify-between items-center bg-white p-4 rounded-xl border">
                     <span><strong>{rel.relationship_label}:</strong> {rel.related_name_free_text || "Unnamed"}</span>
                     <button onClick={() => deleteRel(rel.id)} className="text-red-500">Remove</button>
                   </div>
                 ))}
              </div>
            </div>
          )}

          {tab === "privacy" && (
            <form onSubmit={saveProfile} className="feature-card p-8">
               <h2 className="mb-6 text-xl font-bold text-gray-900">Privacy</h2>
               <div className="space-y-4">
                  <label className="flex items-center gap-3">
                    <input type="checkbox" checked={allowRequests} onChange={e => setAllowRequests(e.target.checked)} />
                    <span>Allow connection requests</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" checked={showInDirectory} onChange={e => setShowInDirectory(e.target.checked)} />
                    <span>Show in Community Directory</span>
                  </label>
               </div>
               <button type="submit" className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-xl">Save Privacy</button>
            </form>
          )}

          {tab === "security" && (
             <div className="feature-card p-8">
                <h2 className="mb-4 text-xl font-bold text-gray-900">Security</h2>
                <p>2FA Status: {twoFAEnabled ? "Enabled" : "Disabled"}</p>
                <button onClick={() => setTwoFAPhase("setup")} className="mt-4 px-6 py-2 bg-slate-800 text-white rounded-xl">Configure 2FA</button>
             </div>
          )}
        </div>
      </section>
    </>
  );
}
