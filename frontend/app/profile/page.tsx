"use client";

import Link from "next/link";

import {
  ArrowLeft,
  Bell,
  Lock,
  Mail,
  User,
} from "lucide-react";

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-[#07090d] text-slate-100">
    
 <div className="min-h-screen">
        <header className="border-b border-white/10 bg-[#090c11]">
          <div className="flex w-full items-center justify-between px-6 py-5">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-violet-400">
                ACCOUNT
              </p>

              <h1 className="mt-1 text-2xl font-bold">
                Profile Settings
              </h1>
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

        <section className="w-full px-6 py-10">
          <div className="mb-8">
            <p className="mb-3 text-sm font-semibold tracking-[0.2em] text-violet-400">
              USER PROFILE
            </p>

            <h2 className="text-4xl font-bold">
              Your Profile
            </h2>

            <p className="mt-3 text-slate-500">
              View your ThreatLens account information and security status.
            </p>
          </div>

          <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
            {/* Profile card */}
            <article className="rounded-2xl border border-white/10 bg-[#0b0e13] p-6">
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

            {/* Account information */}
            <article className="rounded-2xl border border-white/10 bg-[#0b0e13] p-6">
              <h3 className="text-lg font-semibold">
                Account Information
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Manage your ThreatLens account information.
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <ProfileInfo
                  icon={<User className="h-5 w-5 text-violet-400" />}
                  label="Name"
                  value="Devendra Sinha"
                />

                <ProfileInfo
                  icon={<Mail className="h-5 w-5 text-blue-400" />}
                  label="Email"
                  value="Your registered email"
                />

                <ProfileInfo
                  icon={<Lock className="h-5 w-5 text-amber-400" />}
                  label="Password"
                  value="Protected"
                />

                <ProfileInfo
                  icon={<Bell className="h-5 w-5 text-cyan-400" />}
                  label="Notifications"
                  value="Security alerts enabled"
                />
              </div>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}

function ProfileInfo({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="flex items-center gap-3">
        {icon}

        <div>
          <p className="text-xs text-slate-500">
            {label}
          </p>

          <p className="mt-1 text-sm text-slate-300">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}