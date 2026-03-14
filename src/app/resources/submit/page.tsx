"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getMe, getResourceCategories, submitResource, ResourceCategory, ApiError } from "@/lib/api";

const RESOURCE_TYPES = ["Online", "In-Person", "Hotline", "Document", "Organization"];
const COUNTRIES = [
  "Thailand", "Malaysia", "Singapore", "Japan", "South Korea",
  "Australia", "United Kingdom", "United States", "Germany", "Other",
];

export default function ResourceSubmitPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<ResourceCategory[]>([]);
  const [authChecked, setAuthChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title_en: "",
    title_my: "",
    description_en: "",
    description_my: "",
    external_url: "",
    category_id: "",
    country: "",
    resource_type: "",
  });

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    if (!token) { setAuthChecked(true); return; }
    getMe(token)
      .then(() => { setIsLoggedIn(true); setAuthChecked(true); })
      .catch(() => { setAuthChecked(true); });
    getResourceCategories().then(setCategories).catch(() => {});
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.category_id) { setError("Please select a category."); return; }
    if (!form.title_en.trim()) { setError("English title is required."); return; }
    if (!form.description_en.trim()) { setError("English description is required."); return; }
    if (!form.external_url.trim()) { setError("External URL is required."); return; }
    try { new URL(form.external_url); } catch {
      setError("Please enter a valid URL (e.g. https://example.com).");
      return;
    }
    const token = localStorage.getItem("access_token");
    if (!token) { setError("You must be logged in to submit."); return; }
    setLoading(true);
    try {
      await submitResource(token, {
        title_en: form.title_en.trim(),
        title_my: form.title_my.trim() || undefined,
        description_en: form.description_en.trim(),
        description_my: form.description_my.trim() || undefined,
        external_url: form.external_url.trim(),
        category_id: Number(form.category_id),
        country: form.country || undefined,
        resource_type: form.resource_type || undefined,
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm({ ...form, [key]: e.target.value }),
  });

  if (!authChecked) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="flex min-h-96 flex-col items-center justify-center gap-4 px-6 text-center">
        <span className="text-6xl">🔒</span>
        <h1 className="text-2xl font-bold text-gray-900">Login Required</h1>
        <p className="max-w-sm text-gray-500">You must be logged in to submit a resource.</p>
        <Link
          href="/login?next=/resources/submit"
          className="mt-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Log In
        </Link>
        <Link href="/register" className="text-sm text-gray-500 hover:text-gray-700">
          Don&apos;t have an account? Register
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-96 flex-col items-center justify-center gap-4 px-6 text-center">
        <span className="text-6xl">🎉</span>
        <h1 className="text-2xl font-bold text-gray-900">Submitted for Review!</h1>
        <p className="max-w-sm text-gray-500">
          Thank you for your contribution. Your resource will be published after admin approval.
        </p>
        <div className="mt-2 flex gap-3">
          <Link
            href="/resources"
            className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Browse Resources
          </Link>
          <button
            onClick={() => {
              setSuccess(false);
              setForm({ title_en: "", title_my: "", description_en: "", description_my: "", external_url: "", category_id: "", country: "", resource_type: "" });
            }}
            className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Submit Another
          </button>
        </div>
      </div>
    );
  }

  const inputCls = "w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200";

  return (
    <>
      {/* Hero */}
      <section
        className="px-6 py-14 text-white"
        style={{ background: "linear-gradient(135deg, #059669 0%, #0d9488 100%)" }}
      >
        <div className="mx-auto max-w-2xl">
          <Link href="/resources" className="mb-5 inline-flex items-center gap-1 text-sm text-white/70 hover:text-white">
            ← Back to Resources
          </Link>
          <h1 className="mb-2 text-3xl font-extrabold">Submit a Resource</h1>
          <p className="text-white/80">
            Share a helpful resource with the Myanmar diaspora community. All submissions are reviewed before publication.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="bg-gray-50 px-6 py-12">
        <div className="mx-auto max-w-2xl">
          {/* Moderation notice */}
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
            <p className="text-sm font-semibold text-amber-800">ℹ️ Moderation Notice</p>
            <p className="mt-1 text-xs text-amber-700">
              Your submission will be reviewed by our moderation team before it appears publicly.
              External URLs only — no file uploads.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-6 space-y-5">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  Category <span className="text-red-500">*</span>
                </label>
                <select {...field("category_id")} required className={inputCls}>
                  <option value="">Select category…</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name_en}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">Resource Type</label>
                <select {...field("resource_type")} className={inputCls}>
                  <option value="">Select type…</option>
                  {RESOURCE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Country (optional)</label>
              <select {...field("country")} className={inputCls}>
                <option value="">Select country…</option>
                {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Title (English) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...field("title_en")}
                placeholder="e.g. UNHCR Refugee Registration Programme"
                required
                className={inputCls}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Title (Burmese)</label>
              <input
                type="text"
                {...field("title_my")}
                placeholder="ခေါင်းစဉ် (ဗမာဘာသာဖြင့်)"
                className={inputCls}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Description (English) <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                {...field("description_en")}
                placeholder="Describe what this resource offers and who it's for…"
                required
                className={inputCls}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Description (Burmese)</label>
              <textarea
                rows={4}
                {...field("description_my")}
                placeholder="ဖော်ပြချက် (ဗမာဘာသာဖြင့်)"
                className={inputCls}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                External URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                {...field("external_url")}
                placeholder="https://example.org/resource"
                required
                className={inputCls}
              />
              <p className="mt-1 text-xs text-gray-400">Must be a valid URL. External links only — no file uploads.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {loading ? "Submitting…" : "Submit for Review"}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
