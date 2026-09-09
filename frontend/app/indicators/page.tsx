"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Database,
  RefreshCw,
  Search,
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

export default function IndicatorsPage() {
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadIndicators = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/indicators",
        { cache: "no-store" },
      );

      if (!response.ok) {
        throw new Error("Unable to load indicators");
      }

      const data: Indicator[] = await response.json();
      setIndicators(data);
    } catch {
      setError(
        "Backend connection failed. Make sure FastAPI is running.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadIndicators();
  }, [loadIndicators]);

  const filteredIndicators = useMemo(() => {
    const query = search.toLowerCase().trim();

    return indicators.filter((indicator) => {
      const matchesSearch =
        indicator.value.toLowerCase().includes(query) ||
        indicator.indicator_type.toLowerCase().includes(query) ||
        indicator.source.toLowerCase().includes(query);

      const matchesSeverity =
        severity === "All" || indicator.severity === severity;

      return matchesSearch && matchesSeverity;
    });
  }, [indicators, search, severity]);

  function severityStyle(value: string) {
    if (value === "Critical") {
      return "border-red-500/20 bg-red-500/10 text-red-400";
    }

    if (value === "High") {
      return "border-orange-500/20 bg-orange-500/10 text-orange-400";
    }

    if (value === "Medium") {
      return "border-violet-500/20 bg-violet-500/10 text-violet-400";
    }

    return "border-cyan-500/20 bg-cyan-500/10 text-cyan-400";
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
            className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-[1500px] p-5 md:p-8">
        <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="mb-3 text-xs font-semibold tracking-[0.18em] text-violet-400">
              IOC MANAGEMENT
            </p>

            <h2 className="text-3xl font-bold md:text-4xl">
              Threat Indicators
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Search and review indicators stored in ThreatLens.
            </p>
          </div>

          <button
            type="button"
            onClick={loadIndicators}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-slate-400 hover:text-white"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                loading ? "animate-spin" : ""
              }`}
            />
            Refresh data
          </button>
        </div>

        <div className="mb-5 grid gap-4 md:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search indicator, type or source..."
              className="h-12 w-full rounded-xl border border-white/[0.08] bg-[#080c14] pl-11 pr-4 text-sm outline-none placeholder:text-slate-700 focus:border-violet-500/50"
            />
          </div>

          <select
            value={severity}
            onChange={(event) => setSeverity(event.target.value)}
            className="h-12 rounded-xl border border-white/[0.08] bg-[#080c14] px-4 text-sm outline-none"
          >
            <option>All</option>
            <option>Critical</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </div>

        <div className="mb-5 grid gap-4 sm:grid-cols-3">
          <article className="rounded-2xl border border-white/[0.08] bg-[#080c14] p-5">
            <p className="text-sm text-slate-500">Total indicators</p>
            <strong className="mt-2 block text-3xl">
              {indicators.length}
            </strong>
          </article>

          <article className="rounded-2xl border border-red-500/15 bg-[#080c14] p-5">
            <p className="text-sm text-slate-500">
              Critical indicators
            </p>

            <strong className="mt-2 block text-3xl text-red-400">
              {
                indicators.filter(
                  (indicator) =>
                    indicator.severity === "Critical",
                ).length
              }
            </strong>
          </article>

          <article className="rounded-2xl border border-violet-500/15 bg-[#080c14] p-5">
            <p className="text-sm text-slate-500">Search results</p>
            <strong className="mt-2 block text-3xl text-violet-400">
              {filteredIndicators.length}
            </strong>
          </article>
        </div>

        <article className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#080c14]">
          <div className="flex items-center gap-3 border-b border-white/[0.07] p-5">
            <Database className="h-5 w-5 text-violet-400" />

            <div>
              <h3 className="font-semibold">Indicator database</h3>
              <p className="text-xs text-slate-500">
                Ordered by highest severity score.
              </p>
            </div>
          </div>

          {error && (
            <div className="m-5 rounded-xl bg-red-500/10 p-4 text-sm text-red-400">
              {error}
            </div>
          )}

          {!error && loading && (
            <div className="p-12 text-center text-slate-500">
              Loading indicators...
            </div>
          )}

          {!error &&
            !loading &&
            filteredIndicators.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="text-[10px] uppercase tracking-wider text-slate-600">
                    <tr>
                      <th className="px-5 py-4">Indicator</th>
                      <th className="px-5 py-4">Type</th>
                      <th className="px-5 py-4">Risk</th>
                      <th className="px-5 py-4">Severity</th>
                      <th className="px-5 py-4">Source</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4">Added</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredIndicators.map((indicator) => (
                      <tr
                        key={indicator.id}
                        className="border-t border-white/[0.055] hover:bg-white/[0.025]"
                      >
                        <td className="max-w-[300px] truncate px-5 py-4 font-mono text-xs text-blue-300">
                          {indicator.value}
                        </td>

                        <td className="px-5 py-4 text-slate-500">
                          {indicator.indicator_type}
                        </td>

                        <td className="px-5 py-4 font-semibold">
                          {indicator.severity_score}/100
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full border px-2.5 py-1 text-xs ${severityStyle(
                              indicator.severity,
                            )}`}
                          >
                            {indicator.severity}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-slate-500">
                          {indicator.source}
                        </td>

                        <td className="px-5 py-4 text-emerald-400">
                          ● {indicator.status}
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {new Date(
                            indicator.created_at,
                          ).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          {!error &&
            !loading &&
            filteredIndicators.length === 0 && (
              <div className="p-12 text-center text-slate-500">
                No matching indicators found.
              </div>
            )}
        </article>
      </section>
    </main>
  );
}