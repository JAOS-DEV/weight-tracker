import { useState, type FormEvent } from "react";
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

  return (
    <form className="weight-input" onSubmit={handleSubmit}>
      <label className="weight-input__label" htmlFor="entry-date">
        Date
      </label>
      <input
        id="entry-date"
        className="weight-input__field weight-input__field--date"
        type="date"
        max={getTodayDateString()}
        value={date}
        onChange={(event) => onDateChange(event.target.value)}
      />
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
