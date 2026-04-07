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
  isMobile?: boolean;
  mobileOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isMobile = false, mobileOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  const transform = isMobile ? (mobileOpen ? "translateX(0)" : "translateX(-100%)") : "translateX(0)";

  return (
    <aside
      style={{
        position: "fixed",
        top: 0, left: 0, bottom: 0,
        width: "var(--sidebar-width)",
        zIndex: 40,
        display: "flex",
        flexDirection: "column",
        transform,
        transition: "transform 300ms cubic-bezier(.16,1,.3,1)",
        background: "rgba(4,4,6,0.96)",
        backdropFilter: "blur(32px)",
        WebkitBackdropFilter: "blur(32px)",
        borderRight: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {/* Brand */}
      <div style={{ padding: "32px 20px 28px", borderBottom: "1px solid rgba(255,255,255,0.04)", position: "relative" }}>
        {isMobile && (
          <button
            onClick={onClose}
            style={{ position: "absolute", top: 12, right: 12, padding: 6, color: "rgba(255,255,255,0.4)", background: "none", border: "none", cursor: "pointer" }}
          >
            <X size={16} />
          </button>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: "italic", fontWeight: 500,
            fontSize: "2.1rem", letterSpacing: "-0.02em", lineHeight: 1,
            color: "white",
          }}>M</span>
          <span style={{
            fontFamily: "'DM Sans', sans-serif", fontWeight: 300,
            fontSize: "0.6rem", letterSpacing: "0.35em",
            color: "rgba(255,255,255,0.85)", textTransform: "uppercase",
          }}>Vela Marine Group</span>
          <span style={{
            fontFamily: "'DM Sans', sans-serif", fontWeight: 300,
            fontSize: "0.55rem", letterSpacing: "0.25em",
            color: "rgba(255,255,255,0.35)", textTransform: "uppercase",
          }}>CRM · Demo</span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "20px 12px" }}>
        <p style={{
          padding: "0 8px", paddingBottom: 12, margin: 0,
          fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
          fontSize: "0.6rem", letterSpacing: "0.18em",
          color: "rgba(255,255,255,0.2)", textTransform: "uppercase",
        }}>Navigation</p>
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px", borderRadius: 12, marginBottom: 2,
                fontSize: 14, fontWeight: active ? 500 : 400, textDecoration: "none",
                transition: "all 150ms ease",
                color: active ? "#fff" : "rgba(255,255,255,0.4)",
                background: active ? "rgba(255,255,255,0.07)" : "transparent",
                fontFamily: "'DM Sans', sans-serif",
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
      <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <p style={{
          margin: 0,
          fontFamily: "'DM Sans', sans-serif", fontWeight: 300,
          fontSize: "0.55rem", letterSpacing: "0.2em",
          color: "rgba(255,255,255,0.2)", textTransform: "uppercase",
        }}>Powered by FASTR AI</p>
      </div>
    </aside>
  );
}
