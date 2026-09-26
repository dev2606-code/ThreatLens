"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

type AuthGuardProps = {
  children: ReactNode;
};

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const publicRoutes = [
      "/login",
      "/register",
      "/forgot-password",
      "/reset-password",
      "/verify-email",
    ];

    const isPublicRoute = publicRoutes.some(
      (route) =>
        pathname === route || pathname.startsWith(`${route}/`)
    );

    if (isPublicRoute) {
      setChecking(false);
      return;
    }

    const token = localStorage.getItem("threatlens_access_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          localStorage.removeItem("threatlens_access_token");
          router.replace("/login");
          return;
        }

        setChecking(false);
      } catch {
        localStorage.removeItem("threatlens_access_token");
        router.replace("/login");
      }
    };

    verifyToken();
  }, [pathname, router]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#030509]">
        <div className="text-sm text-slate-500">
          Checking authentication...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}