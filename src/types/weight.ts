export type WeightUnit = "kg" | "lb";

export type WeightEntry = {
  id: string;
  date: string;
  weight: number;
  unit: WeightUnit;
  createdAt: string;
  updatedAt: string;
};

export type UserSettings = {
  preferredUnit: WeightUnit;
};

export type TimeRange = "7d" | "1m" | "3m" | "6m" | "1y" | "all";
