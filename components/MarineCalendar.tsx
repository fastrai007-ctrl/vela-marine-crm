"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, X, Anchor } from "lucide-react";

type Shoot = {
  id: string;
  shootDate: Date | null;
  location: string | null;
  services: string;
  status: string;
  budget: number | null;
  vessel: { name: string; client: { companyName: string } };
};

type Props = { shoots: Shoot[] };

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const STATUS_STYLE: Record<string, { dot: string; bg: string; text: string; label: string }> = {
  ENQUIRY:   { dot: "#3b82f6", bg: "rgba(59,130,246,0.12)",  text: "#60a5fa", label: "Enquiry" },
  BOOKED:    { dot: "#1a7a9e", bg: "rgba(26,122,158,0.15)",  text: "#4db8d8", label: "Booked" },
  COMPLETED: { dot: "#10b981", bg: "rgba(16,185,129,0.12)",  text: "#34d399", label: "Completed" },
  DELIVERED: { dot: "#f0ece4", bg: "rgba(240,236,228,0.08)", text: "#f0ece4", label: "Delivered" },
};

function getCalendarDays(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  return days;
}

function isSameDay(date: Date | null | undefined, year: number, month: number, day: number): boolean {
  if (!date) return false;
  const d = new Date(date);
  return d.getFullYear() === year && d.getMonth() + 1 === month && d.getDate() === day;
}

export function MarineCalendar({ shoots }: Props) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const days = getCalendarDays(year, month);

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
    setSelectedDay(null);
  }
  function nextMonth() {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
    setSelectedDay(null);
  }

  function shootsOnDay(day: number) {
    return shoots.filter(s => isSameDay(s.shootDate ? new Date(s.shootDate) : null, year, month, day));
  }

  const selectedShoots = selectedDay ? shootsOnDay(selectedDay) : [];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "24px", alignItems: "start" }}>
      {/* Calendar grid */}
      <div className="card" style={{ padding: "24px" }}>
        {/* Nav */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={prevMonth} style={{ background: "none", border: "none", color: "rgba(240,236,228,0.5)", cursor: "pointer", padding: "4px" }}>
            <ChevronLeft size={18} />
          </button>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "1.4rem", color: "#f0ece4", fontWeight: 500 }}>
            {MONTH_NAMES[month - 1]} {year}
          </h2>
          <button onClick={nextMonth} style={{ background: "none", border: "none", color: "rgba(240,236,228,0.5)", cursor: "pointer", padding: "4px" }}>
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Day headers */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px", marginBottom: "8px" }}>
          {DAY_NAMES.map(d => (
            <div key={d} className="heading-xs" style={{ textAlign: "center", padding: "4px 0" }}>{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px" }}>
          {days.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} />;
            const dayShots = shootsOnDay(day);
            const isToday = year === today.getFullYear() && month === today.getMonth() + 1 && day === today.getDate();
            const isSelected = selectedDay === day;
            const hasShoot = dayShots.length > 0;

            return (
              <button key={day} onClick={() => setSelectedDay(isSelected ? null : day)}
                style={{
                  aspectRatio: "1", borderRadius: "10px", border: "none", cursor: "pointer",
                  background: isSelected
                    ? "rgba(26,122,158,0.25)"
                    : isToday
                      ? "rgba(26,122,158,0.1)"
                      : hasShoot
                        ? "rgba(255,255,255,0.04)"
                        : "transparent",
                  outline: isToday ? "1px solid rgba(26,122,158,0.4)" : isSelected ? "1px solid var(--accent)" : "none",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  gap: "3px", padding: "4px", transition: "all 0.15s",
                  color: isSelected || isToday ? "#f0ece4" : hasShoot ? "rgba(240,236,228,0.9)" : "rgba(240,236,228,0.4)",
                  fontSize: "0.8rem", fontFamily: "'DM Sans', sans-serif",
                }}
                onMouseEnter={e => { if (!isSelected && !isToday) e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                onMouseLeave={e => { if (!isSelected && !isToday) e.currentTarget.style.background = hasShoot ? "rgba(255,255,255,0.04)" : "transparent"; }}
              >
                <span>{day}</span>
                {hasShoot && (
                  <div style={{ display: "flex", gap: "2px" }}>
                    {dayShots.slice(0, 3).map((s, si) => (
                      <span key={si} style={{
                        width: 5, height: 5, borderRadius: "50%",
                        background: STATUS_STYLE[s.status]?.dot || "var(--accent)",
                      }} />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex gap-4 mt-5 flex-wrap">
          {Object.entries(STATUS_STYLE).map(([k, v]) => (
            <div key={k} className="flex items-center gap-1.5">
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: v.dot, display: "inline-block" }} />
              <span style={{ fontSize: "0.65rem", color: "rgba(240,236,228,0.45)", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", letterSpacing: "0.08em" }}>{v.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Side panel */}
      <div>
        {selectedDay ? (
          <div className="card" style={{ padding: "20px" }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="heading-xs mb-1">{MONTH_NAMES[month - 1]} {selectedDay}</p>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "1.1rem", color: "#f0ece4" }}>
                  {selectedShoots.length} Shoot{selectedShoots.length !== 1 ? "s" : ""}
                </p>
              </div>
              <button onClick={() => setSelectedDay(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(240,236,228,0.4)" }}>
                <X size={16} />
              </button>
            </div>
            {selectedShoots.length === 0 ? (
              <p style={{ fontSize: "0.8rem", color: "rgba(240,236,228,0.35)", textAlign: "center", padding: "20px 0" }}>No shoots this day</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {selectedShoots.map(s => {
                  const meta = STATUS_STYLE[s.status] || STATUS_STYLE.ENQUIRY;
                  return (
                    <div key={s.id} style={{ background: "rgba(255,255,255,0.03)", borderRadius: "12px", padding: "14px", border: `1px solid ${meta.dot}22` }}>
                      <div className="flex items-center justify-between mb-2">
                        <p style={{ fontSize: "0.875rem", color: "#f0ece4", fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>{s.vessel.name}</p>
                        <span style={{ fontSize: "0.6rem", padding: "3px 8px", borderRadius: "20px", background: meta.bg, color: meta.text, fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 600 }}>{meta.label}</span>
                      </div>
                      <p className="heading-xs mb-1">{s.vessel.client.companyName}</p>
                      {s.location && <p style={{ fontSize: "0.75rem", color: "rgba(240,236,228,0.45)", marginTop: "4px" }}>📍 {s.location}</p>}
                      <p style={{ fontSize: "0.75rem", color: "rgba(240,236,228,0.45)", marginTop: "4px" }}>
                        {s.services.split(",").join(" · ")}
                        {s.budget ? ` · $${s.budget.toLocaleString()}` : ""}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="card" style={{ padding: "24px", textAlign: "center" }}>
            <Anchor size={24} style={{ color: "var(--accent)", margin: "0 auto 12px", opacity: 0.6 }} />
            <p style={{ fontSize: "0.8rem", color: "rgba(240,236,228,0.35)", lineHeight: 1.6 }}>
              Select a day to view scheduled shoots
            </p>
          </div>
        )}

        {/* This month summary */}
        <div className="card" style={{ padding: "20px", marginTop: "16px" }}>
          <p className="heading-xs mb-3">This Month</p>
          {(["ENQUIRY", "BOOKED", "COMPLETED", "DELIVERED"] as const).map(status => {
            const count = shoots.filter(s => {
              if (!s.shootDate) return false;
              const d = new Date(s.shootDate);
              return d.getFullYear() === year && d.getMonth() + 1 === month && s.status === status;
            }).length;
            if (count === 0) return null;
            const meta = STATUS_STYLE[status];
            return (
              <div key={status} className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: meta.dot, display: "inline-block" }} />
                  <span style={{ fontSize: "0.75rem", color: "rgba(240,236,228,0.6)", fontFamily: "'DM Sans', sans-serif" }}>{meta.label}</span>
                </div>
                <span style={{ fontSize: "0.85rem", color: "#f0ece4", fontFamily: "'DM Mono', monospace" }}>{count}</span>
              </div>
            );
          })}
          {shoots.filter(s => { if (!s.shootDate) return false; const d = new Date(s.shootDate); return d.getFullYear() === year && d.getMonth() + 1 === month; }).length === 0 && (
            <p style={{ fontSize: "0.75rem", color: "rgba(240,236,228,0.3)" }}>No shoots this month</p>
          )}
        </div>
      </div>
    </div>
  );
}
