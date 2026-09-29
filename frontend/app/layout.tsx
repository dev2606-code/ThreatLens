import type { Metadata } from "next";
import AppShell from "./components/AppShell";
import "./globals.css";
import GoogleProvider from "./components/GoogleProvider";
export const metadata: Metadata = {
  title: "ThreatLens",
  description: "Threat Intelligence Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#07090d] text-slate-100 antialiased">
        <GoogleProvider>
          <AppShell>{children}</AppShell>
        </GoogleProvider>
      </body>
    </html>
  );
}