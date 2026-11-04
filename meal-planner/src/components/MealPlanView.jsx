import React, { useState, useEffect } from 'react';
import './MealPlanView.css';
import { usePreferences } from '../state/PreferencesContext';
import AgentStatusPanel from './AgentStatusPanel';
import { useAgentSteps } from '../utils/useAgentSteps';

const AI_PLAN_STEP_LABELS = [
  'Reading your preferences',
  'Selecting recipes',
  'Balancing macros',
  'Finalising week',
];

const AI_PLAN_THINKING_PHRASES = [
  'Analysing dietary goals and restrictions…',
  'Picking from recipe database…',
  'Tuning protein, carb, fat ratios…',
  'Assembling your 7-day schedule…',
];

export default function MealPlanView({
  mealPlan,
  onRegenerate,
  onQuickGenerate,
  onAIGenerate,
  isGeneratingAI,
  aiReasoning,
  aiError,
  setAiError,
  planMode = 'quick'
}) {
  const { preferences } = usePreferences();
  const currentDayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());

  const handleQuick = onQuickGenerate || onRegenerate;

  // ── "Why this plan?" collapsible state ──────────────────────────────────
  // Expanded by default when aiReasoning first appears; collapsed on subsequent regenerations
  const [reasoningExpanded, setReasoningExpanded] = useState(false);
  const prevReasoning = React.useRef(null);

  useEffect(() => {
    if (aiReasoning && aiReasoning !== prevReasoning.current) {
      // New reasoning text arrived — expand it automatically
      setReasoningExpanded(true);
      prevReasoning.current = aiReasoning;
    }
  }, [aiReasoning]);

  // ── Agent steps for AI plan generation ──────────────────────────────────
  const { steps, startSteps, finishSteps, resetSteps, isRunning } =
    useAgentSteps(AI_PLAN_STEP_LABELS, 1600);

  const activeIdx    = steps.findIndex(s => s.status === 'active');
  const thinkingText = isRunning && activeIdx >= 0
    ? AI_PLAN_THINKING_PHRASES[activeIdx] ?? AI_PLAN_THINKING_PHRASES[AI_PLAN_THINKING_PHRASES.length - 1]
    : undefined;

  // ── Sync isGeneratingAI prop with our step tracker ───────────────────────
  const wasGenerating = React.useRef(false);
  useEffect(() => {
    if (isGeneratingAI && !wasGenerating.current) {
      startSteps();
      wasGenerating.current = true;
    } else if (!isGeneratingAI && wasGenerating.current) {
      finishSteps();
      wasGenerating.current = false;
    }
  }, [isGeneratingAI]);

  // ── Early returns ────────────────────────────────────────────────────────
  if (!mealPlan && !isGeneratingAI) {
    return (
      <div className="meal-plan-empty">
        <p>Fill out your preferences above to generate your meal plan.</p>
      </div>
    );
  }

  const hasAnyMeals = mealPlan?.days?.some(day =>
    day.meals?.breakfast || day.meals?.lunch || day.meals?.dinner || day.meals?.snack
  );

  if (!hasAnyMeals && !isGeneratingAI) {
    return (
      <div className="meal-plan-empty">
        <p>No recipes match your current restrictions — try loosening them in Preferences.</p>
      </div>
    );
  }

  const target = preferences.dailyCalorieGoal || 2000;
  const isTargetTooLow  = mealPlan?.theoreticalMin > 0 && target < mealPlan.theoreticalMin * 0.8;
  const isTargetTooHigh = mealPlan?.theoreticalMax > 0 && target > mealPlan.theoreticalMax * 1.2;
  const showWarning     = isTargetTooLow || isTargetTooHigh;

  return (
    <div className="meal-plan-view">

      {/* ── Calorie warning ── */}
      {showWarning && (
        <div className="plan-warning-card">
          <strong>Note:</strong> Your calorie goal ({target} kcal) is outside the typical range for current filters.
          A realistic daily range is approximately {mealPlan.theoreticalMin}–{mealPlan.theoreticalMax} kcal.
        </div>
      )}

      {/* ── Header ── */}
      <div className="meal-plan-header">
        <div className="header-meta">
          <h2>
            <svg width={24} height={24} fill="none" viewBox="0 0 24 24"
              strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
            </svg>
            Your Weekly Meal Plan
          </h2>
          <div className="plan-mode-badge-container">
            {planMode === 'ai' ? (
              <span className="badge-ai-mode">
                <span className="badge-pulse-dot" />
                ✨ AI Smart Plan
              </span>
            ) : (
              <span className="badge-quick-mode">⚡ Quick Local Plan</span>
            )}
          </div>
        </div>

        <div className="plan-actions-group">
          <button
            type="button"
            className="quick-generate-btn"
            onClick={handleQuick}
            disabled={isGeneratingAI}
            title="Instant local generation using heuristic sampling"
          >
            <svg width={17} height={17} fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Quick Generate
          </button>

          <button
            type="button"
            className={`ai-generate-btn ${isGeneratingAI ? 'loading' : ''}`}
            onClick={onAIGenerate}
            disabled={isGeneratingAI}
            title="AI-driven meal selection"
          >
            {isGeneratingAI ? (
              <>
                <span className="ai-btn-spinner" />
                AI is planning…
              </>
            ) : (
              <>
                <svg width={17} height={17} fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                </svg>
                ✨ AI Smart Plan
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Fallback alert ── */}
      {aiError && (
        <div className="ai-fallback-alert">
          <div className="alert-content">
            <span className="alert-icon">⚠️</span>
            <div className="alert-text">
              <strong>Notice:</strong> {aiError}
            </div>
          </div>
          {setAiError && (
            <button type="button" className="alert-dismiss-btn"
              onClick={() => setAiError(null)} title="Dismiss">✕</button>
          )}
        </div>
      )}

      {/* ── AI Agent step tracker (replaces old full-bleed loading box) ── */}
      {isRunning && (
        <AgentStatusPanel steps={steps} thinkingText={thinkingText} />
      )}

      {/* ── Collapsible "Why this plan?" reasoning panel ── */}
      {aiReasoning && !isGeneratingAI && (
        <div className="ai-strategy-callout">
          <button
            type="button"
            className="ai-strategy-toggle"
            onClick={() => setReasoningExpanded(prev => !prev)}
            aria-expanded={reasoningExpanded}
          >
            <div className="ai-strategy-label">
              <span className="ai-strategy-icon">🤖</span>
              <span className="ai-strategy-title">Why this plan?</span>
              <span className="ai-model-tag">AI reasoning</span>
            </div>
            <span className="ai-strategy-chevron" aria-hidden="true"
              style={{ transform: reasoningExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
              ▾
            </span>
          </button>

          {reasoningExpanded && (
            <p className="ai-strategy-text">{aiReasoning}</p>
          )}
        </div>
      )}

      {/* ── Day cards grid ── */}
      {mealPlan?.days && (
        <div className={`days-grid ${isGeneratingAI ? 'dimmed' : ''}`}>
          {mealPlan.days.map((dayInfo, index) => (
            <div
              key={dayInfo.day}
              className={`day-card ${dayInfo.day === currentDayName ? 'today-card' : ''}`}
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <h3 className="day-name">
                {dayInfo.day}
                {dayInfo.day === currentDayName && <span className="today-badge">Today</span>}
              </h3>

              <div className="meals-list">
                <div className="meal-item">
                  <span className="meal-type">Breakfast:</span>
                  <span className="recipe-name">{dayInfo.meals?.breakfast?.name ?? 'None'}</span>
                </div>
                <div className="meal-item">
                  <span className="meal-type">Lunch:</span>
                  <span className="recipe-name">{dayInfo.meals?.lunch?.name ?? 'None'}</span>
                </div>
                <div className="meal-item">
                  <span className="meal-type">Dinner:</span>
                  <span className="recipe-name">{dayInfo.meals?.dinner?.name ?? 'None'}</span>
                </div>
                <div className="meal-item">
                  <span className="meal-type">Snack:</span>
                  <span className="recipe-name">{dayInfo.meals?.snack?.name ?? 'None'}</span>
                </div>
              </div>

              <div className="day-macros">
                <span
                  className={`macro-badge calories ${
                    Math.abs(target - (dayInfo.totalMacros?.calories || 0)) <= target * 0.1
                      ? 'good' : 'warn'
                  }`}
                  title="Planned vs target calories"
                >
                  Target: {target} | {dayInfo.totalMacros?.calories || 0} Cals
                </span>
                <span className="macro-badge protein">P: {dayInfo.totalMacros?.protein || 0}g</span>
                <span className="macro-badge carbs">C: {dayInfo.totalMacros?.carbs || 0}g</span>
                <span className="macro-badge fat">F: {dayInfo.totalMacros?.fat || 0}g</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
