"use client";

import Link from "next/link";
import { useRef, useState, FormEvent, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword, ApiError } from "@/lib/api";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);

  // Pre-fill from URL params (set by /forgot-password)
  useEffect(() => {
    const e = searchParams.get("email");
    const c = searchParams.get("code");
    if (e) setEmail(e);
    if (c && c.length === 6) {
      setOtp(c.split(""));
    }
  }, [searchParams]);

  // Redirect after success
  useEffect(() => {
    if (!success) return;
    if (countdown <= 0) { router.push("/login"); return; }
    const t = setTimeout(() => setCountdown((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [success, countdown, router]);

  function handleOtpChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < 5) otpRefs.current[index + 1]?.focus();
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!digits) return;
    e.preventDefault();
    const next = [...otp];
    digits.split("").forEach((d, i) => { next[i] = d; });
    setOtp(next);
    const focusIdx = Math.min(digits.length, 5);
    otpRefs.current[focusIdx]?.focus();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const code = otp.join("");
    if (!email) { setError("Please enter your email address."); return; }
    if (code.length < 6) { setError("Please enter all 6 digits of the reset code."); return; }
    if (newPassword.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (newPassword !== confirmPassword) { setError("Passwords do not match."); return; }

    setLoading(true);
    try {
      await resetPassword(email, code, newPassword);
      setSuccess(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        setError("Too many attempts. Please wait before trying again.");
      } else if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to connect. Please try again.");
      }
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Hero strip */}
      <section className="relative overflow-hidden bg-slate-50 pt-12 pb-10 border-b border-slate-100 text-center">
        <div className="absolute inset-0 bg-pattern opacity-[0.03] pointer-events-none" />
        <div className="mx-auto max-w-md px-6 relative z-10">
          <h1 className="hero-title text-3xl md:text-4xl mb-2">Reset Password</h1>
          <p className="text-slate-500 text-sm">
            Enter your reset code and choose a new password
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="bg-gray-50 px-6 py-16">
        <div className="mx-auto max-w-md">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            {/* Logo */}
            <div className="mb-6 flex items-center justify-center">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ background: "linear-gradient(135deg, #dc2626 0%, #facc15 50%, #16a34a 100%)" }}
              >
                <span className="text-sm font-black tracking-tight text-white" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.2)" }}>
                  TM
                </span>
              </div>
            </div>

            {success ? (
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="mb-2 text-xl font-bold text-gray-900">Password updated!</h2>
                <p className="mb-4 text-sm text-gray-600">
                  Your password has been changed. Redirecting to login in {countdown}s…
                </p>
                <Link
                  href="/login"
                  className="inline-block rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
                >
                  Sign In Now
                </Link>
              </div>
            ) : (
              <>
                <h2 className="mb-1 text-center text-xl font-bold text-gray-900">Set a new password</h2>
                <p className="mb-6 text-center text-sm text-gray-500">
                  Enter the 6‑digit code from your email and your new password.
                </p>

                {error && (
                  <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-900">
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                    />
                  </div>

                  {/* OTP boxes */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-900">
                      Reset Code
                    </label>
                    <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                      {otp.map((digit, i) => (
                        <input
                          key={i}
                          ref={(el) => { otpRefs.current[i] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(i, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(i, e)}
                          className="h-12 w-12 rounded-xl border border-gray-300 text-center text-xl font-bold text-gray-900 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                        />
                      ))}
                    </div>
                    <p className="mt-2 text-center text-xs text-gray-400">
                      Check your inbox (and spam folder) for the 6‑digit code.
                    </p>
                  </div>

                  {/* New password */}
                  <div>
                    <label htmlFor="new-password" className="mb-1 block text-sm font-medium text-gray-900">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        id="new-password"
                        type={showPassword ? "text" : "password"}
                        required
                        autoComplete="new-password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 pr-10 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                          </svg>
                        ) : (
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm password */}
                  <div>
                    <label htmlFor="confirm-password" className="mb-1 block text-sm font-medium text-gray-900">
                      Confirm New Password
                    </label>
                    <input
                      id="confirm-password"
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat your new password"
                      className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                    />
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="mt-1 text-xs text-red-600">Passwords do not match.</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Updating…" : "Update Password"}
                  </button>
                </form>

                <div className="mt-4 text-center text-sm text-gray-500">
                  Didn&apos;t get a code?{" "}
                  <Link href="/forgot-password" className="font-semibold text-primary-600 hover:text-primary-800">
                    Resend
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
