import { useState } from "react";
import type { WeightEntry, WeightUnit } from "../types/weight";
import { validateWeightInput } from "../storage/weightStorage";
import { UnitSelector } from "./UnitSelector";

interface HistoryItemProps {
  entry: WeightEntry;
  displayWeight: string;
  displayUnit: WeightUnit;
  onUpdate: (id: string, weight: number, unit: WeightUnit) => void;
  onDelete: (id: string) => void;
}

export function HistoryItem({
  entry,
  displayWeight,
  displayUnit,
  onUpdate,
  onDelete,
}: HistoryItemProps): React.ReactElement {
  const [isEditing, setIsEditing] = useState(false);
  const [weight, setWeight] = useState(String(entry.weight));
  const [unit, setUnit] = useState<WeightUnit>(entry.unit);
  const [error, setError] = useState<string | null>(null);

  const handleSave = (): void => {
    const validation = validateWeightInput(weight);

    if (!validation.valid || validation.weight === undefined) {
      setError(validation.error ?? "Invalid weight.");
      return;
    }

    onUpdate(entry.id, validation.weight, unit);
    setError(null);
    setIsEditing(false);
  };

  const handleCancel = (): void => {
    setWeight(String(entry.weight));
    setUnit(entry.unit);
    setError(null);
    setIsEditing(false);
  };

  const handleDelete = (): void => {
    const confirmed = window.confirm(
      `Delete the entry for ${entry.date} (${displayWeight} ${displayUnit})?`,
    );

    if (confirmed) {
      onDelete(entry.id);
    }
  };

  return (
    <li className="history-item">
      <div className="history-item__main">
        <p className="history-item__date">{entry.date}</p>
        {isEditing ? (
          <div className="history-item__edit">
            <input
              className="history-item__input"
              type="number"
              inputMode="decimal"
              step="0.1"
              min="0"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
            />
            <UnitSelector value={unit} onChange={setUnit} />
          </div>
        ) : (
          <p className="history-item__weight">
            {displayWeight} {displayUnit}
          </p>
        )}
        {error ? <p className="history-item__error">{error}</p> : null}
      </div>
      <div className="history-item__actions">
        {isEditing ? (
          <>
            <button
              type="button"
              className="button button--small button--primary"
              onClick={handleSave}
            >
              Save
            </button>
            <button
              type="button"
              className="button button--small button--secondary"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="button button--small button--secondary"
              onClick={() => setIsEditing(true)}
            >
              Edit
            </button>
            <button
              type="button"
              className="button button--small button--danger"
              onClick={handleDelete}
            >
              Delete
            </button>
          </>
        )}
      </div>
    </li>
  );
}
