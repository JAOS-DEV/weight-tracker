import type { UserSettings } from "../types/weight";
import type { WeeklySummary } from "../utils/weightStats";

interface WeeklySummaryCardProps {
  summary: WeeklySummary;
  settings: UserSettings;
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

export function WeeklySummaryCard({
  summary,
  settings,
}: WeeklySummaryCardProps): React.ReactElement {
  return (
    <section className="card weekly-summary">
      <h2 className="card__title">This week</h2>
      <div className="weekly-summary__grid">
        <div className="weekly-summary__item">
          <p className="weekly-summary__label">Average</p>
          <p className="weekly-summary__value">
            {formatWeight(summary.average, settings.preferredUnit)}
          </p>
        </div>
        <div className="weekly-summary__item">
          <p className="weekly-summary__label">Vs last week</p>
          <p className="weekly-summary__value">
            {formatChange(summary.changeFromLastWeek, settings.preferredUnit)}
          </p>
        </div>
        <div className="weekly-summary__item">
          <p className="weekly-summary__label">Days logged</p>
          <p className="weekly-summary__value">{summary.daysLogged}</p>
        </div>
        <div className="weekly-summary__item">
          <p className="weekly-summary__label">Range</p>
          <p className="weekly-summary__value">
            {summary.lowest !== null && summary.highest !== null
              ? `${summary.lowest}–${summary.highest} ${settings.preferredUnit}`
              : "—"}
          </p>
        </div>
      </div>
    </section>
  );
}
