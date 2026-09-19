"use client";

import Link from "next/link";
import {
  FormEvent,
  Suspense,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  ShieldCheck,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!token) {
      setError("Password reset token is missing.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            new_password: password,
          }),
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.detail ??
            "This reset link is invalid or has expired.",
        );
      }

      setMessage(
        data?.message ??
          "Your password has been reset successfully.",
      );
      setPassword("");
      setConfirmPassword("");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Backend server is not available.",
      );
    } finally {
      setIsLoading(false);
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
            Create new password
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Choose a strong password for your ThreatLens account.
          </p>
        </div>

        {message ? (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.08] p-5 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400" />

            <h2 className="mt-4 font-semibold text-emerald-300">
              Password updated
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              {message}
            </p>

            <Link
              href="/login"
              className="mt-5 flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-sm font-semibold text-white transition hover:from-violet-500 hover:to-purple-500"
            >
              Sign in now
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {!token && (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.08] px-4 py-3 text-sm leading-6 text-amber-300">
                Reset token is missing. Please open the link sent
                to your email.
              </div>
            )}

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                New password
              </label>

              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-600" />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Minimum 8 characters"
                  minLength={8}
                  required
                  autoComplete="new-password"
                  disabled={isLoading}
                  className="h-14 w-full rounded-xl border border-white/[0.08] bg-[#070a0f] pl-12 pr-12 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-violet-500/60 focus:ring-4 focus:ring-violet-500/10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 transition hover:text-slate-300"
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Confirm password
              </label>

              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-600" />

                <input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  placeholder="Enter password again"
                  minLength={8}
                  required
                  autoComplete="new-password"
                  disabled={isLoading}
                  className="h-14 w-full rounded-xl border border-white/[0.08] bg-[#070a0f] pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-violet-500/60 focus:ring-4 focus:ring-violet-500/10"
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
              disabled={isLoading || !token}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:from-violet-500 hover:to-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Updating password...
                </>
              ) : (
                "Reset password"
              )}
            </button>

            <Link
              href="/login"
              className="block text-center text-sm text-slate-500 transition hover:text-violet-300"
            >
              Return to sign in
            </Link>
          </form>
        )}
      </section>
    </main>
  );
}

function LoadingFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#05070b] text-violet-400">
      <Loader2 className="h-8 w-8 animate-spin" />
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResetPasswordContent />
    </Suspense>
  );
}