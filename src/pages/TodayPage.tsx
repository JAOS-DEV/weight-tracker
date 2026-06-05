import { useState } from "react";
import type { UserSettings, WeightEntry, WeightUnit } from "../types/weight";
import {
  formatDisplayDate,
  getTodayDateString,
} from "../utils/dateRanges";
import {
  convertEntryWeight,
  getChangeSinceLastEntry,
  getMonthlyAverage,
  getWeeklyAverage,
  sortEntriesByDate,
} from "../utils/weightStats";
import { StatCard } from "../components/StatCard";
import { WeightInput } from "../components/WeightInput";

interface TodayPageProps {
  entries: WeightEntry[];
  settings: UserSettings;
  onSaveEntry: (date: string, weight: number, unit: WeightUnit) => void;
}

function formatWeight(
  value: number | null,
  unit: UserSettings["preferredUnit"],
): string {
  if (value === null) {
    return "—";
  }
  return `${value} ${unit}`;
}

function formatChange(change: number | null, unit: UserSettings["preferredUnit"]): string {
  if (change === null) {
    return "—";
  }

  const prefix = change > 0 ? "+" : "";
  return `${prefix}${change} ${unit}`;
}

export function TodayPage({
  entries,
  settings,
  onSaveEntry,
}: TodayPageProps): React.ReactElement {
  const today = getTodayDateString();
  const [selectedDate, setSelectedDate] = useState(today);
  const selectedEntry = entries.find((entry) => entry.date === selectedDate);
  const sortedEntries = sortEntriesByDate(entries, true);
  const latestEntry = sortedEntries[0];
  const currentWeightEntry = entries.find((entry) => entry.date === today) ?? latestEntry ?? null;
  const currentWeight = currentWeightEntry
    ? convertEntryWeight(currentWeightEntry, settings.preferredUnit)
    : null;

  const changeInfo = getChangeSinceLastEntry(entries, settings.preferredUnit);
  const weekAverage = getWeeklyAverage(entries, settings.preferredUnit);
  const monthAverage = getMonthlyAverage(entries, settings.preferredUnit);

  const isToday = selectedDate === today;
  const cardTitle = selectedEntry
    ? isToday
      ? "Update today's weight"
      : `Update entry for ${formatDisplayDate(selectedDate)}`
    : isToday
      ? "Add today's weight"
      : `Add entry for ${formatDisplayDate(selectedDate)}`;

  const handleSave = (date: string, weight: number, unit: WeightUnit): void => {
    onSaveEntry(date, weight, unit);
  };

  return (
    <div className="page">
      <header className="page__header">
        <h1>Today</h1>
        <p className="page__subtitle">{formatDisplayDate(today)}</p>
      </header>

      <section className="card">
        <h2 className="card__title">{cardTitle}</h2>
        {selectedEntry ? (
          <p className="card__text">
            Saved: {selectedEntry.weight} {selectedEntry.unit}
          </p>
        ) : null}
        <WeightInput
          key={selectedDate}
          date={selectedDate}
          initialWeight={selectedEntry ? String(selectedEntry.weight) : ""}
          initialUnit={selectedEntry?.unit ?? settings.preferredUnit}
          onDateChange={setSelectedDate}
          onSave={handleSave}
          submitLabel={selectedEntry ? "Update" : "Save"}
        />
      </section>

      {entries.length === 0 ? (
        <section className="empty-state">
          <p>No weight entries yet</p>
          <p className="empty-state__hint">Add your first weight entry above</p>
        </section>
      ) : (
        <section className="stats-grid">
          <StatCard
            label="Current weight"
            value={formatWeight(currentWeight, settings.preferredUnit)}
          />
          <StatCard
            label="Last recorded weight"
            value={
              changeInfo
                ? formatWeight(changeInfo.previous, settings.preferredUnit)
                : "—"
            }
          />
          <StatCard
            label="Change since last entry"
            value={formatChange(changeInfo?.change ?? null, settings.preferredUnit)}
          />
          <StatCard
            label="Current week average"
            value={formatWeight(weekAverage, settings.preferredUnit)}
          />
          <StatCard
            label="Current month average"
            value={formatWeight(monthAverage, settings.preferredUnit)}
          />
        </section>
      )}
    </div>
  );
}
