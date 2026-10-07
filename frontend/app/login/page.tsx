"use client";

import { useState } from "react";
import {
  Loader2,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://threatlens-1-hu2v.onrender.com";

export default function LoginPage() {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGoogleLogin(credential: string) {
    setError("");
    setGoogleLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/auth/google`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ credential }),
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          typeof data?.detail === "string"
            ? data.detail
            : "Google sign-in failed. Please try again.",
        );
      }

      if (!data?.access_token) {
        throw new Error(
          "No access token was returned by the server.",
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
          : "Google sign-in failed. Please try again.",
      );
    } finally {
      setGoogleLoading(false);
    }
  }

  async function handleGuestLogin() {
    setError("");
    setGuestLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/auth/guest`,
        {
          method: "POST",
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          typeof data?.detail === "string"
            ? data.detail
            : "Guest login failed. Please try again.",
        );
      }

      if (!data?.access_token) {
        throw new Error(
          "No access token was returned by the server.",
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
          : "Guest login failed. Please try again.",
      );
    } finally {
      setGuestLoading(false);
    }
  }

  const isLoading = googleLoading || guestLoading;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#030509] px-5 py-10 text-white">
      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />

      <section className="relative w-full max-w-md">
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

        <div className="rounded-3xl border border-white/[0.08] bg-[#080c14]/95 p-7 shadow-2xl shadow-black/50 backdrop-blur-xl sm:p-8">
          <div className="mb-7 text-center">
            <h2 className="text-2xl font-bold">
              Welcome to ThreatLens
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Sign in to access your security dashboard.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
            >
              {error}
            </div>
          )}

          {/* Google Login */}

          <div className="flex min-h-12 items-center justify-center">
            {googleLoading ? (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in with Google...
              </div>
            ) : (
              <GoogleLogin
                onSuccess={(result) => {
                  if (result.credential) {
                    void handleGoogleLogin(
                      result.credential,
                    );
                  } else {
                    setError(
                      "Google did not return a credential. Please try again.",
                    );
                  }
                }}
                onError={() =>
                  setError(
                    "Google sign-in failed. Please try again.",
                  )
                }
                theme="filled_black"
                size="large"
                text="signin_with"
                shape="rectangular"
                width="320"
              />
            )}
          </div>

          {/* Divider */}

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />

            <span className="text-xs tracking-wider text-slate-500">
              OR
            </span>

            <div className="h-px flex-1 bg-white/10" />
          </div>

          {/* Guest Login */}

          <button
            type="button"
            onClick={() => void handleGuestLogin()}
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white transition hover:border-violet-500/40 hover:bg-violet-500/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {guestLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UserRound className="h-4 w-4" />
            )}

            {guestLoading
              ? "Creating guest session..."
              : "Continue as Guest"}
          </button>

          <p className="mt-5 text-center text-xs leading-5 text-slate-600">
            Guest access lets you explore ThreatLens
            without creating an account.
          </p>
        </div>

        <p className="mt-5 text-center text-[11px] text-slate-700">
          ThreatLens Security Operations
        </p>
      </section>
    </main>
  );
}