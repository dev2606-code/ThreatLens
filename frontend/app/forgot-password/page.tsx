"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Mail,
  ShieldCheck,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:8000";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.detail ?? "Unable to send reset link.",
        );
      }

      setMessage(
        data?.message ??
          "If the email exists, a password reset link has been sent.",
      );
      setEmail("");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Backend server is not available.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#05070b] px-5 py-12 text-white">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[700px] -translate-x-1/2 rounded-full bg-violet-700/10 blur-[140px]" />

      <section className="relative w-full max-w-md rounded-3xl border border-white/[0.08] bg-[#0b0e14]/95 p-7 shadow-2xl shadow-black/50 sm:p-9">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-500/30 bg-violet-500/10 text-violet-400">
            <ShieldCheck className="h-7 w-7" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight">
            Forgot password?
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Enter your registered email and we will send you a
            secure password-reset link.
          </p>
        </div>

        {message ? (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.08] p-5">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />

              <div>
                <p className="font-medium text-emerald-300">
                  Check your email
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-400">
                  {message}
                </p>
              </div>
            </div>

            <Link
              href="/login"
              className="mt-5 flex w-full items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08]"
            >
              Return to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Email address
              </label>

              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-600" />

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  disabled={loading}
                  className="h-14 w-full rounded-xl border border-white/[0.08] bg-[#070a0f] pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-violet-500/60 focus:ring-4 focus:ring-violet-500/10 disabled:opacity-60"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/[0.08] px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:from-violet-500 hover:to-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Sending link...
                </>
              ) : (
                "Send reset link"
              )}
            </button>
          </form>
        )}

        {!message && (
          <Link
            href="/login"
            className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500 transition hover:text-violet-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        )}
      </section>
    </main>
  );
}