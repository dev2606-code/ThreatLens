const threats = [
  {
    indicator: "185.220.101.42",
    type: "IP Address",
    score: 96,
    severity: "Critical",
    source: "AbuseIPDB",
  },
  {
    indicator: "login-secure-update.com",
    type: "Domain",
    score: 88,
    severity: "High",
    source: "URLhaus",
  },
  {
    indicator: "44d88612fea8a8f36de82e1278abb02f",
    type: "File Hash",
    score: 82,
    severity: "High",
    source: "VirusTotal",
  },
  {
    indicator: "91.218.114.11",
    type: "IP Address",
    score: 67,
    severity: "Medium",
    source: "AlienVault OTX",
  },
];

const navItems = [
  "Overview",
  "Indicators",
  "Alerts",
  "Threat Map",
  "Intelligence Feeds",
  "Reports",
];

export default async function Home() {
  const response = await fetch(
    "http://127.0.0.1:8000/api/dashboard/stats",
    {
      cache: "no-store",
    },
  );

  const data = await response.json();

  const stats = [
    {
      title: "Active Indicators",
      value: data.active_indicators.toLocaleString(),
      change: "+12.5%",
      color: "text-cyan-400",
    },
    {
      title: "Critical Threats",
      value: data.critical_threats.toString(),
      change: "+4 today",
      color: "text-red-400",
    },
    {
      title: "Open Alerts",
      value: data.open_alerts.toString(),
      change: "38 assigned",
      color: "text-amber-400",
    },
    {
      title: "Feeds Online",
      value: `${data.feeds_online}/8`,
      change: "All operational",
      color: "text-emerald-400",
    },
  ];

  return (
    <main className="min-h-screen bg-[#05080f] text-slate-100">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 border-r border-white/10 bg-[#080d17] p-5 lg:block">
          <div className="mb-10 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400 font-black text-slate-950">
              TL
            </div>

            <div>
              <h1 className="font-bold tracking-wide">ThreatLens</h1>
              <p className="text-xs text-slate-500">
                Security Intelligence
              </p>
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map((item, index) => (
              <button
                key={item}
                className={`w-full rounded-xl px-4 py-3 text-left text-sm transition ${
                  index === 0
                    ? "bg-cyan-400/10 text-cyan-400"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {item}
              </button>
            ))}
          </nav>

          <div className="mt-12 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4">
            <p className="text-xs text-slate-400">System status</p>

            <div className="mt-2 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <span className="text-sm font-medium text-emerald-400">
                All systems operational
              </span>
            </div>
          </div>
        </aside>

        <section className="flex-1 p-5 md:p-8">
          <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="mb-2 text-sm font-medium text-cyan-400">
                SECURITY OPERATIONS CENTRE
              </p>

              <h2 className="text-3xl font-bold">Threat Overview</h2>

              <p className="mt-2 text-sm text-slate-500">
                Real-time intelligence and security monitoring
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
                Last updated: Just now
              </div>

              <button className="rounded-xl bg-cyan-400 px-5 py-2 font-semibold text-slate-950 transition hover:bg-cyan-300">
                Add Indicator
              </button>
            </div>
          </header>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <article
                key={stat.title}
                className="rounded-2xl border border-white/10 bg-[#0b111d] p-5"
              >
                <p className="text-sm text-slate-500">{stat.title}</p>

                <div className="mt-3 flex items-end justify-between gap-3">
                  <strong className="text-3xl">{stat.value}</strong>

                  <span
                    className={`text-xs font-semibold ${stat.color}`}
                  >
                    {stat.change}
                  </span>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.7fr_1fr]">
            <article className="rounded-2xl border border-white/10 bg-[#0b111d] p-5">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Threat Activity</h3>

                  <p className="text-sm text-slate-500">
                    Indicators detected during the last seven days
                  </p>
                </div>

                <span className="rounded-lg bg-white/5 px-3 py-1 text-xs text-slate-400">
                  Last 7 days
                </span>
              </div>

              <div className="flex h-64 items-end gap-3 border-b border-l border-white/10 px-4 pb-4">
                {[32, 48, 40, 67, 54, 82, 72, 93, 64, 85, 70, 96].map(
                  (height, index) => (
                    <div
                      key={index}
                      className="flex-1 rounded-t bg-gradient-to-t from-cyan-500/30 to-cyan-400"
                      style={{ height: `${height}%` }}
                    />
                  ),
                )}
              </div>
            </article>

            <article className="rounded-2xl border border-white/10 bg-[#0b111d] p-5">
              <h3 className="font-semibold">Threat Distribution</h3>

              <p className="text-sm text-slate-500">
                By severity level
              </p>

              <div className="mt-8 flex justify-center">
                <div className="flex h-40 w-40 items-center justify-center rounded-full border-[22px] border-cyan-400 shadow-[0_0_40px_rgba(34,211,238,0.18)]">
                  <div className="text-center">
                    <p className="text-3xl font-bold">12.8K</p>
                    <p className="text-xs text-slate-500">Total IOCs</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3 text-sm">
                <p className="text-red-400">● Critical: 24</p>
                <p className="text-orange-400">● High: 147</p>
                <p className="text-amber-400">● Medium: 681</p>
                <p className="text-emerald-400">● Low: 11,995</p>
              </div>
            </article>
          </div>

          <article className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-[#0b111d]">
            <div className="flex items-center justify-between border-b border-white/10 p-5">
              <div>
                <h3 className="font-semibold">
                  Latest Threat Intelligence
                </h3>

                <p className="text-sm text-slate-500">
                  Recently detected indicators of compromise
                </p>
              </div>

              <button className="text-sm font-medium text-cyan-400">
                View all
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead className="text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Indicator</th>
                    <th className="px-5 py-4">Type</th>
                    <th className="px-5 py-4">Risk score</th>
                    <th className="px-5 py-4">Severity</th>
                    <th className="px-5 py-4">Source</th>
                  </tr>
                </thead>

                <tbody>
                  {threats.map((threat) => (
                    <tr
                      key={threat.indicator}
                      className="border-t border-white/5 text-sm"
                    >
                      <td className="max-w-72 truncate px-5 py-4 font-mono text-slate-200">
                        {threat.indicator}
                      </td>

                      <td className="px-5 py-4 text-slate-400">
                        {threat.type}
                      </td>

                      <td className="px-5 py-4 font-semibold">
                        {threat.score}/100
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            threat.severity === "Critical"
                              ? "bg-red-400/10 text-red-400"
                              : threat.severity === "High"
                                ? "bg-orange-400/10 text-orange-400"
                                : "bg-amber-400/10 text-amber-400"
                          }`}
                        >
                          {threat.severity}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-slate-400">
                        {threat.source}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}