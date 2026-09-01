import { describe, expect, it } from "vitest";
import { installmentNumberForMonth, monthsForExpense } from "../lib/installments";

describe("monthsForExpense", () => {
  it("1 cuota devuelve solo el mes de compra", () => {
    expect(monthsForExpense("2026-03", 1)).toEqual(["2026-03"]);
  });

  it("3 cuotas dentro del mismo año", () => {
    expect(monthsForExpense("2026-01", 3)).toEqual(["2026-01", "2026-02", "2026-03"]);
  });

  it("12 cuotas cruzando fin de año", () => {
    expect(monthsForExpense("2025-12", 12)).toEqual([
      "2025-12", "2026-01", "2026-02", "2026-03", "2026-04", "2026-05",
      "2026-06", "2026-07", "2026-08", "2026-09", "2026-10", "2026-11",
    ]);
  });
});

describe("installmentNumberForMonth", () => {
  it("devuelve el número de cuota 1-based para un mes dentro del rango", () => {
    expect(installmentNumberForMonth("2026-01", 3, "2026-02")).toBe(2);
  });

  it("devuelve null para un mes fuera del rango de cuotas", () => {
    expect(installmentNumberForMonth("2026-01", 3, "2026-05")).toBeNull();
  });
});
