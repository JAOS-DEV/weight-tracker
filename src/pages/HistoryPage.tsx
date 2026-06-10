import { useMemo, useState } from "react";
import type { UserSettings, WeightEntry } from "../types/weight";
import type { UpdateEntryInput } from "../storage/weightStorage";
import {
  convertEntryWeight,
  filterEntriesByMonthYear,
  getUniqueYears,
  sortEntriesByDate,
} from "../utils/weightStats";
import { HistoryItem } from "../components/HistoryItem";

interface HistoryPageProps {
  entries: WeightEntry[];
  settings: UserSettings;
  onUpdateEntry: (id: string, input: UpdateEntryInput) => string | null;
  onDeleteEntry: (id: string) => void;
}

const MONTH_OPTIONS = [
  { value: "all", label: "All months" },
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

export function HistoryPage({
  entries,
  settings,
  onUpdateEntry,
  onDeleteEntry,
}: HistoryPageProps): React.ReactElement {
  const [filterYear, setFilterYear] = useState("all");
  const [filterMonth, setFilterMonth] = useState("all");
  const years = useMemo(() => getUniqueYears(entries), [entries]);

  const filteredEntries = useMemo(() => {
    const filtered = filterEntriesByMonthYear(entries, filterYear, filterMonth);
    return sortEntriesByDate(filtered, true);
  }, [entries, filterYear, filterMonth]);

  return (
    <div className="page">
      <header className="page__header">
        <h1>History</h1>
        <p className="page__subtitle">All saved weight entries</p>
      </header>

      {entries.length === 0 ? (
        <section className="empty-state">
          <p>No weight entries yet</p>
          <p className="empty-state__hint">Add your first weight entry on Today</p>
        </section>
      ) : (
        <>
          <section className="card">
            <h2 className="card__title">Filter</h2>
            <div className="history-filters">
              <label className="history-filters__field">
                <span className="history-filters__label">Year</span>
                <select
                  className="history-filters__select"
                  value={filterYear}
                  onChange={(event) => setFilterYear(event.target.value)}
                >
                  <option value="all">All years</option>
                  {years.map((year) => (
                    <option key={year} value={String(year)}>
                      {year}
                    </option>
                  ))}
                </select>
              </label>
              <label className="history-filters__field">
                <span className="history-filters__label">Month</span>
                <select
                  className="history-filters__select"
                  value={filterMonth}
                  onChange={(event) => setFilterMonth(event.target.value)}
                >
                  {MONTH_OPTIONS.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          {filteredEntries.length === 0 ? (
            <section className="empty-state">
              <p>No entries match this filter</p>
              <p className="empty-state__hint">Try a different year or month</p>
            </section>
          ) : (
            <ul className="history-list">
              {filteredEntries.map((entry) => {
                const displayWeight = String(
                  convertEntryWeight(entry, settings.preferredUnit),
                );

                return (
                  <HistoryItem
                    key={entry.id}
                    entry={entry}
                    displayWeight={displayWeight}
                    displayUnit={settings.preferredUnit}
                    onUpdate={onUpdateEntry}
                    onDelete={onDeleteEntry}
                  />
                );
              })}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
