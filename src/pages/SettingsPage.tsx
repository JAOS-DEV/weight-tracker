import { useEffect, useRef, useState, type FormEvent } from "react";
import type { UserSettings, WeightUnit } from "../types/weight";
import {
  exportAppData,
  importAppData,
  validateGoalWeightInput,
} from "../storage/weightStorage";
import { UnitSelector } from "../components/UnitSelector";

interface SettingsPageProps {
  settings: UserSettings;
  onPreferredUnitChange: (unit: WeightUnit) => void;
  onGoalWeightChange: (goalWeight?: number) => void;
  onImportComplete: () => void;
}

export function SettingsPage({
  settings,
  onPreferredUnitChange,
  onGoalWeightChange,
  onImportComplete,
}: SettingsPageProps): React.ReactElement {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [goalWeight, setGoalWeight] = useState(
    settings.goalWeight !== undefined ? String(settings.goalWeight) : "",
  );
  const [goalError, setGoalError] = useState<string | null>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);

  useEffect(() => {
    setGoalWeight(
      settings.goalWeight !== undefined ? String(settings.goalWeight) : "",
    );
  }, [settings.goalWeight, settings.preferredUnit]);

  const handleGoalSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const validation = validateGoalWeightInput(goalWeight);

    if (!validation.valid) {
      setGoalError(validation.error ?? "Invalid goal weight.");
      return;
    }

    setGoalError(null);
    onGoalWeightChange(validation.weight);
  };

  const handleExport = (): void => {
    const data = exportAppData();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `weightpal-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = (): void => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    const confirmed = window.confirm(
      "Importing will replace your current entries and settings. Continue?",
    );

    if (!confirmed) {
      return;
    }

    try {
      const rawData = await file.text();
      const result = importAppData(rawData);

      if (!result.success) {
        setImportMessage(result.error ?? "Import failed.");
        return;
      }

      setImportMessage("Backup imported successfully.");
      onImportComplete();
    } catch {
      setImportMessage("Could not read the selected file.");
    }
  };

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

      <section className="card">
        <h2 className="card__title">Goal weight</h2>
        <p className="card__text">
          Set a target weight to track progress on Today and Progress.
        </p>
        <form className="settings-goal" onSubmit={handleGoalSubmit}>
          <div className="settings-goal__row">
            <input
              className="settings-goal__input"
              type="number"
              inputMode="decimal"
              step="0.1"
              min="0"
              placeholder={`e.g. 75 ${settings.preferredUnit}`}
              value={goalWeight}
              onChange={(event) => setGoalWeight(event.target.value)}
            />
            <span className="settings-goal__unit">{settings.preferredUnit}</span>
          </div>
          {goalError ? <p className="settings-goal__error">{goalError}</p> : null}
          <div className="settings-goal__actions">
            <button className="button button--primary button--small" type="submit">
              Save goal
            </button>
            {settings.goalWeight !== undefined ? (
              <button
                className="button button--secondary button--small"
                type="button"
                onClick={() => {
                  setGoalWeight("");
                  setGoalError(null);
                  onGoalWeightChange(undefined);
                }}
              >
                Clear goal
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="card">
        <h2 className="card__title">Backup</h2>
        <p className="card__text">
          Export your entries and settings as JSON, or import a previous backup.
        </p>
        <div className="settings-backup__actions">
          <button
            className="button button--secondary button--small"
            type="button"
            onClick={handleExport}
          >
            Export data
          </button>
          <button
            className="button button--secondary button--small"
            type="button"
            onClick={handleImportClick}
          >
            Import data
          </button>
          <input
            ref={fileInputRef}
            className="settings-backup__file-input"
            type="file"
            accept="application/json,.json"
            onChange={handleImportFile}
          />
        </div>
        {importMessage ? (
          <p className="settings-backup__message">{importMessage}</p>
        ) : null}
      </section>
    </div>
  );
}
