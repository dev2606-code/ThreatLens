"use client";
import { GoogleLogin } from "@react-oauth/google";
import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  Loader2,
  LockKeyhole,
  ShieldCheck,
  User,
  ArrowRight,
} from "lucide-react";
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [googleError, setGoogleError] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setGoogleError("");
    setIsLoading(true);

    try {
      const formData = new URLSearchParams();

      formData.append("grant_type", "password");
      formData.append("username", username);
      formData.append("password", password);

      const response = await fetch(
        `${API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded",
          },
          body: formData.toString(),
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const detail = data?.detail;

        let message = "Invalid username or password.";

        if (typeof detail === "string") {
          message = detail;
        } else if (Array.isArray(detail)) {
          message = detail
            .map((item) => {
              if (typeof item === "string") {
                return item;
              }

              return item?.msg ?? "Invalid login request.";
            })
            .join(", ");
        }

        throw new Error(message);
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
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to sign in.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleLogin(credential: string) {
    setGoogleError("");
    setError("");
    setIsGoogleLoading(true);

    try {
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
        const detail = data?.detail;

        throw new Error(
          typeof detail === "string"
            ? detail
            : "Google login failed.",
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
    } catch (requestError) {
      setGoogleError(
        requestError instanceof Error
          ? requestError.message
          : "Google login failed.",
      );
    } finally {
      setIsGoogleLoading(false);
    }
  }

  if (!GOOGLE_CLIENT_ID) {
    return (
      <LoginUI
        username={username}
        password={password}
        setUsername={setUsername}
        setPassword={setPassword}
        error={error}
        googleError="Google login is not configured. Add NEXT_PUBLIC_GOOGLE_CLIENT_ID to frontend/.env.local."
        setGoogleError={setGoogleError}
        isLoading={isLoading}
        isGoogleLoading={false}
        handleSubmit={handleSubmit}
        handleGoogleLogin={handleGoogleLogin}
        googleClientIdMissing
      />
    );
  }


}

type LoginUIProps = {
  username: string;
  password: string;
  setUsername: (value: string) => void;
  setPassword: (value: string) => void;
  error: string;
  googleError: string;
  setGoogleError: (value: string) => void;
  isLoading: boolean;
  isGoogleLoading: boolean;
  handleSubmit: (
    event: FormEvent<HTMLFormElement>,
  ) => Promise<void>;
  handleGoogleLogin: (credential: string) => Promise<void>;
  googleClientIdMissing?: boolean;
};

function LoginUI({
  username,
  password,
  setUsername,
  setPassword,
  error,
  googleError,
  setGoogleError,
  isLoading,
  isGoogleLoading,
  handleSubmit,
  handleGoogleLogin,
  googleClientIdMissing = false,
}: LoginUIProps) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#05070b] px-5 py-12 text-white">

      {/* Background effects */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[700px] -translate-x-1/2 rounded-full bg-violet-700/10 blur-[140px]" />

      <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-blue-600/5 blur-[100px]" />

      <section className="relative w-full max-w-md rounded-3xl border border-white/[0.08] bg-[#0b0e14]/95 p-7 shadow-2xl shadow-black/50 backdrop-blur-xl sm:p-9">

        {/* Logo */}
        <div className="mb-8 text-center">

          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-500/30 bg-violet-500/10 text-violet-400 shadow-[0_0_35px_rgba(139,92,246,0.15)]">
            <ShieldCheck className="h-7 w-7" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Sign in to your ThreatLens account.
          </p>
        </div>

        {/* Google */}
        <div className="mb-6">

          {googleClientIdMissing ? (
            <div className="rounded-xl border border-orange-500/20 bg-orange-500/[0.06] px-4 py-3 text-center text-sm text-orange-300">
              Google login is not configured.
            </div>
          ) : (
            <div className="flex min-h-12 justify-center overflow-hidden rounded-xl">

              {isGoogleLoading ? (
                <div className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] text-sm text-slate-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in with Google...
                </div>
              ) : (
            <GoogleLogin
  onSuccess={(credentialResponse) => {
    if (!credentialResponse.credential) {
      setGoogleError("Google credential was not received.");
      return;
    }

    void handleGoogleLogin(
      credentialResponse.credential,
    );
  }}
  onError={() => {
    setGoogleError("Google sign-in failed.");
  }}
  useOneTap={false}
  theme="filled_black"
  size="large"
  text="continue_with"
  shape="rectangular"
  width={380}
/>
              )}

            </div>
          )}

        </div>

        {googleError && (
          <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/[0.08] px-4 py-3 text-sm text-red-300">
            {googleError}
          </div>
        )}

        {/* Divider */}
        <div className="mb-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-white/[0.08]" />

          <span className="text-xs uppercase tracking-[0.2em] text-slate-600">
            or continue with username
          </span>

          <div className="h-px flex-1 bg-white/[0.08]" />
        </div>

        {/* Username / Password */}
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

              <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-600" />

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
                disabled={isLoading}
                className="h-14 w-full rounded-xl border border-white/[0.08] bg-[#070a0f] pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-violet-500/60 focus:ring-4 focus:ring-violet-500/10 disabled:opacity-60"
              />

            </div>
          </div>

          {/* Password */}
          <div>

            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Password
            </label>

            <div className="relative">

              <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-600" />

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                disabled={isLoading}
                className="h-14 w-full rounded-xl border border-white/[0.08] bg-[#070a0f] pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-violet-500/60 focus:ring-4 focus:ring-violet-500/10 disabled:opacity-60"
              />

            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/[0.08] px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* Forgot password */}
          <div className="flex justify-end">

            <Link
              href="/forgot-password"
              className="text-sm text-slate-500 transition hover:text-violet-300"
            >
              Forgot password?
            </Link>

          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading || isGoogleLoading}
            className="group flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:from-violet-500 hover:to-purple-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >

            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
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

        <p className="mt-6 text-center text-[11px] text-slate-700">
          ThreatLens Security Operations
        </p>

      </section>
    </main>
  );
}