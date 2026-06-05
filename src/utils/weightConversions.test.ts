import { describe, expect, it } from "vitest";
import {
  convertWeight,
  kgToLb,
  lbToKg,
  roundWeight,
} from "./weightConversions";

describe("weightConversions", () => {
  it("converts kg to lb", () => {
    expect(roundWeight(kgToLb(100))).toBe(220.5);
  });

  it("converts lb to kg", () => {
    expect(roundWeight(lbToKg(220.462))).toBe(100);
  });

  it("returns same value when units match", () => {
    expect(convertWeight(75.5, "kg", "kg")).toBe(75.5);
  });

  it("converts between units", () => {
    expect(roundWeight(convertWeight(100, "kg", "lb"))).toBe(220.5);
    expect(roundWeight(convertWeight(220.5, "lb", "kg"))).toBe(100);
  });

  it("rounds to one decimal place", () => {
    expect(roundWeight(75.555)).toBe(75.6);
    expect(roundWeight(75.54)).toBe(75.5);
  });
});
