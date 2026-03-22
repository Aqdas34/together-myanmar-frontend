"use client";

import { useState, useEffect } from "react";
import { adminGetSettings, adminUpdateSetting, SiteSetting } from "@/lib/api";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [loading, setLoading]  = useState(true);
  const [error,   setError]    = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    adminGetSettings(token)
      .then(setSettings)
      .catch((err) => setError(err.message || "Failed to fetch settings"))
      .finally(() => setLoading(false));
  }, []);

  async function handleToggle(key: string, currentValue: boolean | null) {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    setUpdating(key);
    try {
      const updated = await adminUpdateSetting(token, key, { value_bool: !currentValue });
      setSettings(prev => prev.map(s => s.key === key ? updated : s));
    } catch (err: any) {
      alert(err.message || "Failed to update setting");
    } finally {
      setUpdating(null);
    }
  }

  if (loading) return <div className="p-8 text-slate-500">Loading settings...</div>;
  if (error)   return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Site Settings</h1>
        <p className="text-slate-500">Manage site-wide features and configuration.</p>
      </div>

      <div className="grid gap-4">
        {settings.map((s) => (
          <div key={s.key} className="flex items-center justify-between p-6 bg-white rounded-xl border border-slate-200 shadow-sm transition-all hover:border-slate-300">
            <div className="max-w-xl">
              <h3 className="font-bold text-slate-900 mb-1">{s.key.replace(/_/g, " ").toUpperCase()}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{s.description}</p>
            </div>
            
            <div className="flex items-center gap-4">
               {s.value_bool !== null && (
                 <button
                   onClick={() => handleToggle(s.key, s.value_bool)}
                   disabled={updating === s.key}
                   className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                     s.value_bool ? "bg-primary-600" : "bg-slate-200"
                   } ${updating === s.key ? "opacity-50 cursor-not-allowed" : ""}`}
                 >
                   <span
                     className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                       s.value_bool ? "translate-x-5" : "translate-x-0"
                     }`}
                   />
                 </button>
               )}
            </div>
          </div>
        ))}
      </div>
      
      {settings.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400">
           No settings found.
        </div>
      )}
    </div>
  );
}
