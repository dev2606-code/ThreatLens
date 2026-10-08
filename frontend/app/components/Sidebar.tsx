"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  Activity,
  Bell,
  Database,
  FileText,
  Globe2,
  LayoutDashboard,
  Loader2,
  LogOut,
  Search,
  Settings,
  Shield,
  User,
  X,
} from "lucide-react";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface UserData {
  username: string;
  email: string;
  is_active: boolean;
  is_guest: boolean;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://threatlens-1-hu2v.onrender.com";

const navItems = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Indicators",
    href: "/indicators",
    icon: Search,
  },
  {
    name: "Alerts",
    href: "/alerts",
    icon: Bell,
  },
  {
    name: "Threat Map",
    href: "/threat-map",
    icon: Globe2,
  },
  {
    name: "Reports",
    href: "/reports",
    icon: FileText,
  },
  {
    name: "Intelligence Feeds",
    href: "/intelligence-feeds",
    icon: Database,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
  {
    name: "Profile",
    href: "/profile",
    icon: User,
  },
  {
    name: "Logout",
    href: "/logout",
    icon: LogOut,
  },
];

export default function Sidebar({
  isOpen = true,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<UserData | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem(
        "threatlens_access_token",
      );

      if (!token) {
        setUserLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/api/auth/me`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error("Unable to load user.");
        }

        const data = await response.json();

        setUser(data);
      } catch {
        setUser(null);
      } finally {
        setUserLoading(false);
      }
    }

    void loadUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem(
      "threatlens_access_token",
    );

    localStorage.removeItem(
      "threatlens-settings",
    );

    router.push("/login");
  };

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  };

  const displayName = user
    ? user.is_guest
      ? "Guest"
      : user.username
    : "User";

  const displayRole = user
    ? user.is_guest
      ? "Guest Account"
      : "Threat Analyst"
    : "Account";

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-white/[0.06] bg-[#090b10] transition-transform duration-300 ${
          isOpen
            ? "translate-x-0"
            : "-translate-x-full"
        } md:translate-x-0`}
      >
        {/* Logo / Header */}
        <div className="flex h-20 items-center justify-between border-b border-white/[0.06] px-5">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600/15 ring-1 ring-violet-500/20">
              <Shield className="h-5 w-5 text-violet-400" />
            </div>

            <div>
              <h1 className="text-base font-semibold tracking-wide text-white">
                ThreatLens
              </h1>

              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                Threat Intelligence
              </p>
            </div>
          </Link>

          {/* Mobile Close */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-white/[0.05] hover:text-white md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-6">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
            Main Menu
          </p>

          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(event) => {
                    if (item.href === "/logout") {
                      event.preventDefault();
                      handleLogout();
                    }

                    onClose?.();
                  }}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all ${
                    active
                      ? "bg-violet-500/10 text-violet-300 ring-1 ring-violet-500/15"
                      : "text-slate-500 hover:bg-white/[0.035] hover:text-slate-200"
                  }`}
                >
                  <Icon
                    className={`h-[18px] w-[18px] shrink-0 transition ${
                      active
                        ? "text-violet-400"
                        : "text-slate-600 group-hover:text-slate-300"
                    }`}
                  />

                  <span>{item.name}</span>

                  {active && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-violet-400" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom Status */}
        <div className="border-t border-white/[0.06] p-3">
          <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/[0.04] p-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />

                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>

              <span className="text-xs font-medium text-emerald-400">
                System Online
              </span>
            </div>

            <p className="mt-1 pl-4 text-[10px] text-slate-600">
              All services operational
            </p>
          </div>

          {/* Profile */}
          <Link
            href="/profile"
            onClick={onClose}
            className="mt-3 flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-white/[0.035]"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-500">
              <User className="h-4 w-4 text-white" />
            </div>

            <div className="min-w-0 flex-1">
              {userLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-violet-400" />

                  <p className="text-xs text-slate-500">
                    Loading...
                  </p>
                </div>
              ) : (
                <>
                  <p className="truncate text-xs font-medium text-slate-200">
                    {displayName}
                  </p>

                  <p className="truncate text-[10px] text-slate-600">
                    {displayRole}
                  </p>
                </>
              )}
            </div>

            <Activity className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
          </Link>
        </div>
      </aside>
    </>
  );
}