"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Anchor, CalendarDays, BarChart2, Inbox, Calendar, Bot, Settings, X } from "lucide-react";

const NAV = [
  { href: "/vessels",    icon: Anchor,        label: "Vessels" },
  { href: "/bookings",   icon: CalendarDays,  label: "Bookings" },
  { href: "/leads",      icon: Inbox,         label: "Leads" },
  { href: "/financials", icon: BarChart2,     label: "Financials" },
  { href: "/calendar",   icon: Calendar,      label: "Calendar" },
  { href: "/agent",      icon: Bot,           label: "Agent" },
  { href: "/settings",   icon: Settings,      label: "Settings" },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`sidebar-drawer fixed left-0 top-0 h-screen flex flex-col z-40${mobileOpen ? " sidebar-open" : ""}`}
      style={{
        width: "var(--sidebar-width)",
        background: "rgba(4,4,6,0.96)",
        backdropFilter: "blur(32px)",
        WebkitBackdropFilter: "blur(32px)",
        borderRight: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {/* Brand */}
      <div className="px-5 pt-8 pb-7 relative" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        {/* Mobile close button */}
        <button
          className="md:hidden absolute top-4 right-4 p-1.5"
          style={{ color: "rgba(255,255,255,0.4)", background: "none", border: "none", cursor: "pointer" }}
          onClick={onClose}
        >
          <X size={16} />
        </button>

        <div className="flex flex-col items-start gap-1">
          <span
            className="font-serif text-white leading-none select-none"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontStyle: "italic",
              fontWeight: 500,
              fontSize: "2.1rem",
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            M
          </span>
          <span
            className="text-white uppercase tracking-widest"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 300,
              fontSize: "0.6rem",
              letterSpacing: "0.35em",
              opacity: 0.85,
            }}
          >
            Vela Marine Group
          </span>
          <span
            className="text-white uppercase"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 300,
              fontSize: "0.55rem",
              letterSpacing: "0.25em",
              opacity: 0.35,
            }}
          >
            CRM · Demo
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-0.5">
        <p
          className="px-2 pb-3 uppercase"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 500,
            fontSize: "0.6rem",
            letterSpacing: "0.18em",
            color: "rgba(255,255,255,0.2)",
          }}
        >
          Navigation
        </p>
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all duration-150"
              style={{
                color: active ? "#fff" : "rgba(255,255,255,0.4)",
                background: active ? "rgba(255,255,255,0.07)" : "transparent",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: active ? 500 : 400,
                letterSpacing: "0.01em",
              }}
            >
              <Icon size={15} style={{ opacity: active ? 1 : 0.6 }} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        className="px-5 py-4"
        style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
      >
        <p
          className="uppercase"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 300,
            fontSize: "0.55rem",
            letterSpacing: "0.2em",
            color: "rgba(255,255,255,0.2)",
          }}
        >
          Powered by FASTR AI
        </p>
      </div>
    </aside>
  );
}
