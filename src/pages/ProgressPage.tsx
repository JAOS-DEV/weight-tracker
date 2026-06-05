import { useState } from "react";
import type { TimeRange, UserSettings, WeightEntry } from "../types/weight";
import { TIME_RANGE_LABELS } from "../utils/dateRanges";
import {
  getEntriesForRange,
  getStatsForRange,
  sortEntriesByDate,
} from "../utils/weightStats";
import { StatCard } from "../components/StatCard";
import { WeightChart } from "../components/WeightChart";

interface ProgressPageProps {
  entries: WeightEntry[];
  settings: UserSettings;
}

const TIME_RANGES: TimeRange[] = ["7d", "1m", "3m", "6m", "1y", "all"];

function formatStat(
  value: number | null,
  unit: UserSettings["preferredUnit"],
): string {
  if (value === null) {
    return "—";
  }
  return `${value} ${unit}`;
}

function formatChange(
  value: number | null,
  unit: UserSettings["preferredUnit"],
): string {
  if (value === null) {
    return "—";
  }
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value} ${unit}`;
}

export function ProgressPage({
  entries,
  settings,
}: ProgressPageProps): React.ReactElement {
  const [range, setRange] = useState<TimeRange>("1m");
  const stats = getStatsForRange(entries, range, settings.preferredUnit);
  const rangeEntries = sortEntriesByDate(
    getEntriesForRange(entries, range),
    false,
  );

  return (
    <div className="page">
      <header className="page__header">
        <h1>Progress</h1>
        <p className="page__subtitle">Track your weight over time</p>
      </header>

      <section className="card">
        <h2 className="card__title">Time range</h2>
        <div className="range-filters">
          {TIME_RANGES.map((timeRange) => (
            <button
              key={timeRange}
              type="button"
              className={`range-filters__button ${
                range === timeRange ? "range-filters__button--active" : ""
              }`}
              onClick={() => setRange(timeRange)}
            >
              {TIME_RANGE_LABELS[timeRange]}
            </button>
          ))}
        </div>
      </section>

      {stats.entryCount === 0 ? (
        <section className="empty-state">
          <p>Not enough data for this range</p>
          <p className="empty-state__hint">Add weight entries to see progress</p>
        </section>
      ) : (
        <>
          <section className="stats-grid">
            <StatCard
              label="Starting weight"
              value={formatStat(stats.startingWeight, settings.preferredUnit)}
            />
            <StatCard
              label="Latest weight"
              value={formatStat(stats.currentWeight, settings.preferredUnit)}
            />
            <StatCard
              label="Total change"
              value={formatChange(stats.totalChange, settings.preferredUnit)}
            />
            <StatCard
              label="Average weight"
              value={formatStat(stats.averageWeight, settings.preferredUnit)}
            />
            <StatCard
              label="Highest weight"
              value={formatStat(stats.highestWeight, settings.preferredUnit)}
            />
            <StatCard
              label="Lowest weight"
              value={formatStat(stats.lowestWeight, settings.preferredUnit)}
            />
            <StatCard
              label="Number of entries"
              value={String(stats.entryCount)}
            />
          </section>

          <section className="card">
            <h2 className="card__title">Weight chart</h2>
            <WeightChart
              entries={rangeEntries}
              preferredUnit={settings.preferredUnit}
            />
          </section>
        </>
      )}
    </div>
  );
}
