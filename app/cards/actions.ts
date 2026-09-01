"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db/client";
import { cards } from "@/db/schema";

function parseClosingDay(formData: FormData): number | null {
  const raw = String(formData.get("closingDay") ?? "").trim();
  if (!raw) return null;
  const n = Number(raw);
  return Number.isInteger(n) && n >= 1 && n <= 31 ? n : null;
}

export async function addCard(formData: FormData) {
  const session = await auth();
  const ownerEmail = session?.user?.email;
  if (!ownerEmail) throw new Error("No autorizado");

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  await db.insert(cards).values({ ownerEmail, name, closingDay: parseClosingDay(formData) });
  revalidatePath("/cards");
}

export async function updateCard(id: number, formData: FormData) {
  const session = await auth();
  const ownerEmail = session?.user?.email;
  if (!ownerEmail) throw new Error("No autorizado");

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  await db
    .update(cards)
    .set({ name, closingDay: parseClosingDay(formData) })
    .where(and(eq(cards.id, id), eq(cards.ownerEmail, ownerEmail)));

  revalidatePath("/cards");
  redirect("/cards");
}
