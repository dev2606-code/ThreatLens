"use client";

import {
  ReactNode,
  useEffect,
  useState,
} from "react";
import {
  usePathname,
  useRouter,
} from "next/navigation";
import {
  Loader2,
  LogOut,
  ShieldCheck,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:8000";

const PUBLIC_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

type AuthGuardProps = {
  children: ReactNode;
};

export default function AuthGuard({
  children,
}: AuthGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  useEffect(() => {
    let active = true;

    async function checkAuthentication() {
      setChecking(true);

      if (isPublicRoute) {
        if (active) {
          setChecking(false);
        }
        return;
      }

      const token = localStorage.getItem(
        "threatlens_access_token"
      );

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/api/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error("Invalid session");
        }

        if (active) {
          setChecking(false);
        }
     } catch {
  localStorage.removeItem("threatlens_access_token");

  if (active) {
    router.replace("/login");
  }
}
    }

    void checkAuthentication();

    return () => {
      active = false;
    };
  }, [isPublicRoute, pathname, router]);

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#030509] text-slate-100">
        <div className="text-center">
          <ShieldCheck className="mx-auto mb-4 h-10 w-10 text-violet-400" />

          <Loader2 className="mx-auto h-5 w-5 animate-spin text-slate-500" />

          <p className="mt-3 text-sm text-slate-500">
            Verifying secure session...
          </p>
        </div>
      </main>
    );
  }

  return (
    <>
      {children}

      {!isPublicRoute && (
        <button
          type="button"
          onClick={() => {
          localStorage.removeItem(
  "threatlens_access_token",
);
            router.replace("/login");
          }}
          className="fixed bottom-5 right-5 z-[100] flex items-center gap-2 rounded-xl border border-red-500/20 bg-[#080c14] px-4 py-2.5 text-sm text-red-400 shadow-xl transition hover:bg-red-500/10"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      )}
    </>
  );
}