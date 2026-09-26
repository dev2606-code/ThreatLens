"use client";
import { GoogleLogin } from "@react-oauth/google";
import Link from "next/link";
import { FormEvent, useState } from "react";

import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  User,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleRegister(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must contain at least 8 characters.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password,
          }),
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Unable to create your account.",
        );
      }

      setSuccess(
        "Account created successfully. Please check your email if verification is required.",
      );

      setName("");
      setEmail("");
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

  async function handleGoogleSuccess(
    credential: string,
  ) {
    try {
      setGoogleLoading(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_URL}/api/auth/google`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            credential,
          }),
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Google authentication failed.",
        );
      }

      if (!data?.access_token) {
        throw new Error(
          "Google authentication succeeded, but no access token was returned.",
        );
      }

      localStorage.setItem(
        "threatlens_access_token",
        data.access_token,
      );

      window.location.href = "/";
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Google authentication failed.",
      );
    } finally {
      setGoogleLoading(false);
    }
  }

  function handleGoogleError() {
    setError(
      "Google sign-up was cancelled or failed. Please try again.",
    );
  }

  return (

      <main className="relative min-h-screen overflow-hidden bg-[#030509] text-slate-100">
        {/* Background effects */}
        <div className="pointer-events-none absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full bg-violet-600/10 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-40 -right-40 h-[420px] w-[420px] rounded-full bg-blue-600/10 blur-3xl" />

        <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/[0.03] blur-3xl" />

        <div className="relative flex min-h-screen items-center justify-center px-5 py-10">
          <div className="w-full max-w-md">

            {/* Logo */}
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-400/30 bg-violet-500/10 shadow-[0_0_40px_rgba(139,92,246,0.2)] transition duration-300 hover:scale-105 hover:border-violet-400/60">
                <ShieldCheck className="h-9 w-9 text-violet-400" />
              </div>

              <h1 className="text-3xl font-bold tracking-tight">
                Threat
                <span className="text-violet-400">
                  Lens
                </span>
              </h1>

              <p className="mt-2 text-[10px] tracking-[0.28em] text-slate-500">
                SECURITY OPERATIONS PLATFORM
              </p>
            </div>

            {/* Card */}
            <section className="rounded-3xl border border-white/[0.08] bg-[#080c14]/95 p-6 shadow-2xl shadow-black/50 backdrop-blur-xl transition duration-300 hover:border-white/[0.12] sm:p-8">

              {/* Header */}
              <div className="mb-7">
                <p className="mb-2 text-xs font-semibold tracking-[0.18em] text-violet-400">
                  GET STARTED
                </p>

                <h2 className="text-2xl font-bold">
                  Create your account
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Join ThreatLens and start monitoring
                  your security intelligence.
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm leading-5 text-red-300">
                  {error}
                </div>
              )}

              {/* Success */}
              {success && (
                <div className="mb-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm leading-5 text-emerald-300">
                  {success}
                </div>
              )}

              {/* Google */}
              <div className="relative">
                {googleLoading && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-[#080c14]/80 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Loader2 className="h-4 w-4 animate-spin text-violet-400" />
                      Signing up with Google...
                    </div>
                  </div>
                )}

                {GOOGLE_CLIENT_ID ? (
                  <div className="flex justify-center overflow-hidden rounded-xl">
                    <GoogleLogin
                      onSuccess={(credentialResponse) => {
                        if (
                          !credentialResponse.credential
                        ) {
                          setError(
                            "Google did not return a valid credential.",
                          );
                          return;
                        }

                        void handleGoogleSuccess(
                          credentialResponse.credential,
                        );
                      }}
                      onError={handleGoogleError}
                      theme="filled_black"
                      size="large"
                      text="continue_with"
                      shape="rectangular"
                      width="380"
                    />
                  </div>
                ) : (
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-center text-xs text-amber-300">
                    Google sign-up is not configured.
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-white/[0.08]" />

                <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-slate-600">
                  Or continue with email
                </span>

                <div className="h-px flex-1 bg-white/[0.08]" />
              </div>

              {/* Register form */}
              <form
                onSubmit={handleRegister}
                className="space-y-5"
              >
                {/* Name */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Full name
                  </label>

                  <div className="group relative">
                    <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600 transition group-focus-within:text-violet-400" />

                    <input
                      type="text"
                      value={name}
                      onChange={(event) =>
                        setName(event.target.value)
                      }
                      required
                      placeholder="Enter your name"
                      className="h-12 w-full rounded-xl border border-white/[0.08] bg-white/[0.035] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500/50 focus:bg-violet-500/[0.03] focus:ring-4 focus:ring-violet-500/10"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Email address
                  </label>

                  <div className="group relative">
                    <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600 transition group-focus-within:text-violet-400" />

                    <input
                      type="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(event.target.value)
                      }
                      required
                      placeholder="you@example.com"
                      className="h-12 w-full rounded-xl border border-white/[0.08] bg-white/[0.035] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500/50 focus:bg-violet-500/[0.03] focus:ring-4 focus:ring-violet-500/10"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Password
                  </label>

                  <div className="group relative">
                    <LockKeyhole className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600 transition group-focus-within:text-violet-400" />

                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      required
                      minLength={8}
                      placeholder="Create a strong password"
                      className="h-12 w-full rounded-xl border border-white/[0.08] bg-white/[0.035] pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500/50 focus:bg-violet-500/[0.03] focus:ring-4 focus:ring-violet-500/10"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (value) => !value,
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 transition hover:text-slate-200"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  <p className="mt-2 text-xs text-slate-600">
                    Use at least 8 characters.
                  </p>
                </div>

                {/* Confirm password */}
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
                      onChange={(event) =>
                        setConfirmPassword(
                          event.target.value,
                        )
                      }
                      required
                      minLength={8}
                      placeholder="Confirm your password"
                      className="h-12 w-full rounded-xl border border-white/[0.08] bg-white/[0.035] pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500/50 focus:bg-violet-500/[0.03] focus:ring-4 focus:ring-violet-500/10"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (value) => !value,
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 transition hover:text-slate-200"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-500 hover:shadow-violet-500/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </form>

              {/* Sign in */}
              <p className="mt-7 text-center text-sm text-slate-500">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium text-violet-400 transition hover:text-violet-300"
                >
                  Sign in
                </Link>
              </p>
            </section>

            {/* Footer */}
            <p className="mt-6 text-center text-[11px] text-slate-700">
              ThreatLens Security Operations
            </p>
          </div>
        </div>
      </main>
    );
}