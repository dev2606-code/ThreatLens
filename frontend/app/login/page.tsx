"use client";

import { FormEvent, useState } from "react";
import { Loader2, Lock, ShieldCheck, User } from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail ?? "Login failed");
      }

      localStorage.setItem(
        "threatlens_token",
        data.access_token,
      );

      window.location.href = "/";
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "Login failed",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#030509] px-5 text-slate-100">
      <section className="w-full max-w-md rounded-3xl border border-white/[0.08] bg-[#080c14] p-7 shadow-2xl md:p-9">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-500/30 bg-violet-500/10">
            <ShieldCheck className="h-7 w-7 text-violet-400" />
          </div>

          <h1 className="text-2xl font-bold">
            Threat<span className="text-violet-400">Lens</span>
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Sign in to the Security Operations Centre
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label
              htmlFor="username"
              className="mb-2 block text-sm text-slate-400"
            >
              Username
            </label>

            <div className="relative">
              <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />

              <input
                id="username"
                value={username}
                onChange={(event) =>
                  setUsername(event.target.value)
                }
                required
                autoComplete="username"
                placeholder="Enter username"
                className="h-12 w-full rounded-xl border border-white/[0.08] bg-[#050810] pl-11 pr-4 text-sm outline-none placeholder:text-slate-700 focus:border-violet-500/50"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm text-slate-400"
            >
              Password
            </label>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
                autoComplete="current-password"
                placeholder="Enter password"
                className="h-12 w-full rounded-xl border border-white/[0.08] bg-[#050810] pl-11 pr-4 text-sm outline-none placeholder:text-slate-700 focus:border-violet-500/50"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 font-semibold transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
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