import type {
  ExportData,
  UserSettings,
  WeightEntry,
  WeightUnit,
} from "../types/weight";
import { getTodayDateString, isValidDateString } from "../utils/dateRanges";
import { convertWeight, roundWeight } from "../utils/weightConversions";
import { sortEntriesByDate, upsertEntryForDate } from "../utils/weightStats";

const ENTRIES_KEY = "weightpal_entries";
const SETTINGS_KEY = "weightpal_settings";

const DEFAULT_SETTINGS: UserSettings = {
  preferredUnit: "kg",
};

export interface WeightStorage {
  getEntries(): WeightEntry[];
  saveEntries(entries: WeightEntry[]): void;
  getSettings(): UserSettings;
  saveSettings(settings: UserSettings): void;
}

export interface WeightValidationResult {
  valid: boolean;
  weight?: number;
  error?: string;
}

export interface DateValidationResult {
  valid: boolean;
  error?: string;
}

export interface UpdateEntryInput {
  date: string;
  weight: number;
  unit: WeightUnit;
  note?: string;
}

export interface UpdateEntryResult {
  success: boolean;
  entries: WeightEntry[];
  error?: string;
}

export function validateDateInput(value: string): DateValidationResult {
  const trimmed = value.trim();

  if (!trimmed) {
    return { valid: false, error: "Please select a date." };
  }

  if (!isValidDateString(trimmed)) {
    return { valid: false, error: "Please enter a valid date." };
  }

  if (trimmed > getTodayDateString()) {
    return { valid: false, error: "Future dates are not allowed." };
  }

  return { valid: true };
}

export function validateWeightInput(value: string): WeightValidationResult {
  const trimmed = value.trim();

  if (!trimmed) {
    return { valid: false, error: "Please enter a weight." };
  }

  const parsed = Number(trimmed);

  if (!Number.isFinite(parsed)) {
    return { valid: false, error: "Please enter a valid number." };
  }

  if (parsed <= 0) {
    return { valid: false, error: "Weight must be greater than zero." };
  }

  return { valid: true, weight: parsed };
}

export function validateGoalWeightInput(
  value: string,
): WeightValidationResult {
  if (!value.trim()) {
    return { valid: true, weight: undefined };
  }

  return validateWeightInput(value);
}

function normalizeSettings(settings: UserSettings): UserSettings {
  const normalized: UserSettings = {
    preferredUnit:
      settings.preferredUnit === "lb" ? "lb" : DEFAULT_SETTINGS.preferredUnit,
  };

  if (
    typeof settings.goalWeight === "number" &&
    Number.isFinite(settings.goalWeight) &&
    settings.goalWeight > 0
  ) {
    normalized.goalWeight = roundWeight(settings.goalWeight);
  }

  return normalized;
}

class LocalWeightStorage implements WeightStorage {
  getEntries(): WeightEntry[] {
    try {
      const raw = localStorage.getItem(ENTRIES_KEY);
      if (!raw) {
        return [];
      }

      const parsed = JSON.parse(raw) as WeightEntry[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  saveEntries(entries: WeightEntry[]): void {
    localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
  }

  getSettings(): UserSettings {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) {
        return DEFAULT_SETTINGS;
      }

      const parsed = JSON.parse(raw) as UserSettings;
      return normalizeSettings(parsed);
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  saveSettings(settings: UserSettings): void {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(normalizeSettings(settings)));
  }
}

export const weightStorage: WeightStorage = new LocalWeightStorage();

export function updateSettings(partial: Partial<UserSettings>): UserSettings {
  const currentSettings = weightStorage.getSettings();
  const updatedSettings = normalizeSettings({ ...currentSettings, ...partial });
  weightStorage.saveSettings(updatedSettings);
  return updatedSettings;
}

export function saveEntryForDate(
  date: string,
  weight: number,
  unit: WeightUnit,
): WeightEntry[] {
  const entries = weightStorage.getEntries();
  const updatedEntries = upsertEntryForDate(entries, date, weight, unit);
  weightStorage.saveEntries(updatedEntries);
  return updatedEntries;
}

export function updateEntry(
  id: string,
  input: UpdateEntryInput,
): UpdateEntryResult {
  const entries = weightStorage.getEntries();
  const existingEntry = entries.find((entry) => entry.id === id);

  if (!existingEntry) {
    return { success: false, entries, error: "Entry not found." };
  }

  const dateConflict = entries.find(
    (entry) => entry.date === input.date && entry.id !== id,
  );

  if (dateConflict) {
    return {
      success: false,
      entries,
      error: "An entry already exists for this date.",
    };
  }

  const updatedEntries = entries.map((entry) =>
    entry.id === id
      ? {
          ...entry,
          date: input.date,
          weight: input.weight,
          unit: input.unit,
          note: input.note?.trim() ? input.note.trim() : undefined,
          updatedAt: new Date().toISOString(),
        }
      : entry,
  );

  weightStorage.saveEntries(updatedEntries);
  return { success: true, entries: updatedEntries };
}

export function deleteEntry(id: string): WeightEntry[] {
  const entries = weightStorage.getEntries();
  const updatedEntries = entries.filter((entry) => entry.id !== id);
  weightStorage.saveEntries(updatedEntries);
  return updatedEntries;
}

export function savePreferredUnit(preferredUnit: WeightUnit): UserSettings {
  const currentSettings = weightStorage.getSettings();
  let goalWeight = currentSettings.goalWeight;

  if (
    goalWeight !== undefined &&
    currentSettings.preferredUnit !== preferredUnit
  ) {
    goalWeight = roundWeight(
      convertWeight(goalWeight, currentSettings.preferredUnit, preferredUnit),
    );
  }

  return updateSettings({ preferredUnit, goalWeight });
}

export function saveGoalWeight(goalWeight?: number): UserSettings {
  return updateSettings({ goalWeight });
}

export function exportAppData(): ExportData {
  return {
    version: 1,
    entries: sortEntriesByDate(weightStorage.getEntries(), true),
    settings: weightStorage.getSettings(),
    exportedAt: new Date().toISOString(),
  };
}

export function importAppData(rawData: string): { success: boolean; error?: string } {
  try {
    const parsed = JSON.parse(rawData) as ExportData;

    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.entries)) {
      return { success: false, error: "Invalid backup file format." };
    }

    const validEntries = parsed.entries.filter(
      (entry) =>
        typeof entry.id === "string" &&
        typeof entry.date === "string" &&
        typeof entry.weight === "number" &&
        (entry.unit === "kg" || entry.unit === "lb"),
    );

    const dates = new Set<string>();
    for (const entry of validEntries) {
      if (dates.has(entry.date)) {
        return {
          success: false,
          error: "Backup contains duplicate dates and cannot be imported.",
        };
      }
      dates.add(entry.date);
    }

    weightStorage.saveEntries(validEntries);
    weightStorage.saveSettings(normalizeSettings(parsed.settings ?? DEFAULT_SETTINGS));
    return { success: true };
  } catch {
    return { success: false, error: "Could not read backup file." };
  }
}
