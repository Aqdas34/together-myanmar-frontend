"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getNewsPost, getAdjacentNewsPosts, type NewsPost } from "@/lib/api";
import { useLanguage } from "@/lib/language-context";

const COLOR_POOL = [
  "#4f46e5", // Primary Indigo
  "#2563eb", // Blue 600
  "#059669", "#7c3aed", "#dc2626", "#d97706", "#0891b2",
];

function colorForPost(post: NewsPost): string {
  const str = post.slug ?? post.id;
  let sum = 0;
  for (let i = 0; i < str.length; i++) sum += str.charCodeAt(i);
  return COLOR_POOL[sum % COLOR_POOL.length];
}

function pick(en: string, my: string, lang: string): { text: string; isFallback: boolean } {
  if (lang === "my" && my) return { text: my, isFallback: false };
  return { text: en, isFallback: lang !== "en" };
}

export default function NewsArticlePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { lang } = useLanguage();

  const [post, setPost] = useState<NewsPost | null>(null);
  const [adjacent, setAdjacent] = useState<{
    prev: { id: string; title_en: string } | null;
    next: { id: string; title_en: string } | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getNewsPost(id)
      .then((p) => {
        setPost(p);
        return getAdjacentNewsPosts(p.id);
      })
      .then(setAdjacent)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  function handleShare() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-gray-400">
        Loading article...
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-gray-500">
        <p className="text-2xl font-bold">Article not found</p>
        <p className="text-sm">This article may have been removed or the link is incorrect.</p>
        <button
          onClick={() => router.push("/news")}
          className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Back to News
        </button>
      </div>
    );
  }

  const color = colorForPost(post);
  const title = pick(post.title_en, post.title_my, lang);
  const body = pick(post.body_en, post.body_my, lang);

  return (
    <>
      {/* Hero */}
      <section
        className="px-6 py-16 text-white"
        style={{ background: `linear-gradient(135deg, ${color}ee 0%, ${color} 100%)` }}
      >
        <div className="mx-auto max-w-3xl">
          <Link
            href="/news"
            className="mb-4 inline-flex items-center gap-1 text-sm text-white/70 hover:text-white"
          >
            ← Back to News
          </Link>

          <div className="mb-3 flex flex-wrap items-center gap-2">
            {post.status === "archived" && (
              <span className="rounded-full bg-white/20 px-3 py-0.5 text-xs font-semibold">
                Archived
              </span>
            )}
            {title.isFallback && (
              <span className="rounded-full bg-white/20 px-3 py-0.5 text-xs font-medium">
                Reading in English
              </span>
            )}
            {post.categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/news?category=${cat.slug}`}
                className="rounded-full bg-white/20 px-3 py-0.5 text-xs font-semibold hover:bg-white/30"
              >
                {lang === "my" && cat.name_my ? cat.name_my : cat.name_en}
              </Link>
            ))}
          </div>

          <h1 className="text-3xl font-extrabold leading-snug sm:text-4xl">{title.text}</h1>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-white/70">
            {post.author_name && <span>By: {post.author_name}</span>}
            {post.published_at && (
              <span>
                {new Date(post.published_at).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            )}
            <button
              onClick={handleShare}
              className="ml-auto flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold hover:bg-white/30"
            >
              {copied ? "✓ Copied!" : "Share →"}
            </button>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="bg-white px-6 py-14">
        <div className="mx-auto max-w-3xl">
          {post.status === "archived" && (
            <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-700">
              This article has been archived and may no longer reflect current information.
            </div>
          )}
          <article className="prose prose-gray max-w-none leading-relaxed text-gray-800">
            {body.text.split("\n").map((para, i) =>
              para.trim() ? (
                <p key={i} className="mb-4">
                  {para}
                </p>
              ) : null
            )}
          </article>
        </div>
      </section>

      {/* Prev / Next navigation */}
      {adjacent && (adjacent.prev || adjacent.next) && (
        <section className="border-t border-gray-200 bg-gray-50 px-6 py-10">
          <div className="mx-auto grid max-w-3xl grid-cols-2 gap-6">
            <div>
              {adjacent.prev && (
                <Link
                  href={`/news/${adjacent.prev.id}`}
                  className="group flex flex-col gap-1 rounded-2xl border border-gray-200 bg-white p-4 hover:border-blue-300 hover:shadow-sm"
                >
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    ← Previous Article
                  </span>
                  <span className="text-sm font-semibold text-gray-800 group-hover:text-blue-700 line-clamp-2">
                    {adjacent.prev.title_en}
                  </span>
                </Link>
              )}
            </div>
            <div className="text-right">
              {adjacent.next && (
                <Link
                  href={`/news/${adjacent.next.id}`}
                  className="group flex flex-col gap-1 rounded-2xl border border-gray-200 bg-white p-4 hover:border-blue-300 hover:shadow-sm"
                >
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Next Article →
                  </span>
                  <span className="text-sm font-semibold text-gray-800 group-hover:text-blue-700 line-clamp-2">
                    {adjacent.next.title_en}
                  </span>
                </Link>
              )}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
