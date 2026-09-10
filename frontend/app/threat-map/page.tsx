"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowLeft,
  Globe2,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Wifi,
} from "lucide-react";

type Indicator = {
  id: number;
  value: string;
  indicator_type: string;
  severity_score: number;
  severity: string;
  source: string;
  status: string;
  description: string | null;
  created_at: string;
};

type ThreatPoint = {
  id: number;
  city: string;
  country: string;
  x: number;
  y: number;
  severity: "Critical" | "High" | "Medium" | "Low";
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

const threatPoints: ThreatPoint[] = [
  {
    id: 1,
    city: "New York",
    country: "United States",
    x: 24,
    y: 37,
    severity: "Critical",
  },
  {
    id: 2,
    city: "São Paulo",
    country: "Brazil",
    x: 34,
    y: 70,
    severity: "High",
  },
  {
    id: 3,
    city: "London",
    country: "United Kingdom",
    x: 47,
    y: 31,
    severity: "Medium",
  },
  {
    id: 4,
    city: "Moscow",
    country: "Russia",
    x: 59,
    y: 27,
    severity: "Critical",
  },
  {
    id: 5,
    city: "Mumbai",
    country: "India",
    x: 67,
    y: 54,
    severity: "High",
  },
  {
    id: 6,
    city: "Singapore",
    country: "Singapore",
    x: 77,
    y: 65,
    severity: "Medium",
  },
  {
    id: 7,
    city: "Tokyo",
    country: "Japan",
    x: 88,
    y: 42,
    severity: "Critical",
  },
  {
    id: 8,
    city: "Sydney",
    country: "Australia",
    x: 87,
    y: 79,
    severity: "Low",
  },
];

function severityColor(severity: ThreatPoint["severity"]) {
  if (severity === "Critical") return "#fb4b62";
  if (severity === "High") return "#ff922b";
  if (severity === "Medium") return "#8b5cf6";
  return "#22d3ee";
}

export default function ThreatMapPage() {
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedThreat, setSelectedThreat] =
    useState<ThreatPoint | null>(threatPoints[0]);

  const loadThreats = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/indicators`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Unable to load threat information");
      }

      const data: Indicator[] = await response.json();
      setIndicators(Array.isArray(data) ? data : []);
    } catch {
      setIndicators([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadThreats();
  }, [loadThreats]);

  const criticalCount = useMemo(
    () =>
      indicators.filter(
        (indicator) => indicator.severity?.toLowerCase() === "critical",
      ).length,
    [indicators],
  );

  const highCount = useMemo(
    () =>
      indicators.filter(
        (indicator) => indicator.severity?.toLowerCase() === "high",
      ).length,
    [indicators],
  );

  const recentIndicators = indicators.slice(0, 5);

  return (
    <main className="min-h-screen bg-[#07090d] text-slate-100">
      <header className="border-b border-white/10 bg-[#090c11]">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-6 py-5">
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

      <section className="mx-auto max-w-[1500px] px-6 py-9">
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-[0.2em] text-violet-400">
              <Globe2 className="h-4 w-4" />
              GLOBAL MONITORING
            </p>

            <h2 className="text-4xl font-bold">Live Threat Map</h2>

            <p className="mt-3 text-slate-500">
              Monitor global cyber threat activity and active indicators.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadThreats()}
            className="flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-[#0d1117] px-4 py-3 text-sm text-slate-300 hover:border-violet-500/40 hover:text-white"
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh data
          </button>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Active indicators"
            value={indicators.length}
            color="text-violet-400"
          />

          <StatCard
            title="Critical threats"
            value={criticalCount}
            color="text-red-400"
          />

          <StatCard
            title="High severity"
            value={highCount}
            color="text-orange-400"
          />

          <StatCard
            title="Monitored regions"
            value={threatPoints.length}
            color="text-cyan-400"
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b0e13]">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <div>
                <h3 className="font-semibold">Global threat activity</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Select a location to inspect activity.
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-400">
                <Wifi className="h-3.5 w-3.5" />
                Live monitoring
              </div>
            </div>

            <div className="relative min-h-[540px] overflow-hidden bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.12),transparent_60%)]">
              <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(139,92,246,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.15)_1px,transparent_1px)] [background-size:45px_45px]" />

              <svg
                viewBox="0 0 1000 520"
                className="absolute inset-0 h-full w-full"
                aria-label="Global threat map"
              >
                <path
                  d="M85 190 C110 105 230 80 315 135 C350 160 325 205 275 210 C225 215 210 260 165 245 C120 230 65 235 85 190Z"
                  fill="#251b48"
                  stroke="#7047ca"
                  strokeWidth="2"
                />

                <path
                  d="M270 275 C330 275 370 330 350 395 C335 450 295 485 270 430 C250 385 220 350 235 305 C242 285 255 277 270 275Z"
                  fill="#251b48"
                  stroke="#7047ca"
                  strokeWidth="2"
                />

                <path
                  d="M430 145 C485 95 565 105 605 145 C635 175 605 205 550 195 C515 188 490 225 450 215 C410 205 397 175 430 145Z"
                  fill="#251b48"
                  stroke="#7047ca"
                  strokeWidth="2"
                />

                <path
                  d="M475 230 C535 210 585 260 570 330 C555 395 515 430 470 385 C430 345 420 270 475 230Z"
                  fill="#251b48"
                  stroke="#7047ca"
                  strokeWidth="2"
                />

                <path
                  d="M590 145 C670 95 825 110 900 170 C945 205 890 240 825 220 C770 205 730 250 675 225 C625 205 550 180 590 145Z"
                  fill="#251b48"
                  stroke="#7047ca"
                  strokeWidth="2"
                />

                <path
                  d="M785 350 C825 310 900 335 925 385 C945 430 885 455 830 440 C775 425 750 385 785 350Z"
                  fill="#251b48"
                  stroke="#7047ca"
                  strokeWidth="2"
                />

                {threatPoints.map((point) => (
                  <g
                    key={point.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedThreat(point)}
                  >
                    <circle
                      cx={point.x * 10}
                      cy={point.y * 5.2}
                      r="18"
                      fill={severityColor(point.severity)}
                      opacity="0.12"
                    >
                      <animate
                        attributeName="r"
                        values="10;24;10"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                    </circle>

                    <circle
                      cx={point.x * 10}
                      cy={point.y * 5.2}
                      r="7"
                      fill={severityColor(point.severity)}
                      stroke="#ffffff"
                      strokeOpacity="0.45"
                      strokeWidth="2"
                    />
                  </g>
                ))}
              </svg>

              <div className="absolute bottom-5 left-5 flex flex-wrap gap-3 rounded-xl border border-white/10 bg-black/60 p-3 text-xs backdrop-blur">
                {["Critical", "High", "Medium", "Low"].map((severity) => (
                  <span
                    key={severity}
                    className="flex items-center gap-2 text-slate-400"
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{
                        backgroundColor: severityColor(
                          severity as ThreatPoint["severity"],
                        ),
                      }}
                    />
                    {severity}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-[#0b0e13] p-6">
              <h3 className="flex items-center gap-2 font-semibold">
                <MapPin className="h-5 w-5 text-violet-400" />
                Selected location
              </h3>

              {selectedThreat && (
                <div className="mt-6">
                  <div
                    className="mb-5 h-1.5 rounded-full"
                    style={{
                      backgroundColor: severityColor(
                        selectedThreat.severity,
                      ),
                    }}
                  />

                  <p className="text-2xl font-bold">{selectedThreat.city}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {selectedThreat.country}
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <InfoBox
                      label="Severity"
                      value={selectedThreat.severity}
                    />
                    <InfoBox
                      label="Status"
                      value="Active"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0b0e13]">
              <div className="border-b border-white/10 p-5">
                <h3 className="flex items-center gap-2 font-semibold">
                  <Activity className="h-5 w-5 text-cyan-400" />
                  Recent indicators
                </h3>
              </div>

              <div className="divide-y divide-white/5">
                {recentIndicators.length === 0 ? (
                  <p className="p-6 text-sm text-slate-500">
                    No indicators available.
                  </p>
                ) : (
                  recentIndicators.map((indicator) => (
                    <div key={indicator.id} className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <p className="truncate font-mono text-sm text-slate-300">
                          {indicator.value}
                        </p>

                        <span
                          className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                            indicator.severity === "Critical"
                              ? "bg-red-500/10 text-red-400"
                              : indicator.severity === "High"
                                ? "bg-orange-500/10 text-orange-400"
                                : "bg-violet-500/10 text-violet-400"
                          }`}
                        >
                          {indicator.severity}
                        </span>
                      </div>

                      <p className="mt-2 text-xs text-slate-600">
                        {indicator.indicator_type} • Score{" "}
                        {indicator.severity_score}/100
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function StatCard({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0b0e13] p-5">
      <p className="text-sm text-slate-500">{title}</p>
      <p className={`mt-3 text-3xl font-bold ${color}`}>{value}</p>
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
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-200">{value}</p>
    </div>
  );
}