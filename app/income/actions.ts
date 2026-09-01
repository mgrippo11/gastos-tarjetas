"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db/client";
import { income } from "@/db/schema";

export async function addIncome(formData: FormData) {
  const session = await auth();
  const ownerEmail = session?.user?.email;
  if (!ownerEmail) throw new Error("No autorizado");

  const description = String(formData.get("description") ?? "").trim() || null;
  const amount = Number(formData.get("amount"));
  const month = String(formData.get("month") ?? "");

  if (!Number.isFinite(amount) || amount <= 0 || !/^\d{4}-\d{2}$/.test(month)) {
    throw new Error("Datos inválidos");
  }

  await db.insert(income).values({ ownerEmail, description, amount, month });
  revalidatePath("/income");
}

export async function deleteIncome(id: number) {
  const session = await auth();
  const ownerEmail = session?.user?.email;
  if (!ownerEmail) throw new Error("No autorizado");

  await db.delete(income).where(and(eq(income.id, id), eq(income.ownerEmail, ownerEmail)));
  revalidatePath("/income");
}
