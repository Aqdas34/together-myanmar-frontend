"use client";

import Link from "next/link";
import { useRef, useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { registerUser, verifyEmail, resendVerification, ApiError } from "@/lib/api";

const languages = [
  { value: "en", label: "English" },
  { value: "my", label: "Burmese (Myanmar)" },
];

type Step = "form" | "otp";

export default function RegisterPage() {
  const router = useRouter();

  // Step 1 state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [language, setLanguage] = useState("en");
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Step 2 state (OTP)
  const [step, setStep] = useState<Step>("form");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendDone, setResendDone] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Shared
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Step 1: register -> OTP sent
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    if (!agreed) { setError("You must agree to the Terms of Service and Privacy Policy."); return; }
    setLoading(true);
    try {
      await registerUser({ email, password, preferred_language: language });
      setStep("otp");
      startCountdown();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Step 2: verify OTP -> auto-login -> redirect
  async function handleVerify(e: FormEvent) {
    e.preventDefault();
    setError("");
    const code = otp.join("");
    if (code.length < 6) { setError("Please enter all 6 digits."); return; }
    setLoading(true);
    try {
      const data = await verifyEmail(email, code);
      localStorage.setItem("access_token", data.access_token);
      router.push("/user/profile?welcome=1");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to connect. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }

  // Resend OTP
  async function handleResend() {
    setResendLoading(true);
    setResendDone(false);
    setError("");
    try {
      await resendVerification(email);
      setResendDone(true);
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
      startCountdown();
    } catch {
      setError("Could not resend. Please try again.");
    } finally {
      setResendLoading(false);
    }
  }

  function startCountdown() {
    setCountdown(60);
  }

  useEffect(() => {
    if (countdown <= 0) return;
    const id = setInterval(() => {
      setCountdown((c) => c - 1);
    }, 1000);
    return () => clearInterval(id);
  }, [countdown]);

  function handleOtpChange(idx: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[idx] = digit;
    setOtp(next);
    if (digit && idx < 5) otpRefs.current[idx + 1]?.focus();
  }

  function handleOtpKeyDown(idx: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!digits) return;
    e.preventDefault();
    const next = Array(6).fill("");
    digits.split("").forEach((d, i) => { next[i] = d; });
    setOtp(next);
    otpRefs.current[Math.min(digits.length, 5)]?.focus();
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-pattern opacity-[0.03] pointer-events-none" />
      
      <div className="w-full max-w-lg relative z-10">
        <div className="mb-10 flex flex-col items-center">
            <Link href="/" className="mb-6 group">
               <div className="flex h-16 w-16 items-center justify-center transition-transform group-hover:scale-105">
                  <svg className="h-16 w-16" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#register-globe-clip)">
                      <path d="M50 50L20 20H50V50Z" fill="#3182CE"/>
                      <path d="M50 50L80 20H50V50Z" fill="#ECC94B"/>
                      <path d="M50 50L20 80H50V50Z" fill="#48BB78"/>
                      <path d="M50 50L80 80H50V50Z" fill="#E53E3E"/>
                    </g>
                    <clipPath id="register-globe-clip"><circle cx="50" cy="50" r="32"/></clipPath>
                    <circle cx="50" cy="35" r="8" fill="#ECC94B"/>
                    <circle cx="65" cy="50" r="8" fill="#E53E3E"/>
                    <circle cx="50" cy="65" r="8" fill="#48BB78"/>
                    <circle cx="35" cy="50" r="8" fill="#3182CE"/>
                  </svg>
               </div>
            </Link>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight text-center">
               {step === "form" ? "Join the Network" : "Verify Security Token"}
            </h1>
            <p className="mt-2 text-slate-500 font-medium text-center max-w-sm">
               {step === "form" 
                 ? "Create a secure account to access community resources and reconnect with others."
                 : `We sent a 6-digit authentication code to ${email}`}
            </p>
        </div>

        <div className="card-modern bg-white p-8 md:p-10 border-slate-200 shadow-xl shadow-slate-200/50">
          {error && (
            <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 font-bold">
              {error}
            </div>
          )}

          {step === "form" ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-1">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                    Electronic Mail
                  </label>
                  <input
                    id="email" type="email" required autoComplete="email"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="input-modern"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                    Create Master Key
                  </label>
                  <div className="relative">
                    <input
                      id="password" type={showPassword ? "text" : "password"} required autoComplete="new-password"
                      value={password} onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      className="input-modern pr-12"
                    />
                    <button
                      type="button" onClick={() => setShowPassword(!showPassword)}
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

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                    Confirm Key
                  </label>
                  <input
                    id="confirmPassword" type={showPassword ? "text" : "password"} required autoComplete="new-password"
                    value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Verify master key"
                    className="input-modern"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="language" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                    Preferred Dialect
                  </label>
                  <select
                    id="language" value={language} onChange={(e) => setLanguage(e.target.value)}
                    className="input-modern bg-slate-50 border-slate-100"
                  >
                    {languages.map((l) => (
                      <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl">
                <input
                  id="terms" type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="terms" className="text-[13px] text-slate-500 font-medium leading-relaxed">
                  I confirm that I have reviewed the{" "}
                  <Link href="/terms" className="font-bold text-slate-900 hover:text-primary-600 transition-colors">Safety Protocols</Link>
                  {" "}and{" "}
                  <Link href="/privacy" className="font-bold text-slate-900 hover:text-primary-600 transition-colors">Privacy Shield</Link>
                  {" "}standards.
                </label>
              </div>

              <button
                type="submit" disabled={loading}
                className="btn-primary w-full justify-center py-3 text-[15px]"
              >
                {loading ? "Initializing..." : "Create Primary Account"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-8">
               {resendDone && !error && (
                <div className="mb-4 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2 text-xs text-emerald-700 font-bold text-center">
                  CODE REDISPATCHED TO INBOX
                </div>
              )}
              <div className="flex justify-center gap-2 sm:gap-4">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { otpRefs.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    onPaste={handleOtpPaste}
                    className="h-16 w-12 sm:w-14 rounded-2xl border-2 border-slate-200 bg-slate-50 text-center text-2xl font-black text-slate-900 transition-all focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/5 shadow-sm"
                  />
                ))}
              </div>
              
              <div className="space-y-4">
                 <button
                   type="submit" disabled={loading || otp.join("").length < 6}
                   className="btn-primary w-full justify-center py-3 text-[15px]"
                 >
                   {loading ? "Verifying..." : "Confirm Identity"}
                 </button>
                 
                 <div className="text-center text-[12px] font-bold">
                   <p className="text-slate-400 mb-1 leading-none uppercase italic tracking-tighter">Code Issue?</p>
                   {countdown > 0 ? (
                     <span className="text-slate-500">Wait {countdown}s to retry</span>
                   ) : (
                     <button
                       onClick={handleResend} disabled={resendLoading}
                       className="text-primary-600 hover:text-primary-700 uppercase tracking-tight"
                     >
                       {resendLoading ? "Requesting..." : "Resend Security Code"}
                     </button>
                   )}
                 </div>
              </div>
              
              <div className="pt-6 border-t border-slate-50 text-center">
                 <button
                   onClick={() => { setStep("form"); setError(""); }}
                   className="text-[11px] font-bold text-slate-300 hover:text-slate-500 uppercase tracking-widest"
                 >
                   Abort & Change Identity
                 </button>
              </div>
            </form>
          )}

          {step === "form" && (
            <div className="mt-10 pt-8 border-t border-slate-100 text-center">
              <p className="text-sm text-slate-500 font-medium">
                Already have an account?{" "}
                <Link href="/login" className="font-bold text-primary-600 hover:underline">
                  Authenticate Instead
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
      
      <footer className="mt-12 text-slate-400 text-[11px] font-bold uppercase tracking-[0.2em] relative z-10 text-center">
         &copy; 2026 Together Myanmar · Global Community Network
      </footer>
    </div>
  );
}