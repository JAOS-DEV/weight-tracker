import type { TimeRange, WeightEntry, WeightUnit } from "../types/weight";
import {
  formatDate,
  getEndOfMonth,
  getEndOfWeek,
  getRangeStartDate,
  getStartOfMonth,
  getStartOfWeek,
  getTodayDateString,
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

export interface MovingAveragePoint {
  date: string;
  value: number;
}

export interface WeeklySummary {
  average: number | null;
  changeFromLastWeek: number | null;
  daysLogged: number;
  highest: number | null;
  lowest: number | null;
}

export interface MonthComparison {
  currentMonthAverage: number | null;
  previousMonthAverage: number | null;
  change: number | null;
}

export interface GoalProgress {
  latestWeight: number | null;
  goalWeight: number;
  remaining: number | null;
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

export function getPreviousWeekEntries(entries: WeightEntry[]): WeightEntry[] {
  const now = new Date();
  const currentWeekStart = getStartOfWeek(now);
  const previousWeekEnd = new Date(currentWeekStart);
  previousWeekEnd.setDate(previousWeekEnd.getDate() - 1);
  const previousWeekStart = getStartOfWeek(previousWeekEnd);

  return entries.filter((entry) => {
    const entryDate = parseDate(entry.date);
    return entryDate >= previousWeekStart && entryDate <= previousWeekEnd;
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

export function getPreviousMonthEntries(entries: WeightEntry[]): WeightEntry[] {
  const now = new Date();
  const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const monthStart = getStartOfMonth(previousMonth);
  const monthEnd = getEndOfMonth(previousMonth);

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
  note?: string,
): WeightEntry[] {
  const now = new Date().toISOString();
  const existingEntry = entries.find((entry) => entry.date === date);

  if (existingEntry) {
    return entries.map((entry) =>
      entry.date === date
        ? { ...entry, weight, unit, note, updatedAt: now }
        : entry,
    );
  }

  const newEntry: WeightEntry = {
    id: crypto.randomUUID(),
    date,
    weight,
    unit,
    note,
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

export function getDaysLoggedThisWeek(entries: WeightEntry[]): number {
  return getCurrentWeekEntries(entries).length;
}

export function getLoggingStreak(entries: WeightEntry[]): number {
  if (entries.length === 0) {
    return 0;
  }

  const dateSet = new Set(entries.map((entry) => entry.date));
  const today = getTodayDateString();
  const cursor = new Date();

  if (!dateSet.has(today)) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;

  while (dateSet.has(formatDate(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export function getWeeklySummary(
  entries: WeightEntry[],
  preferredUnit: WeightUnit,
): WeeklySummary {
  const weekEntries = getCurrentWeekEntries(entries);
  const previousWeekEntries = getPreviousWeekEntries(entries);
  const weekWeights = weekEntries.map((entry) =>
    convertEntryWeight(entry, preferredUnit),
  );
  const previousWeekWeights = previousWeekEntries.map((entry) =>
    convertEntryWeight(entry, preferredUnit),
  );
  const average = getAverage(weekWeights);
  const previousAverage = getAverage(previousWeekWeights);

  return {
    average,
    changeFromLastWeek:
      average !== null && previousAverage !== null
        ? roundWeight(average - previousAverage)
        : null,
    daysLogged: weekEntries.length,
    highest: weekWeights.length > 0 ? roundWeight(Math.max(...weekWeights)) : null,
    lowest: weekWeights.length > 0 ? roundWeight(Math.min(...weekWeights)) : null,
  };
}

export function getMovingAverageSeries(
  entries: WeightEntry[],
  preferredUnit: WeightUnit,
  windowDays = 7,
): MovingAveragePoint[] {
  const sortedEntries = sortEntriesByDate(entries, false);

  return sortedEntries.map((entry, index) => {
    const entryDate = parseDate(entry.date);
    const windowStart = new Date(entryDate);
    windowStart.setDate(windowStart.getDate() - (windowDays - 1));

    const windowEntries = sortedEntries.filter((candidate, candidateIndex) => {
      if (candidateIndex > index) {
        return false;
      }

      const candidateDate = parseDate(candidate.date);
      return candidateDate >= windowStart && candidateDate <= entryDate;
    });

    const weights = windowEntries.map((windowEntry) =>
      convertEntryWeight(windowEntry, preferredUnit),
    );

    return {
      date: entry.date,
      value: getAverage(weights) ?? convertEntryWeight(entry, preferredUnit),
    };
  });
}

export function getMonthOverMonthComparison(
  entries: WeightEntry[],
  preferredUnit: WeightUnit,
): MonthComparison {
  const currentMonthAverage = getMonthlyAverage(entries, preferredUnit);
  const previousMonthEntries = getPreviousMonthEntries(entries);
  const previousMonthWeights = previousMonthEntries.map((entry) =>
    convertEntryWeight(entry, preferredUnit),
  );
  const previousMonthAverage = getAverage(previousMonthWeights);

  return {
    currentMonthAverage,
    previousMonthAverage,
    change:
      currentMonthAverage !== null && previousMonthAverage !== null
        ? roundWeight(currentMonthAverage - previousMonthAverage)
        : null,
  };
}

export function getGoalProgress(
  entries: WeightEntry[],
  goalWeight: number,
  preferredUnit: WeightUnit,
): GoalProgress {
  const sortedEntries = sortEntriesByDate(entries, true);
  const latestWeight =
    sortedEntries.length > 0
      ? convertEntryWeight(sortedEntries[0], preferredUnit)
      : null;

  return {
    latestWeight,
    goalWeight,
    remaining:
      latestWeight !== null ? roundWeight(latestWeight - goalWeight) : null,
  };
}

export function getUniqueYears(entries: WeightEntry[]): number[] {
  const years = new Set(entries.map((entry) => parseDate(entry.date).getFullYear()));
  return [...years].sort((a, b) => b - a);
}

export function filterEntriesByMonthYear(
  entries: WeightEntry[],
  year: string,
  month: string,
): WeightEntry[] {
  return entries.filter((entry) => {
    const entryDate = parseDate(entry.date);
    const matchesYear = year === "all" || entryDate.getFullYear() === Number(year);
    const matchesMonth =
      month === "all" || entryDate.getMonth() + 1 === Number(month);
    return matchesYear && matchesMonth;
  });
}
