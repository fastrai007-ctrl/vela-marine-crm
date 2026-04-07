"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      router.push("/vessels");
      router.refresh();
    } else {
      setError("Incorrect password");
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: "#060609",
        backgroundImage: `
          radial-gradient(ellipse 80% 60% at 50% -20%, rgba(26,122,154,0.07), transparent),
          radial-gradient(ellipse 40% 50% at 90% 90%, rgba(6,182,212,0.04), transparent)
        `,
      }}
    >
      {/* Grain overlay */}
      <div
        style={{
          position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1,
          opacity: 0.028,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 600'%3E%3Cfilter id='a'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23a)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
        }}
      />

      <div className="relative z-10 w-full max-w-sm">
        {/* Wordmark */}
        <div className="text-center mb-10 space-y-1">
          <p
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontStyle: "italic",
              fontWeight: 500,
              fontSize: "3.5rem",
              color: "#fff",
              lineHeight: 1,
              letterSpacing: "-0.02em",
            }}
          >
            M
          </p>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 300,
              fontSize: "0.65rem",
              letterSpacing: "0.42em",
              color: "rgba(255,255,255,0.8)",
              textTransform: "uppercase",
            }}
          >
            Vela Marine Group
          </p>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 300,
              fontSize: "0.58rem",
              letterSpacing: "0.3em",
              color: "rgba(255,255,255,0.3)",
              textTransform: "uppercase",
            }}
          >
            Marine Media · SE Queensland
          </p>
        </div>

        {/* Card */}
        <div className="glass-modal p-8 space-y-6">
          <div className="space-y-1">
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 500,
                fontSize: "1.5rem",
                color: "#fff",
                letterSpacing: "-0.02em",
              }}
            >
              CRM Access
            </h1>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 300,
                fontSize: "0.8rem",
                color: "rgba(255,255,255,0.35)",
                letterSpacing: "0.02em",
              }}
            >
              Enter your access code to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Access code"
                className="input pr-10"
                autoFocus
              />
            </div>

            {error && (
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "0.78rem",
                  color: "rgba(239,68,68,0.8)",
                  letterSpacing: "0.02em",
                }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="btn-primary w-full justify-center py-2.5"
              style={{ borderRadius: "10px" }}
            >
              {loading ? "Verifying..." : "Enter"}
            </button>
          </form>
        </div>

        <p
          className="text-center mt-6"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 300,
            fontSize: "0.6rem",
            letterSpacing: "0.2em",
            color: "rgba(255,255,255,0.18)",
            textTransform: "uppercase",
          }}
        >
          Confidential Demo · FASTR AI © 2026
        </p>
      </div>
    </div>
  );
}
