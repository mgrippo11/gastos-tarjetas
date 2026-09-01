import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseStatementText } from "../lib/pdf-parser";

const fixture = readFileSync(
  join(__dirname, "fixtures/resumen-ejemplo.txt"),
  "utf-8"
);

describe("parseStatementText", () => {
  it("extrae las líneas de gasto de un resumen real (5 de 5)", () => {
    const result = parseStatementText(fixture);
    expect(result).toEqual([
      { date: "03/01", description: "SPOTIFY AR", amount: 1499 },
      { date: "05/01", description: "SUPERMERCADO DIA SUC 123", amount: 8750.5 },
      { date: "12/01", description: "PAGO SU FACTURA", amount: -15000 },
      { date: "18/01", description: "NETFLIX.COM", amount: 3200 },
      { date: "20/01", description: "FARMACITY", amount: 980.25 },
    ]);
  });

  it("descarta encabezados, totales y líneas sin fecha sin romper el resto", () => {
    const text = [
      "RESUMEN DE CUENTA",
      "SALDO ANTERIOR                    45.230,10",
      "01/02   SERVICIO DE LUZ           4.500,00",
      "LIMITE DE COMPRA                 250.000,00",
    ].join("\n");

    expect(parseStatementText(text)).toEqual([
      { date: "01/02", description: "SERVICIO DE LUZ", amount: 4500 },
    ]);
  });

  it("texto vacío devuelve lista vacía", () => {
    expect(parseStatementText("")).toEqual([]);
  });
});
