// ponytail: parser genérico por regex (fecha + descripción + monto), agregar
// parser específico por banco si el genérico falla seguido con resúmenes reales.

export type ParsedExpenseLine = {
  date: string; // tal como aparece en el resumen, ej "15/01" o "15/01/2026"
  description: string;
  amount: number; // ARS, negativo si es un pago/crédito
};

const LINE_PATTERN =
  /^(\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?)\s+(.+?)\s+\$?\s*(-?\d{1,3}(?:\.\d{3})*,\d{2})-?$/;

function parseArsAmount(raw: string): number {
  // "1.234,56" -> 1234.56 ; "-500,00" -> -500 ; formato AR (miles con punto, decimales con coma)
  return Number(raw.replace(/\./g, "").replace(",", "."));
}

/** Extrae líneas candidatas a gasto (fecha + descripción + monto) del texto de un resumen. */
export function parseStatementText(text: string): ParsedExpenseLine[] {
  const results: ParsedExpenseLine[] = [];

  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;

    const match = line.match(LINE_PATTERN);
    if (!match) continue;

    const [, date, description, amountRaw] = match;
    const amount = parseArsAmount(amountRaw);
    if (!Number.isFinite(amount) || amount === 0) continue;

    results.push({ date, description: description.trim(), amount });
  }

  return results;
}

/** Extrae el texto plano de un PDF de resumen. */
export async function extractPdfText(buffer: Buffer): Promise<string> {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return result.text;
  } finally {
    await parser.destroy();
  }
}
