export type WeightUnit = "kg" | "lb";

export type WeightEntry = {
  id: string;
  date: string;
  weight: number;
  unit: WeightUnit;
  note?: string;
  createdAt: string;
  updatedAt: string;
};

export type UserSettings = {
  preferredUnit: WeightUnit;
  goalWeight?: number;
};

export type TimeRange = "7d" | "1m" | "3m" | "6m" | "1y" | "all";

export interface ExportData {
  version: 1;
  entries: WeightEntry[];
  settings: UserSettings;
  exportedAt: string;
}
