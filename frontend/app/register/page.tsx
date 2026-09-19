"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  User,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            email,
            password,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Unable to create account",
        );
      }

      setSuccess(data.message);
      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (registerError) {
      setError(
        registerError instanceof Error
          ? registerError.message
          : "Unable to create account",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#030509] px-5 py-10 text-slate-100">
      <section className="w-full max-w-lg rounded-3xl border border-white/[0.08] bg-[#080c14] p-7 shadow-2xl sm:p-9">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-500/30 bg-violet-500/10">
            <ShieldCheck className="h-7 w-7 text-violet-400" />
          </div>

          <h1 className="text-2xl font-bold">
            Create Threat
            <span className="text-violet-400">
              Lens
            </span>{" "}
            account
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Your email must be verified before login.
          </p>
        </div>

        <form
          onSubmit={handleRegister}
          className="space-y-4"
        >
          <InputField
            label="Username"
            value={username}
            onChange={setUsername}
            placeholder="Choose a username"
            icon={<User className="h-4 w-4" />}
          />

          <InputField
            label="Email address"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            icon={<Mail className="h-4 w-4" />}
          />

          <InputField
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="Minimum 8 characters"
            icon={<Lock className="h-4 w-4" />}
          />

          <InputField
            label="Confirm password"
            type="password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Enter password again"
            icon={<Lock className="h-4 w-4" />}
          />

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {success && (
            <div className="flex gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-400">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 font-semibold transition hover:bg-violet-500 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-violet-400 hover:text-violet-300"
          >
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}

type InputFieldProps = {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon: React.ReactNode;
};

function InputField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  icon,
}: InputFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm text-slate-400">
        {label}
      </label>

      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">
          {icon}
        </span>

        <input
          type={type}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          required
          placeholder={placeholder}
          className="h-12 w-full rounded-xl border border-white/[0.08] bg-[#050810] pl-11 pr-4 text-sm outline-none placeholder:text-slate-700 focus:border-violet-500/50"
        />
      </div>
    </div>
  );
}