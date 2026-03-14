"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getResource, getResourceCategories, Resource, ResourceCategory, ApiError } from "@/lib/api";

const CAT_META: Record<string, { icon: string; color: string; border: string }> = {
  education:            { icon: "🎓", color: "text-blue-700",   border: "border-blue-200 bg-blue-50" },
  employment:           { icon: "💼", color: "text-emerald-700", border: "border-emerald-200 bg-emerald-50" },
  "legal-aid":          { icon: "⚖️",  color: "text-amber-700",  border: "border-amber-200 bg-amber-50" },
  health:               { icon: "🏥", color: "text-rose-700",   border: "border-rose-200 bg-rose-50" },
  "community-programs": { icon: "🤝", color: "text-purple-700", border: "border-purple-200 bg-purple-50" },
};
const DEFAULT_META = { icon: "📄", color: "text-gray-700", border: "border-gray-200 bg-gray-50" };

export default function ResourceDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [resource, setResource] = useState<Resource | null>(null);
  const [categories, setCategories] = useState<ResourceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      getResource(id).catch(() => null),
      getResourceCategories().catch(() => []),
    ]).then(([r, cats]) => {
      if (!r) setNotFound(true);
      else setResource(r);
      setCategories(cats);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  if (notFound || !resource) {
    return (
      <div className="flex min-h-96 flex-col items-center justify-center gap-4 px-6 text-center">
        <span className="text-6xl">🔍</span>
        <h1 className="text-2xl font-bold text-gray-900">Resource not found</h1>
        <p className="text-gray-500">It may have been removed or is pending review.</p>
        <Link
          href="/resources"
          className="mt-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Back to Resources
        </Link>
      </div>
    );
  }

  const category = categories.find((c) => c.id === resource.category_id);
  const meta = category ? (CAT_META[category.slug] ?? DEFAULT_META) : DEFAULT_META;

  return (
    <>
      {/* Hero */}
      <section
        className="px-6 py-14 text-white"
        style={{ background: "linear-gradient(135deg, #059669 0%, #0d9488 100%)" }}
      >
        <div className="mx-auto max-w-4xl">
          <Link
            href="/resources"
            className="mb-5 inline-flex items-center gap-1 text-sm text-white/70 hover:text-white"
          >
            ← Back to Resources
          </Link>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {category && (
              <span className={`rounded-lg border px-3 py-1 text-xs font-semibold ${meta.border} ${meta.color}`}>
                {meta.icon} {category.name_en}
              </span>
            )}
            {resource.is_verified && (
              <span className="rounded-lg border border-emerald-300 bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                ✓ Verified Resource
              </span>
            )}
            {resource.resource_type && (
              <span className="rounded-lg border border-white/30 bg-white/10 px-3 py-1 text-xs text-white">
                {resource.resource_type}
              </span>
            )}
          </div>
          <h1 className="mb-1 text-3xl font-extrabold sm:text-4xl">{resource.title_en}</h1>
          {resource.title_my && <p className="text-lg text-white/70">{resource.title_my}</p>}
          {resource.country && (
            <p className="mt-3 text-sm text-white/60">📍 {resource.country}</p>
          )}
        </div>
      </section>

      {/* Body */}
      <section className="bg-white px-6 py-12">
        <div className="mx-auto grid max-w-4xl gap-8 lg:grid-cols-3">
          {/* Descriptions */}
          <div className="space-y-5 lg:col-span-2">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
              <h2 className="mb-3 text-lg font-bold text-gray-900">About this Resource</h2>
              <p className="whitespace-pre-line leading-relaxed text-gray-700">{resource.description_en}</p>
            </div>
            {resource.description_my && (
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
                <h2 className="mb-3 text-lg font-bold text-gray-900">ဖော်ပြချက် (Burmese)</h2>
                <p className="whitespace-pre-line leading-relaxed text-gray-700">{resource.description_my}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <h3 className="mb-2 text-sm font-bold text-emerald-900">Access this resource</h3>
              <p className="mb-3 break-all text-xs text-emerald-700">{resource.external_url}</p>
              <a
                href={resource.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl bg-emerald-600 py-2.5 text-center text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Open Resource →
              </a>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-bold text-gray-900">Details</h3>
              <dl className="space-y-2 text-sm">
                {category && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Category</dt>
                    <dd className="font-medium text-gray-800">{category.name_en}</dd>
                  </div>
                )}
                {resource.country && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Country</dt>
                    <dd className="font-medium text-gray-800">{resource.country}</dd>
                  </div>
                )}
                {resource.resource_type && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Type</dt>
                    <dd className="font-medium text-gray-800">{resource.resource_type}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-gray-500">Verified</dt>
                  <dd className={`font-semibold ${resource.is_verified ? "text-emerald-600" : "text-gray-400"}`}>
                    {resource.is_verified ? "✓ Yes" : "Not verified"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Added</dt>
                  <dd className="text-gray-600">{new Date(resource.created_at).toLocaleDateString()}</dd>
                </div>
              </dl>
            </div>

            <Link
              href="/resources"
              className="block rounded-xl border border-gray-200 py-2.5 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              ← All Resources
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
