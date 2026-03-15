"use client";

import { useState, useEffect, FormEvent } from "react";
import { getCommunityEvents, getMyEvents, submitUserEvent, type CommunityEvent } from "@/lib/api";

const TYPE_LABELS: Record<string, string> = {
  online: "Virtual Hub",
  in_person: "Physical Gathering",
  hybrid: "Hybrid Session",
};

const TYPE_COLORS: Record<string, string> = {
  online: "bg-emerald-50 text-emerald-700",
  in_person: "bg-blue-50 text-blue-700",
  hybrid: "bg-indigo-50 text-indigo-700",
};

const TYPE_ICONS: Record<string, string> = {
  online: "🌐",
  in_person: "📍",
  hybrid: "🔀",
};

const STATUS_LABELS: Record<string, string> = {
  pending:  "Under Review",
  approved: "Live & Active",
  rejected: "Declined",
};
const STATUS_COLORS: Record<string, string> = {
  pending:  "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-600",
};

const emptyForm = {
  title_en: "",
  title_my: "",
  description_en: "",
  event_type: "in_person" as "online" | "in_person" | "hybrid",
  starts_at: "",
  ends_at: "",
  location_name: "",
  online_url: "",
};

function SubmitEventModal({
  onClose,
  onSubmitted,
}: {
  onClose: () => void;
  onSubmitted: (ev: CommunityEvent) => void;
}) {
  const [form, setForm] = useState(emptyForm);
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem("access_token");
    if (!token) { setMsg("You must be logged in to submit an event."); return; }
    setSaving(true);
    setMsg("");
    try {
      const ev = await submitUserEvent(token, {
        ...form,
        ends_at: form.ends_at || undefined,
        location_name: form.location_name || undefined,
        online_url: form.online_url || undefined,
        title_my: form.title_my || form.title_en,
        title_th: form.title_en,
        title_ms: form.title_en,
      });
      onSubmitted(ev);
    } catch (err: unknown) {
      setMsg((err as Error).message || "Failed to submit event.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl p-8 space-y-6 max-h-[90vh] overflow-y-auto relative">
        <button onClick={onClose} className="absolute right-6 top-6 text-slate-300 hover:text-slate-500 transition-colors text-2xl font-light">&times;</button>
        
        <div>
           <h2 className="text-2xl font-black text-slate-900 mb-2">Submit an Event</h2>
           <p className="text-sm font-medium text-slate-500 leading-relaxed">Your event will be reviewed by our moderators before appearing in the global directory.</p>
        </div>

        {msg && <p className={`rounded-xl px-4 py-3 text-sm font-bold ${msg.includes("Failed") || msg.includes("logged") ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>{msg}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
             <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Title (English) *</label>
                <input required value={form.title_en} onChange={(e) => setForm({ ...form, title_en: e.target.value })}
                  className="input-modern" placeholder="e.g. Community Dialogue" />
             </div>
             <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Title (Burmese)</label>
                <input value={form.title_my} onChange={(e) => setForm({ ...form, title_my: e.target.value })}
                  className="input-modern" placeholder="မြန်မာခေါင်းစဥ်" />
             </div>
             <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Event Domain</label>
                <select value={form.event_type} onChange={(e) => setForm({ ...form, event_type: e.target.value as typeof form.event_type })}
                  className="input-modern bg-slate-50 border-slate-100">
                  <option value="in_person">Physical Gathering</option>
                  <option value="online">Virtual Session</option>
                  <option value="hybrid">Hybrid Approach</option>
                </select>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Commencement *</label>
                  <input required type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
                    className="input-modern px-3 py-2" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Conclusion</label>
                  <input type="datetime-local" value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
                    className="input-modern px-3 py-2" />
                </div>
             </div>
             <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Geographic Location</label>
                <input value={form.location_name} onChange={(e) => setForm({ ...form, location_name: e.target.value })}
                  placeholder="e.g. Civic Center, Downtown"
                  className="input-modern" />
             </div>
             <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Digital Link</label>
                <input type="url" value={form.online_url} onChange={(e) => setForm({ ...form, online_url: e.target.value })}
                  placeholder="https://community.zoom.us/..."
                  className="input-modern" />
             </div>
             <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Abstract / Agenda</label>
                <textarea rows={4} value={form.description_en} onChange={(e) => setForm({ ...form, description_en: e.target.value })}
                  placeholder="Provide a brief overview of the event's goals..."
                  className="input-modern resize-none" />
             </div>
          </div>
          <div className="flex gap-4 pt-4">
            <button type="submit" disabled={saving}
              className="btn-primary flex-1 justify-center py-3">
              {saving ? "Processing..." : "Submit for Approval"}
            </button>
            <button type="button" onClick={onClose}
              className="btn-secondary flex-1 justify-center py-3">
              Abort
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EventCard({ ev }: { ev: CommunityEvent }) {
  const [expanded, setExpanded] = useState(false);
  const start = new Date(ev.starts_at);
  const past = start < new Date();

  return (
    <div className={`card-modern group flex flex-col overflow-hidden bg-white border-slate-200 shadow-sm transition-all hover:border-primary-200 hover:shadow-md ${past ? "opacity-60 saturate-50" : ""}`}>
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-4 flex items-center justify-between gap-2">
          <span className={`badge-modern px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider border-none ${TYPE_COLORS[ev.event_type]}`}>
            <span className="mr-1.5">{TYPE_ICONS[ev.event_type]}</span>
            {TYPE_LABELS[ev.event_type]}
          </span>
          {past && (
            <span className="badge-modern bg-slate-100 text-slate-500 border-none px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider">
               CONCLUDED
            </span>
          )}
        </div>

        <h3 className="text-xl font-black text-slate-900 group-hover:text-primary-600 transition-colors mb-2 leading-tight">{ev.title_en}</h3>
        {ev.title_my && (
          <p className="mb-3 text-[13px] font-bold text-slate-400 italic">{ev.title_my}</p>
        )}

        <div className="mb-4 space-y-2">
           <div className="flex items-center gap-2.5 text-[13px] font-bold text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
              <span className="text-lg opacity-60">📅</span>
              <span>{start.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
              <span className="text-slate-300">|</span>
              <span>{start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
           </div>

           {ev.location_name && (
             <div className="flex items-center gap-2.5 text-[13px] font-medium text-slate-500 px-2 py-1">
               <span className="text-lg opacity-40">📍</span>
               <span className="truncate">{ev.location_name}{ev.location_address ? `, ${ev.location_address}` : ""}</span>
             </div>
           )}

           {ev.online_url && (
             <div className="flex items-center gap-2.5 text-[13px] font-bold text-primary-600 px-2 py-1">
               <span className="text-lg opacity-40">🌐</span>
               <a href={ev.online_url} target="_blank" rel="noopener noreferrer" className="underline hover:text-primary-800 transition-colors">
                  Secure Access Hub
               </a>
             </div>
           )}
        </div>

        {ev.description_en && (
          <div className="mt-2 border-t border-slate-50 pt-4">
            <p className={`text-[14px] leading-relaxed text-slate-500 font-medium ${expanded ? "" : "line-clamp-2"}`}>{ev.description_en}</p>
            {ev.description_en.length > 120 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="mt-2 text-[11px] font-black text-primary-600 uppercase tracking-widest hover:underline"
              >
                {expanded ? "Collapse Info" : "View Full Abstract"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function EventsPage() {
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [myEvents, setMyEvents] = useState<CommunityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("upcoming");
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("access_token"));
    setLoading(true);
    getCommunityEvents()
      .then(setEvents)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    getMyEvents(token).then(setMyEvents).catch(() => {});
  }, []);

  function handleSubmitted(ev: CommunityEvent) {
    setMyEvents((prev) => [ev, ...prev]);
    setShowSubmitModal(false);
  }

  const now = new Date();
  const filtered = events.filter((ev) => {
    const start = new Date(ev.starts_at);
    if (filter === "upcoming") return start >= now;
    if (filter === "past") return start < now;
    return true;
  });

  return (
    <div className="bg-white min-h-screen">
      {showSubmitModal && (
        <SubmitEventModal
          onClose={() => setShowSubmitModal(false)}
          onSubmitted={handleSubmitted}
        />
      )}

      {/* Hero */}
      <header className="pt-20 pb-16 border-b border-slate-100 relative overflow-hidden bg-slate-50">
        <div className="absolute inset-0 bg-pattern opacity-[0.03] pointer-events-none" />
        <div className="mx-auto max-w-7xl px-6 relative z-10 flex flex-col items-center text-center">
          <span className="badge-primary mb-4 py-1 px-3 inline-block">
             Global Myanmar Events
          </span>
          <h1 className="hero-title mb-4">Community Events Calendar</h1>
          <p className="text-lg text-slate-600 max-w-3xl leading-relaxed mb-6">
             The Together Myanmar Community Calendar highlights workshops, webinars, cultural gatherings, and community events across the global Myanmar network.
          </p>
          <p className="text-sm font-bold text-slate-500 mb-8 flex items-center gap-2">
            <span className="text-primary-500 text-lg">🤝</span> This calendar connects Myanmar communities worldwide through shared events and collaboration.
          </p>

          {isLoggedIn ? (
            <div className="flex flex-col items-center">
              <button
                onClick={() => setShowSubmitModal(true)}
                className="btn-primary shadow-xl shadow-primary-500/20 py-4 px-10 text-[15px]"
              >
                + Propose an Event
              </button>
              <p className="text-xs font-medium text-slate-400 mt-3 text-center max-w-md leading-relaxed italic">
                Community members can submit events related to education, advocacy, culture, or networking. Event organizers should ensure compliance with local laws and safety guidelines.
              </p>
            </div>
          ) : (
            <p className="text-sm font-bold text-slate-400 bg-white border border-slate-200 px-6 py-3 rounded-full shadow-sm">
              Log in to submit community events.
            </p>
          )}
        </div>
      </header>

      {/* Filter bar */}
      <section className="bg-white sticky top-[64px] z-20 border-b border-slate-100 px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {(["upcoming", "past", "all"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full px-5 py-2 text-[12px] font-black uppercase tracking-widest transition-all ${
                   filter === f 
                    ? "bg-primary-600 text-white shadow-md shadow-primary-200" 
                    : "bg-slate-50 text-slate-500 border border-slate-200 hover:border-slate-300 hover:text-slate-900"
                }`}
              >
                {f === "all" ? "All Events" : f === "upcoming" ? "Future Sessions" : "Past Events Archive"}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 border-l border-slate-200 pl-4">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Format Filters:</span>
             <select className="input-modern bg-slate-50 border-slate-100 py-1.5 px-3 text-xs w-32">
               <option value="">All Formats</option>
               <option value="online">🎥 Online</option>
               <option value="in_person">👥 In-person</option>
               <option value="hybrid">🔀 Hybrid</option>
             </select>
             <select className="input-modern bg-slate-50 border-slate-100 py-1.5 px-3 text-xs w-32">
               <option value="">Global</option>
               <option value="asia">Asia</option>
               <option value="europe">Europe</option>
               <option value="na">North America</option>
               <option value="aus">Australia</option>
             </select>
          </div>
        </div>
      </section>

      {/* Events grid */}
      <section className="bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-7xl">
          
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
             <h2 className="text-[13px] font-black text-slate-800 uppercase tracking-widest px-2">
               {filter === "past" ? "Archive of Completed Events" : "Upcoming Featured Events"}
             </h2>
             <div className="flex bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                <button className="px-4 py-1.5 bg-slate-100 text-slate-900 text-xs font-bold flex items-center gap-2 border-r border-slate-200">📅 Calendar View</button>
                <button className="px-4 py-1.5 text-slate-500 hover:bg-slate-50 text-xs font-bold flex items-center gap-2">📋 List View</button>
             </div>
          </div>
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
               {[1, 2, 3].map(i => <div key={i} className="h-64 animate-pulse bg-white border border-slate-100 rounded-2xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="card-modern py-32 bg-white border-dashed border-slate-200 text-center shadow-sm">
              <div className="text-6xl mb-6">📅</div>
              <p className="text-2xl font-black text-slate-900 mb-3 tracking-tight">No upcoming events yet.</p>
              <p className="text-slate-500 font-medium text-lg mb-8 max-w-md mx-auto">
                Be the first to share an event with the community. Workshops, webinars, and cultural gatherings are welcome.
              </p>
              {filter !== "all" && (
                <button onClick={() => setFilter("all")} className="btn-secondary">View All Events</button>
              )}
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {filtered
                .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
                .map((ev) => (
                  <EventCard key={ev.id} ev={ev} />
                ))}
            </div>
          )}
        </div>
      </section>

      {/* My Submissions */}
      {isLoggedIn && myEvents.length > 0 && (
        <section className="bg-white border-t border-slate-100 px-6 py-20">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-2xl font-black text-slate-900 mb-8 border-l-4 border-primary-600 pl-6">Your Propositions</h2>
            <div className="grid gap-4">
              {myEvents.map((ev) => (
                <div key={ev.id} className="card-modern flex flex-wrap items-center justify-between gap-6 p-6 bg-slate-50 border-slate-100">
                  <div className="space-y-1">
                    <p className="text-lg font-black text-slate-900">{ev.title_en}</p>
                    <p className="text-[12px] font-bold text-slate-400">
                      SCHEDULED: {new Date(ev.starts_at).toLocaleDateString("en-GB", {
                        day: "numeric", month: "long", year: "numeric",
                      })}
                    </p>
                  </div>
                  <span className={`badge-modern px-4 py-1.5 text-[11px] font-black uppercase tracking-wider border-none ${STATUS_COLORS[ev.status]}`}>
                    {STATUS_LABELS[ev.status]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
