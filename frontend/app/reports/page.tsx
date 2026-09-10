"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  Download,
  FileText,
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

export default function ReportsPage() {
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadIndicators = useCallback(async () => {
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
        "Report data load nahi hua. Check karein ki backend port 8000 par running hai.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadIndicators();
  }, [loadIndicators]);

  const reportStats = useMemo(() => {
    const critical = indicators.filter(
      (item) => item.severity?.toLowerCase() === "critical",
    ).length;

    const high = indicators.filter(
      (item) => item.severity?.toLowerCase() === "high",
    ).length;

    const medium = indicators.filter(
      (item) => item.severity?.toLowerCase() === "medium",
    ).length;

    const low = indicators.filter(
      (item) => item.severity?.toLowerCase() === "low",
    ).length;

    return {
      total: indicators.length,
      critical,
      high,
      medium,
      low,
    };
  }, [indicators]);

  const maxSeverityValue = Math.max(
    reportStats.critical,
    reportStats.high,
    reportStats.medium,
    reportStats.low,
    1,
  );

  function exportCsv() {
    if (indicators.length === 0) {
      window.alert("Export karne ke liye indicator data available nahi hai.");
      return;
    }

    const headers = [
      "ID",
      "Indicator",
      "Type",
      "Risk Score",
      "Severity",
      "Source",
      "Status",
      "Description",
      "Created At",
    ];

    const rows = indicators.map((indicator) => [
      indicator.id,
      indicator.value,
      indicator.indicator_type,
      indicator.severity_score,
      indicator.severity,
      indicator.source,
      indicator.status,
      indicator.description ?? "",
      indicator.created_at,
    ]);

    const escapeCell = (value: string | number) =>
      `"${String(value).replaceAll('"', '""')}"`;

    const csvContent = [
      headers.map(escapeCell).join(","),
      ...rows.map((row) => row.map(escapeCell).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `threatlens-report-${
      new Date().toISOString().split("T")[0]
    }.csv`;

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
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
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-[0.2em] text-violet-400">
              <FileText className="h-4 w-4" />
              SECURITY REPORTING
            </p>

            <h2 className="text-4xl font-bold">Threat Reports</h2>

            <p className="mt-3 text-slate-500">
              Review and export threat-intelligence information.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => void loadIndicators()}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0d1117] px-4 py-3 text-sm text-slate-300 hover:text-white"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  loading ? "animate-spin" : ""
                }`}
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={exportCsv}
              className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-500"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}

        <div className="mb-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total indicators"
            value={reportStats.total}
            icon={<BarChart3 className="h-5 w-5 text-violet-400" />}
            valueColor="text-violet-400"
          />

          <StatCard
            title="Critical threats"
            value={reportStats.critical}
            icon={<AlertTriangle className="h-5 w-5 text-red-400" />}
            valueColor="text-red-400"
          />

          <StatCard
            title="High severity"
            value={reportStats.high}
            icon={<AlertTriangle className="h-5 w-5 text-orange-400" />}
            valueColor="text-orange-400"
          />

          <StatCard
            title="Active records"
            value={
              indicators.filter(
                (item) => item.status?.toLowerCase() === "active",
              ).length
            }
            icon={<CheckCircle2 className="h-5 w-5 text-emerald-400" />}
            valueColor="text-emerald-400"
          />
        </div>

        <div className="mb-7 grid gap-6 lg:grid-cols-[420px_1fr]">
          <section className="rounded-2xl border border-white/10 bg-[#0b0e13] p-6">
            <div className="mb-7">
              <h3 className="font-semibold">Severity distribution</h3>
              <p className="mt-1 text-sm text-slate-500">
                Indicators grouped by risk severity.
              </p>
            </div>

            <div className="space-y-6">
              <SeverityBar
                label="Critical"
                value={reportStats.critical}
                maximum={maxSeverityValue}
                color="bg-red-500"
              />

              <SeverityBar
                label="High"
                value={reportStats.high}
                maximum={maxSeverityValue}
                color="bg-orange-500"
              />

              <SeverityBar
                label="Medium"
                value={reportStats.medium}
                maximum={maxSeverityValue}
                color="bg-violet-500"
              />

              <SeverityBar
                label="Low"
                value={reportStats.low}
                maximum={maxSeverityValue}
                color="bg-cyan-500"
              />
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#0b0e13] p-6">
            <h3 className="font-semibold">Report summary</h3>
            <p className="mt-1 text-sm text-slate-500">
              Current ThreatLens database overview.
            </p>

            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <SummaryItem
                label="Generated"
                value={new Date().toLocaleDateString()}
              />

              <SummaryItem
                label="Report format"
                value="CSV"
              />

              <SummaryItem
                label="Data source"
                value="ThreatLens API"
              />

              <SummaryItem
                label="Current status"
                value={error ? "API unavailable" : "Ready"}
              />
            </div>

            <div className="mt-6 rounded-xl border border-violet-500/20 bg-violet-500/[0.06] p-4">
              <p className="text-sm leading-6 text-slate-400">
                Exported report mein indicator value, type, risk score,
                severity, source, status, description aur creation date
                include honge.
              </p>
            </div>
          </section>
        </div>

        <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b0e13]">
          <div className="border-b border-white/10 px-6 py-5">
            <h3 className="font-semibold">Latest threat records</h3>

            <p className="mt-1 text-sm text-slate-500">
              Recently stored threat indicators.
            </p>
          </div>

          {loading ? (
            <div className="flex min-h-60 items-center justify-center">
              <RefreshCw className="h-8 w-8 animate-spin text-violet-400" />
            </div>
          ) : indicators.length === 0 ? (
            <div className="flex min-h-60 flex-col items-center justify-center px-6 text-center">
              <FileText className="mb-4 h-12 w-12 text-slate-700" />
              <h4 className="font-semibold">No report data</h4>
              <p className="mt-2 text-sm text-slate-500">
                Add an indicator from the Dashboard to generate report data.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-600">
                  <tr>
                    <th className="px-6 py-4">Indicator</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Risk</th>
                    <th className="px-6 py-4">Severity</th>
                    <th className="px-6 py-4">Source</th>
                    <th className="px-6 py-4">Added</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5">
                  {indicators.slice(0, 8).map((indicator) => (
                    <tr
                      key={indicator.id}
                      className="transition hover:bg-white/[0.02]"
                    >
                      <td className="max-w-xs truncate px-6 py-4 font-mono text-sm text-blue-400">
                        {indicator.value}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-400">
                        {indicator.indicator_type}
                      </td>

                      <td className="px-6 py-4 text-sm font-semibold">
                        {indicator.severity_score}/100
                      </td>

                      <td className="px-6 py-4">
                        <SeverityBadge severity={indicator.severity} />
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-400">
                        {indicator.source}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-500">
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
        </section>
      </section>
    </main>
  );
}

function StatCard({
  title,
  value,
  icon,
  valueColor,
}: {
  title: string;
  value: number;
  icon: ReactNode;
  valueColor: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0b0e13] p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{title}</p>
        {icon}
      </div>

      <p className={`mt-4 text-3xl font-bold ${valueColor}`}>
        {value}
      </p>
    </div>
  );
}

function SeverityBar({
  label,
  value,
  maximum,
  color,
}: {
  label: string;
  value: number;
  maximum: number;
  color: string;
}) {
  const width = value === 0 ? 0 : Math.max((value / maximum) * 100, 6);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-slate-400">{label}</span>
        <span className="font-semibold">{value}</span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-white/5">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <p className="text-xs text-slate-600">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-300">
        {value}
      </p>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const severityName = severity?.toLowerCase();

  const style =
    severityName === "critical"
      ? "border-red-500/30 bg-red-500/10 text-red-400"
      : severityName === "high"
        ? "border-orange-500/30 bg-orange-500/10 text-orange-400"
        : severityName === "medium"
          ? "border-violet-500/30 bg-violet-500/10 text-violet-400"
          : "border-cyan-500/30 bg-cyan-500/10 text-cyan-400";

  return (
    <span className={`rounded-full border px-3 py-1 text-xs ${style}`}>
      {severity}
    </span>
  );
}