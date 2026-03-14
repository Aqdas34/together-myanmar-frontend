"use client";

import { useState, useEffect, FormEvent } from "react";
import {
  getContentBlocks, upsertContentBlock, getAdvisoryMembers, createAdvisoryMember,
  deleteAdvisoryMember, getTestimonials, createTestimonial, deleteTestimonial,
  adminListAllFAQs, adminCreateFAQ, adminUpdateFAQ, adminDeleteFAQ,
  type ContentBlock, type AdvisoryMember, type Testimonial, type FAQ,
} from "@/lib/api";

type Tab = "blocks" | "advisory" | "testimonials" | "faqs";

const CMS_BLOCK_KEYS = [
  // ── Homepage Sections ─────────────────────────────────────────────────────
  { key: "home_hero_badge",       label: "Home: Hero Badge Text" },
  { key: "home_hero_title",       label: "Home: Hero Heading" },
  { key: "home_hero_subtitle",    label: "Home: Hero Subtitle / Description" },
  { key: "home_mission_title",    label: "Home: Mission Card Title" },
  { key: "home_mission_body",     label: "Home: Mission Card Body" },
  { key: "home_features_title",   label: "Home: Features Section Heading" },
  { key: "home_features_subtitle",label: "Home: Features Section Subtitle" },
  { key: "home_cta_title",        label: "Home: CTA Heading" },
  { key: "home_cta_subtitle",     label: "Home: CTA Subtitle" },
  // ── About Page ────────────────────────────────────────────────────────────
  { key: "about_mission", label: "About: Mission" },
  { key: "about_vision",  label: "About: Vision" },
  { key: "about_story",   label: "About: Our Story" },
];

const EMPTY_FAQ = { question_en: "", answer_en: "", question_my: "", answer_my: "", is_published: true, display_order: 0 };

export default function AdminContentPage() {
  const [tab, setTab] = useState<Tab>("blocks");
  const [token, setToken] = useState("");
  useEffect(() => { setToken(localStorage.getItem("access_token") ?? ""); }, []);

  // ── Content Blocks ───────────────────────────────────────────────────────
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [blockForm, setBlockForm] = useState({ title: "", body_en: "", body_my: "", body_th: "", body_ms: "" });
  const [blockSaving, setBlockSaving] = useState(false);
  const [blockMsg, setBlockMsg] = useState("");

  useEffect(() => { getContentBlocks().then(setBlocks).catch(() => {}); }, []);

  function openBlockEditor(key: string) {
    const def = CMS_BLOCK_KEYS.find((b) => b.key === key)!;
    const existing = blocks.find((b) => b.key === key);
    setBlockForm({
      title: existing?.title ?? def.label,
      body_en: existing?.body_en ?? "",
      body_my: existing?.body_my ?? "",
      body_th: existing?.body_th ?? "",
      body_ms: existing?.body_ms ?? "",
    });
    setEditingKey(key);
    setBlockMsg("");
  }

  async function saveBlock(e: FormEvent) {
    e.preventDefault();
    if (!editingKey) return;
    setBlockSaving(true);
    setBlockMsg("");
    try {
      const updated = await upsertContentBlock(token, { key: editingKey, ...blockForm });
      setBlocks((prev) => {
        const idx = prev.findIndex((b) => b.key === editingKey);
        if (idx >= 0) { const next = [...prev]; next[idx] = updated; return next; }
        return [...prev, updated];
      });
      setBlockMsg("Saved successfully.");
      setEditingKey(null);
    } catch {
      setBlockMsg("Save failed. Ensure the backend is running and you are logged in as admin.");
    } finally {
      setBlockSaving(false);
    }
  }

  // ── Advisory Members ────────────────────────────────────────────────────
  const [advisory, setAdvisory] = useState<AdvisoryMember[]>([]);
  const [advisoryForm, setAdvisoryForm] = useState({ name: "", role: "", bio: "", image_url: "", category: "advisor", display_order: 0 });
  const [advisorySaving, setAdvisorySaving] = useState(false);
  const [advisoryMsg, setAdvisoryMsg] = useState("");

  useEffect(() => { getAdvisoryMembers().then(setAdvisory).catch(() => {}); }, []);

  async function addAdvisory(e: FormEvent) {
    e.preventDefault();
    setAdvisorySaving(true);
    setAdvisoryMsg("");
    try {
      const created = await createAdvisoryMember(token, { ...advisoryForm, image_url: advisoryForm.image_url || null, is_active: true });
      setAdvisory((prev) => [...prev, created]);
      setAdvisoryForm({ name: "", role: "", bio: "", image_url: "", category: "advisor", display_order: 0 });
      setAdvisoryMsg("Member added.");
    } catch {
      setAdvisoryMsg("Failed to add. Check you are logged in as admin.");
    } finally {
      setAdvisorySaving(false);
    }
  }

  async function removeAdvisory(id: number) {
    if (!confirm("Remove this member?")) return;
    try {
      await deleteAdvisoryMember(token, id);
      setAdvisory((prev) => prev.filter((m) => m.id !== id));
    } catch { alert("Delete failed."); }
  }

  // ── Testimonials ────────────────────────────────────────────────────────
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [testimonialForm, setTestimonialForm] = useState({ author_name: "", author_location: "", quote_en: "", quote_my: "", display_order: 0 });
  const [testimonialSaving, setTestimonialSaving] = useState(false);
  const [testimonialMsg, setTestimonialMsg] = useState("");

  useEffect(() => { getTestimonials().then(setTestimonials).catch(() => {}); }, []);

  async function addTestimonial(e: FormEvent) {
    e.preventDefault();
    setTestimonialSaving(true);
    setTestimonialMsg("");
    try {
      const created = await createTestimonial(token, { ...testimonialForm, is_active: true });
      setTestimonials((prev) => [...prev, created]);
      setTestimonialForm({ author_name: "", author_location: "", quote_en: "", quote_my: "", display_order: 0 });
      setTestimonialMsg("Testimonial added.");
    } catch {
      setTestimonialMsg("Failed to add. Check you are logged in as admin.");
    } finally {
      setTestimonialSaving(false);
    }
  }

  async function removeTestimonial(id: number) {
    if (!confirm("Remove this testimonial?")) return;
    try {
      await deleteTestimonial(token, id);
      setTestimonials((prev) => prev.filter((t) => t.id !== id));
    } catch { alert("Delete failed."); }
  }

  // ── FAQs ────────────────────────────────────────────────────────────────
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [faqsLoaded, setFaqsLoaded] = useState(false);
  const [faqForm, setFaqForm] = useState(EMPTY_FAQ);
  const [faqEditId, setFaqEditId] = useState<number | null>(null);
  const [faqSaving, setFaqSaving] = useState(false);
  const [faqMsg, setFaqMsg] = useState("");
  const [faqConfirmDelete, setFaqConfirmDelete] = useState<number | null>(null);

  useEffect(() => {
    if (tab === "faqs" && !faqsLoaded && token) {
      adminListAllFAQs(token).then((data) => { setFaqs(data); setFaqsLoaded(true); }).catch(() => {});
    }
  }, [tab, token, faqsLoaded]);

  function openFaqEdit(faq: FAQ) {
    setFaqEditId(faq.id);
    setFaqForm({ question_en: faq.question_en, answer_en: faq.answer_en, question_my: faq.question_my ?? "", answer_my: faq.answer_my ?? "", is_published: faq.is_published, display_order: faq.display_order });
    setFaqMsg("");
  }

  function cancelFaqEdit() { setFaqEditId(null); setFaqForm(EMPTY_FAQ); setFaqMsg(""); }

  async function saveFaq(e: FormEvent) {
    e.preventDefault();
    setFaqSaving(true); setFaqMsg("");
    try {
      if (faqEditId !== null) {
        const updated = await adminUpdateFAQ(token, faqEditId, faqForm);
        setFaqs((prev) => prev.map((f) => (f.id === faqEditId ? updated : f)));
        setFaqMsg("FAQ updated.");
      } else {
        const created = await adminCreateFAQ(token, faqForm);
        setFaqs((prev) => [...prev, created]);
        setFaqMsg("FAQ created.");
      }
      cancelFaqEdit();
    } catch { setFaqMsg("Save failed. Check you are logged in as admin."); }
    finally { setFaqSaving(false); }
  }

  async function deleteFaq(id: number) {
    try {
      await adminDeleteFAQ(token, id);
      setFaqs((prev) => prev.filter((f) => f.id !== id));
    } catch { alert("Delete failed."); }
    finally { setFaqConfirmDelete(null); }
  }

  async function toggleFaqPublished(faq: FAQ) {
    try {
      const updated = await adminUpdateFAQ(token, faq.id, { is_published: !faq.is_published });
      setFaqs((prev) => prev.map((f) => (f.id === faq.id ? updated : f)));
    } catch { alert("Update failed."); }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Content Management</h2>
        <p className="text-sm text-gray-500">Edit page content, advisory board members, and community testimonials.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-gray-200 bg-gray-100 p-1 w-fit">
      {([["blocks", "Page Content"], ["advisory", "Advisory & Partners"], ["testimonials", "Testimonials"], ["faqs", "FAQs"]] as [Tab, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`rounded-lg px-5 py-2 text-sm font-semibold transition-colors ${tab === key ? "bg-white shadow text-blue-700" : "text-gray-500 hover:text-gray-700"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Content Blocks ── */}
      {tab === "blocks" && (
        <div className="space-y-4">
          {editingKey ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold text-gray-900">{CMS_BLOCK_KEYS.find((b) => b.key === editingKey)?.label}</h3>
                <button onClick={() => setEditingKey(null)} className="text-sm text-gray-400 hover:text-gray-700">Cancel</button>
              </div>
              <form onSubmit={saveBlock} className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700">Block Title</label>
                  <input value={blockForm.title} onChange={(e) => setBlockForm({ ...blockForm, title: e.target.value })} required className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
                </div>
                {(["en", "my"] as const).map((lang) => (
                  <div key={lang}>
                    <label className="mb-1 block text-xs font-semibold text-gray-700">
                      Body ({lang === "en" ? "English" : "Burmese"})
                    </label>
                    <textarea
                      rows={5}
                      value={blockForm[`body_${lang}`]}
                      onChange={(e) => setBlockForm({ ...blockForm, [`body_${lang}`]: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                ))}
                {blockMsg && <p className={`text-sm ${blockMsg.includes("failed") ? "text-red-600" : "text-emerald-600"}`}>{blockMsg}</p>}
                <button type="submit" disabled={blockSaving} className="rounded-xl bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                  {blockSaving ? "Saving…" : "Save Block"}
                </button>
              </form>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
              {blockMsg && <p className="px-6 py-3 text-sm text-emerald-600 bg-emerald-50 border-b border-emerald-100">{blockMsg}</p>}
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Block</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {CMS_BLOCK_KEYS.map(({ key, label }) => {
                    const existing = blocks.find((b) => b.key === key);
                    return (
                      <tr key={key} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <p className="font-semibold text-sm text-gray-900">{label}</p>
                          <p className="text-xs text-gray-400 font-mono mt-0.5">{key}</p>
                        </td>
                        <td className="px-4 py-4">
                          {existing ? (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">Customised</span>
                          ) : (
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500">Default</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button onClick={() => openBlockEditor(key)} className="rounded-lg bg-blue-50 px-4 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100">
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Advisory & Partners ── */}
      {tab === "advisory" && (
        <div className="space-y-6">
          {/* Add form */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h3 className="mb-4 font-bold text-gray-900">Add Advisory Member or Partner</h3>
            <form onSubmit={addAdvisory} className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700">Name</label>
                <input required value={advisoryForm.name} onChange={(e) => setAdvisoryForm({ ...advisoryForm, name: e.target.value })} className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700">Role / Title</label>
                <input required value={advisoryForm.role} onChange={(e) => setAdvisoryForm({ ...advisoryForm, role: e.target.value })} className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-gray-700">Bio</label>
                <textarea rows={3} value={advisoryForm.bio} onChange={(e) => setAdvisoryForm({ ...advisoryForm, bio: e.target.value })} className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700">Photo URL (optional)</label>
                <input value={advisoryForm.image_url} onChange={(e) => setAdvisoryForm({ ...advisoryForm, image_url: e.target.value })} className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700">Category</label>
                <select value={advisoryForm.category} onChange={(e) => setAdvisoryForm({ ...advisoryForm, category: e.target.value })} className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200">
                  <option value="advisor">Advisory Board</option>
                  <option value="partner">Partner Organisation</option>
                </select>
              </div>
              {advisoryMsg && <p className={`sm:col-span-2 text-sm ${advisoryMsg.includes("Failed") ? "text-red-600" : "text-emerald-600"}`}>{advisoryMsg}</p>}
              <div className="sm:col-span-2">
                <button type="submit" disabled={advisorySaving} className="rounded-xl bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                  {advisorySaving ? "Adding…" : "Add Member"}
                </button>
              </div>
            </form>
          </div>

          {/* List */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Category</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {advisory.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{m.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{m.role}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${m.category === "advisor" ? "bg-purple-100 text-purple-700" : "bg-amber-100 text-amber-700"}`}>
                        {m.category === "advisor" ? "Advisor" : "Partner"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => removeAdvisory(m.id)} className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100">Remove</button>
                    </td>
                  </tr>
                ))}
                {advisory.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-400">No members yet. Add one above.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Testimonials ── */}
      {tab === "testimonials" && (
        <div className="space-y-6">
          {/* Add form */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h3 className="mb-4 font-bold text-gray-900">Add Testimonial</h3>
            <form onSubmit={addTestimonial} className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700">Author Name</label>
                <input required value={testimonialForm.author_name} onChange={(e) => setTestimonialForm({ ...testimonialForm, author_name: e.target.value })} className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700">Location</label>
                <input required value={testimonialForm.author_location} onChange={(e) => setTestimonialForm({ ...testimonialForm, author_location: e.target.value })} placeholder="e.g. Chiang Mai, Thailand" className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-gray-700">Quote (English)</label>
                <textarea required rows={3} value={testimonialForm.quote_en} onChange={(e) => setTestimonialForm({ ...testimonialForm, quote_en: e.target.value })} className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-gray-700">Quote (Burmese, optional)</label>
                <textarea rows={2} value={testimonialForm.quote_my} onChange={(e) => setTestimonialForm({ ...testimonialForm, quote_my: e.target.value })} className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
              {testimonialMsg && <p className={`sm:col-span-2 text-sm ${testimonialMsg.includes("Failed") ? "text-red-600" : "text-emerald-600"}`}>{testimonialMsg}</p>}
              <div className="sm:col-span-2">
                <button type="submit" disabled={testimonialSaving} className="rounded-xl bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                  {testimonialSaving ? "Adding…" : "Add Testimonial"}
                </button>
              </div>
            </form>
          </div>

          {/* List */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white divide-y divide-gray-100">
            {testimonials.map((t) => (
              <div key={t.id} className="flex items-start justify-between gap-4 p-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t.author_name} <span className="text-gray-400 font-normal">— {t.author_location}</span></p>
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">{t.quote_en}</p>
                </div>
                <button onClick={() => removeTestimonial(t.id)} className="shrink-0 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100">Remove</button>
              </div>
            ))}
            {testimonials.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-gray-400">No testimonials yet. Add one above.</p>
            )}
          </div>
        </div>
      )}
      {/* ── FAQs ── */}
      {tab === "faqs" && (
        <div className="space-y-6">
          {/* Form */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h3 className="mb-4 font-bold text-gray-900">{faqEditId !== null ? "Edit FAQ" : "Add FAQ"}</h3>
            <form onSubmit={saveFaq} className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-gray-700">Question (English) *</label>
                <input required value={faqForm.question_en} onChange={(e) => setFaqForm({ ...faqForm, question_en: e.target.value })} className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-gray-700">Answer (English) *</label>
                <textarea required rows={3} value={faqForm.answer_en} onChange={(e) => setFaqForm({ ...faqForm, answer_en: e.target.value })} className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700">Question (Myanmar)</label>
                <input value={faqForm.question_my} onChange={(e) => setFaqForm({ ...faqForm, question_my: e.target.value })} className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700">Display Order</label>
                <input type="number" value={faqForm.display_order} onChange={(e) => setFaqForm({ ...faqForm, display_order: Number(e.target.value) })} className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-gray-700">Answer (Myanmar)</label>
                <textarea rows={2} value={faqForm.answer_my} onChange={(e) => setFaqForm({ ...faqForm, answer_my: e.target.value })} className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="faq-published" checked={faqForm.is_published} onChange={(e) => setFaqForm({ ...faqForm, is_published: e.target.checked })} className="h-4 w-4 rounded" />
                <label htmlFor="faq-published" className="text-sm font-medium text-gray-700">Published</label>
              </div>
              {faqMsg && <p className={`sm:col-span-2 text-sm ${faqMsg.includes("failed") || faqMsg.includes("Failed") ? "text-red-600" : "text-emerald-600"}`}>{faqMsg}</p>}
              <div className="sm:col-span-2 flex gap-3">
                <button type="submit" disabled={faqSaving} className="rounded-xl bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                  {faqSaving ? "Saving…" : faqEditId !== null ? "Save Changes" : "Add FAQ"}
                </button>
                {faqEditId !== null && (
                  <button type="button" onClick={cancelFaqEdit} className="rounded-xl border border-gray-300 px-6 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
                )}
              </div>
            </form>
          </div>

          {/* List */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Question</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Order</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {faqs.map((faq) => (
                  <tr key={faq.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900 max-w-xs">
                      <p className="font-medium">{faq.question_en}</p>
                      <p className="text-xs text-gray-400 line-clamp-1">{faq.answer_en}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${faq.is_published ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                        {faq.is_published ? "Published" : "Hidden"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{faq.display_order}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openFaqEdit(faq)} className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-200">Edit</button>
                        <button onClick={() => toggleFaqPublished(faq)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${faq.is_published ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"}`}>
                          {faq.is_published ? "Hide" : "Publish"}
                        </button>
                        {faqConfirmDelete === faq.id ? (
                          <>
                            <button onClick={() => deleteFaq(faq.id)} className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700">Confirm</button>
                            <button onClick={() => setFaqConfirmDelete(null)} className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-200">Cancel</button>
                          </>
                        ) : (
                          <button onClick={() => setFaqConfirmDelete(faq.id)} className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100">Delete</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {faqs.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-400">No FAQs yet. Add one above.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
