import type { WeightUnit } from "../types/weight";

const KG_TO_LB = 2.20462;

export function kgToLb(kg: number): number {
  return kg * KG_TO_LB;
}

export function lbToKg(lb: number): number {
  return lb / KG_TO_LB;
}

export function convertWeight(
  weight: number,
  from: WeightUnit,
  to: WeightUnit,
): number {
  if (from === to) {
    return weight;
  }
  if (from === "kg") {
    return kgToLb(weight);
  }
  return lbToKg(weight);
}

export function roundWeight(weight: number): number {
  return Math.round(weight * 10) / 10;
}
