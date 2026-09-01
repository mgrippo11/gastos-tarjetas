/** Mes actual en formato "YYYY-MM". */
export function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/** Convierte una fecha de resumen ("DD/MM", "DD.MM.YY", "DD-MM-YYYY"...) a "YYYY-MM". Sin año, asume el actual. */
export function shortDateToMonth(date: string): string {
  const [, month, yearRaw] = date.split(/[./-]/).map(Number);
  const year = yearRaw ? (yearRaw < 100 ? 2000 + yearRaw : yearRaw) : new Date().getFullYear();
  return `${year}-${String(month).padStart(2, "0")}`;
}
