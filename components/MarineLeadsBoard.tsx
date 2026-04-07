"use client";

import { useState, useRef, useTransition } from "react";
import { Lead, Client } from "@prisma/client";
import { Plus, Trash2, X, Anchor } from "lucide-react";
import { createLead, updateLeadStage, deleteLead } from "@/lib/actions";

const STAGES = ["NEW", "CONTACTED", "QUOTED", "BOOKED", "LOST"] as const;

const stageBadge: Record<string, string> = {
  NEW: "bg-slate-700/60 text-slate-300",
  CONTACTED: "bg-sky-500/15 text-sky-300",
  QUOTED: "bg-amber-500/15 text-amber-300",
  BOOKED: "bg-emerald-500/15 text-emerald-300",
  LOST: "bg-red-500/15 text-red-400",
};

const stageCol: Record<string, string> = {
  NEW: "border-slate-700/40 bg-slate-800/30",
  CONTACTED: "border-sky-700/30 bg-sky-900/15",
  QUOTED: "border-amber-700/30 bg-amber-900/15",
  BOOKED: "border-emerald-700/30 bg-emerald-900/15",
  LOST: "border-red-900/30 bg-red-900/10",
};

function fmtDate(d: Date) {
  return new Date(d).toLocaleDateString("en-AU", { day: "numeric", month: "short" });
}

export function MarineLeadsBoard({ leads }: { leads: Lead[] }) {
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ letterSpacing: "-0.03em" }}>Leads</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
            {leads.filter(l => l.stage !== "LOST").length} active · {leads.filter(l => l.stage === "BOOKED").length} converted
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus size={14} /> Add Lead
        </button>
      </div>

      {/* Kanban */}
      <div className="grid grid-cols-5 gap-3">
        {STAGES.map(stage => {
          const stageLeads = leads.filter(l => l.stage === stage);
          return (
            <div key={stage} className={`rounded-2xl border p-3 ${stageCol[stage]}`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`rounded-full text-[10px] font-semibold px-2 py-0.5 tracking-wider ${stageBadge[stage]}`}>{stage}</span>
                <span className="text-xs text-slate-600 mono-data">{stageLeads.length}</span>
              </div>
              <div className="space-y-2">
                {stageLeads.length === 0 && <p className="text-xs text-slate-700 text-center py-3">—</p>}
                {stageLeads.map(lead => (
                  <button
                    key={lead.id}
                    onClick={() => setSelected(lead)}
                    className="w-full text-left rounded-xl bg-black/30 border border-white/5 p-3 hover:border-white/10 hover:bg-black/40 transition-all"
                  >
                    <p className="text-sm font-semibold text-white">{lead.name}</p>
                    {lead.vesselName && <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1"><Anchor size={9} />{lead.vesselName}</p>}
                    {lead.location && <p className="text-xs text-slate-500">{lead.location}</p>}
                    {lead.servicesInterested && <p className="text-[10px] text-sky-400 mt-1">{lead.servicesInterested}</p>}
                    {lead.budget && <p className="text-[10px] text-slate-500 mono-data mt-0.5">{lead.budget}</p>}
                    <p className="text-[10px] text-slate-700 mt-1">{fmtDate(lead.createdAt)}</p>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Lead Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 backdrop-blur-md px-4 py-14">
          <div className="glass-modal w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white">New Lead</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-white"><X size={16} /></button>
            </div>
            <form ref={formRef} action={(fd) => { startTransition(async () => { await createLead(fd); formRef.current?.reset(); setShowForm(false); }); }} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input name="name" placeholder="Contact name *" className="input col-span-2" required />
                <input name="email" placeholder="Email" type="email" className="input" />
                <input name="phone" placeholder="Phone" className="input" />
                <input name="vesselName" placeholder="Vessel name" className="input" />
                <select name="vesselType" className="input">
                  <option value="">Vessel type</option>
                  {["MOTOR_YACHT","SAILING","CATAMARAN","SUPERYACHT","SPORTFISH"].map(t => <option key={t}>{t.replace("_"," ")}</option>)}
                </select>
                <input name="location" placeholder="Location / Marina" className="input" />
                <input name="servicesInterested" placeholder="Services (PHOTO,VIDEO…)" className="input" />
                <input name="budget" placeholder="Budget" className="input" />
                <input name="timeline" placeholder="Timeline" className="input" />
                <select name="source" className="input">
                  <option value="">Source</option>
                  <option>website</option><option>instagram</option><option>referral</option><option>direct</option>
                </select>
                <select name="stage" className="input col-span-2">
                  {STAGES.map(s => <option key={s}>{s}</option>)}
                </select>
                <textarea name="notes" placeholder="Notes" className="input col-span-2 h-16 resize-none" />
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={isPending} className="btn-primary flex-1 justify-center">{isPending ? "Saving..." : "Add Lead"}</button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 rounded-full border border-white/10 py-2 text-sm text-slate-400 hover:text-white">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 backdrop-blur-md px-4 py-14">
          <div className="glass-modal w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white">{selected.name}</h3>
              <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-white"><X size={16} /></button>
            </div>
            <div className="space-y-2 text-sm text-slate-400">
              {selected.email && <p>📧 {selected.email}</p>}
              {selected.phone && <p>📞 {selected.phone}</p>}
              {selected.vesselName && <p>⚓ {selected.vesselName} {selected.vesselType ? `(${selected.vesselType.replace("_"," ")})` : ""}</p>}
              {selected.location && <p>📍 {selected.location}</p>}
              {selected.servicesInterested && <p>🎬 {selected.servicesInterested}</p>}
              {selected.budget && <p className="mono-data">💰 {selected.budget}</p>}
              {selected.timeline && <p>📅 {selected.timeline}</p>}
              {selected.source && <p>🔗 via {selected.source}</p>}
              {selected.notes && <p className="text-slate-500 italic">{selected.notes}</p>}
            </div>
            <div className="pt-1">
              <p className="heading-xs mb-2">Move to</p>
              <div className="flex flex-wrap gap-2">
                {STAGES.filter(s => s !== selected.stage).map(s => (
                  <button key={s} onClick={() => { startTransition(() => updateLeadStage(selected.id, s)); setSelected(null); }} className={`rounded-full text-xs px-3 py-1 border border-white/10 text-slate-300 hover:text-white hover:border-white/20`}>{s}</button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => setSelected(null)} className="flex-1 rounded-full border border-white/10 py-2 text-sm text-slate-400 hover:text-white">Close</button>
              <button onClick={() => { startTransition(() => deleteLead(selected.id)); setSelected(null); }} disabled={isPending} className="text-red-400 hover:text-red-300 text-sm px-4 disabled:opacity-40">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
