"use client";

import { useState } from "react";
import { Save, CheckCircle } from "lucide-react";

type Settings = Record<string, string>;

const FIELDS: { key: string; label: string; placeholder: string; type?: string }[] = [
  { key: "businessName",    label: "Business Name",        placeholder: "Vela Marine Group" },
  { key: "contactName",     label: "Contact Name",         placeholder: "Your name" },
  { key: "email",           label: "Email",                placeholder: "hello@velamarinegroup.com.au", type: "email" },
  { key: "phone",           label: "Phone",                placeholder: "+61 4XX XXX XXX" },
  { key: "location",        label: "Base / Location",      placeholder: "SE Queensland, Australia" },
  { key: "website",         label: "Website",              placeholder: "https://velamarinegroup.com.au" },
  { key: "bookingLink",     label: "Booking / Inquiry Link", placeholder: "https://..." },
  { key: "instagram",       label: "Instagram Handle",     placeholder: "@velamarinegroup" },
  { key: "servicesOffered", label: "Services Offered",     placeholder: "Photography, Videography, Reels, Virtual Tours" },
  { key: "notes",           label: "Additional Notes",     placeholder: "Anything else to remember..." },
];

export function MarineSettings({ initial }: { initial: Settings }) {
  const [form, setForm] = useState<Settings>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ maxWidth: "640px" }}>
      <div className="card" style={{ padding: "32px" }}>
        <p className="heading-xs mb-1">Business Profile</p>
        <p style={{ fontSize: "0.8rem", color: "rgba(240,236,228,0.4)", marginBottom: "28px", fontFamily: "'DM Sans', sans-serif" }}>
          This information helps the AI agent understand your business. Fill in what you know — it saves automatically.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {FIELDS.map(f => (
            <div key={f.key}>
              <label className="heading-xs" style={{ display: "block", marginBottom: "6px" }}>{f.label}</label>
              <input
                type={f.type || "text"}
                value={form[f.key] || ""}
                onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                style={{
                  width: "100%", boxSizing: "border-box",
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "10px", padding: "10px 14px",
                  color: "#f0ece4", fontSize: "0.875rem", outline: "none",
                  fontFamily: "'DM Sans', sans-serif", transition: "border-color 0.15s",
                }}
                onFocus={e => (e.target.style.borderColor = "var(--accent)")}
                onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
              />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 mt-8">
          <button onClick={handleSave} disabled={saving}
            className="btn-primary flex items-center gap-2"
            style={{ opacity: saving ? 0.7 : 1 }}>
            {saved ? <CheckCircle size={14} /> : <Save size={14} />}
            {saved ? "Saved!" : saving ? "Saving..." : "Save Settings"}
          </button>
          {saved && (
            <span style={{ fontSize: "0.75rem", color: "rgba(26,122,158,0.9)", fontFamily: "'DM Sans', sans-serif" }}>
              Changes saved successfully
            </span>
          )}
        </div>
      </div>

      <div className="card" style={{ padding: "24px", marginTop: "20px" }}>
        <p className="heading-xs mb-3">CRM Access</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div className="flex items-center justify-between">
            <span style={{ fontSize: "0.8rem", color: "rgba(240,236,228,0.5)", fontFamily: "'DM Sans', sans-serif" }}>Demo password</span>
            <span style={{ fontSize: "0.8rem", color: "#f0ece4", fontFamily: "'DM Mono', monospace", background: "rgba(255,255,255,0.06)", padding: "3px 10px", borderRadius: "6px" }}>DEMO</span>
          </div>
          <div className="flex items-center justify-between">
            <span style={{ fontSize: "0.8rem", color: "rgba(240,236,228,0.5)", fontFamily: "'DM Sans', sans-serif" }}>Built by</span>
            <span style={{ fontSize: "0.8rem", color: "rgba(240,236,228,0.7)", fontFamily: "'DM Sans', sans-serif" }}>FASTR AI</span>
          </div>
        </div>
      </div>
    </div>
  );
}
