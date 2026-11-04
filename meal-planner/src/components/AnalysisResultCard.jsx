import React from 'react';
import { usePreferences } from '../state/PreferencesContext';

/**
 * AnalysisResultCard
 * ------------------
 * Renders the AI food analysis result.
 * Adds a confidence-tier border treatment on the result card:
 *   high   → solid AI-accent border
 *   medium → dashed AI-accent border
 *   low    → dashed AI-accent border + prominent caution block
 */
export default function AnalysisResultCard({ result, onReset }) {
  const { preferences, updatePreferences } = usePreferences();
  const [successMsg, setSuccessMsg] = React.useState('');

  if (!result) return null;

  /* ── 1. Not-food case ── */
  if (result.isFood === false) {
    return (
      <div className="result-card not-food-card animation-fade-in">
        <div className="not-food-header">
          <span className="not-food-icon">🤔</span>
          <h4>That doesn't look like food</h4>
        </div>
        <p className="not-food-message">
          {result.message || "We couldn't recognize an edible food item in your input."}
        </p>
        <button type="button" className="retry-btn not-food-retry" onClick={onReset}>
          <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Try Again
        </button>
      </div>
    );
  }

  /* ── 2. Food result case ── */
  const handleAddToIngredients = () => {
    const newIng = {
      id: `custom-ai-${Date.now()}`,
      name: result.name,
      category: 'Other',
      caloriesPerUnit: result.calories,
      proteinPerUnit: result.protein,
      carbsPerUnit: result.carbs,
      fatPerUnit: result.fat,
      unit: result.unit,
      isCustom: true
    };

    const existingCustom = preferences.customIngredients || [];
    const existingAvailable = preferences.availableIngredientIds || [];

    updatePreferences({
      customIngredients: [...existingCustom, newIng],
      availableIngredientIds: [...existingAvailable, newIng.id]
    });

    setSuccessMsg(`${result.name} added to your ingredients!`);

    setTimeout(() => {
      onReset && onReset();
    }, 3000);
  };

  const confidence = result.confidence || 'medium';
  // Map confidence → CSS modifier on the result card
  const confidenceClass = `result-card--${confidence}`;

  return (
    <div className={`result-card animation-fade-in ${confidenceClass}`}>
      <div className="result-header">
        <h4>{result.name}</h4>
        <span className={`confidence-badge ${confidence}`}>
          {confidence} confidence
        </span>
      </div>

      <p className="unit-info">Estimated per {result.unit}</p>

      <div className="macro-badges">
        <span className="macro-badge calories">{result.calories} kcal</span>
        <span className="macro-badge protein">{result.protein}g P</span>
        <span className="macro-badge carbs">{result.carbs}g C</span>
        <span className="macro-badge fat">{result.fat}g F</span>
      </div>

      {/* Low confidence — prominent caution block */}
      {confidence === 'low' && (
        <div className="low-confidence-caution low-confidence-caution--prominent">
          <svg className="caution-svg" width={16} height={16} viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <span>Low confidence — verify these values before logging</span>
        </div>
      )}

      {/* Medium confidence — subtle note */}
      {confidence === 'medium' && (
        <p className="medium-confidence-note">
          Values are estimates — accuracy may vary for complex dishes.
        </p>
      )}

      {successMsg ? (
        <div className="success-msg">
          <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          {successMsg}
        </div>
      ) : (
        <button className="add-ingredient-btn" onClick={handleAddToIngredients}>
          Add to My Ingredients
        </button>
      )}
    </div>
  );
}
