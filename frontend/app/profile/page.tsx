"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  Lock,
  Mail,
  ShieldCheck,
  User,
} from "lucide-react";

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-[#030509] text-slate-100">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-white/[0.07] bg-[#050810] lg:flex lg:flex-col">
          <div className="flex h-20 items-center border-b border-white/[0.07] px-6">
            <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/30 bg-violet-500/10">
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
            <Link
              href="/"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-500 transition hover:bg-white/[0.04] hover:text-slate-200"
            >
              <ArrowLeft className="h-[18px] w-[18px]" />
              Back to Overview
            </Link>

            <Link
              href="/settings"
              className="flex items-center gap-3 rounded-xl border border-violet-500/20 bg-violet-500/10 px-4 py-3 text-sm text-violet-300"
            >
              <User className="h-[18px] w-[18px]" />
              Profile
            </Link>
          </nav>

          <div className="m-4 rounded-2xl border border-violet-500/15 bg-gradient-to-b from-violet-500/10 to-transparent p-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <p className="text-xs font-medium text-emerald-400">
                System Operational
              </p>
            </div>

            <p className="text-xs leading-5 text-slate-500">
              All threat feeds and monitoring services are online.
            </p>
          </div>
        </aside>

        {/* Main */}
        <section className="min-w-0 flex-1 lg:ml-64">
          <header className="flex min-h-20 items-center border-b border-white/[0.07] bg-[#030509]/95 px-5 md:px-8">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.18em] text-violet-400">
                ACCOUNT
              </p>
              <h2 className="mt-1 text-2xl font-bold">Profile Settings</h2>
            </div>
          </header>

          <div className="p-5 md:p-8">
            <Link
              href="/"
              className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Overview
            </Link>

            <div className="grid max-w-5xl gap-5 xl:grid-cols-[0.8fr_1.2fr]">
              {/* Profile card */}
              <article className="rounded-2xl border border-white/[0.08] bg-[#080c14] p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500 to-blue-500 shadow-[0_0_35px_rgba(139,92,246,0.25)]">
                    <User className="h-10 w-10 text-white" />
                  </div>

                  <h3 className="mt-5 text-xl font-semibold">
                    Devendra Sinha
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Threat Analyst
                  </p>

                  <div className="mt-5 flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 text-xs text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    Account Active
                  </div>
                </div>
              </article>

              {/* Account details */}
              <article className="rounded-2xl border border-white/[0.08] bg-[#080c14] p-6">
                <h3 className="text-lg font-semibold">Account Information</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Manage your ThreatLens account information.
                </p>

                <div className="mt-6 space-y-4">
                  <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-violet-400" />
                      <div>
                        <p className="text-xs text-slate-500">Name</p>
                        <p className="mt-1 text-sm">Devendra Sinha</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-blue-400" />
                      <div>
                        <p className="text-xs text-slate-500">Email</p>
                        <p className="mt-1 text-sm text-slate-300">
                          Your registered email
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
                    <div className="flex items-center gap-3">
                      <Lock className="h-5 w-5 text-amber-400" />
                      <div>
                        <p className="text-xs text-slate-500">Password</p>
                        <p className="mt-1 text-sm text-slate-300">
                          Protected
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
                    <div className="flex items-center gap-3">
                      <Bell className="h-5 w-5 text-cyan-400" />
                      <div>
                        <p className="text-xs text-slate-500">
                          Notifications
                        </p>
                        <p className="mt-1 text-sm text-slate-300">
                          Security alerts enabled
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}