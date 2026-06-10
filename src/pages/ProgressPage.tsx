import { useState } from "react";
import type { TimeRange, UserSettings, WeightEntry } from "../types/weight";
import { TIME_RANGE_LABELS } from "../utils/dateRanges";
import {
  getEntriesForRange,
  getGoalProgress,
  getMonthOverMonthComparison,
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

function getEmptyStateMessage(entryCount: number, totalEntries: number): {
  title: string;
  hint: string;
} {
  if (totalEntries === 0) {
    return {
      title: "No weight entries yet",
      hint: "Add your first weight entry on Today",
    };
  }

  if (entryCount === 0) {
    return {
      title: "No entries in this range",
      hint: "Try a wider time range or add more entries",
    };
  }

  if (entryCount === 1) {
    return {
      title: "Only one entry in this range",
      hint: "Add another entry to unlock trend stats and the chart",
    };
  }

  return {
    title: "Not enough data for this range",
    hint: "Add weight entries to see progress",
  };
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
  const monthComparison = getMonthOverMonthComparison(entries, settings.preferredUnit);
  const goalProgress =
    settings.goalWeight !== undefined
      ? getGoalProgress(entries, settings.goalWeight, settings.preferredUnit)
      : null;
  const emptyState = getEmptyStateMessage(stats.entryCount, entries.length);
  const showStats = stats.entryCount > 0;
  const showChartSection = stats.entryCount > 0;

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

      {!showStats ? (
        <section className="empty-state">
          <p>{emptyState.title}</p>
          <p className="empty-state__hint">{emptyState.hint}</p>
        </section>
      ) : (
        <>
          {monthComparison.change !== null ? (
            <section className="card card--highlight">
              <h2 className="card__title">This month vs last month</h2>
              <p className="card__metric">
                {formatChange(monthComparison.change, settings.preferredUnit)}
              </p>
              <p className="card__text">
                Current month average:{" "}
                {formatStat(monthComparison.currentMonthAverage, settings.preferredUnit)}
                {" · "}
                Last month average:{" "}
                {formatStat(monthComparison.previousMonthAverage, settings.preferredUnit)}
              </p>
            </section>
          ) : null}

          <section className="stats-grid stats-grid--spaced">
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
            {goalProgress?.remaining !== null && goalProgress?.remaining !== undefined ? (
              <StatCard
                label="To goal"
                value={formatChange(goalProgress.remaining, settings.preferredUnit)}
                hint={`Goal: ${goalProgress.goalWeight} ${settings.preferredUnit}`}
              />
            ) : null}
          </section>

          {showChartSection ? (
            <section className="card">
              <h2 className="card__title">Weight chart</h2>
              <p className="card__text">
                Solid line is your recorded weight. Dashed line is the 7-day moving
                average, which smooths out daily ups and downs.
              </p>
              <WeightChart
                entries={rangeEntries}
                preferredUnit={settings.preferredUnit}
                goalWeight={settings.goalWeight}
              />
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
