"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db/client";
import { expenses } from "@/db/schema";

function parsePositiveNumber(raw: FormDataEntryValue | null): number | null {
  const n = Number(raw);
  return raw && Number.isFinite(n) && n > 0 ? n : null;
}

function parseDay(raw: FormDataEntryValue | null): number | null {
  if (!raw) return null;
  const n = Number(raw);
  return Number.isInteger(n) && n >= 1 && n <= 31 ? n : null;
}

function parseExpenseFields(formData: FormData) {
  const description = String(formData.get("description") ?? "").trim();
  const amount = parsePositiveNumber(formData.get("amount"));
  const purchaseMonth = String(formData.get("purchaseMonth") ?? "");
  const totalInstallmentsRaw = Number(formData.get("totalInstallments"));
  const totalInstallments =
    Number.isInteger(totalInstallmentsRaw) && totalInstallmentsRaw >= 1 ? totalInstallmentsRaw : null;
  const cardIdRaw = String(formData.get("cardId") ?? "");
  const cardId = cardIdRaw ? Number(cardIdRaw) : null;
  const categoryIdRaw = String(formData.get("categoryId") ?? "");
  const categoryId = categoryIdRaw ? Number(categoryIdRaw) : null;
  const dueDay = cardId === null ? parseDay(formData.get("dueDay")) : null;

  if (!description || !amount || !/^\d{4}-\d{2}$/.test(purchaseMonth) || !totalInstallments) {
    throw new Error("Datos inválidos");
  }

  return { description, amount, purchaseMonth, totalInstallments, cardId, categoryId, dueDay };
}

export async function addExpense(formData: FormData) {
  const session = await auth();
  const ownerEmail = session?.user?.email;
  if (!ownerEmail) throw new Error("No autorizado");

  await db.insert(expenses).values({ ownerEmail, ...parseExpenseFields(formData) });

  revalidatePath("/expenses");
  redirect("/expenses");
}

export async function updateExpense(id: number, formData: FormData) {
  const session = await auth();
  const ownerEmail = session?.user?.email;
  if (!ownerEmail) throw new Error("No autorizado");

  await db
    .update(expenses)
    .set(parseExpenseFields(formData))
    .where(and(eq(expenses.id, id), eq(expenses.ownerEmail, ownerEmail)));

  revalidatePath("/expenses");
  redirect("/expenses");
}

export async function deleteExpense(id: number) {
  const session = await auth();
  const ownerEmail = session?.user?.email;
  if (!ownerEmail) throw new Error("No autorizado");

  await db
    .delete(expenses)
    .where(and(eq(expenses.id, id), eq(expenses.ownerEmail, ownerEmail)));

  revalidatePath("/expenses");
}
