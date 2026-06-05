import type { WeightUnit } from "../types/weight";

interface UnitSelectorProps {
  value: WeightUnit;
  onChange: (unit: WeightUnit) => void;
  name?: string;
}

export function UnitSelector({
  value,
  onChange,
  name = "unit",
}: UnitSelectorProps): React.ReactElement {
  return (
    <div className="unit-selector" role="group" aria-label="Weight unit">
      {(["kg", "lb"] as WeightUnit[]).map((unit) => (
        <button
          key={unit}
          type="button"
          name={name}
          className={`unit-selector__button ${
            value === unit ? "unit-selector__button--active" : ""
          }`}
          onClick={() => onChange(unit)}
          aria-pressed={value === unit}
        >
          {unit}
        </button>
      ))}
    </div>
  );
}
