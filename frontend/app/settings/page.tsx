"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  ArrowLeft,
  Bell,
  Check,
  Database,
  KeyRound,
  MonitorCog,
  Save,
  Server,
  Settings,
  ShieldCheck,
  User,
} from "lucide-react";

type ToggleProps = {
  enabled: boolean;
  onChange: () => void;
};

export default function SettingsPage() {
  const [analystName, setAnalystName] = useState("Devendra Sinha");
  const [email, setEmail] = useState("devendra@threatlens.local");
  const [apiUrl, setApiUrl] = useState("http://127.0.0.1:8000");
  const [criticalAlerts, setCriticalAlerts] = useState(true);
  const [highAlerts, setHighAlerts] = useState(true);
  const [feedAlerts, setFeedAlerts] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState("30");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem("threatlens-settings");

    if (!savedSettings) return;

    try {
      const settings = JSON.parse(savedSettings);

      setAnalystName(settings.analystName ?? "Devendra Sinha");
      setEmail(settings.email ?? "devendra@threatlens.local");
      setApiUrl(settings.apiUrl ?? "http://127.0.0.1:8000");
      setCriticalAlerts(settings.criticalAlerts ?? true);
      setHighAlerts(settings.highAlerts ?? true);
      setFeedAlerts(settings.feedAlerts ?? true);
      setAutoRefresh(settings.autoRefresh ?? true);
      setRefreshInterval(settings.refreshInterval ?? "30");
    } catch {
      localStorage.removeItem("threatlens-settings");
    }
  }, []);

  function saveSettings() {
    localStorage.setItem(
      "threatlens-settings",
      JSON.stringify({
        analystName,
        email,
        apiUrl,
        criticalAlerts,
        highAlerts,
        feedAlerts,
        autoRefresh,
        refreshInterval,
      }),
    );

    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 2500);
  }

  return (
    <main className="min-h-screen bg-[#07090d] text-slate-100">
      <header className="border-b border-white/10 bg-[#090c11]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
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

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-[0.2em] text-violet-400">
            <Settings className="h-4 w-4" />
            SYSTEM CONFIGURATION
          </p>

          <h2 className="text-4xl font-bold">Settings</h2>

          <p className="mt-3 text-slate-500">
            Manage your ThreatLens profile, API and notification preferences.
          </p>
        </div>

        {saved && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-400">
            <Check className="h-5 w-5" />
            Settings saved successfully.
          </div>
        )}

        <div className="space-y-6">
          <SettingsSection
            icon={<User className="h-5 w-5 text-violet-400" />}
            title="Analyst profile"
            description="Manage the analyst information shown in ThreatLens."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <InputField
                label="Analyst name"
                value={analystName}
                onChange={setAnalystName}
                placeholder="Enter analyst name"
              />

              <InputField
                label="Email address"
                value={email}
                onChange={setEmail}
                placeholder="Enter email address"
                type="email"
              />
            </div>
          </SettingsSection>

          <SettingsSection
            icon={<Server className="h-5 w-5 text-blue-400" />}
            title="API configuration"
            description="Configure the FastAPI backend connection."
          >
            <InputField
              label="Backend API URL"
              value={apiUrl}
              onChange={setApiUrl}
              placeholder="http://127.0.0.1:8000"
            />

            <div className="mt-4 flex items-start gap-3 rounded-xl border border-blue-500/20 bg-blue-500/[0.06] p-4">
              <Database className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" />

              <div>
                <p className="text-sm font-medium text-blue-300">
                  Local database connection
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  ThreatLens currently uses the SQLite database through the
                  FastAPI backend.
                </p>
              </div>
            </div>
          </SettingsSection>

          <SettingsSection
            icon={<Bell className="h-5 w-5 text-red-400" />}
            title="Alert notifications"
            description="Select which security events should generate notifications."
          >
            <div className="space-y-3">
              <SettingRow
                title="Critical threat alerts"
                description="Notify when a critical indicator is detected."
              >
                <Toggle
                  enabled={criticalAlerts}
                  onChange={() => setCriticalAlerts((value) => !value)}
                />
              </SettingRow>

              <SettingRow
                title="High-severity alerts"
                description="Notify when a high-risk indicator is detected."
              >
                <Toggle
                  enabled={highAlerts}
                  onChange={() => setHighAlerts((value) => !value)}
                />
              </SettingRow>

              <SettingRow
                title="Feed health alerts"
                description="Notify when an intelligence feed becomes unavailable."
              >
                <Toggle
                  enabled={feedAlerts}
                  onChange={() => setFeedAlerts((value) => !value)}
                />
              </SettingRow>
            </div>
          </SettingsSection>

          <SettingsSection
            icon={<MonitorCog className="h-5 w-5 text-cyan-400" />}
            title="Dashboard preferences"
            description="Control automatic dashboard updates."
          >
            <SettingRow
              title="Automatic refresh"
              description="Automatically refresh threat information."
            >
              <Toggle
                enabled={autoRefresh}
                onChange={() => setAutoRefresh((value) => !value)}
              />
            </SettingRow>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Refresh interval
              </label>

              <select
                value={refreshInterval}
                onChange={(event) =>
                  setRefreshInterval(event.target.value)
                }
                disabled={!autoRefresh}
                className="w-full rounded-xl border border-white/10 bg-[#080b10] px-4 py-3 text-sm text-slate-300 outline-none disabled:cursor-not-allowed disabled:opacity-40 md:w-64"
              >
                <option value="15">Every 15 seconds</option>
                <option value="30">Every 30 seconds</option>
                <option value="60">Every 1 minute</option>
                <option value="300">Every 5 minutes</option>
              </select>
            </div>
          </SettingsSection>

          <SettingsSection
            icon={<KeyRound className="h-5 w-5 text-orange-400" />}
            title="Security"
            description="Current application security status."
          >
            <div className="grid gap-4 md:grid-cols-3">
              <StatusCard
                title="API status"
                value="Connected"
                color="text-emerald-400"
              />

              <StatusCard
                title="Database"
                value="SQLite"
                color="text-blue-400"
              />

              <StatusCard
                title="Environment"
                value="Development"
                color="text-orange-400"
              />
            </div>
          </SettingsSection>
        </div>

        <div className="mt-7 flex justify-end">
          <button
            type="button"
            onClick={saveSettings}
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-500"
          >
            <Save className="h-4 w-4" />
            Save settings
          </button>
        </div>
      </section>
    </main>
  );
}

function SettingsSection({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#0b0e13]">
      <div className="flex items-start gap-3 border-b border-white/10 px-6 py-5">
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2">
          {icon}
        </div>

        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
      </div>

      <div className="p-6">{children}</div>
    </section>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-300">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-[#080b10] px-4 py-3 text-sm text-slate-200 outline-none placeholder:text-slate-700 focus:border-violet-500/50"
      />
    </div>
  );
}

function SettingRow({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-5 rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div>
        <p className="text-sm font-medium text-slate-300">{title}</p>
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      </div>

      {children}
    </div>
  );
}

function Toggle({ enabled, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onChange}
      className={`relative h-7 w-12 shrink-0 rounded-full transition ${
        enabled ? "bg-violet-600" : "bg-slate-700"
      }`}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
          enabled ? "left-6" : "left-1"
        }`}
      />
    </button>
  );
}

function StatusCard({
  title,
  value,
  color,
}: {
  title: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <p className="text-xs text-slate-500">{title}</p>
      <p className={`mt-2 text-sm font-semibold ${color}`}>{value}</p>
    </div>
  );
}