"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShieldAlert,
  Activity,
  Settings,
  LogOut,
  User,
  X,
  Map,
  FileText,
  Radio,
} from "lucide-react";
interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  active?: string;
}
const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Indicators", href: "/indicators", icon: Activity },
  { name: "Alerts", href: "/alerts", icon: ShieldAlert },
  { name: "Threat Map", href: "/threat-map", icon: Map },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Intelligence Feeds", href: "/intelligence-feeds", icon: Radio },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar({
  isOpen = true,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("threatlens_access_token");
    localStorage.removeItem("threatlens_user");
    window.location.href = "/login";
  };

  return (
    <>
      {isOpen && onClose && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-white/10 bg-[#09090b] text-white transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
          <Link href="/" onClick={onClose} className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600">
              <ShieldAlert size={22} />
            </div>

            <div>
              <h1 className="text-lg font-bold">ThreatLens</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">
                Threat Intelligence
              </p>
            </div>
          </Link>

          {onClose && (
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 hover:bg-white/10 md:hidden"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <nav className="flex-1 space-y-2 px-3 py-6">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-widest text-gray-500">
            Main Menu
          </p>

          {navigation.map((item) => {
            const Icon = item.icon;

            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-violet-600/15 text-violet-400"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={19} />
                <span>{item.name}</span>

                {isActive && (
                  <span className="ml-auto h-2 w-2 rounded-full bg-violet-500" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          <div className="mb-2 flex items-center gap-3 rounded-xl bg-white/[0.03] px-3 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-600/20 text-violet-400">
              <User size={18} />
            </div>

            <div>
              <p className="text-sm font-medium text-white">
                ThreatLens User
              </p>
              <p className="text-xs text-gray-500">
                Security Analyst
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-gray-400 hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut size={19} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}