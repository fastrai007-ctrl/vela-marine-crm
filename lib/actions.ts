"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";

function safeNumber(v: FormDataEntryValue | null): number | null {
  if (!v) return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
}

function safeDate(v: FormDataEntryValue | null): Date | undefined {
  if (!v || typeof v !== "string" || v === "") return undefined;
  const d = new Date(v);
  return isNaN(d.getTime()) ? undefined : d;
}

function revalidateAll() {
  revalidatePath("/vessels");
  revalidatePath("/bookings");
  revalidatePath("/leads");
  revalidatePath("/financials");
}

// ── CLIENTS ────────────────────────────────────────────────────────────────────

export async function createClient(formData: FormData) {
  const companyName = formData.get("companyName")?.toString().trim() ?? "";
  const contactName = formData.get("contactName")?.toString().trim() ?? "";
  const email = formData.get("email")?.toString().trim() ?? "";
  if (!companyName || !contactName || !email) return;
  await prisma.client.create({
    data: {
      companyName, contactName, email,
      phone: formData.get("phone")?.toString().trim() || null,
      clientType: formData.get("clientType")?.toString() || "VESSEL_OWNER",
      stage: formData.get("stage")?.toString() || "LEAD",
      location: formData.get("location")?.toString().trim() || null,
      monthlyValue: safeNumber(formData.get("monthlyValue")),
      notes: formData.get("notes")?.toString().trim() || null,
    },
  });
  revalidateAll();
}

export async function updateClient(id: string, formData: FormData) {
  await prisma.client.update({
    where: { id },
    data: {
      companyName: formData.get("companyName")?.toString().trim() ?? "",
      contactName: formData.get("contactName")?.toString().trim() ?? "",
      email: formData.get("email")?.toString().trim() ?? "",
      phone: formData.get("phone")?.toString().trim() || null,
      clientType: formData.get("clientType")?.toString() || "VESSEL_OWNER",
      stage: formData.get("stage")?.toString() || "LEAD",
      location: formData.get("location")?.toString().trim() || null,
      monthlyValue: safeNumber(formData.get("monthlyValue")),
      notes: formData.get("notes")?.toString().trim() || null,
    },
  });
  revalidateAll();
}

export async function deleteClient(id: string) {
  await prisma.client.delete({ where: { id } });
  revalidateAll();
}

// ── VESSELS ────────────────────────────────────────────────────────────────────

export async function createVessel(formData: FormData) {
  const name = formData.get("name")?.toString().trim() ?? "";
  const clientId = formData.get("clientId")?.toString() ?? "";
  if (!name || !clientId) return;
  await prisma.vessel.create({
    data: {
      name, clientId,
      vesselType: formData.get("vesselType")?.toString() || "MOTOR_YACHT",
      lengthM: safeNumber(formData.get("lengthM")) as number | null,
      listingPrice: safeNumber(formData.get("listingPrice")),
      marina: formData.get("marina")?.toString().trim() || null,
      listingStatus: formData.get("listingStatus")?.toString() || "PRIVATE",
    },
  });
  revalidateAll();
}

export async function updateVessel(id: string, formData: FormData) {
  await prisma.vessel.update({
    where: { id },
    data: {
      name: formData.get("name")?.toString().trim() ?? "",
      vesselType: formData.get("vesselType")?.toString() || "MOTOR_YACHT",
      lengthM: safeNumber(formData.get("lengthM")) as number | null,
      listingPrice: safeNumber(formData.get("listingPrice")),
      marina: formData.get("marina")?.toString().trim() || null,
      listingStatus: formData.get("listingStatus")?.toString() || "PRIVATE",
    },
  });
  revalidateAll();
}

export async function deleteVessel(id: string) {
  await prisma.vessel.delete({ where: { id } });
  revalidateAll();
}

// ── SHOOTS ─────────────────────────────────────────────────────────────────────

export async function createShoot(formData: FormData) {
  const vesselId = formData.get("vesselId")?.toString() ?? "";
  if (!vesselId) return;
  await prisma.shoot.create({
    data: {
      vesselId,
      shootDate: safeDate(formData.get("shootDate")),
      location: formData.get("location")?.toString().trim() || null,
      weatherNotes: formData.get("weatherNotes")?.toString().trim() || null,
      services: formData.get("services")?.toString() || "PHOTO",
      status: formData.get("status")?.toString() || "ENQUIRY",
      budget: safeNumber(formData.get("budget")),
      notes: formData.get("notes")?.toString().trim() || null,
    },
  });
  revalidateAll();
}

export async function updateShootStatus(id: string, status: string) {
  await prisma.shoot.update({ where: { id }, data: { status } });
  revalidateAll();
}

export async function deleteShoot(id: string) {
  await prisma.shoot.delete({ where: { id } });
  revalidateAll();
}

export async function toggleDeliverable(id: string, completed: boolean) {
  await prisma.shootDeliverable.update({ where: { id }, data: { completed } });
  revalidateAll();
}

export async function createDeliverable(formData: FormData) {
  const shootId = formData.get("shootId")?.toString() ?? "";
  const title = formData.get("title")?.toString().trim() ?? "";
  if (!shootId || !title) return;
  await prisma.shootDeliverable.create({
    data: {
      shootId, title,
      type: formData.get("type")?.toString() || "PHOTO",
      dueDate: safeDate(formData.get("dueDate")),
      link: formData.get("link")?.toString().trim() || null,
    },
  });
  revalidateAll();
}

// ── LEADS ──────────────────────────────────────────────────────────────────────

export async function createLead(formData: FormData) {
  const name = formData.get("name")?.toString().trim() ?? "";
  if (!name) return;
  await prisma.lead.create({
    data: {
      name,
      email: formData.get("email")?.toString().trim() || null,
      phone: formData.get("phone")?.toString().trim() || null,
      vesselName: formData.get("vesselName")?.toString().trim() || null,
      vesselType: formData.get("vesselType")?.toString() || null,
      location: formData.get("location")?.toString().trim() || null,
      servicesInterested: formData.get("servicesInterested")?.toString() || null,
      budget: formData.get("budget")?.toString().trim() || null,
      timeline: formData.get("timeline")?.toString().trim() || null,
      stage: formData.get("stage")?.toString() || "NEW",
      notes: formData.get("notes")?.toString().trim() || null,
      source: formData.get("source")?.toString().trim() || null,
    },
  });
  revalidatePath("/leads");
}

export async function updateLeadStage(id: string, stage: string) {
  await prisma.lead.update({ where: { id }, data: { stage } });
  revalidatePath("/leads");
}

export async function deleteLead(id: string) {
  await prisma.lead.delete({ where: { id } });
  revalidatePath("/leads");
}

// ── EXPENSES ───────────────────────────────────────────────────────────────────

export async function createExpense(formData: FormData) {
  const title = formData.get("title")?.toString().trim() ?? "";
  const amount = safeNumber(formData.get("amount"));
  const month = formData.get("month")?.toString().trim() ?? new Date().toISOString().slice(0, 7);
  if (!title || amount === null) return;
  await prisma.expense.create({
    data: { title, amount, purpose: formData.get("purpose")?.toString().trim() || null, month },
  });
  revalidatePath("/financials");
}

export async function deleteExpense(id: string) {
  await prisma.expense.delete({ where: { id } });
  revalidatePath("/financials");
}
