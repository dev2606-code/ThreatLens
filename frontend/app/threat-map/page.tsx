"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  Database,
  FileText,
  Globe2,
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
  ShieldCheck,
} from "lucide-react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";

const geoUrl =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const threatPoints = [
  {
    name: "North America",
    coordinates: [-100, 40] as [number, number],
    severity: "High",
    attacks: 842,
  },
  {
    name: "Europe",
    coordinates: [10, 50] as [number, number],
    severity: "Critical",
    attacks: 1264,
  },
  {
    name: "Asia",
    coordinates: [105, 35] as [number, number],
    severity: "High",
    attacks: 1842,
  },
  {
    name: "South America",
    coordinates: [-60, -15] as [number, number],
    severity: "Medium",
    attacks: 524,
  },
  {
    name: "Africa",
    coordinates: [20, 5] as [number, number],
    severity: "Medium",
    attacks: 436,
  },
];

const navigation = [
  {
    name: "Overview",
    icon: LayoutDashboard,
    href: "/",
  },
  {
    name: "Indicators",
    icon: Search,
    href: "/indicators",
  },
  {
    name: "Alerts",
    icon: Bell,
    href: "/alerts",
  },
  {
    name: "Threat Map",
    icon: Globe2,
    href: "/threat-map",
  },
  {
    name: "Intelligence Feeds",
    icon: Database,
    href: "/intelligence-feeds",
  },
  {
    name: "Reports",
    icon: FileText,
    href: "/reports",
  },
  {
    name: "Settings",
    icon: Settings,
    href: "/settings",
  },
];

export default function ThreatMapPage() {
  return (
    <div className="min-h-screen bg-[#030509] text-white">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-white/10 bg-[#070a0f]">
        {/* Logo */}
        <div className="flex h-20 items-center gap-3 border-b border-white/10 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
            <ShieldCheck className="h-6 w-6 text-blue-400" />
          </div>

          <div>
            <h1 className="text-lg font-semibold tracking-wide">
              ThreatLens
            </h1>
            <p className="text-xs text-slate-500">
              Threat Intelligence
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-6">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = item.name === "Threat Map";

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                  active
                    ? "bg-blue-500/10 text-blue-400"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom status */}
        <div className="border-t border-white/10 p-4">
          <div className="mb-4 flex items-center gap-3 rounded-xl bg-white/[0.03] p-3">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />

            <div>
              <p className="text-xs font-medium text-white">
                System Operational
              </p>
              <p className="text-[11px] text-slate-500">
                All systems online
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              localStorage.removeItem("threatlens_access_token");
              window.location.href = "/login";
            }}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-white/10 bg-[#030509]/95 px-8 backdrop-blur-xl">
          {/* Left side */}
          <div className="flex items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Intelligence
              </p>
              <h2 className="mt-1 text-xl font-semibold">
                Global Threat Map
              </h2>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Live status */}
            <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span className="text-xs font-medium text-emerald-400">
                LIVE
              </span>
            </div>

            {/* Dashboard - RIGHT SIDE */}
            <Link
              href="/"
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-slate-300 transition hover:border-blue-400/30 hover:bg-blue-500/10 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
             Dashboard
            </Link>
          </div>
        </header>

        {/* Page content */}
        <div className="space-y-6 p-8">
          {/* Stats */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-[#080c12] p-5">
              <p className="text-sm text-slate-500">
                Active Threats
              </p>

              <div className="mt-3 flex items-end justify-between">
                <p className="text-3xl font-semibold">3,842</p>
                <span className="text-xs text-red-400">
                  +12.4%
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#080c12] p-5">
              <p className="text-sm text-slate-500">
                Critical Threats
              </p>

              <div className="mt-3 flex items-end justify-between">
                <p className="text-3xl font-semibold">24</p>
                <span className="text-xs text-red-400">
                  +4 today
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#080c12] p-5">
              <p className="text-sm text-slate-500">
                Regions Affected
              </p>

              <div className="mt-3 flex items-end justify-between">
                <p className="text-3xl font-semibold">68</p>
                <span className="text-xs text-amber-400">
                  Global
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#080c12] p-5">
              <p className="text-sm text-slate-500">
                Intelligence Feeds
              </p>

              <div className="mt-3 flex items-end justify-between">
                <p className="text-3xl font-semibold">8/8</p>
                <span className="text-xs text-emerald-400">
                  Healthy
                </span>
              </div>
            </div>
          </div>

          {/* World Map */}
          <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#080c12]">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <div>
                <h3 className="text-lg font-semibold">
                  Global Threat Activity
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Real-time geographic distribution of detected
                  threats
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                  Critical
                </div>

                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-orange-400" />
                  High
                </div>

                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                  Medium
                </div>
              </div>
            </div>

            <div className="relative flex min-h-[520px] items-center justify-center overflow-hidden bg-[#05080d]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.08),transparent_55%)]" />

              <ComposableMap
                projection="geoMercator"
                projectionConfig={{
                  scale: 145,
                  center: [10, 10],
                }}
                width={1000}
                height={520}
                className="relative z-10 h-full w-full"
              >
                <Geographies geography={geoUrl}>
                  {({ geographies }) =>
                    geographies.map((geo) => (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        style={{
                          fill: "#111827",
                          stroke: "#334155",
                          strokeWidth: 0.6,
                          outline: "none",
                        }}
                      />
                    )
                  )}
                </Geographies>

                {threatPoints.map((point) => {
                  const markerColor =
                    point.severity === "Critical"
                      ? "#ef4444"
                      : point.severity === "High"
                        ? "#fb923c"
                        : "#facc15";

                  return (
                    <Marker
                      key={point.name}
                      coordinates={point.coordinates}
                    >
                      <circle
                        r={8}
                        fill={markerColor}
                        opacity={0.18}
                      />

                      <circle
                        r={4}
                        fill={markerColor}
                        stroke="#fff"
                        strokeWidth={1}
                        opacity={0.95}
                      />

                      <circle
                        r={12}
                        fill="none"
                        stroke={markerColor}
                        strokeWidth={1}
                        opacity={0.35}
                      />
                    </Marker>
                  );
                })}
              </ComposableMap>
            </div>
          </section>

          {/* Bottom sections */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            {/* Most Active Regions */}
            <section className="rounded-2xl border border-white/10 bg-[#080c12] p-6">
              <div className="mb-5">
                <h3 className="text-lg font-semibold">
                  Most Active Regions
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Regions with the highest detected activity
                </p>
              </div>

              <div className="space-y-4">
                {threatPoints.map((point, index) => (
                  <div
                    key={point.name}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-4"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-slate-600">
                        0{index + 1}
                      </span>

                      <div>
                        <p className="text-sm font-medium text-white">
                          {point.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {point.severity} severity
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        {point.attacks.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500">
                        attacks
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Threat Intelligence */}
            <section className="rounded-2xl border border-white/10 bg-[#080c12] p-6">
              <div className="mb-5">
                <h3 className="text-lg font-semibold">
                  Threat Intelligence
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Latest global threat intelligence activity
                </p>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-red-500/10 bg-red-500/[0.03] p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-white">
                        Critical activity detected
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Increased malicious activity detected
                        across multiple regions.
                      </p>
                    </div>

                    <span className="rounded-full bg-red-500/10 px-2.5 py-1 text-[11px] text-red-400">
                      Critical
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-orange-400/10 bg-orange-400/[0.03] p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-white">
                        New indicators observed
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Multiple indicators have been added to
                        the intelligence database.
                      </p>
                    </div>

                    <span className="rounded-full bg-orange-400/10 px-2.5 py-1 text-[11px] text-orange-400">
                      High
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-emerald-400/10 bg-emerald-400/[0.03] p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-white">
                        Intelligence feeds healthy
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        All connected threat intelligence feeds
                        are currently operational.
                      </p>
                    </div>

                    <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-[11px] text-emerald-400">
                      Healthy
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}