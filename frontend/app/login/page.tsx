"use client";

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
} from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const formData = new URLSearchParams();

      formData.append("grant_type", "password");
      formData.append("username", username);
      formData.append("password", password);

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const detail = data?.detail;

        if (typeof detail === "string") {
          throw new Error(detail);
        }

        if (Array.isArray(detail)) {
          throw new Error(
            detail
              .map((item) => item?.msg ?? "Invalid login request.")
              .join(", "),
          );
        }

        throw new Error("Invalid username or password.");
      }

      if (!data?.access_token) {
        throw new Error(
          "Login succeeded but no access token was returned.",
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
          : "Unable to sign in.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin(credential: string) {
    setError("");
    setGoogleLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          credential,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.detail ?? "Google sign-in failed.",
        );
      }

      if (!data?.access_token) {
        throw new Error(
          "Google login succeeded but no access token was returned.",
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
          : "Google sign-in failed.",
      );
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#030509] px-5 py-10 text-white">
      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />

      <section className="relative w-full max-w-md">
        {/* Logo */}
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-500/30 bg-violet-500/10 shadow-[0_0_35px_rgba(139,92,246,0.2)]">
            <ShieldCheck className="h-7 w-7 text-violet-400" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight">
            Threat<span className="text-violet-400">Lens</span>
          </h1>

          <p className="mt-1 text-[10px] tracking-[0.25em] text-slate-600">
            SECURITY OPERATIONS PLATFORM
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-white/[0.08] bg-[#080c14]/95 p-7 shadow-2xl shadow-black/50 backdrop-blur-xl sm:p-8">
          <div className="mb-7">
            <h2 className="text-2xl font-bold">
              Welcome back
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Sign in to your ThreatLens account.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* Google Login - ONLY ONE */}
          <div className="flex min-h-11 justify-center">
            {googleLoading ? (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in with Google...
              </div>
            ) : (
           <GoogleLogin
  onSuccess={(credentialResponse) => {
    if (credentialResponse.credential) {
      void handleGoogleLogin(credentialResponse.credential);
    }
  }}
  onError={() => {
    setError("Google sign-in failed.");
  }}
  theme="filled_black"
  size="large"
  text="signin_with"
  shape="rectangular"
  width="320"
/>
            )}
          </div>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/[0.07]" />

            <span className="text-xs text-slate-600">
              OR
            </span>

            <div className="h-px flex-1 bg-white/[0.07]" />
          </div>

          {/* Login Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Username
              </label>

              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />

                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(event) =>
                    setUsername(event.target.value)
                  }
                  placeholder="Enter your username"
                  autoComplete="username"
                  required
                  disabled={loading}
                  className="h-12 w-full rounded-xl border border-white/[0.08] bg-white/[0.035] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/10"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-slate-300"
                >
                  Password
                </label>

                <Link
                  href="/forgot-password"
                  className="text-xs text-violet-400 transition hover:text-violet-300"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  disabled={loading}
                  className="h-12 w-full rounded-xl border border-white/[0.08] bg-white/[0.035] pl-11 pr-11 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/10"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((value) => !value)
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
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Register */}
          <p className="mt-7 text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-violet-400 transition hover:text-violet-300"
            >
              Create account
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="mt-5 text-center text-[11px] text-slate-700">
          ThreatLens Security Operations
        </p>
      </section>
    </main>
  );
}