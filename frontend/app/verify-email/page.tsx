"use client";

import Link from "next/link";
import {
  Suspense,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  MailCheck,
  ShieldCheck,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

type VerificationStatus =
  | "loading"
  | "success"
  | "error";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const requestStarted = useRef(false);

  const [status, setStatus] =
    useState<VerificationStatus>("loading");
  const [message, setMessage] = useState(
    "We are verifying your email address.",
  );

  useEffect(() => {
    if (requestStarted.current) {
      return;
    }

    requestStarted.current = true;

    async function verifyEmail() {
      if (!token) {
        setStatus("error");
        setMessage(
          "Verification token is missing. Please open the complete link sent to your email.",
        );
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/api/auth/verify-email`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
          },
        );

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            data?.detail ??
              "This verification link is invalid or has expired.",
          );
        }

        setStatus("success");
        setMessage(
          data?.message ??
            "Your email has been verified successfully.",
        );
      } catch (requestError) {
        setStatus("error");
        setMessage(
          requestError instanceof Error
            ? requestError.message
            : "Backend server is not available.",
        );
      }
    }

    void verifyEmail();
  }, [token]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#05070b] px-5 py-12 text-white">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[700px] -translate-x-1/2 rounded-full bg-violet-700/10 blur-[140px]" />

      <section className="relative w-full max-w-md rounded-3xl border border-white/[0.08] bg-[#0b0e14]/95 p-8 text-center shadow-2xl shadow-black/50 sm:p-10">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-500/30 bg-violet-500/10 text-violet-400">
          <ShieldCheck className="h-7 w-7" />
        </div>

        {status === "loading" && (
          <>
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-violet-400" />

            <h1 className="mt-6 text-2xl font-bold">
              Verifying your email
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              {message}
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10">
              <CheckCircle2 className="h-9 w-9 text-emerald-400" />
            </div>

            <h1 className="mt-6 text-2xl font-bold">
              Email verified
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              {message} You can now sign in to your ThreatLens
              account.
            </p>

            <Link
              href="/login"
              className="mt-7 flex h-13 w-full items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:from-violet-500 hover:to-purple-500"
            >
              Continue to sign in
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10">
              <AlertCircle className="h-9 w-9 text-red-400" />
            </div>

            <h1 className="mt-6 text-2xl font-bold">
              Verification failed
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              {message}
            </p>

            <div className="mt-7 space-y-3">
              <Link
                href="/register"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:from-violet-500 hover:to-purple-500"
              >
                <MailCheck className="h-4 w-4" />
                Create account again
              </Link>

              <Link
                href="/login"
                className="flex w-full items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.08]"
              >
                Return to sign in
              </Link>
            </div>
          </>
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

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <VerifyEmailContent />
    </Suspense>
  );
}