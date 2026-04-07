"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Menu } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (pathname === "/login") return <>{children}</>;

  return (
    <div className="flex min-h-screen">
      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          style={{ background: "rgba(0,0,0,0.65)" }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <main className="main-content flex-1 overflow-y-auto min-w-0">
        {/* Mobile top bar */}
        <div
          className="md:hidden sticky top-0 z-20 flex items-center gap-3 px-4"
          style={{
            height: "56px",
            background: "rgba(4,4,6,0.95)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <button
            onClick={() => setMobileOpen(true)}
            style={{
              color: "rgba(255,255,255,0.6)",
              padding: "6px",
              marginLeft: "-6px",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            <Menu size={20} />
          </button>
          <span
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontStyle: "italic",
              fontWeight: 500,
              fontSize: "1.25rem",
              color: "white",
              letterSpacing: "-0.02em",
            }}
          >
            Vela Marine Group
          </span>
        </div>

        <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-10">{children}</div>
      </main>
    </div>
  );
}
