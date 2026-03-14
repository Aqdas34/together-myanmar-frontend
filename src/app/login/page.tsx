"use client";

import Link from "next/link";
import { useState, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginUser, resendVerification, ApiError } from "@/lib/api";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendDone, setResendDone] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setEmailNotVerified(false);
    setResendDone(false);
    setLoading(true);

    try {
      const data = await loginUser(email, password);
      localStorage.setItem("access_token", data.access_token);
      router.push(next);
    } catch (err) {
      if (err instanceof ApiError && err.message === "EMAIL_NOT_VERIFIED") {
        setEmailNotVerified(true);
      } else if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to connect. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!email) { setError("Enter your email address above first."); return; }
    setResendLoading(true);
    try {
      await resendVerification(email);
      setResendDone(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        setError("Too many attempts. Please wait a while before requesting a new code.");
      } else if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to connect. Is the server running?");
      }
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-pattern opacity-[0.03] pointer-events-none" />
      
      <div className="w-full max-w-md relative z-10">
        <div className="mb-12 flex flex-col items-center">
            <Link href="/" className="mb-8 group">
               <div className="flex h-16 w-16 items-center justify-center transition-transform group-hover:scale-105">
                  <svg className="h-16 w-16" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#login-globe-clip)">
                      <path d="M50 50L20 20H50V50Z" fill="#3182CE"/>
                      <path d="M50 50L80 20H50V50Z" fill="#ECC94B"/>
                      <path d="M50 50L20 80H50V50Z" fill="#48BB78"/>
                      <path d="M50 50L80 80H50V50Z" fill="#E53E3E"/>
                    </g>
                    <clipPath id="login-globe-clip"><circle cx="50" cy="50" r="32"/></clipPath>
                    <circle cx="50" cy="35" r="8" fill="#ECC94B"/>
                    <circle cx="65" cy="50" r="8" fill="#E53E3E"/>
                    <circle cx="50" cy="65" r="8" fill="#48BB78"/>
                    <circle cx="35" cy="50" r="8" fill="#3182CE"/>
                  </svg>
               </div>
            </Link>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight text-center">Welcome Back</h1>
            <p className="mt-2 text-slate-500 font-medium text-center">
              Authenticate to access your secure dashboard
            </p>
        </div>

        <div className="card-modern bg-white p-10 border-slate-200 shadow-xl shadow-slate-200/50">
          {error && (
            <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 font-bold">
              {error}
            </div>
          )}

          {emailNotVerified && (
            <div className="mb-6 rounded-xl border border-amber-100 bg-amber-50 px-4 py-4 text-sm text-amber-800">
              <p className="font-black uppercase tracking-tight mb-2 flex items-center gap-2">
                 <span className="h-2 w-2 rounded-full bg-amber-500" />
                 Verification Pending
              </p>
              <p className="mb-4 font-medium opacity-80 leading-relaxed text-[13px]">We sent a 6-digit code to your email. Enter it on the <a href="/verify-email" className="font-bold underline">verification page</a>.</p>
              {resendDone ? (
                <p className="font-black text-emerald-700 text-xs">✓ NEW CODE DISPATCHED</p>
              ) : (
                <button
                  type="button"
                  disabled={resendLoading}
                  onClick={handleResend}
                  className="w-full btn-secondary py-1.5 text-xs justify-center bg-white border-amber-200 text-amber-800 hover:bg-amber-100"
                >
                  {resendLoading ? "Processing…" : "Resend Security Code"}
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                Security Identity
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="input-modern"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label htmlFor="password" className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  Master Key
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] font-bold text-primary-600 hover:text-primary-700 uppercase"
                >
                  Lost Access?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-modern pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                >
                  {showPassword ? (
                     <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                     <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 text-[15px]"
            >
              {loading ? "Authenticating..." : "Access Dashboard"}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500 font-medium">
              New to the platform?{" "}
              <Link href="/register" className="font-bold text-primary-600 hover:underline">
                Create Secure Account
              </Link>
            </p>
          </div>
        </div>
      </div>
      
      <footer className="mt-12 text-slate-400 text-[11px] font-bold uppercase tracking-[0.2em] relative z-10 text-center">
         &copy; 2026 Together Myanmar · Global Community Network
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
