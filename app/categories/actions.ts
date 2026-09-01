"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/db/client";
import { categories } from "@/db/schema";

export async function addCategory(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("No autorizado");

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  await db.insert(categories).values({ name });
  revalidatePath("/categories");
}
