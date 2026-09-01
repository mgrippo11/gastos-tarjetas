"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth, isAdminEmail } from "@/auth";
import { db } from "@/db/client";
import { users } from "@/db/schema";

async function requireAdmin() {
  const session = await auth();
  if (!isAdminEmail(session?.user?.email)) {
    throw new Error("No autorizado");
  }
}

export async function addUser(formData: FormData) {
  await requireAdmin();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!email || !email.includes("@")) return;
  await db.insert(users).values({ email }).onConflictDoNothing();
  revalidatePath("/admin/users");
}

export async function removeUser(email: string) {
  await requireAdmin();
  await db.delete(users).where(eq(users.email, email));
  revalidatePath("/admin/users");
}
