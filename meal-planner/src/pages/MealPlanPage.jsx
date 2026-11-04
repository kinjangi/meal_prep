import React from 'react';
import { useOutletContext } from 'react-router-dom';
import MealPlanView from '../components/MealPlanView';

export default function MealPlanPage() {
  const {
    mealPlan,
    handleRegenerate,
    handleQuickGenerate,
    handleAIGenerate,
    isGeneratingAI,
    aiReasoning,
    aiError,
    setAiError,
    planMode,
  } = useOutletContext();

  return (
    <div className="page-container animation-fade-in">
      <div className="page-header">
        <h2>Your Meal Plan</h2>
        <p className="text-muted">Review your personalized weekly meal plan or let AI optimize your week.</p>
      </div>
      <MealPlanView
        mealPlan={mealPlan}
        onRegenerate={handleRegenerate}
        onQuickGenerate={handleQuickGenerate}
        onAIGenerate={handleAIGenerate}
        isGeneratingAI={isGeneratingAI}
        aiReasoning={aiReasoning}
        aiError={aiError}
        setAiError={setAiError}
        planMode={planMode}
      />
    </div>
  );
}
