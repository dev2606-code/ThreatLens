"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Mail,
  ShieldCheck,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
          }),
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.detail || "Unable to process your request.",
        );
      }

      setSuccess(
        "If an account exists with this email, password reset instructions have been sent.",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030509] text-slate-100">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />

      <div className="relative flex min-h-screen items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-400/30 bg-violet-500/10 shadow-[0_0_35px_rgba(139,92,246,0.2)]">
              <ShieldCheck className="h-8 w-8 text-violet-400" />
            </div>

            <h1 className="text-2xl font-bold">
              Threat<span className="text-violet-400">Lens</span>
            </h1>

            <p className="mt-1 text-[10px] tracking-[0.25em] text-slate-500">
              SECURITY OPERATIONS PLATFORM
            </p>
          </div>

          <section className="rounded-3xl border border-white/[0.08] bg-[#080c14]/95 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-8">
            <Link
              href="/login"
              className="mb-7 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Sign In
            </Link>

            <div className="mb-7">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                <Mail className="h-5 w-5" />
              </div>

              <h2 className="text-2xl font-bold">
                Forgot your password?
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Enter your registered email address and we&apos;ll
                send you instructions to reset your password.
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm leading-5 text-emerald-300">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Email address
              </label>

              <div className="group relative">
                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600 transition group-focus-within:text-violet-400" />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="h-12 w-full rounded-xl border border-white/[0.08] bg-white/[0.035] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500/50 focus:bg-violet-500/[0.03] focus:ring-4 focus:ring-violet-500/10"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-500 hover:shadow-violet-500/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Reset Link
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-7 border-t border-white/[0.06] pt-6 text-center">
              <p className="text-sm text-slate-500">
                Remember your password?{" "}
                <Link
                  href="/login"
                  className="font-medium text-violet-400 hover:text-violet-300"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}