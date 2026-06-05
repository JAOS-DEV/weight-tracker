import type { UserSettings, WeightUnit } from "../types/weight";
import { UnitSelector } from "../components/UnitSelector";

interface SettingsPageProps {
  settings: UserSettings;
  onPreferredUnitChange: (unit: WeightUnit) => void;
}

export function SettingsPage({
  settings,
  onPreferredUnitChange,
}: SettingsPageProps): React.ReactElement {
  return (
    <div className="page">
      <header className="page__header">
        <h1>Settings</h1>
        <p className="page__subtitle">App preferences</p>
      </header>

      <section className="card">
        <h2 className="card__title">Preferred unit</h2>
        <p className="card__text">
          Stats and history are shown in your preferred unit. Original entry units
          are always stored.
        </p>
        <UnitSelector
          value={settings.preferredUnit}
          onChange={onPreferredUnitChange}
          name="preferred-unit"
        />
      </section>
    </div>
  );
}
