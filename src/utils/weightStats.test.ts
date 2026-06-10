import { describe, expect, it } from "vitest";
import type { WeightEntry } from "../types/weight";
import {
  getAverage,
  getGoalProgress,
  getLoggingStreak,
  getMonthOverMonthComparison,
  getMovingAverageSeries,
  getStatsForRange,
  getWeeklySummary,
  sortEntriesByDate,
  upsertEntryForDate,
} from "./weightStats";

const sampleEntries: WeightEntry[] = [
  {
    id: "1",
    date: "2026-05-01",
    weight: 100,
    unit: "kg",
    createdAt: "2026-05-01T08:00:00.000Z",
    updatedAt: "2026-05-01T08:00:00.000Z",
  },
  {
    id: "2",
    date: "2026-05-15",
    weight: 98,
    unit: "kg",
    createdAt: "2026-05-15T08:00:00.000Z",
    updatedAt: "2026-05-15T08:00:00.000Z",
  },
  {
    id: "3",
    date: "2026-06-01",
    weight: 220,
    unit: "lb",
    createdAt: "2026-06-01T08:00:00.000Z",
    updatedAt: "2026-06-01T08:00:00.000Z",
  },
];

describe("weightStats", () => {
  it("calculates average from actual entries only", () => {
    expect(getAverage([100, 98, 99.8])).toBe(99.3);
    expect(getAverage([])).toBeNull();
  });

  it("sorts entries by date", () => {
    const sorted = sortEntriesByDate(sampleEntries, true);
    expect(sorted[0].date).toBe("2026-06-01");
    expect(sorted[2].date).toBe("2026-05-01");
  });

  it("upserts instead of duplicating same date", () => {
    const updated = upsertEntryForDate(sampleEntries, "2026-05-15", 97.5, "kg");
    expect(updated).toHaveLength(3);
    expect(updated.find((entry) => entry.date === "2026-05-15")?.weight).toBe(
      97.5,
    );
  });

  it("creates a new entry for a new date", () => {
    const updated = upsertEntryForDate(sampleEntries, "2026-06-05", 96, "kg");
    expect(updated).toHaveLength(4);
    expect(updated.some((entry) => entry.date === "2026-06-05")).toBe(true);
  });

  it("calculates range stats with unit conversion", () => {
    const stats = getStatsForRange(sampleEntries, "all", "kg");
    expect(stats.entryCount).toBe(3);
    expect(stats.startingWeight).toBe(100);
    expect(stats.currentWeight).toBe(99.8);
    expect(stats.totalChange).toBe(-0.2);
    expect(stats.averageWeight).toBe(99.3);
    expect(stats.highestWeight).toBe(100);
    expect(stats.lowestWeight).toBe(98);
  });

  it("builds a seven day moving average series", () => {
    const series = getMovingAverageSeries(sampleEntries, "kg", 7);
    expect(series).toHaveLength(3);
    expect(series[0].value).toBe(100);
    expect(series[1].value).toBe(98);
    expect(series[2].value).toBe(99.8);
  });

  it("calculates goal progress", () => {
    const progress = getGoalProgress(sampleEntries, 95, "kg");
    expect(progress.latestWeight).toBe(99.8);
    expect(progress.remaining).toBe(4.8);
  });

  it("returns weekly summary values", () => {
    const summary = getWeeklySummary(sampleEntries, "kg");
    expect(summary.daysLogged).toBeGreaterThanOrEqual(0);
    expect(summary.highest === null || typeof summary.highest === "number").toBe(
      true,
    );
  });

  it("returns month comparison values", () => {
    const comparison = getMonthOverMonthComparison(sampleEntries, "kg");
    expect(comparison.currentMonthAverage).not.toBeNull();
  });

  it("returns zero streak for empty entries", () => {
    expect(getLoggingStreak([])).toBe(0);
  });
});
