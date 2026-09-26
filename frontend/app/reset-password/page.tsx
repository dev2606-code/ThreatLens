"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const passwordLength = password.length >= 8;
  const passwordsMatch =
    password.length > 0 &&
    confirmPassword.length > 0 &&
    password === confirmPassword;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!passwordLength) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const params = new URLSearchParams(
        window.location.search,
      );

      const token = params.get("token");

      const response = await fetch(
        `${API_URL}/api/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            password,
            new_password: password,
          }),
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.detail || "Unable to reset your password.",
        );
      }

      setSuccess(true);
      setPassword("");
      setConfirmPassword("");
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
            {!success ? (
              <>
                <Link
                  href="/login"
                  className="mb-7 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Sign In
                </Link>

                <div className="mb-7">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                    <LockKeyhole className="h-5 w-5" />
                  </div>

                  <h2 className="text-2xl font-bold">
                    Reset your password
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    Create a new secure password for your
                    ThreatLens account.
                  </p>
                </div>

                {error && (
                  <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Password */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      New password
                    </label>

                    <div className="group relative">
                      <LockKeyhole className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600 transition group-focus-within:text-violet-400" />

                      <input
                        type={
                          showPassword ? "text" : "password"
                        }
                        value={password}
                        onChange={(e) =>
                          setPassword(e.target.value)
                        }
                        required
                        placeholder="Enter new password"
                        className="h-12 w-full rounded-xl border border-white/[0.08] bg-white/[0.035] pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500/50 focus:bg-violet-500/[0.03] focus:ring-4 focus:ring-violet-500/10"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword((value) => !value)
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-200"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <div
                        className={`h-1.5 flex-1 rounded-full ${
                          passwordLength
                            ? "bg-emerald-500"
                            : "bg-white/10"
                        }`}
                      />
                      <span className="text-[11px] text-slate-600">
                        {passwordLength
                          ? "Strong enough"
                          : "8+ characters"}
                      </span>
                    </div>
                  </div>

                  {/* Confirm */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Confirm password
                    </label>

                    <div className="group relative">
                      <LockKeyhole className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600 transition group-focus-within:text-violet-400" />

                      <input
                        type={
                          showConfirmPassword
                            ? "text"
                            : "password"
                        }
                        value={confirmPassword}
                        onChange={(e) =>
                          setConfirmPassword(e.target.value)
                        }
                        required
                        placeholder="Confirm new password"
                        className={`h-12 w-full rounded-xl border bg-white/[0.035] pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-slate-600 focus:ring-4 ${
                          confirmPassword.length > 0
                            ? passwordsMatch
                              ? "border-emerald-500/40 focus:ring-emerald-500/10"
                              : "border-red-500/40 focus:ring-red-500/10"
                            : "border-white/[0.08] focus:border-violet-500/50 focus:ring-violet-500/10"
                        }`}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(
                            (value) => !value,
                          )
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-200"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-500 hover:shadow-violet-500/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Resetting password...
                      </>
                    ) : (
                      <>
                        Reset Password
                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className="py-8 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
                  <CheckCircle2 className="h-8 w-8" />
                </div>

                <h2 className="mt-6 text-2xl font-bold">
                  Password updated
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Your password has been successfully changed.
                  You can now sign in with your new password.
                </p>

                <Link
                  href="/login"
                  className="mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-500"
                >
                  Continue to Sign In
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}