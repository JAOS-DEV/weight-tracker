import type { TimeRange, WeightEntry, WeightUnit } from "../types/weight";
import {
  getEndOfMonth,
  getEndOfWeek,
  getRangeStartDate,
  getStartOfMonth,
  getStartOfWeek,
  parseDate,
} from "./dateRanges";
import { convertWeight, roundWeight } from "./weightConversions";

export interface RangeStats {
  startingWeight: number | null;
  currentWeight: number | null;
  totalChange: number | null;
  averageWeight: number | null;
  highestWeight: number | null;
  lowestWeight: number | null;
  entryCount: number;
}

export function getAverage(weights: number[]): number | null {
  if (weights.length === 0) {
    return null;
  }

  const total = weights.reduce((sum, weight) => sum + weight, 0);
  return roundWeight(total / weights.length);
}

export function convertEntryWeight(
  entry: WeightEntry,
  preferredUnit: WeightUnit,
): number {
  return roundWeight(convertWeight(entry.weight, entry.unit, preferredUnit));
}

export function sortEntriesByDate(
  entries: WeightEntry[],
  descending = true,
): WeightEntry[] {
  return [...entries].sort((a, b) => {
    const comparison = a.date.localeCompare(b.date);
    return descending ? -comparison : comparison;
  });
}

export function getCurrentWeekEntries(entries: WeightEntry[]): WeightEntry[] {
  const now = new Date();
  const weekStart = getStartOfWeek(now);
  const weekEnd = getEndOfWeek(now);

  return entries.filter((entry) => {
    const entryDate = parseDate(entry.date);
    return entryDate >= weekStart && entryDate <= weekEnd;
  });
}

export function getCurrentMonthEntries(entries: WeightEntry[]): WeightEntry[] {
  const now = new Date();
  const monthStart = getStartOfMonth(now);
  const monthEnd = getEndOfMonth(now);

  return entries.filter((entry) => {
    const entryDate = parseDate(entry.date);
    return entryDate >= monthStart && entryDate <= monthEnd;
  });
}

export function getEntriesForRange(
  entries: WeightEntry[],
  range: TimeRange,
): WeightEntry[] {
  const rangeStart = getRangeStartDate(range);

  if (!rangeStart) {
    return entries;
  }

  return entries.filter((entry) => parseDate(entry.date) >= rangeStart);
}

export function getStatsForRange(
  entries: WeightEntry[],
  range: TimeRange,
  preferredUnit: WeightUnit,
): RangeStats {
  const rangeEntries = sortEntriesByDate(
    getEntriesForRange(entries, range),
    false,
  );

  if (rangeEntries.length === 0) {
    return {
      startingWeight: null,
      currentWeight: null,
      totalChange: null,
      averageWeight: null,
      highestWeight: null,
      lowestWeight: null,
      entryCount: 0,
    };
  }

  const convertedWeights = rangeEntries.map((entry) =>
    convertEntryWeight(entry, preferredUnit),
  );
  const startingWeight = convertedWeights[0];
  const currentWeight = convertedWeights[convertedWeights.length - 1];

  return {
    startingWeight,
    currentWeight,
    totalChange: roundWeight(currentWeight - startingWeight),
    averageWeight: getAverage(convertedWeights),
    highestWeight: roundWeight(Math.max(...convertedWeights)),
    lowestWeight: roundWeight(Math.min(...convertedWeights)),
    entryCount: rangeEntries.length,
  };
}

export function upsertEntryForDate(
  entries: WeightEntry[],
  date: string,
  weight: number,
  unit: WeightUnit,
): WeightEntry[] {
  const now = new Date().toISOString();
  const existingEntry = entries.find((entry) => entry.date === date);

  if (existingEntry) {
    return entries.map((entry) =>
      entry.date === date
        ? { ...entry, weight, unit, updatedAt: now }
        : entry,
    );
  }

  const newEntry: WeightEntry = {
    id: crypto.randomUUID(),
    date,
    weight,
    unit,
    createdAt: now,
    updatedAt: now,
  };

  return [...entries, newEntry];
}

export function getWeeklyAverage(
  entries: WeightEntry[],
  preferredUnit: WeightUnit,
): number | null {
  const weekEntries = getCurrentWeekEntries(entries);
  const weights = weekEntries.map((entry) =>
    convertEntryWeight(entry, preferredUnit),
  );
  return getAverage(weights);
}

export function getMonthlyAverage(
  entries: WeightEntry[],
  preferredUnit: WeightUnit,
): number | null {
  const monthEntries = getCurrentMonthEntries(entries);
  const weights = monthEntries.map((entry) =>
    convertEntryWeight(entry, preferredUnit),
  );
  return getAverage(weights);
}

export function getChangeSinceLastEntry(
  entries: WeightEntry[],
  preferredUnit: WeightUnit,
): { current: number; previous: number; change: number } | null {
  const sorted = sortEntriesByDate(entries, true);

  if (sorted.length < 2) {
    return null;
  }

  const current = convertEntryWeight(sorted[0], preferredUnit);
  const previous = convertEntryWeight(sorted[1], preferredUnit);

  return {
    current,
    previous,
    change: roundWeight(current - previous),
  };
}
