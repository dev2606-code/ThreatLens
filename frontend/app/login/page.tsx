"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Loader2, LockKeyhole, ShieldCheck, User } from "lucide-react";
import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setIsLoading(true);

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
if (data?.access_token) {
  localStorage.setItem("threatlens_access_token", data.access_token);


}
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

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#05070b] px-5 py-12 text-white">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[700px] -translate-x-1/2 rounded-full bg-violet-700/10 blur-[140px]" />

      <section className="relative w-full max-w-md rounded-3xl border border-white/[0.08] bg-[#0b0e14]/95 p-7 shadow-2xl shadow-black/50 sm:p-9">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-500/30 bg-violet-500/10 text-violet-400">
            <ShieldCheck className="h-7 w-7" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Sign in to your ThreatLens account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
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
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Enter your username"
                autoComplete="username"
                required
                disabled={isLoading}
                className="h-14 w-full rounded-xl border border-white/[0.08] bg-[#070a0f] pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-violet-500/60 focus:ring-4 focus:ring-violet-500/10 disabled:opacity-60"
              />
            </div>
          </div>

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
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                disabled={isLoading}
                className="h-14 w-full rounded-xl border border-white/[0.08] bg-[#070a0f] pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-violet-500/60 focus:ring-4 focus:ring-violet-500/10 disabled:opacity-60"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/[0.08] px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm text-slate-500 transition hover:text-violet-300"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:from-violet-500 hover:to-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>
      </section>
    </main>
  );
}