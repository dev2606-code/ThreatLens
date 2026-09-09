"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  CircleAlert,
  RefreshCw,
  ShieldCheck,
  Siren,
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

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Indicator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [acknowledged, setAcknowledged] = useState<number[]>([]);

  const loadAlerts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/indicators",
        {
          cache: "no-store",
        },
      );

      if (!response.ok) {
        throw new Error("Unable to load alerts");
      }

      const indicators: Indicator[] = await response.json();

      const highRiskIndicators = indicators.filter(
        (indicator) =>
          indicator.severity === "Critical" ||
          indicator.severity === "High",
      );

      setAlerts(highRiskIndicators);
    } catch {
      setError(
        "Backend connection failed. Make sure FastAPI is running.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  const filteredAlerts = useMemo(() => {
    if (filter === "All") {
      return alerts;
    }

    return alerts.filter(
      (alert) => alert.severity === filter,
    );
  }, [alerts, filter]);

  const criticalCount = alerts.filter(
    (alert) => alert.severity === "Critical",
  ).length;

  const highCount = alerts.filter(
    (alert) => alert.severity === "High",
  ).length;

  function acknowledgeAlert(alertId: number) {
    setAcknowledged((current) => {
      if (current.includes(alertId)) {
        return current.filter((id) => id !== alertId);
      }

      return [...current, alertId];
    });
  }

  return (
    <main className="min-h-screen bg-[#030509] text-slate-100">
      <header className="border-b border-white/[0.07] bg-[#050810]">
        <div className="mx-auto flex min-h-20 max-w-[1500px] items-center justify-between px-5 md:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-500/30 bg-violet-500/10">
              <ShieldCheck className="h-5 w-5 text-violet-400" />
            </div>

            <div>
              <h1 className="text-lg font-bold">
                Threat<span className="text-violet-400">Lens</span>
              </h1>

              <p className="text-[9px] tracking-[0.18em] text-slate-600">
                SECURITY INTELLIGENCE
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-slate-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-[1500px] p-5 md:p-8">
        <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-red-400">
              <Siren className="h-4 w-4" />
              SECURITY ALERTS
            </div>

            <h2 className="text-3xl font-bold md:text-4xl">
              Alert Centre
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Review critical and high-risk threat indicators.
            </p>
          </div>

          <div className="flex gap-3">
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="rounded-xl border border-white/[0.08] bg-[#080c14] px-4 py-2.5 text-sm outline-none focus:border-violet-500/50"
            >
              <option>All</option>
              <option>Critical</option>
              <option>High</option>
            </select>

            <button
              type="button"
              onClick={loadAlerts}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-slate-400 transition hover:text-white disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  loading ? "animate-spin" : ""
                }`}
              />
              Refresh
            </button>
          </div>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <article className="rounded-2xl border border-white/[0.08] bg-[#080c14] p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Open alerts
              </p>

              <Bell className="h-5 w-5 text-blue-400" />
            </div>

            <strong className="mt-3 block text-3xl">
              {alerts.length}
            </strong>
          </article>

          <article className="rounded-2xl border border-red-500/20 bg-[#080c14] p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Critical
              </p>

              <CircleAlert className="h-5 w-5 text-red-400" />
            </div>

            <strong className="mt-3 block text-3xl text-red-400">
              {criticalCount}
            </strong>
          </article>

          <article className="rounded-2xl border border-orange-500/20 bg-[#080c14] p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                High severity
              </p>

              <Siren className="h-5 w-5 text-orange-400" />
            </div>

            <strong className="mt-3 block text-3xl text-orange-400">
              {highCount}
            </strong>
          </article>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-400">
            {error}
          </div>
        )}

        {!error && loading && (
          <div className="rounded-2xl border border-white/[0.08] bg-[#080c14] p-12 text-center text-slate-500">
            Loading security alerts...
          </div>
        )}

        {!error &&
          !loading &&
          filteredAlerts.length === 0 && (
            <div className="rounded-2xl border border-white/[0.08] bg-[#080c14] p-12 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" />

              <h3 className="mt-4 font-semibold">
                No matching alerts
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                No critical or high-severity indicators require review.
              </p>
            </div>
          )}

        {!error &&
          !loading &&
          filteredAlerts.length > 0 && (
            <div className="space-y-4">
              {filteredAlerts.map((alert) => {
                const isAcknowledged =
                  acknowledged.includes(alert.id);

                const isCritical =
                  alert.severity === "Critical";

                return (
                  <article
                    key={alert.id}
                    className={`rounded-2xl border bg-[#080c14] p-5 transition ${
                      isAcknowledged
                        ? "border-emerald-500/20 opacity-70"
                        : isCritical
                          ? "border-red-500/25 hover:border-red-500/45"
                          : "border-orange-500/25 hover:border-orange-500/45"
                    }`}
                  >
                    <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                      <div className="flex min-w-0 gap-4">
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                            isCritical
                              ? "bg-red-500/10 text-red-400"
                              : "bg-orange-500/10 text-orange-400"
                          }`}
                        >
                          {isCritical ? (
                            <CircleAlert className="h-6 w-6" />
                          ) : (
                            <Siren className="h-6 w-6" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="max-w-xl truncate font-mono text-sm text-blue-300">
                              {alert.value}
                            </h3>

                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                isCritical
                                  ? "bg-red-500/10 text-red-400"
                                  : "bg-orange-500/10 text-orange-400"
                              }`}
                            >
                              {alert.severity}
                            </span>

                            {isAcknowledged && (
                              <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-400">
                                Acknowledged
                              </span>
                            )}
                          </div>

                          <p className="mt-2 text-sm text-slate-500">
                            {alert.description ||
                              "No additional threat context provided."}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-600">
                            <span>
                              Type: {alert.indicator_type}
                            </span>

                            <span>
                              Source: {alert.source}
                            </span>

                            <span>
                              Risk: {alert.severity_score}/100
                            </span>

                            <span>
                              Detected:{" "}
                              {new Date(
                                alert.created_at,
                              ).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          acknowledgeAlert(alert.id)
                        }
                        className={`flex shrink-0 items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition ${
                          isAcknowledged
                            ? "border-white/[0.08] text-slate-400 hover:text-white"
                            : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/15"
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
      </section>
    </main>
  );
}