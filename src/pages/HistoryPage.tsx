import type { UserSettings, WeightEntry, WeightUnit } from "../types/weight";
import { convertEntryWeight, sortEntriesByDate } from "../utils/weightStats";
import { HistoryItem } from "../components/HistoryItem";

interface HistoryPageProps {
  entries: WeightEntry[];
  settings: UserSettings;
  onUpdateEntry: (id: string, weight: number, unit: WeightUnit) => void;
  onDeleteEntry: (id: string) => void;
}

export function HistoryPage({
  entries,
  settings,
  onUpdateEntry,
  onDeleteEntry,
}: HistoryPageProps): React.ReactElement {
  const sortedEntries = sortEntriesByDate(entries, true);

  return (
    <div className="page">
      <header className="page__header">
        <h1>History</h1>
        <p className="page__subtitle">All saved weight entries</p>
      </header>

      {sortedEntries.length === 0 ? (
        <section className="empty-state">
          <p>No weight entries yet</p>
          <p className="empty-state__hint">Add your first weight entry on Today</p>
        </section>
      ) : (
        <ul className="history-list">
          {sortedEntries.map((entry) => {
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
    </div>
  );
}
