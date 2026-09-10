"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  BellRing,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
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

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export default function AlertsPage() {
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [acknowledged, setAcknowledged] = useState<number[]>([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/indicators`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data: Indicator[] = await response.json();
      setIndicators(Array.isArray(data) ? data : []);
    } catch {
      setError(
        "Alerts load nahi hue. Check karein ki backend port 8000 par running hai.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAlerts();
  }, [loadAlerts]);

  const alerts = useMemo(() => {
    return indicators.filter((indicator) => {
      const severity = indicator.severity?.toLowerCase();
      return severity === "critical" || severity === "high";
    });
  }, [indicators]);

  const filteredAlerts = useMemo(() => {
    if (filter === "All") return alerts;

    return alerts.filter(
      (alert) => alert.severity.toLowerCase() === filter.toLowerCase(),
    );
  }, [alerts, filter]);

  const criticalCount = alerts.filter(
    (alert) => alert.severity.toLowerCase() === "critical",
  ).length;

  const highCount = alerts.filter(
    (alert) => alert.severity.toLowerCase() === "high",
  ).length;

  function toggleAcknowledged(id: number) {
    setAcknowledged((current) =>
      current.includes(id)
        ? current.filter((alertId) => alertId !== id)
        : [...current, id],
    );
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
              <p className="text-xs tracking-[0.2em] text-slate-500">
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
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-[0.2em] text-red-400">
              <BellRing className="h-4 w-4" />
              SECURITY ALERTS
            </p>

            <h2 className="text-4xl font-bold">Alert Centre</h2>

            <p className="mt-3 text-slate-500">
              Review critical and high-risk threat indicators.
            </p>
          </div>

          <div className="flex gap-3">
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="rounded-xl border border-white/10 bg-[#0d1117] px-4 py-3 text-sm text-slate-300 outline-none"
            >
              <option value="All">All alerts</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
            </select>

            <button
              type="button"
              onClick={() => void loadAlerts()}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0d1117] px-4 py-3 text-sm text-slate-300 hover:text-white"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>

        <div className="mb-7 grid gap-4 md:grid-cols-3">
          <StatCard
            title="Open alerts"
            value={alerts.length}
            styleName="border-blue-500/20 text-blue-400"
          />

          <StatCard
            title="Critical"
            value={criticalCount}
            styleName="border-red-500/20 text-red-400"
          />

          <StatCard
            title="High severity"
            value={highCount}
            styleName="border-orange-500/20 text-orange-400"
          />
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}

        <div className="rounded-2xl border border-white/10 bg-[#0b0e13]">
          {loading ? (
            <div className="flex min-h-72 items-center justify-center">
              <RefreshCw className="h-8 w-8 animate-spin text-violet-400" />
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
              <CheckCircle2 className="mb-4 h-12 w-12 text-emerald-400" />

              <h3 className="text-lg font-semibold">No matching alerts</h3>

              <p className="mt-2 text-sm text-slate-500">
                No critical or high-severity indicators require review.
              </p>
            </div>
          ) : (
            <div className="space-y-4 p-5">
              {filteredAlerts.map((alert) => {
                const isCritical =
                  alert.severity.toLowerCase() === "critical";

                const isAcknowledged = acknowledged.includes(alert.id);

                return (
                  <article
                    key={alert.id}
                    className={`rounded-xl border p-5 ${
                      isCritical
                        ? "border-red-500/30 bg-red-500/[0.04]"
                        : "border-orange-500/30 bg-orange-500/[0.04]"
                    }`}
                  >
                    <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
                      <div className="flex min-w-0 gap-4">
                        <div
                          className={`h-fit rounded-xl p-3 ${
                            isCritical
                              ? "bg-red-500/15 text-red-400"
                              : "bg-orange-500/15 text-orange-400"
                          }`}
                        >
                          <AlertTriangle className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">
                          <div className="mb-2 flex flex-wrap items-center gap-3">
                            <h3 className="break-all font-mono font-semibold text-white">
                              {alert.value}
                            </h3>

                            <span
                              className={`rounded-full border px-3 py-1 text-xs ${
                                isCritical
                                  ? "border-red-500/30 bg-red-500/10 text-red-400"
                                  : "border-orange-500/30 bg-orange-500/10 text-orange-400"
                              }`}
                            >
                              {alert.severity}
                            </span>
                          </div>

                          <p className="text-sm text-slate-400">
                            {alert.description || "No description provided."}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                            <span>Type: {alert.indicator_type}</span>
                            <span>Source: {alert.source}</span>
                            <span>Risk: {alert.severity_score}/100</span>
                            <span>
                              Detected:{" "}
                              {new Date(alert.created_at).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleAcknowledged(alert.id)}
                        className={`flex shrink-0 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm ${
                          isAcknowledged
                            ? "border-white/10 text-slate-400"
                            : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                        }`}
                      >
                        <CheckCircle2 className="h-4 w-4" />

                        {isAcknowledged
                          ? "Undo acknowledge"
                          : "Acknowledge"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function StatCard({
  title,
  value,
  styleName,
}: {
  title: string;
  value: number;
  styleName: string;
}) {
  return (
    <div
      className={`rounded-2xl border bg-[#0b0e13] p-6 ${styleName}`}
    >
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-3 text-3xl font-bold">{value}</p>
    </div>
  );
}