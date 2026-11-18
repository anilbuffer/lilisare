import React from "react";
import Link from "next/link";
import { Activity } from "lucide-react";

export const metadata = {
  title: "Submit a Referral | LiliSare",
  description: "Public referral form for healthcare providers.",
};

export default function ReferLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-page-bg font-sans text-text-primary">
      {/* Minimal Header */}
      <header className="bg-white border-b border-[#D5DFDA]">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/refer" className="flex items-center gap-2 group">
            <div className="bg-brand-primary text-white p-1.5 rounded-lg group-hover:bg-brand-primary-hover transition-colors shadow-xs">
              <Activity className="w-5 h-5" />
            </div>
            <span className="font-semibold text-xl tracking-tight text-text-primary">
              LiliSare
            </span>
          </Link>
          <div className="text-sm text-text-secondary">
            Provider Referral Portal
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        {children}
      </main>
    </div>
  );
}
