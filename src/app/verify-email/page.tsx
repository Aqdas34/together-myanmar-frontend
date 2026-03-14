"use client";

import Link from "next/link";
import { useRef, Suspense, useEffect, useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyEmail, resendVerification, ApiError } from "@/lib/api";

function VerifyEmailInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendDone, setResendDone] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Pre-fill email from URL if present
  useEffect(() => {
    const e = searchParams.get("email");
    if (e) setEmail(e);
  }, [searchParams]);

  // Countdown + redirect after success
  useEffect(() => {
    if (!success) return;
    if (countdown <= 0) { router.push("/user/profile?welcome=1"); return; }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [success, countdown, router]);

  async function handleVerify(e: FormEvent) {
    e.preventDefault();
    setError("");
    const code = otp.join("");
    if (!email) { setError("Please enter your email address."); return; }
    if (code.length < 6) { setError("Please enter all 6 digits."); return; }
    setLoading(true);
    try {
      const data = await verifyEmail(email, code);
      localStorage.setItem("access_token", data.access_token);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to connect. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!email) { setError("Please enter your email address first."); return; }
    setResendLoading(true);
    setResendDone(false);
    setError("");
    try {
      await resendVerification(email);
      setResendDone(true);
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
      startResendCountdown();
    } catch {
      setResendDone(true);
      startResendCountdown();
    } finally {
      setResendLoading(false);
    }
  }

  function startResendCountdown() {
    setResendCooldown(60);
    const id = setInterval(() => {
      setResendCooldown((c) => {
        if (c <= 1) { clearInterval(id); return 0; }
        return c - 1;
      });
    }, 1000);
  }

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

  if (success) {
    return (
      <>
        <section
          className="px-6 py-12 text-center text-white"
          style={{ background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)" }}
        >
          <div className="mx-auto max-w-md">
            <h1 className="text-3xl font-extrabold sm:text-4xl">Email Verified!</h1>
            <p className="mt-2 text-sm text-green-100">Your account is now active</p>
          </div>
        </section>
        <section className="bg-gray-50 px-6 py-20">
          <div className="mx-auto max-w-md text-center">
            <div className="rounded-2xl border border-gray-200 bg-white p-10 shadow-sm">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="mb-2 text-xl font-bold text-gray-900">{"You're all set!"}</h2>
              <p className="mb-6 text-gray-500">
                Redirecting to your profile in{" "}
                <span className="font-semibold text-gray-800">{countdown}</span>{" "}
                {countdown !== 1 ? "seconds" : "second"}...
              </p>
              <Link
                href="/user/profile?welcome=1"
                className="inline-block rounded-xl bg-blue-600 px-8 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Complete Your Profile
              </Link>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <section
        className="px-6 py-12 text-center text-white"
        style={{ background: "linear-gradient(135deg, #1d4ed8 0%, #4338ca 100%)" }}
      >
        <div className="mx-auto max-w-md">
          <h1 className="text-3xl font-extrabold sm:text-4xl">Verify your email</h1>
          <p className="mt-2 text-sm" style={{ color: "#bfdbfe" }}>
            Enter the 6-digit code from your inbox
          </p>
        </div>
      </section>

      <section className="bg-gray-50 px-6 py-16">
        <div className="mx-auto max-w-md">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            )}
            {resendDone && !error && (
              <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                New code sent! Check your inbox.
              </div>
            )}

            <form onSubmit={handleVerify} className="space-y-5">
              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-900">Email Address</label>
                <input
                  id="email" type="email" required autoComplete="email"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>
                <label className="mb-3 block text-sm font-medium text-gray-900">Verification Code</label>
                <div className="flex justify-center gap-3">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => { otpRefs.current[idx] = el; }}
                      type="text" inputMode="numeric" maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      onPaste={handleOtpPaste}
                      className="h-14 w-12 rounded-xl border-2 border-gray-300 text-center text-2xl font-bold text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit" disabled={loading || otp.join("").length < 6}
                className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Verifying..." : "Verify & Continue"}
              </button>
            </form>

            <div className="mt-5 text-center text-sm text-gray-500">
              {"Didn't receive a code? "}
              {resendCooldown > 0 ? (
                <span className="text-gray-400">Resend in {resendCooldown}s</span>
              ) : (
                <button
                  onClick={handleResend} disabled={resendLoading}
                  className="font-semibold text-blue-600 hover:text-blue-800 disabled:opacity-60"
                >
                  {resendLoading ? "Sending..." : "Resend code"}
                </button>
              )}
            </div>
            <div className="mt-4 text-center">
              <Link href="/register" className="text-xs text-gray-400 hover:text-gray-600 underline">
                Back to Register
              </Link>
              {" · "}
              <Link href="/login" className="text-xs text-gray-400 hover:text-gray-600 underline">
                Sign In
              </Link>
            </div>
            <p className="mt-4 text-center text-xs text-gray-400">Codes expire after 15 minutes</p>
          </div>
        </div>
      </section>
    </>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailInner />
    </Suspense>
  );
}