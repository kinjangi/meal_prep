import React, { useMemo } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { usePreferences } from '../state/PreferencesContext';
import { generateGroceryList, excludeAvailableIngredients } from '../utils/groceryListGenerator';
import { sampleIngredients } from '../data/ingredients';
import './AnalyticsPage.css';

// Consistent color tokens
const COLOR_PROTEIN = '#E07A5F';
const COLOR_CARBS = '#E5A93C';
const COLOR_FAT = '#2B593F';
const COLOR_TARGET = '#E07A5F';
const COLOR_PLANNED = '#2B593F';

// Custom Tooltip for Recharts
function CustomTooltip({ active, payload, label, unit = '' }) {
  if (active && payload && payload.length) {
    return (
      <div className="custom-chart-tooltip">
        <div className="tooltip-title">{payload[0].payload.fullDay || label}</div>
        {payload.map((entry, index) => (
          <div key={`tooltip-${index}`} className="tooltip-item">
            <span style={{ color: entry.color || entry.fill, fontWeight: 600 }}>
              {entry.name}:
            </span>
            <span style={{ fontWeight: 700 }}>
              {entry.value} {unit}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export default function AnalyticsPage() {
  const { preferences } = usePreferences();
  const outletContext = useOutletContext() || {};
  const { mealPlan, planMode = 'quick' } = outletContext;

  // 1. Calorie Trend Data (Planned vs Target)
  const calorieTrendData = useMemo(() => {
    if (!mealPlan?.days) return [];
    const targetCals = preferences.dailyCalorieGoal || 2000;
    return mealPlan.days.map((dayItem) => ({
      day: dayItem.day.slice(0, 3),
      fullDay: dayItem.day,
      Planned: dayItem.totalMacros?.calories || 0,
      Target: targetCals,
    }));
  }, [mealPlan, preferences.dailyCalorieGoal]);

  // 2. Weekly Macro Breakdown Data (Protein, Carbs, Fat in grams)
  const macroBreakdownData = useMemo(() => {
    if (!mealPlan?.days) return [];
    return mealPlan.days.map((dayItem) => ({
      day: dayItem.day.slice(0, 3),
      fullDay: dayItem.day,
      Protein: dayItem.totalMacros?.protein || 0,
      Carbs: dayItem.totalMacros?.carbs || 0,
      Fat: dayItem.totalMacros?.fat || 0,
    }));
  }, [mealPlan]);

  // 3. Average Macro Split (Target vs Actual percentages)
  const { targetMacroData, actualMacroData, actualPercentages } = useMemo(() => {
    const target = [
      { name: 'Protein', value: preferences.macroGoals?.protein || 30, color: COLOR_PROTEIN },
      { name: 'Carbs', value: preferences.macroGoals?.carbs || 40, color: COLOR_CARBS },
      { name: 'Fat', value: preferences.macroGoals?.fat || 30, color: COLOR_FAT },
    ];

    if (!mealPlan?.days || mealPlan.days.length === 0) {
      return {
        targetMacroData: target,
        actualMacroData: target,
        actualPercentages: { protein: 30, carbs: 40, fat: 30 },
      };
    }

    let totalProtGrams = 0;
    let totalCarbGrams = 0;
    let totalFatGrams = 0;

    mealPlan.days.forEach((dayItem) => {
      totalProtGrams += dayItem.totalMacros?.protein || 0;
      totalCarbGrams += dayItem.totalMacros?.carbs || 0;
      totalFatGrams += dayItem.totalMacros?.fat || 0;
    });

    const proteinCals = totalProtGrams * 4;
    const carbsCals = totalCarbGrams * 4;
    const fatCals = totalFatGrams * 9;
    const sumCals = (proteinCals + carbsCals + fatCals) || 1;

    const actualProtPct = Math.round((proteinCals / sumCals) * 100);
    const actualCarbPct = Math.round((carbsCals / sumCals) * 100);
    const actualFatPct = Math.max(0, 100 - actualProtPct - actualCarbPct);

    const actual = [
      { name: 'Protein', value: actualProtPct, color: COLOR_PROTEIN },
      { name: 'Carbs', value: actualCarbPct, color: COLOR_CARBS },
      { name: 'Fat', value: actualFatPct, color: COLOR_FAT },
    ];

    return {
      targetMacroData: target,
      actualMacroData: actual,
      actualPercentages: { protein: actualProtPct, carbs: actualCarbPct, fat: actualFatPct },
    };
  }, [preferences.macroGoals, mealPlan]);

  // 4. Grocery List Summary ("What to Buy" items per category)
  const grocerySummaryData = useMemo(() => {
    if (!mealPlan?.days) return [];
    const full = generateGroceryList(mealPlan, sampleIngredients);
    const needed = excludeAvailableIngredients(full, preferences.availableIngredientIds || []);

    return Object.entries(needed || {})
      .map(([category, items]) => ({
        category: category.charAt(0).toUpperCase() + category.slice(1),
        itemsCount: items ? items.length : 0,
      }))
      .filter((cat) => cat.itemsCount > 0);
  }, [mealPlan, preferences.availableIngredientIds]);

  // Empty State if no meal plan exists
  if (!mealPlan?.days || mealPlan.days.length === 0) {
    return (
      <div className="analytics-page page-container">
        <div className="analytics-empty-state animation-fade-in">
          <div className="empty-icon-wrap">
            <svg width={48} height={48} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
          <h3>Generate a meal plan first to see your analytics</h3>
          <p>
            Once your personalized 7-day schedule is created, this dashboard will visualize your calorie trajectory, macronutrient balance, and grocery requirements.
          </p>
          <Link to="/meal-plan" className="btn-generate-link">
            Go to Meal Plan
            <svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
    );
  }

  const activeRestrictions = preferences.dietaryRestrictions || [];

  return (
    <div className="analytics-page page-container">
      {/* Page Header */}
      <header className="analytics-header">
        <div>
          <h2 className="analytics-title">Nutrition & Prep Analytics</h2>
          <p className="analytics-subtitle">
            Visual breakdown of calories, macronutrients, and grocery demands across your current 7-day plan.
          </p>
        </div>
        <div className="plan-source-pill">
          <span className="pill-dot"></span>
          Plan Mode: {planMode === 'ai' ? '✨ AI Optimized' : '⚡ Quick Generated'}
        </div>
      </header>

      {/* Analytics Charts Grid */}
      <div className="analytics-grid">
        {/* Card A: Weekly Calorie Trend (Line Chart) */}
        <div className="chart-card chart-card-half">
          <div className="chart-card-header">
            <h3>
              <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="var(--color-primary)" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
              </svg>
              Weekly Calorie Trend
            </h3>
            <span className="chart-card-desc">Target: {preferences.dailyCalorieGoal || 2000} kcal</span>
          </div>
          <div className="chart-container-box">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={calorieTrendData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6E2DA" opacity={0.7} />
                <XAxis dataKey="day" stroke="#707070" fontSize={12} tickLine={false} />
                <YAxis stroke="#707070" fontSize={12} tickLine={false} domain={['dataMin - 300', 'dataMax + 300']} />
                <Tooltip content={<CustomTooltip unit="kcal" />} />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Line
                  type="monotone"
                  dataKey="Planned"
                  name="Planned"
                  stroke={COLOR_PLANNED}
                  strokeWidth={3}
                  dot={{ r: 4, fill: COLOR_PLANNED, strokeWidth: 1 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="Target"
                  name="Target"
                  stroke={COLOR_TARGET}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card B: Weekly Macro Breakdown (Stacked Bar Chart) */}
        <div className="chart-card chart-card-half">
          <div className="chart-card-header">
            <h3>
              <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="var(--color-primary)" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
              Weekly Macro Breakdown
            </h3>
            <span className="chart-card-desc">Daily grams per macronutrient</span>
          </div>
          <div className="chart-container-box">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={macroBreakdownData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6E2DA" opacity={0.7} />
                <XAxis dataKey="day" stroke="#707070" fontSize={12} tickLine={false} />
                <YAxis stroke="#707070" fontSize={12} tickLine={false} />
                <Tooltip content={<CustomTooltip unit="g" />} />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Bar dataKey="Protein" stackId="macros" fill={COLOR_PROTEIN} />
                <Bar dataKey="Carbs" stackId="macros" fill={COLOR_CARBS} />
                <Bar dataKey="Fat" stackId="macros" fill={COLOR_FAT} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card C: Average Macro Split (Side-by-Side Donut Charts) */}
        <div className="chart-card chart-card-half">
          <div className="chart-card-header">
            <h3>
              <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="var(--color-primary)" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
              </svg>
              Average Macro Split (% of Calories)
            </h3>
            <span className="chart-card-desc">Target vs Actual Plan Distribution</span>
          </div>

          <div className="donut-comparison-wrap">
            {/* Target Donut */}
            <div className="donut-subchart">
              <div className="donut-chart-box">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={targetMacroData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={42}
                      outerRadius={65}
                      paddingAngle={3}
                    >
                      {targetMacroData.map((entry, idx) => (
                        <Cell key={`cell-target-${idx}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip unit="%" />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <span className="donut-label-title">🎯 Target Goals</span>
            </div>

            {/* Actual Donut */}
            <div className="donut-subchart">
              <div className="donut-chart-box">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={actualMacroData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={42}
                      outerRadius={65}
                      paddingAngle={3}
                    >
                      {actualMacroData.map((entry, idx) => (
                        <Cell key={`cell-actual-${idx}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip unit="%" />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <span className="donut-label-title">📊 Actual Plan</span>
            </div>

            {/* Comparison Legend */}
            <div className="donut-comparison-legend">
              <div className="macro-legend-row">
                <span className="macro-legend-name">
                  <span className="macro-legend-color-dot" style={{ backgroundColor: COLOR_PROTEIN }}></span>
                  Protein
                </span>
                <span className="macro-legend-comparison">
                  {preferences.macroGoals?.protein || 30}% vs {actualPercentages.protein}%
                </span>
              </div>
              <div className="macro-legend-row">
                <span className="macro-legend-name">
                  <span className="macro-legend-color-dot" style={{ backgroundColor: COLOR_CARBS }}></span>
                  Carbs
                </span>
                <span className="macro-legend-comparison">
                  {preferences.macroGoals?.carbs || 40}% vs {actualPercentages.carbs}%
                </span>
              </div>
              <div className="macro-legend-row">
                <span className="macro-legend-name">
                  <span className="macro-legend-color-dot" style={{ backgroundColor: COLOR_FAT }}></span>
                  Fat
                </span>
                <span className="macro-legend-comparison">
                  {preferences.macroGoals?.fat || 30}% vs {actualPercentages.fat}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card E: Grocery List Summary (Horizontal Bar Chart) */}
        <div className="chart-card chart-card-half">
          <div className="chart-card-header">
            <h3>
              <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="var(--color-primary)" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
              Grocery Needs by Category
            </h3>
            <span className="chart-card-desc">Items to buy for upcoming week</span>
          </div>
          <div className="chart-container-box">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={grocerySummaryData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6E2DA" opacity={0.7} horizontal={false} />
                <XAxis type="number" allowDecimals={false} stroke="#707070" fontSize={12} tickLine={false} />
                <YAxis dataKey="category" type="category" stroke="#707070" fontSize={12} tickLine={false} width={85} />
                <Tooltip
                  formatter={(val) => [`${val} items`, 'Items to Buy']}
                  contentStyle={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '8px',
                    border: '1px solid #E6E2DA',
                    boxShadow: '0 4px 12px rgba(43,89,63,0.08)'
                  }}
                />
                <Bar dataKey="itemsCount" name="Items to Buy" fill={COLOR_PLANNED} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card D: Dietary Restrictions Summary (Clean Card) */}
        <div className="dietary-summary-card">
          <div className="dietary-header">
            <h3>
              <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="var(--color-primary)" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Active Dietary Restrictions
            </h3>
            <Link to="/preferences" className="edit-prefs-link">
              Edit in Preferences →
            </Link>
          </div>
          <div className="dietary-pills-list">
            {activeRestrictions.length > 0 ? (
              activeRestrictions.map((restriction) => (
                <span key={restriction} className="restriction-badge">
                  ✓ {restriction}
                </span>
              ))
            ) : (
              <span className="restriction-badge-none">
                No active dietary restrictions (Standard Balanced Diet)
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
