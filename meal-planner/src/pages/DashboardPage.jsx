import React, { useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { usePreferences } from '../state/PreferencesContext';
import FoodPhotoAnalyzer from '../components/FoodPhotoAnalyzer';
import VoiceFoodLogger from '../components/VoiceFoodLogger';
import './DashboardPage.css';

export default function DashboardPage() {
  const { preferences } = usePreferences();
  const { mealPlan } = useOutletContext();
  const [activeLogTab, setActiveLogTab] = useState('photo'); // 'photo' or 'voice'

  const calories = preferences.dailyCalorieGoal || 0;
  const daysPlanned = mealPlan?.days ? mealPlan.days.length : 0;
  const restrictionsCount = preferences.dietaryRestrictions ? Object.values(preferences.dietaryRestrictions).filter(Boolean).length : 0;
  
  // Calculate items to buy roughly
  let itemsToBuy = 0;
  if (mealPlan?.days) {
    const allIngredients = new Set();
    mealPlan.days.forEach(day => {
      Object.values(day.meals || {}).forEach(meal => {
        if (meal?.ingredients) {
          meal.ingredients.forEach(ing => allIngredients.add(ing.ingredientId || ing.id));
        }
      });
    });
    itemsToBuy = allIngredients.size;
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h2 className="dashboard-welcome">Welcome to your Meal Prep Dashboard!</h2>
        <p className="dashboard-subtitle">Here's an overview of your current plan.</p>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Daily Target</h3>
          <p className="stat-value">{calories} <span className="stat-unit">kcal</span></p>
        </div>
        <div className="stat-card">
          <h3>Days Planned</h3>
          <p className="stat-value">{daysPlanned}</p>
        </div>
        <div className="stat-card">
          <h3>Restrictions</h3>
          <p className="stat-value">{restrictionsCount}</p>
        </div>
        <div className="stat-card">
          <h3>Items to Buy</h3>
          <p className="stat-value">{itemsToBuy}</p>
        </div>
      </div>

      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-cards">
          <Link to="/preferences" className="action-card">
            <svg width={32} height={32} fill="none" viewBox="0 0 24 24" stroke="var(--color-accent)" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h4>Update Preferences</h4>
            <p>Adjust your macros and dietary settings</p>
          </Link>
          
          <Link to="/meal-plan" className="action-card">
            <svg width={32} height={32} fill="none" viewBox="0 0 24 24" stroke="var(--color-primary)" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h4>View Meal Plan</h4>
            <p>See your scheduled meals for the week</p>
          </Link>

          <Link to="/grocery-list" className="action-card">
            <svg width={32} height={32} fill="none" viewBox="0 0 24 24" stroke="var(--color-success)" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h4>Grocery List</h4>
            <p>Check off ingredients for your prep</p>
          </Link>
        </div>
      </div>

      <div className="analyzer-section">
        <div className="log-food-header">
          <h3>Log Food</h3>
          <div className="log-tabs">
            <button 
              className={`log-tab ${activeLogTab === 'photo' ? 'active' : ''}`}
              onClick={() => setActiveLogTab('photo')}
            >
              📷 Take a Photo
            </button>
            <button 
              className={`log-tab ${activeLogTab === 'voice' ? 'active' : ''}`}
              onClick={() => setActiveLogTab('voice')}
            >
              🎤 Speak Name
            </button>
          </div>
        </div>
        
        <div className="log-tab-content">
          {activeLogTab === 'photo' ? <FoodPhotoAnalyzer /> : <VoiceFoodLogger />}
        </div>
      </div>
    </div>
  );
}
