import { useState, useEffect, useCallback, useRef } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import PreferencesPage from './pages/PreferencesPage';
import MealPlanPage from './pages/MealPlanPage';
import GroceryListPage from './pages/GroceryListPage';
import AnalyticsPage from './pages/AnalyticsPage';
import { usePreferences } from './state/PreferencesContext';
import { lsGet, lsSet } from './state/PreferencesContext';
import { generateWeeklyMealPlan } from './utils/mealPlanGenerator';
import { sampleRecipes } from './data/recipes';
import { sampleIngredients } from './data/ingredients';

// ── Storage key for the active meal plan ──────────────────────────────────
const PLAN_KEY = 'mealprep_current_plan';

function loadSavedPlan() {
  const saved = lsGet(PLAN_KEY);
  if (saved && saved.plan && saved.mode) return saved;
  return null;
}

function App() {
  const { preferences } = usePreferences();

  // Restore persisted plan on mount; null if nothing saved
  const savedPlan  = useRef(loadSavedPlan());
  const isFirstRun = useRef(true);  // tracks whether preferences effect is on its first fire

  const [mealPlan,       setMealPlan]       = useState(savedPlan.current?.plan ?? null);
  const [aiReasoning,    setAiReasoning]    = useState(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [planMode,       setPlanMode]       = useState(savedPlan.current?.mode ?? 'quick');
  const [aiError,        setAiError]        = useState(null);

  // ── Persist plan whenever it changes ────────────────────────────────────
  const persistPlan = useCallback((plan, mode) => {
    if (plan) {
      lsSet(PLAN_KEY, { plan, mode, generatedAt: new Date().toISOString() });
    } else {
      try { localStorage.removeItem(PLAN_KEY); } catch { /* ignore */ }
    }
  }, []);

  // ── Quick local generator ────────────────────────────────────────────────
  const handleQuickGenerate = useCallback(() => {
    setAiError(null);
    setAiReasoning(null);
    setPlanMode('quick');
    if (preferences.dailyCalorieGoal && preferences.dailyCalorieGoal > 0) {
      const generated = generateWeeklyMealPlan(preferences, sampleRecipes, sampleIngredients);
      setMealPlan(generated);
      persistPlan(generated, 'quick');
    } else {
      setMealPlan(null);
      persistPlan(null, 'quick');
    }
  }, [preferences, persistPlan]);

  // ── AI generator with fallback ───────────────────────────────────────────
  const handleAIGenerate = useCallback(async () => {
    if (!preferences.dailyCalorieGoal || preferences.dailyCalorieGoal <= 0) return;

    setIsGeneratingAI(true);
    setAiError(null);

    try {
      const response = await fetch('http://localhost:3001/api/generate-ai-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferences,
          recipes: sampleRecipes,
          ingredients: sampleIngredients,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const err = new Error(errData.error || `Server responded with status ${response.status}`);
        err.errorType = errData.errorType;
        throw err;
      }

      const data = await response.json();

      if (!data.days || data.days.length === 0) {
        throw new Error('Received an empty meal plan from the AI service.');
      }

      const plan = {
        days: data.days,
        theoreticalMin: data.theoreticalMin,
        theoreticalMax: data.theoreticalMax,
      };

      setMealPlan(plan);
      setAiReasoning(data.reasoning || null);
      setPlanMode('ai');
      persistPlan(plan, 'ai');
    } catch (err) {
      console.warn('AI Plan Generation failed, falling back to local algorithm:', err);
      const isConnectionError =
        err.name === 'TypeError' ||
        err.message?.includes('Failed to fetch') ||
        err.message?.includes('NetworkError');

      let uiMsg = err.message || 'Network error';
      if (err.errorType === 'model_not_found') uiMsg = 'AI model not found (server needs update)';
      else if (err.errorType === 'rate_limit') uiMsg = 'Rate limit reached, wait a minute';
      else if (err.errorType === 'auth_error') uiMsg = 'API key problem';
      else if (err.errorType === 'unknown')    uiMsg = 'AI returned an unreadable response';

      setAiError(
        `AI planning is currently unavailable (${isConnectionError
          ? "Can't connect to AI server — is it running on port 3001?"
          : uiMsg}). Automatically switched to Quick Generate.`
      );
      setAiReasoning(null);
      setPlanMode('quick');
      const fallback = generateWeeklyMealPlan(preferences, sampleRecipes, sampleIngredients);
      setMealPlan(fallback);
      persistPlan(fallback, 'quick');
    } finally {
      setIsGeneratingAI(false);
    }
  }, [preferences, persistPlan]);

  // ── Auto-regenerate when preferences change ──────────────────────────────
  // IMPORTANT: skip the very first fire if a saved plan was restored from
  // localStorage — we don't want a refresh to silently clobber the saved plan
  // with a fresh quick-generate.
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      // If we restored a plan, keep it. If we didn't (fresh state), generate one.
      if (!savedPlan.current && preferences.dailyCalorieGoal > 0) {
        const plan = generateWeeklyMealPlan(preferences, sampleRecipes, sampleIngredients);
        setMealPlan(plan);
        persistPlan(plan, 'quick');
      }
      return;
    }

    // Subsequent preference changes → regenerate locally, keep in sync
    setAiError(null);
    setAiReasoning(null);
    setPlanMode('quick');
    if (preferences.dailyCalorieGoal && preferences.dailyCalorieGoal > 0) {
      const plan = generateWeeklyMealPlan(preferences, sampleRecipes, sampleIngredients);
      setMealPlan(plan);
      persistPlan(plan, 'quick');
    } else {
      setMealPlan(null);
      persistPlan(null, 'quick');
    }
  }, [preferences]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Global reset handler ─────────────────────────────────────────────────
  // Called by the sidebar "Reset All Data" button via DashboardLayout
  const handleResetAll = useCallback(() => {
    try {
      localStorage.removeItem(PLAN_KEY);
      localStorage.removeItem('mealprep_preferences');
    } catch { /* ignore */ }
    window.location.reload();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <DashboardLayout
              mealPlan={mealPlan}
              handleRegenerate={handleQuickGenerate}
              handleQuickGenerate={handleQuickGenerate}
              handleAIGenerate={handleAIGenerate}
              isGeneratingAI={isGeneratingAI}
              aiReasoning={aiReasoning}
              aiError={aiError}
              setAiError={setAiError}
              planMode={planMode}
              onResetAll={handleResetAll}
            />
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="preferences" element={<PreferencesPage />} />
          <Route path="meal-plan" element={<MealPlanPage />} />
          <Route path="grocery-list" element={<GroceryListPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
