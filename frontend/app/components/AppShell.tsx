"use client";

import { ReactNode, useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

interface AppShellProps {
  children: ReactNode;
}

const AUTH_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

export default function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  const isAuthPage = AUTH_ROUTES.includes(pathname);

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-[#07090d]">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090d]">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="min-h-screen md:ml-64">
        {children}
      </main>
    </div>
  );
}