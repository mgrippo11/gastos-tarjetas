import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseStatementText } from "../lib/pdf-parser";

// Fixture con datos inventados, pero replicando particularidades reales de un
// resumen ICBC/Visa: fechas "DD.MM.YY", comprobante "NNNNNN*" antes de la
// descripción, y líneas que pdf-parse a veces duplica/junta con un tab.
const fixture = readFileSync(join(__dirname, "fixtures/resumen-ejemplo.txt"), "utf-8");

describe("parseStatementText — resumen ICBC/Visa (columnas separadas por espacios; duplicado por tab)", () => {
  it("extrae los consumos de un resumen real, ignora comisiones/pagos/encabezados", () => {
    const result = parseStatementText(fixture);
    expect(result).toEqual([
      { date: "20.06.26", description: "SUPERMERCADO EJEMPLO", amount: 5250.75, installmentNumber: 1, totalInstallments: 1 },
      { date: "25.06.26", description: "SERVICIO STREAMING", amount: 2999, installmentNumber: 1, totalInstallments: 1 },
      { date: "28.07.26", description: "FARMACIA EJEMPLO 000000012345", amount: 1480.5, installmentNumber: 1, totalInstallments: 1 },
    ]);
  });

  it("deduplica una línea que pdf-parse repite entera separada por tab", () => {
    const text = "20.06.26 111111* SUPERMERCADO EJEMPLO 5.250,75\t20.06.26 111111* SUPERMERCADO EJEMPLO 5.250,75";
    expect(parseStatementText(text)).toEqual([
      { date: "20.06.26", description: "SUPERMERCADO EJEMPLO", amount: 5250.75, installmentNumber: 1, totalInstallments: 1 },
    ]);
  });

  it("descarta una línea cuyo último monto es la columna de dólares en 0,00 (comisiones/pagos)", () => {
    const text = "30.06.26 COMISION MANT. DE CUENTA 9.500,00 0,00";
    expect(parseStatementText(text)).toEqual([]);
  });

  it("'C.03/06' (abreviatura ICBC) también se reconoce como cuota", () => {
    const text = "15.06.26 005263* SUPERMERCADO EJEMPLO C.03/06 9.983,33";
    expect(parseStatementText(text)).toEqual([
      { date: "15.06.26", description: "SUPERMERCADO EJEMPLO", amount: 9983.33, installmentNumber: 3, totalInstallments: 6 },
    ]);
  });

  it("descarta encabezados y líneas sin fecha sin romper el resto", () => {
    const text = [
      "RESUMEN DE CUENTA",
      "SALDO ANTERIOR                    45.230,10",
      "01/02   SERVICIO DE LUZ           4.500,00",
      "LIMITE DE COMPRA                 250.000,00",
    ].join("\n");

    expect(parseStatementText(text)).toEqual([
      { date: "01/02", description: "SERVICIO DE LUZ", amount: 4500, installmentNumber: 1, totalInstallments: 1 },
    ]);
  });

  it("texto vacío devuelve lista vacía", () => {
    expect(parseStatementText("")).toEqual([]);
  });
});

// Resumen Galicia real (datos inventados): a diferencia de ICBC, acá el tab
// separa COLUMNAS de un mismo registro (fecha\tcomprobante\tdescripción\tmonto),
// no una línea duplicada. Comprobante "NNNNNNK", pagos con el signo "-" AL
// FINAL (sin columna dólares que los filtre solos).
describe("parseStatementText — resumen Galicia (columnas separadas por tab)", () => {
  it("reconstruye un registro cuyas columnas vienen separadas por tab", () => {
    const text = "18.04.26\t111111*\tTIENDA EJEMPLO\tCuota 05/12\t10.000,00";
    expect(parseStatementText(text)).toEqual([
      { date: "18.04.26", description: "TIENDA EJEMPLO", amount: 10000, installmentNumber: 5, totalInstallments: 12 },
    ]);
  });

  it("un pago (SU PAGO EN PESOS) queda con monto negativo, no positivo", () => {
    const text = "07.08.26\tSU PAGO EN PESOS\t50.000,00-";
    expect(parseStatementText(text)).toEqual([
      { date: "07.08.26", description: "SU PAGO EN PESOS", amount: -50000, installmentNumber: 1, totalInstallments: 1 },
    ]);
  });

  it("extrae comprobante con letra (000001K) igual que con asterisco", () => {
    const text = "20.08.26\t333333K\tCOMPRA UNICA EJEMPLO\t4.500,00";
    expect(parseStatementText(text)).toEqual([
      { date: "20.08.26", description: "COMPRA UNICA EJEMPLO", amount: 4500, installmentNumber: 1, totalInstallments: 1 },
    ]);
  });

  it("no confunde el encabezado de columnas (separado por tabs) con un registro", () => {
    const text = "FECHA\tCOMPROBANTE\tDETALLE DE TRANSACCION\tPESOS\tDOLARES";
    expect(parseStatementText(text)).toEqual([]);
  });
});
