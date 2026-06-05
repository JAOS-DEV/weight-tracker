import { useCallback, useState } from "react";
import type { UserSettings, WeightUnit } from "./types/weight";
import {
  deleteEntry,
  saveEntryForDate,
  savePreferredUnit,
  updateEntry,
  weightStorage,
} from "./storage/weightStorage";
import { TodayPage } from "./pages/TodayPage";
import { ProgressPage } from "./pages/ProgressPage";
import { HistoryPage } from "./pages/HistoryPage";
import { SettingsPage } from "./pages/SettingsPage";

type PageId = "today" | "progress" | "history" | "settings";

const NAV_ITEMS: { id: PageId; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "progress", label: "Progress" },
  { id: "history", label: "History" },
  { id: "settings", label: "Settings" },
];

function App(): React.ReactElement {
  const [activePage, setActivePage] = useState<PageId>("today");
  const [entries, setEntries] = useState(() => weightStorage.getEntries());
  const [settings, setSettings] = useState<UserSettings>(() =>
    weightStorage.getSettings(),
  );

  const refreshEntries = useCallback((): void => {
    setEntries(weightStorage.getEntries());
  }, []);

  const handleSaveEntry = (date: string, weight: number, unit: WeightUnit): void => {
    saveEntryForDate(date, weight, unit);
    refreshEntries();
  };

  const handleUpdateEntry = (id: string, weight: number, unit: WeightUnit): void => {
    updateEntry(id, weight, unit);
    refreshEntries();
  };

  const handleDeleteEntry = (id: string): void => {
    deleteEntry(id);
    refreshEntries();
  };

  const handlePreferredUnitChange = (preferredUnit: WeightUnit): void => {
    const updatedSettings = savePreferredUnit(preferredUnit);
    setSettings(updatedSettings);
  };

  const renderPage = (): React.ReactElement => {
    switch (activePage) {
      case "today":
        return (
          <TodayPage
            entries={entries}
            settings={settings}
            onSaveEntry={handleSaveEntry}
          />
        );
      case "progress":
        return <ProgressPage entries={entries} settings={settings} />;
      case "history":
        return (
          <HistoryPage
            entries={entries}
            settings={settings}
            onUpdateEntry={handleUpdateEntry}
            onDeleteEntry={handleDeleteEntry}
          />
        );
      case "settings":
        return (
          <SettingsPage
            settings={settings}
            onPreferredUnitChange={handlePreferredUnitChange}
          />
        );
    }
  };

  return (
    <div className="app">
      <header className="app__brand">
        <h1 className="app__title">WeightPal</h1>
      </header>

      <main className="app__main">{renderPage()}</main>

      <nav className="app__nav" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`app__nav-button ${
              activePage === item.id ? "app__nav-button--active" : ""
            }`}
            onClick={() => setActivePage(item.id)}
            aria-current={activePage === item.id ? "page" : undefined}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

export default App;
