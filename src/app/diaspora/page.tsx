"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  getDiasporaListings,
  getMyDiasporaListings,
  submitDiasporaListing,
  type DiasporaListing,
} from "@/lib/api";

const TYPE_COLORS: Record<string, string> = {
  individual: "bg-blue-50 text-blue-700",
  organization: "bg-emerald-50 text-emerald-700",
};

function ListingCard({ listing }: { listing: DiasporaListing }) {
  return (
    <div className="card-modern group flex flex-col p-8 bg-white border-slate-200 shadow-sm transition-all hover:border-primary-200 hover:shadow-md">
      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 text-[10px] font-black text-slate-400 group-hover:bg-primary-50 group-hover:border-primary-100 group-hover:text-primary-600 transition-colors">
          {listing.listing_type === "organization" ? "ENTITY" : "MEMBER"}
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-lg font-black text-slate-900 group-hover:text-primary-600 transition-colors leading-none mb-2">{listing.name}</h3>
          <span className={`badge-modern border-none py-0.5 px-2.5 text-[10px] font-black uppercase tracking-wider ${TYPE_COLORS[listing.listing_type]}`}>
            {listing.listing_type}
          </span>
        </div>
      </div>

      {listing.description && (
        <p className="mb-6 line-clamp-3 text-[14px] font-medium text-slate-500 leading-relaxed">
           {listing.description}
        </p>
      )}

      <div className="mt-auto pt-6 border-t border-slate-50 space-y-3">
        {listing.city && (
          <div className="flex items-center gap-2 text-[12px] font-bold text-slate-400">
             <span className="opacity-50">📍</span> {listing.city}
          </div>
        )}
        {listing.contact_email && (
          <div className="flex items-center gap-2 text-[12px] font-bold text-primary-600">
             <span className="opacity-50">📧</span>
             <a href={`mailto:${listing.contact_email}`} className="hover:underline transition-colors">
               {listing.contact_email}
             </a>
          </div>
        )}
        {listing.website_url && (
          <div className="flex items-center gap-2 text-[12px] font-bold text-primary-600">
             <span className="opacity-50">🔗</span>
             <a
               href={listing.website_url}
               target="_blank"
               rel="noopener noreferrer"
               className="truncate hover:underline transition-colors"
             >
               {listing.website_url.replace(/^https?:\/\//, "")}
             </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DiasporaDirectoryPage() {
  const router = useRouter();
  const [listings, setListings] = useState<DiasporaListing[]>([]);
  const [myListings, setMyListings] = useState<DiasporaListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"" | "individual" | "organization">("");
  const [showSubmit, setShowSubmit] = useState(false);
  const [form, setForm] = useState({
    listing_type: "individual" as "individual" | "organization",
    name: "",
    description: "",
    city: "",
    contact_email: "",
    website_url: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState("");

  const [token, setToken] = useState<string | null>(null);
  useEffect(() => {
    setToken(typeof window !== "undefined" ? localStorage.getItem("access_token") : null);
  }, []);

  useEffect(() => {
    if (!token) return;
    getMyDiasporaListings(token)
      .then(setMyListings)
      .catch(() => {});
  }, [token]);

  const load = useCallback(() => {
    setLoading(true);
    getDiasporaListings({ search: search || undefined, listing_type: typeFilter || undefined })
      .then(setListings)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, typeFilter]);

  useEffect(() => {
    const id = setTimeout(load, 300);
    return () => clearTimeout(id);
  }, [load]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) {
      router.push("/login?next=/diaspora");
      return;
    }
    setSubmitting(true);
    setSubmitMsg("");
    try {
      const newListing = await submitDiasporaListing(token, form);
      setMyListings((prev) => [newListing, ...prev]);
      setSubmitMsg("Listing submitted! It will appear after admin approval.");
      setForm({ listing_type: "individual", name: "", description: "", city: "", contact_email: "", website_url: "" });
      setShowSubmit(false);
    } catch (err: unknown) {
      setSubmitMsg((err as Error).message || "Failed to submit listing");
    }
    setSubmitting(false);
  }

  return (
    <div className="bg-white min-h-screen">
      {showSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl p-8 space-y-6 max-h-[90vh] overflow-y-auto relative">
             <button onClick={() => setShowSubmit(false)} className="absolute right-6 top-6 text-slate-300 hover:text-slate-500 transition-colors text-2xl font-light">&times;</button>
             
             <div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">Create Listing</h2>
                <p className="text-sm font-medium text-slate-500 leading-relaxed">Join the global network. Listings are reviewed by moderators before becoming visible.</p>
             </div>

            {submitMsg && (
              <p className="rounded-xl bg-primary-50 px-4 py-3 text-sm font-bold text-primary-700">{submitMsg}</p>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Entity Type</label>
                <select
                  className="input-modern bg-slate-50 border-slate-100"
                  value={form.listing_type}
                  onChange={(e) =>
                    setForm({ ...form, listing_type: e.target.value as "individual" | "organization" })
                  }
                >
                  <option value="individual">Individual Profile</option>
                  <option value="organization">Community Organization</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Display Name *</label>
                <input
                  className="input-modern"
                  placeholder="e.g. Myanmar Youth Network"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Profile Narrative</label>
                <textarea
                  className="input-modern resize-none"
                  rows={4}
                  placeholder="Tell the community who you are and what your goals are..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Geographic Base</label>
                <input
                  className="input-modern"
                  placeholder="e.g. Bangkok, London, Tokyo"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Public Contact</label>
                    <input
                      type="email"
                      className="input-modern"
                      placeholder="hello@network.org"
                      value={form.contact_email}
                      onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                    />
                 </div>

                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Digital Presence</label>
                    <input
                      type="url"
                      className="input-modern"
                      placeholder="https://community.org"
                      value={form.website_url}
                      onChange={(e) => setForm({ ...form, website_url: e.target.value })}
                    />
                 </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary flex-1 justify-center py-3"
                >
                  {submitting ? "Processing..." : "Publish Profile"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSubmit(false)}
                  className="btn-secondary flex-1 justify-center py-3"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hero */}
      <header className="pt-20 pb-16 border-b border-slate-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-pattern opacity-[0.03] pointer-events-none" />
        <div className="mx-auto max-w-7xl px-6 relative z-10 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div>
            <span className="badge-primary mb-4 py-1 px-3">
               Global Community Registry
            </span>
            <h1 className="hero-title mb-4">Diaspora Directory</h1>
            <p className="text-lg text-slate-500 max-w-2xl leading-relaxed">
               A verified catalog of individuals, organizations, and mutual aid groups across the global Myanmar diaspora.
            </p>
          </div>
          <button
            onClick={() => {
              if (!token) {
                router.push("/login?next=/diaspora");
                return;
              }
              setShowSubmit(true);
            }}
            className="btn-primary shadow-xl shadow-primary-500/20 py-3 px-8"
          >
            + ADD YOUR PROFILE
          </button>
        </div>
      </header>

      {/* Search and filter */}
      <section className="bg-slate-50 sticky top-[64px] z-20 border-b border-slate-100 backdrop-blur-md px-6 py-5">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
             <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30">🔍</span>
             <input
               type="text"
               placeholder="Search by name, location, or mission..."
               className="input-modern pl-11 h-11 py-1"
               value={search}
               onChange={(e) => setSearch(e.target.value)}
             />
          </div>
          <select
            className="rounded-xl border border-slate-200 px-4 h-11 text-xs font-bold text-slate-700 bg-white outline-none focus:border-primary-300 shadow-sm"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as "" | "individual" | "organization")}
          >
            <option value="">All Entity Types</option>
            <option value="individual">Active Members</option>
            <option value="organization">Verified Organizations</option>
          </select>
        </div>
      </section>

      {/* Listings grid */}
      <section className="bg-slate-50 px-6 py-16 min-h-[500px]">
        <div className="mx-auto max-w-7xl">
          {submitMsg && !showSubmit && (
            <div className="mb-10 rounded-2xl bg-primary-50 border border-primary-100 px-6 py-4 text-sm font-bold text-primary-700 shadow-sm animate-fade-in">
               HANDSHAKE PENDING: {submitMsg}
            </div>
          )}

          {/* User's own listings */}
          {myListings.filter((l) => l.status !== "approved").length > 0 && (
            <div className="mb-12">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">Your Submission Pipeline</h2>
              <div className="space-y-3">
                {myListings
                  .filter((l) => l.status !== "approved")
                  .map((l) => (
                    <div
                      key={l.id}
                      className={`flex items-center justify-between rounded-2xl border px-6 py-4 transition-all ${
                        l.status === "pending"
                          ? "border-amber-100 bg-white"
                          : "border-red-100 bg-white"
                      }`}
                    >
                      <div>
                        <span className="text-[15px] font-black text-slate-900">{l.name}</span>
                        {l.city && <span className="ml-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">· {l.city}</span>}
                      </div>
                      <span
                        className={`badge-modern border-none px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                          l.status === "pending"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {l.status}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
               {[1, 2, 3].map(i => <div key={i} className="h-64 animate-pulse bg-white border border-slate-100 rounded-2xl" />)}
            </div>
          ) : listings.length === 0 ? (
            <div className="card-modern py-32 bg-white border-dashed border-slate-200 text-center">
              <div className="text-5xl mb-6 opacity-20">🌏</div>
              <p className="text-xl font-bold text-slate-900 mb-2">Registry Mismatch</p>
              <p className="text-slate-500 font-medium mb-8">No profiles match your current search parameters.</p>
              {(search || typeFilter) && (
                <button
                  onClick={() => { setSearch(""); setTypeFilter(""); }}
                  className="btn-secondary"
                >
                  Reset Catalog
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="mb-8 flex items-center justify-between border-b border-slate-200 pb-4">
                 <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest px-2">
                   {listings.length} VERIFIED ENTRIES DISCOVERED
                 </p>
              </div>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
