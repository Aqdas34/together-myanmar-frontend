"use client";

import { useState, useEffect } from "react";
import { adminListContactMessages, type ContactMessage } from "@/lib/api";

export default function AdminMessagesPage() {
  const [token, setToken] = useState<string | null>(null);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => { setToken(localStorage.getItem("access_token")); }, []);

  useEffect(() => {
    if (!token) return;
    adminListContactMessages(token)
      .then(setMessages)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const filtered = messages.filter(
    (m) =>
      !search ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      (m.subject ?? "").toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Contact Messages</h1>
        <p className="text-sm text-gray-500">{messages.length} total messages</p>
      </div>

      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name, email, or subject..."
        className="w-full max-w-sm rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
      />

      <div className="grid gap-6 lg:grid-cols-5">
        {/* List */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white lg:col-span-2">
          {loading ? (
            <div className="flex h-32 items-center justify-center text-gray-400">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-gray-400">No messages.</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {filtered.map((msg) => (
                <li
                  key={msg.id}
                  onClick={() => setSelected(msg)}
                  className={`cursor-pointer p-4 transition-colors hover:bg-gray-50 ${
                    selected?.id === msg.id ? "bg-indigo-50" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-sm text-gray-900">{msg.name}</div>
                      <div className="truncate text-xs text-gray-500">{msg.email}</div>
                    </div>
                    <div className="shrink-0 text-xs text-gray-400">
                      {new Date(msg.created_at).toLocaleDateString("en-GB", {
                        day: "numeric", month: "short",
                      })}
                    </div>
                  </div>
                  <div className="mt-1 truncate text-xs text-gray-600">{msg.subject}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Detail */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 lg:col-span-3">
          {selected ? (
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selected.subject}</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    From <strong>{selected.name}</strong> &lt;{selected.email}&gt;
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(selected.created_at).toLocaleString("en-GB")}
                  </p>
                </div>
                <a
                  href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject ?? "")}`}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
                >
                  Reply via Email
                </a>
              </div>
              <div className="mt-6 whitespace-pre-wrap rounded-xl bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
                {selected.message}
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-[200px] items-center justify-center text-gray-400">
              Select a message to view
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
