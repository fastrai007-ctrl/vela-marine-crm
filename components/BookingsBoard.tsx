"use client";

import { useState, useTransition } from "react";
import { Shoot, Vessel, Client, ShootDeliverable } from "@prisma/client";
import { Camera, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { updateShootStatus, deleteShoot, toggleDeliverable } from "@/lib/actions";

type FullShoot = Shoot & {
  vessel: Vessel & { client: Client };
  deliverables: ShootDeliverable[];
};

const STATUSES = ["ENQUIRY", "BOOKED", "COMPLETED", "DELIVERED"] as const;

const colStyle: Record<string, { bg: string; border: string; badge: string }> = {
  ENQUIRY:   { bg: "bg-slate-800/40",    border: "border-slate-700/40",   badge: "bg-slate-700/60 text-slate-300" },
  BOOKED:    { bg: "bg-sky-900/20",      border: "border-sky-700/30",     badge: "bg-sky-500/15 text-sky-300" },
  COMPLETED: { bg: "bg-violet-900/20",   border: "border-violet-700/30",  badge: "bg-violet-500/15 text-violet-300" },
  DELIVERED: { bg: "bg-emerald-900/20",  border: "border-emerald-700/30", badge: "bg-emerald-500/15 text-emerald-300" },
};

function fmtDate(d: Date | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-AU", { day: "numeric", month: "short" });
}

export function BookingsBoard({ shoots }: { shoots: FullShoot[] }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  function toggle(id: string) {
    setExpanded(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white" style={{ letterSpacing: "-0.03em" }}>Bookings</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
          {shoots.filter(s => s.status === "BOOKED").length} booked · {shoots.filter(s => s.status === "COMPLETED").length} completed
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {STATUSES.map(status => {
          const col = colStyle[status];
          const colShoots = shoots.filter(s => s.status === status);
          return (
            <div key={status} className={`rounded-2xl border ${col.border} ${col.bg} p-3`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`rounded-full text-[10px] font-semibold px-2 py-0.5 tracking-wider ${col.badge}`}>
                  {status}
                </span>
                <span className="text-xs text-slate-500 mono-data">{colShoots.length}</span>
              </div>

              <div className="space-y-2">
                {colShoots.length === 0 && (
                  <p className="text-xs text-slate-700 text-center py-4">None</p>
                )}
                {colShoots.map(shoot => (
                  <div key={shoot.id} className="rounded-xl bg-black/30 border border-white/5 overflow-hidden">
                    <div
                      className="p-3 cursor-pointer hover:bg-white/[0.02]"
                      onClick={() => toggle(shoot.id)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{shoot.vessel.name}</p>
                          <p className="text-[11px] text-slate-500 truncate">{shoot.vessel.client.companyName}</p>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className="text-[10px] text-sky-400 flex items-center gap-1">
                              <Camera size={9} /> {fmtDate(shoot.shootDate)}
                            </span>
                            {shoot.budget && (
                              <span className="text-[10px] text-slate-500 mono-data">${shoot.budget.toLocaleString()}</span>
                            )}
                          </div>
                          {shoot.services && (
                            <p className="text-[10px] text-slate-600 mt-0.5">{shoot.services}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {expanded.has(shoot.id) ? <ChevronUp size={12} className="text-slate-600" /> : <ChevronDown size={12} className="text-slate-600" />}
                        </div>
                      </div>
                    </div>

                    {expanded.has(shoot.id) && (
                      <div className="border-t border-white/5 px-3 pb-3 pt-2 space-y-2">
                        {shoot.location && <p className="text-xs text-slate-500">📍 {shoot.location}</p>}
                        {shoot.weatherNotes && <p className="text-xs text-slate-500">☁ {shoot.weatherNotes}</p>}
                        {shoot.notes && <p className="text-xs text-slate-500">{shoot.notes}</p>}

                        {/* Deliverables */}
                        {shoot.deliverables.length > 0 && (
                          <div className="space-y-1 pt-1">
                            {shoot.deliverables.map(d => (
                              <div key={d.id} className="flex items-center gap-2 text-xs">
                                <input
                                  type="checkbox"
                                  checked={d.completed}
                                  onChange={e => startTransition(() => toggleDeliverable(d.id, e.target.checked))}
                                  className="accent-sky-400 shrink-0"
                                />
                                <span className={d.completed ? "line-through text-slate-600" : "text-slate-300"}>
                                  {d.title}
                                </span>
                                {d.link && <a href={d.link} target="_blank" rel="noreferrer" className="text-sky-400 text-[10px] hover:underline">↗</a>}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Move status */}
                        <div className="flex items-center gap-2 pt-1 flex-wrap">
                          {STATUSES.filter(s => s !== status).map(s => (
                            <button
                              key={s}
                              onClick={() => startTransition(() => updateShootStatus(shoot.id, s))}
                              disabled={isPending}
                              className="text-[10px] border border-white/10 rounded-full px-2 py-0.5 text-slate-400 hover:text-white hover:border-white/20 disabled:opacity-40"
                            >
                              → {s}
                            </button>
                          ))}
                          <button
                            onClick={() => startTransition(() => deleteShoot(shoot.id))}
                            disabled={isPending}
                            className="text-slate-700 hover:text-red-400 ml-auto disabled:opacity-40"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
