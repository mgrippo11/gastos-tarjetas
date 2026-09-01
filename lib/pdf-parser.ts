// ponytail: parser genérico por regex (fecha + descripción + monto), agregar
// parser específico por banco si el genérico falla seguido con resúmenes reales.

export type ParsedExpenseLine = {
  date: string; // tal como aparece en el resumen, ej "15.06.26" o "15/01/2026"
  description: string;
  amount: number; // ARS, negativo para pagos/créditos
  installmentNumber: number; // 1 si no dice "Cuota N/M"
  totalInstallments: number; // 1 si no dice "Cuota N/M"
};

// Fecha (DD/MM, DD.MM.YY, DD-MM-YYYY...) + descripción + monto en formato AR
// ($ opcional, signo "-" antes o después como pagos: "-500,00" o "500,00-").
// Ancorado a fin de línea: si hay más de un monto en la línea (ej. columna de
// dólares en 0,00 al final), toma el último — así los renglones de comisiones
// con esa columna extra quedan afuera solos (0 se descarta más abajo).
const LINE_PATTERN =
  /^(\d{1,2}[./-]\d{1,2}(?:[./-]\d{2,4})?)\s+(.+?)\s+\$?\s*(-)?(\d{1,3}(?:\.\d{3})*,\d{2})(-)?$/;

// Comprobante tipo "005263* " o "000001K " al inicio de la descripción: ruido, no aporta.
const VOUCHER_CODE_PREFIX = /^\d{4,8}[*A-Z]?\s+/;

// "Cuota 05/12" (Galicia) o "C.05/12" (ICBC) en la descripción: gasto ya en
// cuotas, dice cuál es esta.
const INSTALLMENT_PATTERN = /\s*(?:Cuota\s+|C\.)(\d{1,2})\/(\d{1,2})\s*/i;

function parseArsAmount(raw: string): number {
  // "1.234,56" -> 1234.56 (formato AR: miles con punto, decimales con coma)
  return Number(raw.replace(/\./g, "").replace(",", "."));
}

/** Extrae líneas candidatas a gasto (fecha + descripción + monto) del texto de un resumen. */
export function parseStatementText(text: string): ParsedExpenseLine[] {
  const results: ParsedExpenseLine[] = [];
  const seen = new Set<string>();

  // pdf-parse a veces junta dos "líneas" visuales en una sola separadas por
  // tab (reconstrucción de columnas de pdf.js) — se separan como si fueran
  // renglones distintos.
  for (const rawLine of text.split(/[\n\t]/)) {
    // pdf.js a veces linealiza un borde/separador de tabla como "_" pegado
    // al final de la línea real — no es parte del monto, se descarta.
    const line = rawLine.trim().replace(/[\s_]+$/, "");
    if (!line) continue;

    const match = line.match(LINE_PATTERN);
    if (!match) continue;

    const [, date, descriptionRaw, leadingMinus, amountRaw, trailingMinus] = match;
    const sign = leadingMinus || trailingMinus ? -1 : 1;
    const amount = sign * parseArsAmount(amountRaw);
    if (!Number.isFinite(amount) || amount === 0) continue;

    let description = descriptionRaw.trim().replace(VOUCHER_CODE_PREFIX, "").trim();
    let installmentNumber = 1;
    let totalInstallments = 1;
    const installmentMatch = description.match(INSTALLMENT_PATTERN);
    if (installmentMatch) {
      installmentNumber = Number(installmentMatch[1]);
      totalInstallments = Number(installmentMatch[2]);
      description = description.replace(INSTALLMENT_PATTERN, " ").trim();
    }

    const key = `${date}|${description}|${amount}`;
    if (seen.has(key)) continue; // mismo artefacto de duplicación por tab
    seen.add(key);

    results.push({ date, description, amount, installmentNumber, totalInstallments });
  }

  return results;
}

/** Extrae el texto plano de un PDF de resumen. */
export async function extractPdfText(buffer: Buffer): Promise<string> {
  // el worker debe cargarse antes de instanciar PDFParse (requisito de pdf-parse en serverless)
  await import("pdf-parse/worker");
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return result.text;
  } finally {
    await parser.destroy();
  }
}
