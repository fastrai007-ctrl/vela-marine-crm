"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Menu } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Close sidebar when navigating
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  if (pathname === "/login") return <>{children}</>;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Mobile overlay */}
      {isMobile && mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 30,
            background: "rgba(0,0,0,0.65)",
          }}
        />
      )}

      <Sidebar isMobile={isMobile} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <main style={{ flex: 1, overflowY: "auto", minWidth: 0, marginLeft: isMobile ? 0 : "var(--sidebar-width)" }}>
        {/* Mobile top bar */}
        {isMobile && (
          <div
            style={{
              position: "sticky", top: 0, zIndex: 20,
              display: "flex", alignItems: "center", gap: 12, padding: "0 16px",
              height: 56,
              background: "rgba(4,4,6,0.95)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <button
              onClick={() => setMobileOpen(true)}
              style={{ color: "rgba(255,255,255,0.6)", padding: 6, marginLeft: -6, background: "none", border: "none", cursor: "pointer" }}
            >
              <Menu size={20} />
            </button>
            <span style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontStyle: "italic", fontWeight: 500,
              fontSize: "1.2rem", color: "white", letterSpacing: "-0.02em",
            }}>
              Vela Marine Group
            </span>
          </div>
        )}

        <div style={{ maxWidth: 1024, margin: "0 auto", padding: isMobile ? "20px 16px" : "40px 32px" }}>
          {children}
        </div>
      </main>
    </div>
  );
}
