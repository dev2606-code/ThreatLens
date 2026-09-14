"use client";
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Activity,
  Bell,
  CircleAlert,
  Database,
  FileText,
  Globe2,
  LayoutDashboard,
  Radar,
  Search,
  Settings,
  ShieldCheck,
  ShieldPlus,
  Siren,
  SlidersHorizontal,
  User,
} from "lucide-react";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import AddIndicatorModal from "./components/AddIndicatorModal";

type DashboardStats = {
  active_indicators: number;
  critical_threats: number;
  open_alerts: number;
  feeds_online: number;
};

const fallbackStats: DashboardStats = {
  active_indicators: 12847,
  critical_threats: 24,
  open_alerts: 156,
  feeds_online: 8,
};

const chartData = [
  { time: "00:00", total: 310, critical: 110 },
  { time: "04:00", total: 430, critical: 150 },
  { time: "08:00", total: 540, critical: 210 },
  { time: "12:00", total: 720, critical: 260 },
  { time: "16:00", total: 510, critical: 230 },
  { time: "20:00", total: 810, critical: 350 },
  { time: "24:00", total: 680, critical: 290 },
];

const severityData = [
  { name: "Critical", value: 24, color: "#fb4b62" },
  { name: "High", value: 147, color: "#ff932e" },
  { name: "Medium", value: 681, color: "#8b5cf6" },
  { name: "Low", value: 11995, color: "#22d3ee" },
];

const fallbackThreats = [
  {
    indicator: "185.199.110.42",
    type: "IP Address",
    score: 98,
    severity: "Critical",
    source: "OpenIntel Feed",
    time: "14:12",
  },
  {
    indicator: "malware-update[.]com",
    type: "Domain",
    score: 87,
    severity: "Critical",
    source: "ThreatLens CTI",
    time: "13:56",
  },
  {
    indicator: "a3f5d2c7e9b4...7c1a",
    type: "File Hash",
    score: 76,
    severity: "High",
    source: "VirusTotal",
    time: "12:41",
  },
  {
    indicator: "login-secure365[.]net",
    type: "Domain",
    score: 65,
    severity: "Medium",
    source: "PhishTank",
    time: "10:14",
  },
];

const mapPoints = [
  { left: "18%", top: "36%", color: "bg-red-500", size: "h-4 w-4" },
  { left: "26%", top: "29%", color: "bg-violet-500", size: "h-3 w-3" },
  { left: "42%", top: "40%", color: "bg-orange-500", size: "h-4 w-4" },
  { left: "54%", top: "31%", color: "bg-red-500", size: "h-3 w-3" },
  { left: "64%", top: "43%", color: "bg-cyan-400", size: "h-2.5 w-2.5" },
  { left: "75%", top: "35%", color: "bg-violet-500", size: "h-4 w-4" },
  { left: "82%", top: "57%", color: "bg-orange-500", size: "h-3 w-3" },
  { left: "32%", top: "62%", color: "bg-cyan-400", size: "h-3 w-3" },
  { left: "57%", top: "67%", color: "bg-violet-500", size: "h-3 w-3" },
];
export default function Home() {
const [stats, setStats] = useState<DashboardStats>(fallbackStats);
const [isModalOpen, setIsModalOpen] = useState(false);
const [threats, setThreats] = useState(fallbackThreats);

useEffect(() => {
  async function loadDashboardData() {
    try {
      const statsResponse = await fetch(
      `${API_URL}/api/dashboard/stats`
      );

      if (statsResponse.ok) {
        const statsData: DashboardStats =
          await statsResponse.json();

        setStats(statsData);
      }

      const indicatorsResponse = await fetch(
       `${API_URL}/api/indicators`
      );

      if (indicatorsResponse.ok) {
        const indicators = await indicatorsResponse.json();

        const formattedIndicators = indicators.map(
          (indicator: {
            id: number;
            value: string;
            indicator_type: string;
            severity_score: number;
            severity: string;
            source: string;
            created_at: string;
          }) => ({
            indicator: indicator.value,
            type: indicator.indicator_type,
            score: indicator.severity_score,
            severity: indicator.severity,
            source: indicator.source,
            time: new Date(
              indicator.created_at,
            ).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          }),
        );

        setThreats(formattedIndicators);
      }
    } catch {
      setStats(fallbackStats);
      setThreats(fallbackThreats);
    }
  }

  loadDashboardData();
}, []);



  const navigation = [
    { name: "Overview", icon: LayoutDashboard, active: true },
    { name: "Indicators", icon: Search, active: false },
    { name: "Alerts", icon: Bell, active: false, badge: "12" },
    { name: "Threat Map", icon: Globe2, active: false },
    { name: "Intelligence Feeds", icon: Database, active: false },
    { name: "Reports", icon: FileText, active: false },
    { name: "Settings", icon: Settings, active: false },
  ];

  const statCards = [
    {
      title: "Active Indicators",
      value: stats.active_indicators.toLocaleString(),
      change: "Stored IOCs",
      icon: Radar,
      iconColor: "text-violet-400",
      iconBackground: "bg-violet-500/10",
      border: "hover:border-violet-500/40",
    },
    {
      title: "Critical Threats",
      value: stats.critical_threats.toString(),
      change: "Needs review",
      icon: CircleAlert,
      iconColor: "text-red-400",
      iconBackground: "bg-red-500/10",
      border: "hover:border-red-500/40",
    },
    {
      title: "Open Alerts",
      value: stats.open_alerts.toString(),
      change: "High-risk items",
      icon: Siren,
      iconColor: "text-blue-400",
      iconBackground: "bg-blue-500/10",
      border: "hover:border-blue-500/40",
    },
    {
      title: "Feeds Online",
      value: `${stats.feeds_online}/8`,
      change: "All operational",
      icon: Database,
      iconColor: "text-emerald-400",
      iconBackground: "bg-emerald-500/10",
      border: "hover:border-emerald-500/40",
    },
  ];

  return (
    <main className="min-h-screen bg-[#030509] text-slate-100">
      <div className="flex min-h-screen">
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-white/[0.07] bg-[#050810] lg:flex lg:flex-col">
          <div className="flex h-20 items-center border-b border-white/[0.07] px-6">
            <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/30 bg-violet-500/10 shadow-[0_0_25px_rgba(139,92,246,0.22)]">
              <ShieldCheck className="h-6 w-6 text-violet-400" />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Threat<span className="text-violet-400">Lens</span>
              </h1>
              <p className="text-[9px] tracking-[0.18em] text-slate-500">
                SECURITY OPERATIONS
              </p>
            </div>
          </div>

          <nav className="flex-1 space-y-2 p-4">
            {navigation.map((item) => {
              const Icon = item.icon;
const href =
  item.name === "Indicators"
    ? "/indicators"
    : item.name === "Alerts"
      ? "/alerts"
      : item.name === "Threat Map"
        ? "/threat-map"
        : item.name === "Intelligence Feeds"
          ? "/intelligence-feeds"
          : item.name === "Reports"
            ? "/reports"
            : item.name === "Settings"
              ? "/settings"
              : "/";

              return (
                <Link
                  key={item.name}
                  href={href}
                  className={`group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                    item.active
                      ? "border border-violet-500/20 bg-violet-500/10 text-violet-300"
                      : "border border-transparent text-slate-500 hover:bg-white/[0.04] hover:text-slate-200"
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" />
                  <span>{item.name}</span>

                  {item.badge && (
                    <span className="ml-auto rounded-md bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="m-4 rounded-2xl border border-violet-500/15 bg-gradient-to-b from-violet-500/10 to-transparent p-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </span>

              <p className="text-xs font-medium text-emerald-400">
                System Operational
              </p>
            </div>

            <p className="text-xs leading-5 text-slate-500">
              All threat feeds and monitoring services are online.
            </p>
          </div>
        </aside>

        <section className="min-w-0 flex-1 lg:ml-64">
          <header className="sticky top-0 z-20 flex min-h-20 items-center justify-between border-b border-white/[0.07] bg-[#030509]/90 px-5 backdrop-blur-xl md:px-8">
            <div className="relative hidden w-full max-w-xl md:block">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />

              <input
                type="search"
                placeholder="Search indicators, IPs, domains, hashes..."
                className="h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.035] pl-11 pr-4 text-sm text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/10"
              />
            </div>

            <div className="ml-auto flex items-center gap-3 md:gap-5">
              <div className="hidden items-center gap-2 border-r border-white/10 pr-5 sm:flex">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <div>
                  <p className="text-xs font-medium text-emerald-400">
                    System Operational
                  </p>
                  <p className="text-[10px] text-slate-600">
                    All systems online
                  </p>
                </div>
              </div>

              <button className="relative rounded-xl border border-white/[0.08] bg-white/[0.035] p-2.5 text-slate-400 transition hover:text-white">
                <Bell className="h-5 w-5" />
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                  12
                </span>
              </button>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-500">
                  <User className="h-5 w-5" />
                </div>

                <div className="hidden xl:block">
                  <p className="text-sm font-medium">Devendra Sinha</p>
                  <p className="text-[11px] text-slate-500">
                    Threat Analyst
                  </p>
                </div>
              </div>
            </div>
          </header>

          <div className="p-5 md:p-8">
            <div className="mb-8 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
              <div>
                <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] text-violet-400">
                  <Activity className="h-4 w-4" />
                  SECURITY OPERATIONS CENTRE
                </div>

                <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                  Threat Overview
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Global threats. Real-time intelligence. A safer tomorrow.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
  type="button"
  onClick={() => setIsModalOpen(true)}
  className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-violet-500"
>
  <ShieldPlus className="h-4 w-4" />
  Add Indicator
</button>
                {["24H", "7D", "30D"].map((period, index) => (
                  <button
                    key={period}
                    className={`rounded-lg border px-4 py-2 text-xs font-medium transition ${
                      index === 0
                        ? "border-violet-500/50 bg-violet-500/15 text-violet-300"
                        : "border-white/[0.08] bg-white/[0.025] text-slate-500 hover:text-white"
                    }`}
                  >
                    {period}
                  </button>
                ))}

                <button className="rounded-lg border border-white/[0.08] bg-white/[0.025] p-2 text-slate-500 hover:text-white">
                  <SlidersHorizontal className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
              {statCards.map((card) => {
                const Icon = card.icon;

                return (
                  <article
                    key={card.title}
                    className={`rounded-2xl border border-white/[0.08] bg-[#080c14] p-5 transition ${card.border}`}
                  >
                    <div className="flex items-start justify-between">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.iconBackground}`}
                      >
                        <Icon className={`h-5 w-5 ${card.iconColor}`} />
                      </div>

                      <span className={`text-xs font-semibold ${card.iconColor}`}>
                        {card.change}
                      </span>
                    </div>

                    <p className="mt-5 text-sm text-slate-500">
                      {card.title}
                    </p>

                    <strong className="mt-1 block text-3xl font-bold tracking-tight">
                      {card.value}
                    </strong>
                  </article>
                );
              })}
            </div>

            <div className="mt-5 grid gap-5 2xl:grid-cols-[1.2fr_1fr]">
              <article className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#080c14]">
                <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
                  <div>
                    <h3 className="font-semibold">Global Threat Map</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Live threat activity across monitored regions
                    </p>
                  </div>

                  <span className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 text-xs text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    Live
                  </span>
                </div>

                <div className="relative h-[370px] overflow-hidden bg-[radial-gradient(circle_at_center,rgba(87,38,180,0.14),transparent_62%)]">
                  <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px)] [background-size:30px_30px]" />

                  <Globe2 className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 text-violet-400/15 md:h-80 md:w-80" />

                  <div className="absolute inset-x-[12%] top-[25%] h-[48%] rounded-[50%] border border-violet-400/15 bg-violet-400/[0.025] shadow-[inset_0_0_80px_rgba(139,92,246,0.08)]" />

                  {mapPoints.map((point, index) => (
                    <span
                      key={index}
                      className={`absolute ${point.size} ${point.color} rounded-full shadow-[0_0_18px_currentColor]`}
                      style={{
                        left: point.left,
                        top: point.top,
                      }}
                    >
                      <span className="absolute inset-0 animate-ping rounded-full bg-current opacity-40" />
                    </span>
                  ))}

                  <div className="absolute bottom-5 left-5 flex flex-wrap gap-4 rounded-xl border border-white/[0.07] bg-black/40 px-4 py-3 text-[11px] backdrop-blur">
                    <span className="text-red-400">● Critical</span>
                    <span className="text-orange-400">● High</span>
                    <span className="text-violet-400">● Medium</span>
                    <span className="text-cyan-400">● Low</span>
                  </div>
                </div>
              </article>

              <article className="rounded-2xl border border-white/[0.08] bg-[#080c14] p-5">
                <div className="mb-5">
                  <h3 className="font-semibold">Threat Activity</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Detection volume during the last 24 hours
                  </p>
                </div>

                <div className="h-[315px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient
                          id="totalGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#8b5cf6"
                            stopOpacity={0.45}
                          />
                          <stop
                            offset="100%"
                            stopColor="#8b5cf6"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>

                      <CartesianGrid
                        stroke="rgba(148,163,184,0.08)"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="time"
                        stroke="#475569"
                        tickLine={false}
                        axisLine={false}
                        fontSize={11}
                      />

                      <YAxis
                        stroke="#475569"
                        tickLine={false}
                        axisLine={false}
                        fontSize={11}
                      />

                      <Tooltip
                        contentStyle={{
                          background: "#080c14",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "12px",
                          color: "#ffffff",
                        }}
                      />

                      <Area
                        type="monotone"
                        dataKey="total"
                        stroke="#8b5cf6"
                        strokeWidth={2.5}
                        fill="url(#totalGradient)"
                      />

                      <Area
                        type="monotone"
                        dataKey="critical"
                        stroke="#fb4b62"
                        strokeWidth={2}
                        fill="transparent"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </article>
            </div>

            <div className="mt-5 grid gap-5 2xl:grid-cols-[0.75fr_1.25fr]">
              <article className="rounded-2xl border border-white/[0.08] bg-[#080c14] p-5">
                <h3 className="font-semibold">Threat Severity</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Distribution by severity level
                </p>

                <div className="mt-4 grid items-center gap-4 md:grid-cols-[1fr_0.9fr]">
                  <div className="relative h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={severityData}
                          dataKey="value"
                          innerRadius={62}
                          outerRadius={88}
                          paddingAngle={2}
                          stroke="transparent"
                        >
                          {severityData.map((entry) => (
                            <Cell
                              key={entry.name}
                              fill={entry.color}
                            />
                          ))}
                        </Pie>

                        <Tooltip
                          contentStyle={{
                            background: "#080c14",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "12px",
                            color: "#ffffff",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>

                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                      <strong className="text-2xl">12.8K</strong>
                      <span className="text-xs text-slate-500">
                        Indicators
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {severityData.map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="flex items-center gap-2 text-slate-400">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          {item.name}
                        </span>

                        <span className="font-medium">
                          {item.value.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </article>

              <article className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#080c14]">
                <div className="flex items-center justify-between border-b border-white/[0.07] p-5">
                  <div>
                    <h3 className="font-semibold">
                      Latest Threat Intelligence
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Recently detected indicators of compromise
                    </p>
                  </div>

                  <button className="text-xs font-medium text-violet-400 hover:text-violet-300">
                    View all →
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left text-sm">
                    <thead className="text-[10px] uppercase tracking-wider text-slate-600">
                      <tr>
                        <th className="px-5 py-4">Indicator</th>
                        <th className="px-5 py-4">Type</th>
                        <th className="px-5 py-4">Risk</th>
                        <th className="px-5 py-4">Severity</th>
                        <th className="px-5 py-4">Source</th>
                        <th className="px-5 py-4">Time</th>
                      </tr>
                    </thead>

                    <tbody>
                      {threats.map((threat) => (
                        <tr
                          key={threat.indicator}
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
                            <span
                              className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs ${
                                threat.severity === "Critical"
                                  ? "bg-red-500/10 text-red-400"
                                  : threat.severity === "High"
                                    ? "bg-orange-500/10 text-orange-400"
                                    : "bg-violet-500/10 text-violet-400"
                              }`}
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-current" />
                              {threat.severity}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-slate-500">
                            {threat.source}
                          </td>

                          <td className="px-5 py-4 text-slate-600">
                            {threat.time}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>
            </div>
          </div>
        </section>
      </div>
      <AddIndicatorModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onCreated={() => {
    window.location.reload();
  }}
/>
    </main>
  );
}
