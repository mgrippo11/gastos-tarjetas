"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/db/client";
import { cards } from "@/db/schema";

export async function addCard(formData: FormData) {
  const session = await auth();
  const ownerEmail = session?.user?.email;
  if (!ownerEmail) throw new Error("No autorizado");

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const closingDayRaw = String(formData.get("closingDay") ?? "").trim();
  const closingDay = closingDayRaw ? Number(closingDayRaw) : null;
  if (closingDay !== null && (!Number.isInteger(closingDay) || closingDay < 1 || closingDay > 31)) {
    return;
  }

  await db.insert(cards).values({ ownerEmail, name, closingDay });
  revalidatePath("/cards");
}
