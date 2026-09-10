"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  Database,
  ExternalLink,
  RefreshCw,
  Search,
  Server,
  ShieldCheck,
  Wifi,
  WifiOff,
} from "lucide-react";

type FeedStatus = "Online" | "Degraded" | "Offline";

type IntelligenceFeed = {
  id: number;
  name: string;
  provider: string;
  description: string;
  category: string;
  status: FeedStatus;
  indicators: number;
  lastSync: string;
  color: string;
};

const initialFeeds: IntelligenceFeed[] = [
  {
    id: 1,
    name: "AlienVault OTX",
    provider: "AT&T Cybersecurity",
    description: "Community-powered indicators and threat intelligence.",
    category: "Community",
    status: "Online",
    indicators: 4280,
    lastSync: "2 minutes ago",
    color: "#8b5cf6",
  },
  {
    id: 2,
    name: "AbuseIPDB",
    provider: "AbuseIPDB",
    description: "Malicious IP address reputation and abuse reports.",
    category: "IP Reputation",
    status: "Online",
    indicators: 2341,
    lastSync: "4 minutes ago",
    color: "#3b82f6",
  },
  {
    id: 3,
    name: "URLhaus",
    provider: "abuse.ch",
    description: "Malicious URLs used for malware distribution.",
    category: "Malware URLs",
    status: "Online",
    indicators: 1876,
    lastSync: "5 minutes ago",
    color: "#ef4444",
  },
  {
    id: 4,
    name: "MalwareBazaar",
    provider: "abuse.ch",
    description: "Malware samples, hashes and related intelligence.",
    category: "Malware",
    status: "Online",
    indicators: 1548,
    lastSync: "7 minutes ago",
    color: "#f97316",
  },
  {
    id: 5,
    name: "CISA Alerts",
    provider: "CISA",
    description: "Cybersecurity advisories and known exploited vulnerabilities.",
    category: "Government",
    status: "Online",
    indicators: 936,
    lastSync: "10 minutes ago",
    color: "#22c55e",
  },
  {
    id: 6,
    name: "VirusTotal",
    provider: "Google",
    description: "File, URL, domain and IP reputation intelligence.",
    category: "Reputation",
    status: "Online",
    indicators: 721,
    lastSync: "12 minutes ago",
    color: "#22d3ee",
  },
  {
    id: 7,
    name: "ThreatFox",
    provider: "abuse.ch",
    description: "Indicators associated with malware families.",
    category: "IOC Feed",
    status: "Online",
    indicators: 654,
    lastSync: "14 minutes ago",
    color: "#a855f7",
  },
  {
    id: 8,
    name: "OpenPhish",
    provider: "OpenPhish",
    description: "Phishing URLs and campaign intelligence.",
    category: "Phishing",
    status: "Online",
    indicators: 491,
    lastSync: "16 minutes ago",
    color: "#eab308",
  },
];

export default function IntelligenceFeedsPage() {
  const [feeds, setFeeds] = useState(initialFeeds);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [refreshing, setRefreshing] = useState(false);

  const filteredFeeds = useMemo(() => {
    return feeds.filter((feed) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        feed.name.toLowerCase().includes(searchValue) ||
        feed.provider.toLowerCase().includes(searchValue) ||
        feed.category.toLowerCase().includes(searchValue);

      const matchesFilter =
        filter === "All" || feed.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [feeds, search, filter]);

  const onlineFeeds = feeds.filter(
    (feed) => feed.status === "Online",
  ).length;

  const totalIndicators = feeds.reduce(
    (total, feed) => total + feed.indicators,
    0,
  );

  function refreshFeeds() {
    setRefreshing(true);

    window.setTimeout(() => {
      setFeeds((current) =>
        current.map((feed) => ({
          ...feed,
          lastSync: "Just now",
        })),
      );

      setRefreshing(false);
    }, 700);
  }

  return (
    <main className="min-h-screen bg-[#07090d] text-slate-100">
      <header className="border-b border-white/10 bg-[#090c11]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-violet-500/30 bg-violet-500/10 p-3">
              <ShieldCheck className="h-6 w-6 text-violet-400" />
            </div>

            <div>
              <h1 className="text-xl font-bold">
                Threat<span className="text-violet-400">Lens</span>
              </h1>
              <p className="text-[10px] tracking-[0.2em] text-slate-500">
                SECURITY INTELLIGENCE
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm text-slate-400 transition hover:border-violet-500/40 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-[0.2em] text-cyan-400">
              <Database className="h-4 w-4" />
              THREAT INTELLIGENCE
            </p>

            <h2 className="text-4xl font-bold">Intelligence Feeds</h2>

            <p className="mt-3 text-slate-500">
              Monitor connected threat-intelligence data sources.
            </p>
          </div>

          <button
            type="button"
            onClick={refreshFeeds}
            disabled={refreshing}
            className="flex w-fit items-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/10 px-5 py-3 text-sm text-violet-300 transition hover:bg-violet-500/20 disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing ? "animate-spin" : ""
              }`}
            />
            Sync all feeds
          </button>
        </div>

        <div className="mb-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total feeds"
            value={feeds.length.toString()}
            icon={<Server className="h-5 w-5 text-violet-400" />}
          />

          <StatCard
            title="Feeds online"
            value={`${onlineFeeds}/${feeds.length}`}
            icon={<Wifi className="h-5 w-5 text-emerald-400" />}
          />

          <StatCard
            title="Total indicators"
            value={totalIndicators.toLocaleString()}
            icon={<Activity className="h-5 w-5 text-blue-400" />}
          />

          <StatCard
            title="Feed health"
            value={`${Math.round(
              (onlineFeeds / feeds.length) * 100,
            )}%`}
            icon={
              <CheckCircle2 className="h-5 w-5 text-cyan-400" />
            }
          />
        </div>

        <div className="mb-6 grid gap-3 md:grid-cols-[1fr_190px]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-600" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search feeds by name, provider or category..."
              className="w-full rounded-xl border border-white/10 bg-[#0b0e13] py-3.5 pl-12 pr-4 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-violet-500/40"
            />
          </div>

          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="rounded-xl border border-white/10 bg-[#0b0e13] px-4 py-3 text-sm text-slate-300 outline-none"
          >
            <option value="All">All statuses</option>
            <option value="Online">Online</option>
            <option value="Degraded">Degraded</option>
            <option value="Offline">Offline</option>
          </select>
        </div>

        {filteredFeeds.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#0b0e13]">
            <WifiOff className="mb-4 h-12 w-12 text-slate-600" />
            <h3 className="font-semibold">No feeds found</h3>
            <p className="mt-2 text-sm text-slate-500">
              Try changing the search or status filter.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {filteredFeeds.map((feed) => (
              <article
                key={feed.id}
                className="group rounded-2xl border border-white/10 bg-[#0b0e13] p-6 transition hover:border-violet-500/30 hover:bg-white/[0.025]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 gap-4">
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                      style={{
                        backgroundColor: `${feed.color}18`,
                        color: feed.color,
                      }}
                    >
                      <Database className="h-6 w-6" />
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-semibold">
                        {feed.name}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {feed.provider}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${
                      feed.status === "Online"
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                        : feed.status === "Degraded"
                          ? "border-orange-500/20 bg-orange-500/10 text-orange-400"
                          : "border-red-500/20 bg-red-500/10 text-red-400"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        feed.status === "Online"
                          ? "bg-emerald-400"
                          : feed.status === "Degraded"
                            ? "bg-orange-400"
                            : "bg-red-400"
                      }`}
                    />
                    {feed.status}
                  </span>
                </div>

                <p className="mt-5 text-sm leading-6 text-slate-400">
                  {feed.description}
                </p>

                <div className="mt-5 grid grid-cols-3 gap-3">
                  <InfoBox
                    label="Category"
                    value={feed.category}
                  />

                  <InfoBox
                    label="Indicators"
                    value={feed.indicators.toLocaleString()}
                  />

                  <InfoBox
                    label="Last sync"
                    value={feed.lastSync}
                  />
                </div>

                <button
                  type="button"
                  className="mt-5 flex items-center gap-2 text-sm text-violet-400 transition hover:text-violet-300"
                >
                  View feed details
                  <ExternalLink className="h-4 w-4" />
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0b0e13] p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{title}</p>
        {icon}
      </div>

      <p className="mt-4 text-3xl font-bold">{value}</p>
    </div>
  );
}

function InfoBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
      <p className="text-[10px] uppercase tracking-wide text-slate-600">
        {label}
      </p>
      <p className="mt-2 truncate text-xs font-medium text-slate-300">
        {value}
      </p>
    </div>
  );
}