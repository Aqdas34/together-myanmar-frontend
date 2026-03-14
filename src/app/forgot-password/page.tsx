"use client";

import Link from "next/link";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { forgotPassword, ApiError } from "@/lib/api";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        setError("Too many attempts. Please wait before trying again.");
      } else if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to connect. Is the server running?");
      }
    } finally {
      setLoading(false);
    }
  }

  function handleContinue() {
    const params = new URLSearchParams({ email });
    router.push(`/reset-password?${params.toString()}`);
  }

  return (
    <>
      {/* Hero strip */}
      <section
        className="px-6 py-12 text-center text-white"
        style={{ background: "linear-gradient(135deg, #1d4ed8 0%, #4338ca 100%)" }}
      >
        <div className="mx-auto max-w-md">
          <h1 className="text-3xl font-extrabold sm:text-4xl">Forgot Password</h1>
          <p className="mt-2 text-sm" style={{ color: "#bfdbfe" }}>
            We&apos;ll send a reset code to your email
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

            {!sent ? (
              <>
                <h2 className="mb-1 text-center text-xl font-bold text-gray-900">Reset your password</h2>
                <p className="mb-6 text-center text-sm text-gray-500">
                  Enter the email address on your account and we&apos;ll send you a 6‑digit reset code.
                </p>

                {error && (
                  <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
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
                      className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Sending…" : "Send Reset Code"}
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-4 text-center">
                  <p className="text-2xl mb-2">📧</p>
                  <p className="text-sm font-semibold text-green-800">Code sent!</p>
                  <p className="mt-1 text-sm text-green-700">
                    If <span className="font-medium">{email}</span> is registered, a 6‑digit reset code is on its way.
                    Check your inbox (and spam folder).
                  </p>
                </div>

                <button
                  onClick={handleContinue}
                  className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
                >
                  Enter Reset Code →
                </button>
              </>
            )}

            <div className="mt-6 text-center text-sm text-gray-500">
              Remember your password?{" "}
              <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-800">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
