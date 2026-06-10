import { useCallback, useState } from "react";
import type { UserSettings, WeightEntry, WeightUnit } from "../types/weight";
import {
  formatDisplayDate,
  getTodayDateString,
} from "../utils/dateRanges";
import {
  convertEntryWeight,
  getChangeSinceLastEntry,
  getDaysLoggedThisWeek,
  getGoalProgress,
  getLoggingStreak,
  getMonthlyAverage,
  getWeeklyAverage,
  getWeeklySummary,
  sortEntriesByDate,
} from "../utils/weightStats";
import { StatCard } from "../components/StatCard";
import { Toast } from "../components/Toast";
import { WeeklySummaryCard } from "../components/WeeklySummaryCard";
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
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const selectedEntry = entries.find((entry) => entry.date === selectedDate);
  const todayEntry = entries.find((entry) => entry.date === today);
  const sortedEntries = sortEntriesByDate(entries, true);
  const latestEntry = sortedEntries[0];

  const displayedWeightEntry = todayEntry ?? latestEntry ?? null;
  const displayedWeightLabel = todayEntry
    ? "Today's weight"
    : latestEntry
      ? "Latest entry"
      : "Today's weight";
  const displayedWeight = displayedWeightEntry
    ? convertEntryWeight(displayedWeightEntry, settings.preferredUnit)
    : null;

  const changeInfo = getChangeSinceLastEntry(entries, settings.preferredUnit);
  const weekAverage = getWeeklyAverage(entries, settings.preferredUnit);
  const monthAverage = getMonthlyAverage(entries, settings.preferredUnit);
  const daysLoggedThisWeek = getDaysLoggedThisWeek(entries);
  const streak = getLoggingStreak(entries);
  const weeklySummary = getWeeklySummary(entries, settings.preferredUnit);
  const goalProgress =
    settings.goalWeight !== undefined
      ? getGoalProgress(entries, settings.goalWeight, settings.preferredUnit)
      : null;

  const isToday = selectedDate === today;
  const cardTitle = selectedEntry
    ? isToday
      ? "Update today's weight"
      : `Update entry for ${formatDisplayDate(selectedDate)}`
    : isToday
      ? "Add today's weight"
      : `Add entry for ${formatDisplayDate(selectedDate)}`;

  const dismissToast = useCallback((): void => {
    setToastMessage(null);
  }, []);

  const handleSave = (date: string, weight: number, unit: WeightUnit): void => {
    onSaveEntry(date, weight, unit);
    setToastMessage(
      selectedEntry ? "Weight entry updated" : "Weight entry saved",
    );
  };

  return (
    <div className="page">
      {toastMessage ? (
        <Toast message={toastMessage} onDismiss={dismissToast} />
      ) : null}

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
        <>
          <WeeklySummaryCard summary={weeklySummary} settings={settings} />

          <section className="stats-grid">
            <StatCard
              label={displayedWeightLabel}
              value={formatWeight(displayedWeight, settings.preferredUnit)}
              hint={displayedWeightEntry ? displayedWeightEntry.date : undefined}
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
            <StatCard
              label="Days logged this week"
              value={String(daysLoggedThisWeek)}
            />
            <StatCard
              label="Logging streak"
              value={streak === 1 ? "1 day" : `${streak} days`}
              hint={streak > 0 ? "Consecutive days logged" : undefined}
            />
            {goalProgress?.remaining !== null && goalProgress?.remaining !== undefined ? (
              <StatCard
                label="To goal"
                value={formatChange(goalProgress.remaining, settings.preferredUnit)}
                hint={`Goal: ${goalProgress.goalWeight} ${settings.preferredUnit}`}
              />
            ) : null}
          </section>
        </>
      )}
    </div>
  );
}
