"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
Loader2,
ShieldCheck,
Eye,
EyeOff,
} from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";

const API_URL =
process.env.NEXT_PUBLIC_API_URL ??
"https://threatlens-1-hu2v.onrender.com";

export default function LoginPage() {
const [username, setUsername] = useState("");
const [password, setPassword] = useState("");
const [showPassword, setShowPassword] = useState(false);
const [emailLoading, setEmailLoading] = useState(false);
const [googleLoading, setGoogleLoading] = useState(false);
const [error, setError] = useState("");

async function handleEmailLogin(
event: FormEvent<HTMLFormElement>,
) {
event.preventDefault();
setError("");
setEmailLoading(true);

try {
  const formData = new URLSearchParams();
  formData.set("username", username.trim());
  formData.set("password", password);

  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      typeof data?.detail === "string"
        ? data.detail
        : "Login failed. Please check your credentials.",
    );
  }

  if (!data?.access_token) {
    throw new Error("No access token was returned by the server.");
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
      : "Unable to sign in. Please try again.",
  );
} finally {
  setEmailLoading(false);
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
    body: JSON.stringify({ credential }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      typeof data?.detail === "string"
        ? data.detail
        : "Google sign-in failed. Please try again.",
    );
  }

  if (!data?.access_token) {
    throw new Error("No access token was returned by the server.");
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

const isLoading = emailLoading || googleLoading;

return ( <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#030509] px-5 py-10 text-white"> <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl" /> <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />

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
      <div className="mb-6 text-center">
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

      <form onSubmit={handleEmailLogin} className="space-y-4">
        <div>
          <label
            htmlFor="username"
            className="mb-2 block text-sm text-slate-300"
          >
            Email or username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            required
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Enter your registered email or username"
            className="w-full rounded-xl border border-white/10 bg-[#030509] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm text-slate-300"
          >
            Password
          </label>

          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-xl border border-white/10 bg-[#030509] px-4 py-3 pr-12 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500"
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword((visible) => !visible)
              }
              aria-label={
                showPassword ? "Hide password" : "Show password"
              }
              className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-white"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-xs text-violet-400 hover:text-violet-300"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {emailLoading && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
          {emailLoading ? "Signing in..." : "Sign in with Email"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs tracking-wider text-slate-500">
          OR CONTINUE WITH
        </span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

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
                void handleGoogleLogin(result.credential);
              } else {
                setError(
                  "Google did not return a credential. Please try again.",
                );
              }
            }}
            onError={() =>
              setError("Google sign-in failed. Please try again.")
            }
            theme="filled_black"
            size="large"
            text="signin_with"
            shape="rectangular"
            width="320"
          />
        )}
      </div>

      <p className="mt-6 text-center text-sm text-slate-400">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-violet-400 hover:text-violet-300"
        >
          Create account
        </Link>
      </p>
    </div>

    <p className="mt-5 text-center text-[11px] text-slate-700">
      ThreatLens Security Operations
    </p>
  </section>
</main>


);
}
