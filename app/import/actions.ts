"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/db/client";
import { expenses } from "@/db/schema";
import { extractPdfText, parseStatementText } from "@/lib/pdf-parser";
import { shortDateToMonth, subtractMonths } from "@/lib/dates";

export type ImportCandidate = {
  date: string;
  description: string;
  amount: number;
  purchaseMonth: string;
  totalInstallments: number;
  installmentNumber: number; // 1 = compra nueva; >1 = ya venía en cuotas, probablemente ya cargada
};

/** Extrae y parsea el PDF. No toca la base — el resultado se edita en el navegador antes de confirmar. */
export async function parsePdf(formData: FormData): Promise<ImportCandidate[]> {
  const session = await auth();
  if (!session?.user?.email) throw new Error("No autorizado");

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) throw new Error("Subí un PDF");

  const buffer = Buffer.from(await file.arrayBuffer());
  const text = await extractPdfText(buffer);
  const lines = parseStatementText(text);

  // montos negativos son pagos/créditos (ej. "SU PAGO EN PESOS"), no gastos
  return lines.filter((l) => l.amount > 0).map((l) => {
    const statementMonth = shortDateToMonth(l.date);
    // "Cuota 5/12" en agosto -> la compra fue hace 4 meses, en abril.
    const purchaseMonth = subtractMonths(statementMonth, l.installmentNumber - 1);
    return { ...l, purchaseMonth };
  });
}

export type ImportRow = {
  description: string;
  amount: number;
  purchaseMonth: string;
  totalInstallments: number;
  categoryId: number | null;
};

export async function confirmImport(cardId: number | null, rows: ImportRow[]) {
  const session = await auth();
  const ownerEmail = session?.user?.email;
  if (!ownerEmail) throw new Error("No autorizado");

  const valid = rows.filter(
    (r) =>
      r.description.trim() &&
      Number.isFinite(r.amount) &&
      r.amount > 0 &&
      /^\d{4}-\d{2}$/.test(r.purchaseMonth) &&
      Number.isInteger(r.totalInstallments) &&
      r.totalInstallments >= 1
  );
  if (valid.length === 0) return;

  await db.insert(expenses).values(
    valid.map((r) => ({
      ownerEmail,
      cardId,
      categoryId: r.categoryId,
      description: r.description.trim(),
      amount: r.amount,
      totalInstallments: r.totalInstallments,
      purchaseMonth: r.purchaseMonth,
      dueDay: null,
    }))
  );

  revalidatePath("/expenses");
  redirect("/expenses");
}
