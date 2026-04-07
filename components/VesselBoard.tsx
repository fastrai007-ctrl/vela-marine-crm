"use client";

import { useRef, useState, useTransition } from "react";
import { Client, Vessel, Shoot, ShootDeliverable } from "@prisma/client";
import { Anchor, Pencil, Trash2, Plus, X, ChevronDown, ChevronUp, Camera } from "lucide-react";
import { createClient, updateClient, deleteClient, createVessel, updateVessel, deleteVessel, createShoot, toggleDeliverable, createDeliverable } from "@/lib/actions";

type VesselWithShoots = Vessel & {
  shoots: (Shoot & { deliverables: ShootDeliverable[] })[];
};

type ClientWithVessels = Client & { vessels: VesselWithShoots[] };

const CLIENT_TYPES: Record<string, string> = { BROKER: "Broker", VESSEL_OWNER: "Owner", CHARTER_OP: "Charter Op" };
const CLIENT_STAGES: Record<string, string> = { LEAD: "Lead", ACTIVE: "Active", REPEAT: "Repeat", INACTIVE: "Inactive" };
const VESSEL_TYPES = ["MOTOR_YACHT", "SAILING", "CATAMARAN", "SUPERYACHT", "SPORTFISH"];
const LISTING_STATUSES = ["FOR_SALE", "CHARTER", "PRIVATE", "SOLD"];
const SHOOT_STATUSES = ["ENQUIRY", "BOOKED", "COMPLETED", "DELIVERED"];
const DELIVERABLE_TYPES = ["PHOTO", "VIDEO", "REEL", "VIRTUAL_TOUR"];

const stageBg: Record<string, string> = {
  LEAD: "bg-slate-700/60 text-slate-300",
  ACTIVE: "bg-sky-500/15 text-sky-300",
  REPEAT: "bg-emerald-500/15 text-emerald-300",
  INACTIVE: "bg-slate-700/40 text-slate-500",
};

const listingBg: Record<string, string> = {
  FOR_SALE: "bg-amber-500/15 text-amber-300",
  CHARTER: "bg-sky-500/15 text-sky-300",
  PRIVATE: "bg-slate-700/40 text-slate-400",
  SOLD: "bg-emerald-500/15 text-emerald-300",
};

const shootStatusBg: Record<string, string> = {
  ENQUIRY: "bg-slate-700/60 text-slate-300",
  BOOKED: "bg-sky-500/15 text-sky-300",
  COMPLETED: "bg-violet-500/15 text-violet-300",
  DELIVERED: "bg-emerald-500/15 text-emerald-300",
};

function fmtDate(d: Date | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
}

export function VesselBoard({ clients }: { clients: ClientWithVessels[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [editClient, setEditClient] = useState<ClientWithVessels | null>(null);
  const [addVesselToClient, setAddVesselToClient] = useState<string | null>(null);
  const [editVessel, setEditVessel] = useState<Vessel | null>(null);
  const [addShootToVessel, setAddShootToVessel] = useState<string | null>(null);
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set(clients.map(c => c.id)));
  const [expandedShoots, setExpandedShoots] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  function toggleClient(id: string) {
    setExpandedClients(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  }
  function toggleShoot(id: string) {
    setExpandedShoots(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  }

  return (
    <div className="space-y-6">
      {/* Header + Add Client */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ letterSpacing: "-0.03em" }}>Vessels</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
            {clients.filter(c => c.stage === "ACTIVE" || c.stage === "REPEAT").length} active ·{" "}
            {clients.reduce((s, c) => s + c.vessels.length, 0)} vessels tracked
          </p>
        </div>
        <button
          onClick={() => setEditClient({} as ClientWithVessels)}
          className="btn-primary"
        >
          <Plus size={14} /> Add Client
        </button>
      </div>

      {/* Client rows */}
      {clients.length === 0 && (
        <div className="card p-12 text-center">
          <Anchor size={36} className="mx-auto mb-3 opacity-20" />
          <p className="text-slate-500 text-sm">No clients yet — add one above.</p>
        </div>
      )}

      {clients.map(client => (
        <div key={client.id} className="card overflow-hidden">
          {/* Client header */}
          <div
            className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-white/[0.02]"
            onClick={() => toggleClient(client.id)}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white text-sm">{client.companyName}</span>
                  <span className={`rounded-full text-[10px] font-semibold px-2 py-0.5 ${stageBg[client.stage] ?? "bg-slate-700 text-slate-400"}`}>
                    {CLIENT_STAGES[client.stage] ?? client.stage}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">{CLIENT_TYPES[client.clientType] ?? client.clientType}</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{client.contactName} · {client.email}{client.location ? ` · ${client.location}` : ""}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 ml-4">
              {client.monthlyValue && (
                <span className="text-sm font-semibold text-white mono-data">${client.monthlyValue.toLocaleString()}/mo</span>
              )}
              <button onClick={e => { e.stopPropagation(); setEditClient(client); }} className="text-slate-600 hover:text-slate-300"><Pencil size={13} /></button>
              <button onClick={e => { e.stopPropagation(); startTransition(() => deleteClient(client.id)); }} disabled={isPending} className="text-slate-600 hover:text-red-400 disabled:opacity-40"><Trash2 size={13} /></button>
              {expandedClients.has(client.id) ? <ChevronUp size={15} className="text-slate-500" /> : <ChevronDown size={15} className="text-slate-500" />}
            </div>
          </div>

          {/* Vessels */}
          {expandedClients.has(client.id) && (
            <div className="border-t border-white/5 px-5 pb-4 space-y-3 pt-3">
              {client.vessels.length === 0 && (
                <p className="text-xs text-slate-600 py-2">No vessels — add one below.</p>
              )}
              {client.vessels.map(vessel => (
                <div key={vessel.id} className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Anchor size={14} className="text-sky-400 shrink-0" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white">{vessel.name}</span>
                          <span className={`rounded-full text-[10px] font-semibold px-2 py-0.5 ${listingBg[vessel.listingStatus] ?? "bg-slate-700 text-slate-400"}`}>
                            {vessel.listingStatus.replace("_", " ")}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {vessel.vesselType.replace("_", " ")} {vessel.lengthM ? `· ${vessel.lengthM}m` : ""}{vessel.marina ? ` · ${vessel.marina}` : ""}
                          {vessel.listingPrice ? ` · $${(vessel.listingPrice / 1000000).toFixed(2)}M` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setAddShootToVessel(vessel.id)} className="flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 border border-sky-500/20 rounded-full px-2.5 py-1">
                        <Camera size={11} /> Book Shoot
                      </button>
                      <button onClick={() => setEditVessel(vessel)} className="text-slate-600 hover:text-slate-300"><Pencil size={12} /></button>
                      <button onClick={() => startTransition(() => deleteVessel(vessel.id))} disabled={isPending} className="text-slate-600 hover:text-red-400 disabled:opacity-40"><Trash2 size={12} /></button>
                    </div>
                  </div>

                  {/* Shoots for this vessel */}
                  {vessel.shoots.length > 0 && (
                    <div className="border-t border-white/5 px-4 py-2 space-y-2">
                      {vessel.shoots.map(shoot => (
                        <div key={shoot.id} className="text-xs">
                          <button
                            onClick={() => toggleShoot(shoot.id)}
                            className="flex items-center gap-2 w-full text-left py-1.5 hover:text-white text-slate-400"
                          >
                            <span className={`rounded-full text-[10px] font-semibold px-2 py-0.5 ${shootStatusBg[shoot.status] ?? "bg-slate-700 text-slate-400"}`}>
                              {shoot.status}
                            </span>
                            <span>{fmtDate(shoot.shootDate)}</span>
                            {shoot.location && <span className="text-slate-600">· {shoot.location}</span>}
                            <span className="text-slate-600">· {shoot.services}</span>
                            {shoot.budget && <span className="mono-data text-slate-500 ml-auto">${shoot.budget.toLocaleString()}</span>}
                            {expandedShoots.has(shoot.id) ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          </button>

                          {expandedShoots.has(shoot.id) && (
                            <div className="ml-4 mt-1 space-y-1.5 pb-2">
                              {shoot.weatherNotes && <p className="text-slate-500">☁ {shoot.weatherNotes}</p>}
                              {shoot.notes && <p className="text-slate-500">{shoot.notes}</p>}
                              {shoot.deliverables.map(d => (
                                <div key={d.id} className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={d.completed}
                                    onChange={e => startTransition(() => toggleDeliverable(d.id, e.target.checked))}
                                    className="accent-sky-400"
                                  />
                                  <span className={d.completed ? "line-through text-slate-600" : "text-slate-300"}>
                                    [{d.type}] {d.title}
                                  </span>
                                  {d.link && <a href={d.link} target="_blank" rel="noreferrer" className="text-sky-400 hover:underline text-[10px]">↗</a>}
                                </div>
                              ))}
                              {/* Add deliverable inline */}
                              <form action={(fd) => { fd.append("shootId", shoot.id); startTransition(() => createDeliverable(fd)); }} className="flex gap-1 mt-1">
                                <input name="title" placeholder="Add deliverable" className="input text-xs py-1 flex-1" />
                                <select name="type" className="input text-xs py-1 w-28">
                                  {DELIVERABLE_TYPES.map(t => <option key={t}>{t}</option>)}
                                </select>
                                <button type="submit" disabled={isPending} className="text-xs bg-sky-500/15 text-sky-300 px-2.5 rounded-lg hover:bg-sky-500/25 disabled:opacity-40">+</button>
                              </form>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Add vessel button */}
              <button
                onClick={() => setAddVesselToClient(client.id)}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-sky-400 mt-1"
              >
                <Plus size={12} /> Add vessel
              </button>
            </div>
          )}
        </div>
      ))}

      {/* ── ADD/EDIT CLIENT MODAL ── */}
      {editClient !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="glass-modal w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white">{editClient.id ? "Edit Client" : "New Client"}</h3>
              <button onClick={() => setEditClient(null)} className="text-slate-500 hover:text-white"><X size={16} /></button>
            </div>
            <form
              ref={!editClient.id ? formRef : undefined}
              action={(fd) => {
                startTransition(async () => {
                  if (editClient.id) await updateClient(editClient.id, fd);
                  else { await createClient(fd); formRef.current?.reset(); }
                  setEditClient(null);
                });
              }}
              className="space-y-3"
            >
              <div className="grid grid-cols-2 gap-3">
                <input name="companyName" defaultValue={editClient.companyName ?? ""} placeholder="Company *" className="input col-span-2" required />
                <input name="contactName" defaultValue={editClient.contactName ?? ""} placeholder="Contact name *" className="input" required />
                <input name="email" defaultValue={editClient.email ?? ""} placeholder="Email *" type="email" className="input" required />
                <input name="phone" defaultValue={editClient.phone ?? ""} placeholder="Phone" className="input" />
                <input name="location" defaultValue={editClient.location ?? ""} placeholder="Location / Marina" className="input" />
                <select name="clientType" defaultValue={editClient.clientType ?? "VESSEL_OWNER"} className="input">
                  <option value="BROKER">Broker</option>
                  <option value="VESSEL_OWNER">Vessel Owner</option>
                  <option value="CHARTER_OP">Charter Operator</option>
                </select>
                <select name="stage" defaultValue={editClient.stage ?? "LEAD"} className="input">
                  <option value="LEAD">Lead</option>
                  <option value="ACTIVE">Active</option>
                  <option value="REPEAT">Repeat</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
                <input name="monthlyValue" defaultValue={editClient.monthlyValue ?? ""} placeholder="Monthly value ($)" type="number" className="input" />
                <textarea name="notes" defaultValue={editClient.notes ?? ""} placeholder="Notes" className="input col-span-2 h-20 resize-none" />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="submit" disabled={isPending} className="btn-primary flex-1 justify-center">
                  {isPending ? "Saving..." : editClient.id ? "Save" : "Add Client"}
                </button>
                <button type="button" onClick={() => setEditClient(null)} className="flex-1 rounded-full border border-white/10 py-2 text-sm text-slate-400 hover:text-white hover:border-white/20">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── ADD/EDIT VESSEL MODAL ── */}
      {(addVesselToClient || editVessel) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="glass-modal w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white">{editVessel ? "Edit Vessel" : "Add Vessel"}</h3>
              <button onClick={() => { setAddVesselToClient(null); setEditVessel(null); }} className="text-slate-500 hover:text-white"><X size={16} /></button>
            </div>
            <form
              action={(fd) => {
                if (addVesselToClient) fd.append("clientId", addVesselToClient);
                startTransition(async () => {
                  if (editVessel) await updateVessel(editVessel.id, fd);
                  else await createVessel(fd);
                  setAddVesselToClient(null); setEditVessel(null);
                });
              }}
              className="space-y-3"
            >
              <div className="grid grid-cols-2 gap-3">
                <input name="name" defaultValue={editVessel?.name ?? ""} placeholder="Vessel name *" className="input col-span-2" required />
                <select name="vesselType" defaultValue={editVessel?.vesselType ?? "MOTOR_YACHT"} className="input">
                  {VESSEL_TYPES.map(t => <option key={t}>{t.replace("_", " ")}</option>)}
                </select>
                <input name="lengthM" defaultValue={editVessel?.lengthM ?? ""} placeholder="Length (m)" type="number" step="0.1" className="input" />
                <input name="listingPrice" defaultValue={editVessel?.listingPrice ?? ""} placeholder="Listing price ($)" type="number" className="input" />
                <input name="marina" defaultValue={editVessel?.marina ?? ""} placeholder="Marina / location" className="input" />
                <select name="listingStatus" defaultValue={editVessel?.listingStatus ?? "PRIVATE"} className="input">
                  {LISTING_STATUSES.map(s => <option key={s}>{s.replace("_", " ")}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={isPending} className="btn-primary flex-1 justify-center">
                  {isPending ? "Saving..." : editVessel ? "Save" : "Add Vessel"}
                </button>
                <button type="button" onClick={() => { setAddVesselToClient(null); setEditVessel(null); }} className="flex-1 rounded-full border border-white/10 py-2 text-sm text-slate-400 hover:text-white hover:border-white/20">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── ADD SHOOT MODAL ── */}
      {addShootToVessel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="glass-modal w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white">Book Shoot</h3>
              <button onClick={() => setAddShootToVessel(null)} className="text-slate-500 hover:text-white"><X size={16} /></button>
            </div>
            <form
              action={(fd) => {
                fd.append("vesselId", addShootToVessel);
                startTransition(async () => { await createShoot(fd); setAddShootToVessel(null); });
              }}
              className="space-y-3"
            >
              <div className="grid grid-cols-2 gap-3">
                <input name="shootDate" type="date" className="input col-span-2" />
                <input name="location" placeholder="Location (e.g. Gold Coast Seaway)" className="input col-span-2" />
                <input name="services" placeholder="Services (PHOTO,VIDEO,REEL)" className="input" />
                <input name="budget" placeholder="Budget ($)" type="number" className="input" />
                <input name="weatherNotes" placeholder="Weather notes" className="input" />
                <select name="status" className="input">
                  {SHOOT_STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
                <textarea name="notes" placeholder="Notes" className="input col-span-2 h-16 resize-none" />
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={isPending} className="btn-primary flex-1 justify-center">{isPending ? "Saving..." : "Book Shoot"}</button>
                <button type="button" onClick={() => setAddShootToVessel(null)} className="flex-1 rounded-full border border-white/10 py-2 text-sm text-slate-400 hover:text-white">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
