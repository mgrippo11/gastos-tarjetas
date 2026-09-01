import { describe, expect, it } from "vitest";
import { shortDateToMonth, subtractMonths } from "../lib/dates";

describe("shortDateToMonth", () => {
  it("fecha con puntos y año de 2 dígitos (formato ICBC/Galicia)", () => {
    expect(shortDateToMonth("15.06.26")).toBe("2026-06");
  });

  it("fecha con barras y sin año, usa el año actual", () => {
    expect(shortDateToMonth("15/06")).toBe(`${new Date().getFullYear()}-06`);
  });
});

describe("subtractMonths", () => {
  it("resta meses dentro del mismo año", () => {
    expect(subtractMonths("2026-08", 3)).toBe("2026-05");
  });

  it("resta meses cruzando el año hacia atrás", () => {
    expect(subtractMonths("2026-02", 4)).toBe("2025-10");
  });

  it("restar 0 devuelve el mismo mes (cuota 1/N)", () => {
    expect(subtractMonths("2026-08", 0)).toBe("2026-08");
  });
});
