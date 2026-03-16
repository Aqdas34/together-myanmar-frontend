"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getMe,
  getMyConnections,
  getIncomingRequests,
  getOutgoingRequests,
  sendConnectionRequest,
  respondToRequest,
  cancelConnectionRequest,
  removeConnection,
  blockUser,
  ApiError,
  type Connection,
  type ConnectionRequest,
  type AuthUser,
} from "@/lib/api";

type Tab = "connections" | "incoming" | "outgoing" | "send";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function partnerOf(conn: Connection, myId: string) {
  return conn.user_id_1 === myId ? conn.user_id_2 : conn.user_id_1;
}

export default function ReconnectionPage() {
  const router = useRouter();
  const [me, setMe] = useState<AuthUser | null>(null);
  const [tab, setTab] = useState<Tab>("connections");
  const [connections, setConnections] = useState<Connection[]>([]);
  const [incoming, setIncoming] = useState<ConnectionRequest[]>([]);
  const [outgoing, setOutgoing] = useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  // Send request form
  const [receiverId, setReceiverId] = useState("");
  const [requestMsg, setRequestMsg] = useState("");
  const [sendLoading, setSendLoading] = useState(false);
  const [sendSuccess, setSendSuccess] = useState("");
  const [sendError, setSendError] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const loadData = useCallback(async () => {
    if (!token) { router.replace("/login?next=/reconnection"); return; }
    try {
      const [user, conns, inc, out] = await Promise.all([
        getMe(token),
        getMyConnections(token),
        getIncomingRequests(token),
        getOutgoingRequests(token),
      ]);
      setMe(user);
      setConnections(conns);
      setIncoming(inc);
      setOutgoing(out);
    } catch {
      setError("Failed to load data. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, [token, router]);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (mounted) loadData(); }, [mounted, loadData]);

  async function handleRespond(requestId: string, approve: boolean) {
    if (!token) return;
    setActionLoading(requestId);
    try {
      await respondToRequest(token, requestId, approve);
      await loadData();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Action failed");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleCancel(requestId: string) {
    if (!token) return;
    setActionLoading(requestId);
    try {
      await cancelConnectionRequest(token, requestId);
      await loadData();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Action failed");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRemove(connectionId: string) {
    if (!token || !confirm("Remove this connection?")) return;
    setActionLoading(connectionId);
    try {
      await removeConnection(token, connectionId);
      await loadData();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Action failed");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleBlock(targetId: string) {
    if (!token || !confirm("Block this user? They will no longer be able to contact you.")) return;
    setActionLoading(targetId);
    try {
      await blockUser(token, targetId);
      await loadData();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Action failed");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleSendRequest(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSendLoading(true);
    setSendError("");
    setSendSuccess("");
    try {
      await sendConnectionRequest(token, receiverId.trim(), requestMsg.trim() || undefined);
      setSendSuccess("Connection request sent successfully!");
      setReceiverId("");
      setRequestMsg("");
      await loadData();
    } catch (e) {
      setSendError(e instanceof ApiError ? e.message : "Failed to send request");
    } finally {
      setSendLoading(false);
    }
  }

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "connections", label: "My Network", count: connections.length },
    { id: "incoming", label: "Incoming", count: incoming.length },
    { id: "outgoing", label: "Pending", count: outgoing.length },
    { id: "send", label: "Send Request" },
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <header className="pt-20 pb-16 border-b border-slate-100 relative overflow-hidden bg-slate-50">
        <div className="absolute inset-0 bg-pattern opacity-[0.03] pointer-events-none" />
        <div className="mx-auto max-w-7xl px-6 relative z-10 text-center md:text-left">
          <span className="badge-primary mb-4 py-1 px-3 inline-block">
             Community Connection System
          </span>
          <h1 className="hero-title mb-4">Reconnect Safely with the Myanmar Community</h1>
          <p className="text-lg text-slate-600 max-w-3xl leading-relaxed mx-auto md:mx-0">
             Many people from Myanmar have been forced to leave their homes and communities.
             Friends, activists, and colleagues lost contact across borders.
             The Together Myanmar Reconnection system allows people to reconnect privately and safely, using a consent-based process that protects personal information.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
            <button onClick={() => { setTab("send"); document.getElementById("app")?.scrollIntoView({ behavior: "smooth" }); }} className="btn-primary text-lg px-8 py-4 w-full sm:w-auto flex items-center justify-center">
              Send a Reconnection Request
            </button>
            <p className="text-[14px] text-slate-500 font-medium flex items-center justify-center sm:justify-start gap-2 mt-4 sm:mt-0">
               <span className="text-emerald-500 text-lg">🔒</span> Designed with privacy and community safety in mind.
            </p>
          </div>
        </div>
      </header>

      {/* About & Why it Matters */}
      <section className="py-16 bg-white px-6 border-b border-slate-100">
        <div className="mx-auto max-w-7xl grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">About Together Myanmar</h2>
            <p className="text-lg text-slate-600 leading-relaxed mb-10">
              Together Myanmar is a global initiative connecting Myanmar communities worldwide through humanitarian support, digital platforms, and diaspora collaboration.
            </p>
            
            <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Why Reconnection Matters</h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              After the crisis in Myanmar, many people were forced to leave their homes, communities, and networks. Friends, colleagues, activists, and families lost contact. Together Myanmar provides a secure way to reconnect safely without exposing personal data.
            </p>
          </div>

          <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-center">
            <h3 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-tight">Who Is This For?</h3>
            <ul className="space-y-4">
              {[
                "Myanmar diaspora members",
                "Activists and journalists",
                "Students and alumni networks",
                "Community organizers",
                "Friends reconnecting after displacement"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-4 text-lg text-slate-700 font-medium">
                  <span className="h-8 w-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* How It Works & Privacy */}
      <section className="py-16 bg-slate-50 px-6 border-b border-slate-100">
        <div className="mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16">
            
            <div>
              <h2 className="text-3xl font-black text-slate-900 mb-8 tracking-tight">How Reconnection Works</h2>
              <div className="space-y-8">
                <div className="flex gap-4">
                   <div className="h-14 w-14 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-2xl shrink-0">📩</div>
                   <div>
                      <h3 className="text-xl font-black text-slate-900 mb-2">Step 1 – Send Request</h3>
                      <p className="text-lg text-slate-600 leading-relaxed mb-2">Enter the email of someone you want to reconnect with.</p>
                      <div className="text-sm font-mono text-slate-500 bg-slate-100 px-3 py-1.5 rounded inline-block font-bold">User A &rarr; Request &rarr; User B</div>
                   </div>
                </div>
                <div className="flex gap-4">
                   <div className="h-14 w-14 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-2xl shrink-0">✔</div>
                   <div>
                      <h3 className="text-xl font-black text-slate-900 mb-2">Step 2 – Consent Approval</h3>
                      <p className="text-lg text-slate-600 leading-relaxed mb-2">They receive a private request and decide whether to accept.</p>
                      <div className="text-sm font-mono text-slate-500 bg-slate-100 px-3 py-1.5 rounded inline-block font-bold">User B &rarr; Approve &rarr; Secure Chat</div>
                   </div>
                </div>
                <div className="flex gap-4">
                   <div className="h-14 w-14 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-2xl shrink-0">🔒</div>
                   <div>
                      <h3 className="text-xl font-black text-slate-900 mb-2">Step 3 – Private Chat</h3>
                      <p className="text-lg text-slate-600 leading-relaxed">Once approved, a private conversation channel opens.</p>
                   </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tight flex items-center gap-3">
                  <span className="text-emerald-500">🛡️</span> Your Privacy Matters
                </h2>
                <ul className="space-y-4">
                  {[
                    "No public profiles",
                    "No searchable directory",
                    "Only consent-based connections",
                    "Personal data remains private"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-4 text-lg text-slate-700 font-medium">
                      <span className="h-3 w-3 rounded-full bg-emerald-500 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-amber-50 p-6 rounded-3xl border border-amber-200 flex flex-col sm:flex-row gap-5 text-amber-900 items-start">
                <span className="text-3xl shrink-0">⚠️</span>
                <div>
                  <h4 className="font-black mb-2 uppercase tracking-tight text-sm">Safety Notice</h4>
                  <p className="font-medium opacity-90 leading-relaxed text-sm lg:text-base">
                    Together Myanmar is designed to protect user privacy. However, users should always exercise caution when sharing sensitive information online.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Error bar */}
      {error && (
        <div className="bg-red-50 border-b border-red-100 px-6 py-3 text-sm text-red-700 flex items-center justify-between font-bold">
          {error}
          <button onClick={() => setError("")} className="ml-4 opacity-50 hover:opacity-100 transition-opacity">✕</button>
        </div>
      )}

      <section id="app" className="bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-7xl">
          
          <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Sidebar / Tabs */}
            <aside className="w-full lg:w-64 shrink-0">
               <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 scrollbar-hide">
                  {tabs.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTab(t.id)}
                      className={`whitespace-nowrap flex items-center justify-between gap-4 px-6 py-3 rounded-2xl text-[13px] font-black uppercase tracking-tight transition-all text-left ${
                        tab === t.id 
                          ? "bg-primary-600 text-white shadow-xl shadow-primary-200" 
                          : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300 hover:text-slate-900 shadow-sm"
                      }`}
                    >
                      {t.label}
                      {t.count != null && t.count > 0 && (
                        <span className={`h-5 w-5 flex items-center justify-center rounded-full text-[10px] font-black ${tab === t.id ? "bg-white text-primary-600" : "bg-slate-100 text-slate-500"}`}>
                          {t.count}
                        </span>
                      )}
                    </button>
                  ))}
               </nav>
               
               <div className="mt-8 p-6 card-modern bg-white border-slate-200">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 leading-none">Your Connection Email</h4>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 font-mono text-[11px] text-slate-600 break-all select-all flex items-center justify-center font-bold">
                     {mounted ? me?.email : "Loading..."}
                  </div>
                  <p className="mt-4 text-[11px] font-medium text-slate-400 leading-relaxed">
                    Share your email address with trusted friends to receive connection requests.
                  </p>
               </div>
            </aside>

            {/* Main Surface */}
            <main className="flex-1 min-w-0">
               {/* Connections tab */}
               {tab === "connections" && (
                <div className="space-y-6">
                  {loading ? (
                    <div className="space-y-4">
                       {[1, 2, 3].map(i => (
                         <div key={i} className="h-24 w-full bg-white rounded-2xl border border-slate-200 animate-pulse" />
                       ))}
                    </div>
                  ) : connections.length === 0 ? (
                    <div className="card-modern py-32 bg-white border-dashed border-slate-200 text-center">
                      <div className="text-5xl mb-6 opacity-20">📡</div>
                      <p className="text-xl font-bold text-slate-900 mb-2">No Active Connections</p>
                      <p className="text-slate-500 font-medium mb-8">Send a request to safely reconnect with someone in the community.</p>
                      <button onClick={() => setTab("send")} className="btn-primary">Send Request</button>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-1">
                      {connections.map((c) => {
                        const partnerId = me ? partnerOf(c, me.id) : "";
                        const busy = actionLoading === c.id || actionLoading === partnerId;
                        return (
                          <div key={c.id} className="card-modern flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-white border-slate-200 shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-center gap-6 w-full md:w-auto">
                              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-primary-700 shadow-sm overflow-hidden text-2xl">
                                 🤝
                              </div>
                              <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Community Member</p>
                                <p className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                                   <span className="font-mono text-xs opacity-50">{partnerId.slice(0, 16)}…</span>
                                </p>
                                <p className="text-[11px] font-bold text-slate-400 uppercase">Connected Since: {formatDate(c.connected_at)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 w-full md:w-auto">
                              <Link
                                href={`/reconnection/messages/${c.id}`}
                                className="btn-primary flex-1 md:flex-none justify-center px-6 py-2"
                              >
                                Private Chat
                              </Link>
                              <button
                                onClick={() => handleRemove(c.id)}
                                disabled={busy}
                                className="btn-ghost text-red-600 hover:bg-red-50 hover:text-red-700 px-4 py-2 border border-red-100"
                              >
                                {busy ? "..." : "Remove Connection"}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Incoming requests tab */}
              {tab === "incoming" && (
                <div className="space-y-6">
                  {incoming.length === 0 ? (
                    <div className="card-modern py-32 bg-white border-dashed border-slate-200 text-center text-slate-400 font-bold uppercase tracking-widest text-[11px]">
                      No pending connection requests.
                    </div>
                  ) : (
                    <div className="grid gap-6">
                      {incoming.map((req) => {
                        const busy = actionLoading === req.id;
                        return (
                          <div key={req.id} className="card-modern overflow-hidden bg-white border-primary-200/50 shadow-xl shadow-primary-500/5">
                            <div className="bg-primary-50 px-6 py-2 border-b border-primary-100 flex items-center justify-between">
                               <span className="text-[10px] font-black text-primary-700 uppercase tracking-widest">Connection Request</span>
                               <span className="text-[10px] font-bold text-primary-500">{formatDate(req.created_at)}</span>
                            </div>
                            <div className="p-8">
                               <div className="mb-6 flex flex-col md:flex-row md:items-center gap-4">
                                  <div className="h-12 w-12 rounded-xl bg-primary-100 flex items-center justify-center text-xl">👤</div>
                                  <div>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-2">From Identity</p>
                                    <p className="font-mono text-sm font-bold text-slate-900 break-all">{req.sender_id}</p>
                                  </div>
                               </div>
                               
                               {req.message && (
                                  <div className="mb-8 p-5 bg-slate-50 rounded-2xl border border-slate-100 italic text-[14px] text-slate-600 font-medium leading-relaxed shadow-inner">
                                    &ldquo;{req.message}&rdquo;
                                  </div>
                               )}
                               
                               <div className="flex flex-wrap gap-4">
                                  <button
                                    onClick={() => handleRespond(req.id, true)}
                                    disabled={busy}
                                    className="btn-primary flex-1 justify-center py-3"
                                  >
                                    {busy ? "Applying..." : "Approve Connection"}
                                  </button>
                                  <button
                                    onClick={() => handleRespond(req.id, false)}
                                    disabled={busy}
                                    className="btn-secondary flex-1 justify-center py-3 border-slate-300"
                                  >
                                    {busy ? "..." : "Decline"}
                                  </button>
                                  <button
                                    onClick={() => handleBlock(req.sender_id)}
                                    disabled={busy}
                                    className="btn-ghost text-red-600 hover:bg-red-50 py-3 px-6"
                                  >
                                    Restrict
                                  </button>
                               </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Outgoing requests tab */}
              {tab === "outgoing" && (
                <div className="space-y-6">
                  {outgoing.length === 0 ? (
                    <div className="card-modern py-32 bg-white border-dashed border-slate-200 text-center text-slate-400 font-bold uppercase tracking-widest text-[11px]">
                      No pending request sent.
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {outgoing.map((req) => {
                        const busy = actionLoading === req.id;
                        const statusColors: Record<string, string> = {
                          pending: "bg-amber-100 text-amber-700",
                          approved: "bg-emerald-100 text-emerald-700",
                          rejected: "bg-red-100 text-red-700",
                        };
                        return (
                          <div key={req.id} className="card-modern flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-white border-slate-200">
                            <div>
                               <div className="flex items-center gap-3 mb-2">
                                  <span className={`badge-modern border-none py-0.5 px-2 text-[10px] font-black uppercase tracking-widest ${statusColors[req.status] || "bg-slate-100 text-slate-400"}`}>
                                     {req.status}
                                  </span>
                                  <span className="text-[10px] font-bold text-slate-300">{formatDate(req.created_at)}</span>
                               </div>
                               <p className="text-[13px] font-bold text-slate-900 mb-1">Sent to: <span className="font-mono text-xs opacity-50">{req.receiver_id.slice(0, 16)}…</span></p>
                               {req.message && (
                                 <p className="text-xs font-medium text-slate-500 italic truncate max-w-sm ml-1">&ldquo;{req.message}&rdquo;</p>
                               )}
                            </div>
                            {req.status === "pending" && (
                              <button
                                onClick={() => handleCancel(req.id)}
                                disabled={busy}
                                className="btn-ghost text-slate-400 hover:text-slate-900 border border-slate-200 px-5 py-2 text-xs"
                              >
                                {busy ? "..." : "Cancel Request"}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Send request tab */}
              {tab === "send" && (
                <div className="max-w-2xl">
                  <div className="card-modern bg-white p-10 border-slate-200 shadow-xl shadow-slate-200/50">
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Send Reconnection Request</h2>
                    <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                      Enter the email address of the person you want to connect with. They will receive your request securely.
                    </p>

                    {sendSuccess && (
                      <div className="mb-8 rounded-2xl border border-emerald-100 bg-emerald-50 px-6 py-4 text-sm text-emerald-800 font-bold flex items-center gap-4">
                        <span className="text-lg">🛰️</span>
                        {sendSuccess}
                      </div>
                    )}
                    {sendError && (
                      <div className="mb-8 rounded-2xl border border-red-100 bg-red-50 px-6 py-4 text-sm text-red-800 font-bold">
                        {sendError}
                      </div>
                    )}

                    <form onSubmit={handleSendRequest} className="space-y-8">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                          Recipient Email Address <span className="text-primary-600">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={receiverId}
                          onChange={(e) => setReceiverId(e.target.value)}
                          placeholder="friend@example.com"
                          className="input-modern font-mono"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                          Personal Message <span className="text-slate-300 font-normal italic">(Recommended)</span>
                        </label>
                        <textarea
                          rows={4}
                          value={requestMsg}
                          onChange={(e) => setRequestMsg(e.target.value)}
                          placeholder="e.g. Hi, this is [Your Name] from [Place/Time]..."
                          maxLength={500}
                          className="input-modern resize-none"
                        />
                        <div className="flex justify-end pr-2">
                           <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">{requestMsg.length}/500</span>
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={sendLoading}
                        className="btn-primary w-full justify-center py-4 text-[15px]"
                      >
                        {sendLoading ? "Sending request..." : "Send Request"}
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      </section>

      {/* Community Bridge */}
      <section className="px-6 py-24 bg-white border-t border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary-50/50 skew-x-[-20deg] origin-top translate-x-1/2 pointer-events-none" />
        <div className="mx-auto max-w-7xl relative z-10">
          <div className="mb-16">
            <span className="badge-primary mb-4 py-1 px-3">
               Beyond Reconnection
            </span>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-4">Discover the Network</h2>
            <p className="text-lg text-slate-500 max-w-2xl leading-relaxed">
               Once synchronized, explore the wider community ecosystem designed for knowledge exchange and mutual aid.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { href: "/forum", icon: "💬", title: "Global Forum", desc: "Open discussions, storytelling, and collective intelligence for the diaspora.", color: "bg-blue-50" },
              { href: "/events", icon: "📅", title: "Event Catalog", desc: "Digital webinars and physical meetups verified by community leads.", color: "bg-purple-50" },
              { href: "/news", icon: "📰", title: "Intelligence Feed", desc: "Verified updates and reports relevant to our global network.", color: "bg-red-50" },
              { href: "/resources", icon: "📚", title: "Resource Archive", desc: "Handbooks on legal, health, and economic mobility sourced by experts.", color: "bg-amber-50" },
              { href: "/diaspora", icon: "🌏", title: "Global Directory", desc: "Browse opt-in profiles of community members worldwide.", color: "bg-emerald-50" },
              { href: "/get-involved", icon: "🤝", title: "Mutual Aid", desc: "Contribute skills or capital to help scale community impact.", color: "bg-indigo-50" },
            ].map((p) => (
              <Link key={p.href} href={p.href} className="card-modern group p-8 bg-white border-slate-200 hover:border-primary-200 hover:-translate-y-1 transition-all">
                <div className={`mb-6 h-14 w-14 rounded-2xl ${p.color} flex items-center justify-center text-3xl transition-transform group-hover:scale-110`}>
                  {p.icon}
                </div>
                <h3 className="mb-2 text-lg font-black text-slate-900 group-hover:text-primary-600 transition-colors uppercase tracking-tight">{p.title}</h3>
                <p className="text-sm font-medium text-slate-500 leading-relaxed">
                  {p.desc}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
