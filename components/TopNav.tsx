"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Anchor } from "lucide-react";

const NAV_LINKS = [
  { href: "/vessels", label: "Vessels" },
  { href: "/bookings", label: "Bookings" },
  { href: "/leads", label: "Leads" },
  { href: "/financials", label: "Financials" },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 glass-nav">
      <div className="mx-auto max-w-6xl px-4 flex items-center justify-between h-14">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#0ea5e9]/15 border border-[#0ea5e9]/20 flex items-center justify-center">
            <Anchor size={17} className="text-[#38bdf8]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-serif text-base font-medium text-white leading-none italic" style={{ letterSpacing: "-0.01em" }}>
                Vela Marine Group
              </p>
              <span className="rounded-full bg-[#0ea5e9]/15 text-[#38bdf8] text-[10px] font-semibold px-2 py-0.5 leading-none tracking-widest uppercase">
                DEMO
              </span>
            </div>
            <p className="text-[11px] leading-none mt-0.5" style={{ color: "var(--text-secondary)" }}>
              Vessel media management
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-[#0ea5e9]/15 text-[#38bdf8] border border-[#0ea5e9]/20"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
