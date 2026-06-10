import { useRef, useState } from "react";
import type { WeightEntry, WeightUnit } from "../types/weight";
import { getTodayDateString } from "../utils/dateRanges";
import {
  validateDateInput,
  validateWeightInput,
  type UpdateEntryInput,
} from "../storage/weightStorage";
import { UnitSelector } from "./UnitSelector";

interface HistoryItemProps {
  entry: WeightEntry;
  displayWeight: string;
  displayUnit: WeightUnit;
  onUpdate: (id: string, input: UpdateEntryInput) => string | null;
  onDelete: (id: string) => void;
}

export function HistoryItem({
  entry,
  displayWeight,
  displayUnit,
  onUpdate,
  onDelete,
}: HistoryItemProps): React.ReactElement {
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [date, setDate] = useState(entry.date);
  const [weight, setWeight] = useState(String(entry.weight));
  const [unit, setUnit] = useState<WeightUnit>(entry.unit);
  const [note, setNote] = useState(entry.note ?? "");
  const [error, setError] = useState<string | null>(null);

  const openDatePicker = (): void => {
    const input = dateInputRef.current;
    if (!input) {
      return;
    }

    if (typeof input.showPicker === "function") {
      try {
        input.showPicker();
        return;
      } catch {
        input.focus();
        return;
      }
    }

    input.focus();
  };

  const handleSave = (): void => {
    const dateValidation = validateDateInput(date);
    const weightValidation = validateWeightInput(weight);

    if (!dateValidation.valid) {
      setError(dateValidation.error ?? "Invalid date.");
      return;
    }

    if (!weightValidation.valid || weightValidation.weight === undefined) {
      setError(weightValidation.error ?? "Invalid weight.");
      return;
    }

    const updateError = onUpdate(entry.id, {
      date,
      weight: weightValidation.weight,
      unit,
      note: note.trim() ? note.trim() : undefined,
    });

    if (updateError) {
      setError(updateError);
      return;
    }

    setError(null);
    setIsEditing(false);
  };

  const handleCancel = (): void => {
    setDate(entry.date);
    setWeight(String(entry.weight));
    setUnit(entry.unit);
    setNote(entry.note ?? "");
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
    <li className={`history-item ${isEditing ? "history-item--editing" : ""}`}>
      <div className="history-item__main">
        {isEditing ? (
          <div className="history-item__edit-form">
            <label className="history-item__field-label" htmlFor={`date-${entry.id}`}>
              Date
            </label>
            <div className="history-item__date-wrapper">
              <input
                ref={dateInputRef}
                id={`date-${entry.id}`}
                className="history-item__input history-item__input--date"
                type="date"
                max={getTodayDateString()}
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
              <button
                type="button"
                className="history-item__date-button"
                onClick={openDatePicker}
                aria-label="Open calendar"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1.5A2.5 2.5 0 0 1 22 6.5v13A2.5 2.5 0 0 1 19.5 22h-15A2.5 2.5 0 0 1 2 19.5v-13A2.5 2.5 0 0 1 4.5 4H6V3a1 1 0 0 1 1-1Zm12.5 7H4.5v10.5c0 .276.224.5.5.5h15a.5.5 0 0 0 .5-.5V9ZM6 6h-.5a.5.5 0 0 0-.5.5V7h14v-.5a.5.5 0 0 0-.5-.5H18v1a1 1 0 1 1-2 0V6H8v1a1 1 0 0 1-2 0V6Z"
                  />
                </svg>
              </button>
            </div>

            <label className="history-item__field-label" htmlFor={`weight-${entry.id}`}>
              Weight
            </label>
            <div className="history-item__edit-row">
              <input
                id={`weight-${entry.id}`}
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

            <label className="history-item__field-label" htmlFor={`note-${entry.id}`}>
              Note (optional)
            </label>
            <textarea
              id={`note-${entry.id}`}
              className="history-item__textarea"
              rows={2}
              maxLength={200}
              placeholder="e.g. morning weigh-in"
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </div>
        ) : (
          <>
            <p className="history-item__date">{entry.date}</p>
            <p className="history-item__weight">
              {displayWeight} {displayUnit}
            </p>
            {entry.note ? (
              <p className="history-item__note">{entry.note}</p>
            ) : null}
          </>
        )}
        {error ? <p className="history-item__error">{error}</p> : null}
      </div>

      <div
        className={`history-item__actions ${
          isEditing ? "history-item__actions--editing" : ""
        }`}
      >
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
