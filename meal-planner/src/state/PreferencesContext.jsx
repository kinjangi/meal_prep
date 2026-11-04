import { createContext, useState, useContext, useCallback } from 'react';
import { defaultUserPreferences } from '../data/userPreferencesModel';

// ── Storage keys ──────────────────────────────────────────────────────────
const PREF_KEY = 'mealprep_preferences';

// ── Safe localStorage helpers ─────────────────────────────────────────────
function lsGet(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function lsSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage quota exceeded or access blocked — fail silently
  }
}

// ── Load initial state ─────────────────────────────────────────────────────
function loadInitialPreferences() {
  const saved = lsGet(PREF_KEY);
  if (saved && typeof saved === 'object' && !Array.isArray(saved)) {
    // Merge with defaults so any new keys added to defaultUserPreferences
    // in the future are present even for returning users
    return { ...defaultUserPreferences, ...saved };
  }
  return defaultUserPreferences;
}

// ── Context ───────────────────────────────────────────────────────────────
const PreferencesContext = createContext();

export function PreferencesProvider({ children }) {
  const [preferences, setPreferences] = useState(loadInitialPreferences);

  const updatePreferences = useCallback((newPrefs) => {
    setPreferences((prev) => {
      const next = { ...prev, ...newPrefs };
      lsSet(PREF_KEY, next);   // persist on every update
      return next;
    });
  }, []);

  /**
   * Wipes only the preferences localStorage key and resets to defaults.
   * Called by the global reset handler in DashboardLayout.
   */
  const resetPreferences = useCallback(() => {
    try { localStorage.removeItem(PREF_KEY); } catch { /* ignore */ }
    setPreferences(defaultUserPreferences);
  }, []);

  return (
    <PreferencesContext.Provider value={{ preferences, updatePreferences, resetPreferences }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
}

// ── Re-export the helpers so App.jsx can use the same safe wrappers ────────
export { lsGet, lsSet };
