"use client";

import { useState, useEffect, useRef, FormEvent, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getMe, getMessages, sendMessage, ApiError, type PrivateMessage, type AuthUser } from "@/lib/api";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function MessagingPage() {
  const router = useRouter();
  const params = useParams();
  const connectionId = params.id as string;

  const [me, setMe] = useState<AuthUser | null>(null);
  const [messages, setMessages] = useState<PrivateMessage[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [showTips, setShowTips] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const loadMessages = useCallback(async (silent = false) => {
    if (!token) return;
    if (!silent) setLoading(true);
    try {
      const msgs = await getMessages(token, connectionId);
      setMessages(msgs);
    } catch (e) {
      if (!silent) setError(e instanceof ApiError ? e.message : "Failed to load messages");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [token, connectionId]);

  useEffect(() => {
    if (!token) { router.replace("/login"); return; }
    getMe(token).then(setMe).catch(() => router.replace("/login"));
    loadMessages();
    pollRef.current = setInterval(() => loadMessages(true), 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [token, router, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    if (!token || !body.trim()) return;
    setSending(true);
    setError("");
    try {
      const msg = await sendMessage(token, connectionId, body.trim());
      setMessages((prev) => [...prev, msg]);
      setBody("");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-600 border-t-transparent" />
      </div>
    );
  }

  // Group messages by date
  const messagesByDate: { date: string; msgs: PrivateMessage[] }[] = [];
  for (const msg of messages) {
    const d = formatDate(msg.created_at);
    const last = messagesByDate[messagesByDate.length - 1];
    if (last && last.date === d) {
      last.msgs.push(msg);
    } else {
      messagesByDate.push({ date: d, msgs: [msg] });
    }
  }

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="flex items-center gap-4 border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
        <Link href="/reconnection" className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-600 font-bold text-white text-sm">C</div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Private Conversation</p>
            <p className="text-xs text-gray-400 font-mono">conn: {connectionId.slice(0, 8)}…</p>
          </div>
        </div>
        <div className="ml-auto">
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">🔒 Encrypted</span>
        </div>
      </header>

      {/* Tips / Instructions panel */}
      {showTips && (
        <div className="border-b border-green-200 bg-green-50 px-4 py-3">
          <div className="mx-auto max-w-2xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 text-base">💡</span>
                <div>
                  <p className="text-xs font-bold text-green-800 mb-1.5">How to use private messaging</p>
                  <ul className="space-y-1 text-xs text-green-700">
                    <li><span className="font-semibold">✉️ Send a message</span> — Type in the box below and press <kbd className="rounded border border-green-300 bg-white px-1 py-0.5 font-mono text-xs">Enter</kbd> to send.</li>
                    <li><span className="font-semibold">↵ New line</span> — Press <kbd className="rounded border border-green-300 bg-white px-1 py-0.5 font-mono text-xs">Shift + Enter</kbd> to add a line break without sending.</li>
                    <li><span className="font-semibold">✓✓ Read receipts</span> — A single ✓ means sent; double ✓✓ means your message has been read.</li>
                    <li><span className="font-semibold">🔄 Auto-refresh</span> — New messages appear automatically every 5 seconds, no need to reload.</li>
                    <li><span className="font-semibold">🔒 Privacy</span> — This conversation is private and only visible to you and the person you're connected with.</li>
                    <li><span className="font-semibold">🚫 Safety</span> — If you feel unsafe, go back to <Link href="/reconnection" className="underline font-semibold">Reconnection</Link> to remove or block this connection at any time.</li>
                  </ul>
                </div>
              </div>
              <button
                onClick={() => setShowTips(false)}
                title="Dismiss tips"
                className="shrink-0 rounded-lg p-1 text-green-600 hover:bg-green-100 hover:text-green-800"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error bar */}
      {error && (
        <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 flex justify-between">
          {error}
          <button onClick={() => setError("")} className="font-bold">✕</button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center py-10">
            <div className="mx-auto max-w-sm text-center">
              <p className="text-5xl mb-4">💬</p>
              <p className="font-bold text-gray-800 text-base mb-1">No messages yet</p>
              <p className="text-sm text-gray-500 mb-6">You're all set — start the conversation by typing below.</p>
              <div className="rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm">
                <p className="mb-3 text-xs font-bold text-gray-700 uppercase tracking-wide">Quick tips</p>
                <ul className="space-y-2.5 text-xs text-gray-600">
                  <li className="flex gap-2"><span className="text-green-600 font-bold">→</span> Type your message and press <strong>Enter</strong> to send it instantly.</li>
                  <li className="flex gap-2"><span className="text-green-600 font-bold">→</span> Use <strong>Shift + Enter</strong> to write multi-line messages.</li>
                  <li className="flex gap-2"><span className="text-green-600 font-bold">→</span> Messages refresh every <strong>5 seconds</strong> automatically.</li>
                  <li className="flex gap-2"><span className="text-green-600 font-bold">→</span> Only you and this connection can read this conversation.</li>
                  <li className="flex gap-2"><span className="text-green-600 font-bold">→</span> To remove or block this person, go back to <Link href="/reconnection" className="text-green-700 underline font-semibold">Reconnection</Link>.</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl space-y-1">
            {messagesByDate.map(({ date, msgs }) => (
              <div key={date}>
                <div className="my-4 text-center">
                  <span className="rounded-full bg-gray-200 px-3 py-1 text-xs text-gray-500">{date}</span>
                </div>
                {msgs.map((msg) => {
                  const isMe = me && msg.sender_id === me.id;
                  return (
                    <div key={msg.id} className={`flex mb-2 ${isMe ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-xs rounded-2xl px-4 py-2.5 text-sm shadow-sm lg:max-w-md ${
                          isMe
                            ? "rounded-br-sm bg-green-600 text-white"
                            : "rounded-bl-sm bg-white text-gray-900 border border-gray-200"
                        }`}
                      >
                        <p className="break-words">{msg.body}</p>
                        <p className={`mt-1 text-right text-xs ${isMe ? "text-green-200" : "text-gray-400"}`}>
                          {formatTime(msg.created_at)}
                          {isMe && (
                            <span className="ml-1">{msg.is_read ? "✓✓" : "✓"}</span>
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 bg-white px-4 py-3">
        <form onSubmit={handleSend} className="mx-auto flex max-w-2xl items-end gap-2">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(e as unknown as FormEvent); }
            }}
            placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
            rows={1}
            maxLength={2000}
            className="flex-1 resize-none rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
            style={{ minHeight: "44px", maxHeight: "120px" }}
          />
          <button
            type="submit"
            disabled={sending || !body.trim()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-600 text-white hover:bg-green-700 disabled:opacity-40"
          >
            {sending ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <svg className="h-5 w-5 rotate-90" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </form>
        <p className="mt-1 text-center text-xs text-gray-400">Messages are private between connected users only.</p>
      </div>
    </div>
  );
}
