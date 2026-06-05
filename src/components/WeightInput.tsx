import { useRef, useState, type FormEvent } from "react";
import type { WeightUnit } from "../types/weight";
import { getTodayDateString } from "../utils/dateRanges";
import { validateDateInput, validateWeightInput } from "../storage/weightStorage";
import { UnitSelector } from "./UnitSelector";

interface WeightInputProps {
  date: string;
  initialWeight?: string;
  initialUnit: WeightUnit;
  onDateChange: (date: string) => void;
  onSave: (date: string, weight: number, unit: WeightUnit) => void;
  submitLabel?: string;
}

export function WeightInput({
  date,
  initialWeight = "",
  initialUnit,
  onDateChange,
  onSave,
  submitLabel = "Save",
}: WeightInputProps): React.ReactElement {
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [weight, setWeight] = useState(initialWeight);
  const [unit, setUnit] = useState<WeightUnit>(initialUnit);
  const [dateError, setDateError] = useState<string | null>(null);
  const [weightError, setWeightError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    const dateValidation = validateDateInput(date);
    const weightValidation = validateWeightInput(weight);

    if (!dateValidation.valid) {
      setDateError(dateValidation.error ?? "Invalid date.");
    } else {
      setDateError(null);
    }

    if (!weightValidation.valid || weightValidation.weight === undefined) {
      setWeightError(weightValidation.error ?? "Invalid weight.");
    } else {
      setWeightError(null);
    }

    if (!dateValidation.valid || !weightValidation.valid || weightValidation.weight === undefined) {
      return;
    }

    onSave(date, weightValidation.weight, unit);
  };

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

  return (
    <form className="weight-input" onSubmit={handleSubmit}>
      <label className="weight-input__label" htmlFor="entry-date">
        Date
      </label>
      <div className="weight-input__date-wrapper">
        <input
          ref={dateInputRef}
          id="entry-date"
          className="weight-input__field weight-input__field--date"
          type="date"
          max={getTodayDateString()}
          value={date}
          onChange={(event) => onDateChange(event.target.value)}
        />
        <button
          type="button"
          className="weight-input__date-button"
          onClick={openDatePicker}
          aria-label="Open calendar"
        >
          <svg
            className="weight-input__date-icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1.5A2.5 2.5 0 0 1 22 6.5v13A2.5 2.5 0 0 1 19.5 22h-15A2.5 2.5 0 0 1 2 19.5v-13A2.5 2.5 0 0 1 4.5 4H6V3a1 1 0 0 1 1-1Zm12.5 7H4.5v10.5c0 .276.224.5.5.5h15a.5.5 0 0 0 .5-.5V9ZM6 6h-.5a.5.5 0 0 0-.5.5V7h14v-.5a.5.5 0 0 0-.5-.5H18v1a1 1 0 1 1-2 0V6H8v1a1 1 0 0 1-2 0V6Z"
            />
          </svg>
        </button>
      </div>
      {dateError ? <p className="weight-input__error">{dateError}</p> : null}

      <label className="weight-input__label" htmlFor="weight">
        Weight
      </label>
      <div className="weight-input__row">
        <input
          id="weight"
          className="weight-input__field"
          type="number"
          inputMode="decimal"
          step="0.1"
          min="0"
          placeholder="e.g. 75.5"
          value={weight}
          onChange={(event) => setWeight(event.target.value)}
        />
        <UnitSelector value={unit} onChange={setUnit} />
      </div>
      {weightError ? <p className="weight-input__error">{weightError}</p> : null}
      <button className="button button--primary" type="submit">
        {submitLabel}
      </button>
    </form>
  );
}
