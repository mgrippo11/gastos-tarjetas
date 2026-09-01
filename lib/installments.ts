/** Meses ("YYYY-MM") en los que cae cada cuota de un gasto, en orden. */
export function monthsForExpense(
  purchaseMonth: string,
  totalInstallments: number
): string[] {
  const [year, month] = purchaseMonth.split("-").map(Number);
  return Array.from({ length: totalInstallments }, (_, i) => {
    const d = new Date(year, month - 1 + i, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
}

/** Número de cuota (1-based) que cae en `month`, o null si ese gasto no tiene cuota ese mes. */
export function installmentNumberForMonth(
  purchaseMonth: string,
  totalInstallments: number,
  month: string
): number | null {
  const index = monthsForExpense(purchaseMonth, totalInstallments).indexOf(month);
  return index === -1 ? null : index + 1;
}
