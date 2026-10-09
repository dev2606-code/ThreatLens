
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  Database,
  Globe2,
  Radar,
  Search,
  ShieldCheck,
  ShieldPlus,
  Siren,
  User,
} from "lucide-react";
import AddIndicatorModal from "./components/AddIndicatorModal";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://threatlens-1-hu2v.onrender.com";

type UserData = {
  username: string;
  email: string;
  is_active: boolean;
  is_guest: boolean;
};

type DashboardStats = {
  active_indicators: number;
  critical_threats: number;
  open_alerts: number;
  feeds_online: number;
};

type Threat = {
  id: number;
  indicator: string;
  type: string;
  score: number;
  severity: string;
  source: string;
  time: string;
};

const fallbackStats: DashboardStats = {
  active_indicators: 0,
  critical_threats: 0,
  open_alerts: 0,
  feeds_online: 8,
};

export default function Home() {
  const router = useRouter();

  const [user, setUser] = useState<UserData | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [stats, setStats] =
    useState<DashboardStats>(fallbackStats);
  const [threats, setThreats] = useState<Threat[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadError, setLoadError] = useState("");

  // Validate the current session before showing the dashboard.
  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      const token = localStorage.getItem(
        "threatlens_access_token",
      );

      if (!token) {
        router.replace("/login");
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
            cache: "no-store",
          },
        );

        if (!response.ok) {
          localStorage.removeItem(
            "threatlens_access_token",
          );
          router.replace("/login");
          return;
        }

        const data: UserData = await response.json();

        if (!data.is_active) {
          localStorage.removeItem(
            "threatlens_access_token",
          );
          router.replace("/login");
          return;
        }

        if (!cancelled) {
          setUser(data);
          setAuthChecked(true);
        }
      } catch (error) {
        console.error(
          "Failed to validate session:",
          error,
        );

        localStorage.removeItem(
          "threatlens_access_token",
        );
        router.replace("/login");
      }
    }

    void loadUser();

    return () => {
      cancelled = true;
    };
  }, [router]);

  // Load dashboard information after the session is validated.
  useEffect(() => {
    if (!authChecked) return;

    let cancelled = false;

    async function loadDashboardData() {
      const token = localStorage.getItem(
        "threatlens_access_token",
      );

      if (!token) {
        router.replace("/login");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      try {
        const [statsResponse, indicatorsResponse] =
          await Promise.all([
            fetch(`${API_URL}/api/dashboard/stats`, {
              headers,
              cache: "no-store",
            }),
            fetch(`${API_URL}/api/indicators`, {
              headers,
              cache: "no-store",
            }),
          ]);

        if (statsResponse.status === 401 ||
            indicatorsResponse.status === 401) {
          localStorage.removeItem(
            "threatlens_access_token",
          );
          router.replace("/login");
          return;
        }

        if (statsResponse.ok) {
          const data: DashboardStats =
            await statsResponse.json();

          if (!cancelled) setStats(data);
        }

        if (indicatorsResponse.ok) {
          const data = await indicatorsResponse.json();

          const formatted: Threat[] = data.map(
            (item: {
              id: number;
              value: string;
              indicator_type: string;
              severity_score: number;
              severity: string;
              source: string;
              created_at: string;
            }) => ({
              id: item.id,
              indicator: item.value,
              type: item.indicator_type,
              score: item.severity_score,
              severity: item.severity,
              source: item.source,
              time: item.created_at
                ? new Date(
                    item.created_at,
                  ).toLocaleString()
                : "—",
            }),
          );

          if (!cancelled) setThreats(formatted);
        }
      } catch (error) {
        console.error(
          "Failed to load dashboard data:",
          error,
        );

        if (!cancelled) {
          setLoadError(
            "Unable to load live data. Check your backend connection.",
          );
        }
      }
    }

    void loadDashboardData();

    return () => {
      cancelled = true;
    };
  }, [authChecked, router]);

  // Never render dashboard content before authentication succeeds.
  if (!authChecked) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#030509] text-slate-300">
        <div className="text-center">
          <ShieldCheck className="mx-auto mb-4 h-10 w-10 animate-pulse text-violet-400" />
          <p className="text-sm">Checking your session...</p>
        </div>
      </main>
    );
  }

  const displayName = user?.is_guest
    ? "Guest"
    : user?.username ?? "User";

  const displayRole = user?.is_guest
    ? "Guest Account"
    : "Threat Analyst";

  const cards = [
    {
      title: "Active Indicators",
      value: stats.active_indicators,
      icon: Radar,
      color: "text-violet-400",
      note: "Stored IOCs",
    },
    {
      title: "Critical Threats",
      value: stats.critical_threats,
      icon: AlertTriangle,
      color: "text-red-400",
      note: "Needs review",
    },
    {
      title: "Open Alerts",
      value: stats.open_alerts,
      icon: Siren,
      color: "text-blue-400",
      note: "High-risk items",
    },
    {
      title: "Feeds Online",
      value: `${stats.feeds_online}/8`,
      icon: Database,
      color: "text-emerald-400",
      note: "Feeds available",
    },
  ];

  return (
    <main className="min-h-screen bg-[#030509] text-slate-100">
      <header className="sticky top-0 z-20 flex min-h-20 items-center justify-between border-b border-white/[0.07] bg-[#030509]/90 px-5 backdrop-blur-xl md:px-8">
        <div className="relative hidden w-full max-w-xl md:block">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
          <input
            type="search"
            placeholder="Search indicators, IPs, domains, hashes..."
            className="h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.035] pl-11 pr-4 text-sm outline-none placeholder:text-slate-600 focus:border-violet-500/50"
          />
        </div>

        <Link
          href="/profile"
          className="ml-auto flex items-center gap-3 rounded-xl p-1 transition hover:bg-white/[0.04]"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-500">
            <User className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium">
              {displayName}
            </p>
            <p className="text-xs text-slate-500">
              {displayRole}
            </p>
          </div>
        </Link>
      </header>

      <section className="w-full px-5 py-8 md:px-8">
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] text-violet-400">
              <Activity className="h-4 w-4" />
              SECURITY OPERATIONS CENTRE
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Threat Overview
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Global threats. Real-time intelligence.
              A safer tomorrow.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-500"
          >
            <ShieldPlus className="h-4 w-4" />
            Add Indicator
          </button>
        </div>

        {loadError && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-300"
          >
            {loadError}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <article
                key={card.title}
                className="rounded-2xl border border-white/[0.08] bg-[#080c14] p-5 transition hover:border-violet-500/30"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.04]">
                    <Icon className={`h-5 w-5 ${card.color}`} />
                  </div>
                  <span className={`text-xs font-semibold ${card.color}`}>
                    {card.note}
                  </span>
                </div>
                <p className="mt-5 text-sm text-slate-500">
                  {card.title}
                </p>
                <strong className="mt-1 block text-3xl font-bold tracking-tight">
                  {typeof card.value === "number"
                    ? card.value.toLocaleString()
                    : card.value}
                </strong>
              </article>
            );
          })}
        </div>

        <div className="mt-5 grid gap-5 2xl:grid-cols-[0.8fr_1.2fr]">
          <article className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#080c14]">
            <div className="border-b border-white/[0.07] px-5 py-4">
              <h2 className="font-semibold">Global Threat Map</h2>
              <p className="mt-1 text-xs text-slate-500">
                Threat activity overview
              </p>
            </div>
            <div className="relative flex h-72 items-center justify-center bg-[radial-gradient(circle_at_center,rgba(87,38,180,0.14),transparent_62%)]">
              <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px)] [background-size:30px_30px]" />
              <Globe2 className="h-44 w-44 text-violet-400/20" />
              <span className="absolute left-[25%] top-[30%] h-3 w-3 animate-pulse rounded-full bg-red-400" />
              <span className="absolute left-[60%] top-[42%] h-3 w-3 animate-pulse rounded-full bg-orange-400" />
              <span className="absolute left-[48%] top-[65%] h-3 w-3 animate-pulse rounded-full bg-cyan-400" />
              <span className="absolute bottom-4 left-4 text-xs text-slate-500">
                Illustrative threat activity
              </span>
            </div>
          </article>

          <article className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#080c14]">
            <div className="flex items-center justify-between border-b border-white/[0.07] p-5">
              <div>
                <h2 className="font-semibold">
                  Latest Threat Intelligence
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Recently recorded indicators
                </p>
              </div>
              <Link
                href="/indicators"
                className="text-xs font-medium text-violet-400 hover:text-violet-300"
              >
                View all →
              </Link>
            </div>

            {threats.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                No indicators found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-left text-sm">
                  <thead className="text-[10px] uppercase tracking-wider text-slate-600">
                    <tr>
                      <th className="px-5 py-4">Indicator</th>
                      <th className="px-5 py-4">Type</th>
                      <th className="px-5 py-4">Risk</th>
                      <th className="px-5 py-4">Severity</th>
                      <th className="px-5 py-4">Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {threats.map((threat) => (
                      <tr
                        key={threat.id}
                        className="border-t border-white/[0.055] transition hover:bg-white/[0.025]"
                      >
                        <td className="max-w-52 truncate px-5 py-4 font-mono text-xs text-blue-300">
                          {threat.indicator}
                        </td>
                        <td className="px-5 py-4 text-slate-500">
                          {threat.type}
                        </td>
                        <td className="px-5 py-4 font-semibold">
                          {threat.score}
                        </td>
                        <td className="px-5 py-4">
                          <span className="rounded-full bg-violet-500/10 px-2.5 py-1 text-xs text-violet-300">
                            {threat.severity}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-500">
                          {threat.source}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </article>
        </div>
      </section>

      <AddIndicatorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={() => window.location.reload()}
      />
    </main>
  );
}
