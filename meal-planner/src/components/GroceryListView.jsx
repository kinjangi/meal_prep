import { useState, useMemo } from 'react';
import { usePreferences } from '../state/PreferencesContext';
import { generateGroceryList, excludeAvailableIngredients } from '../utils/groceryListGenerator';
import { sampleIngredients } from '../data/ingredients';
import './GroceryListView.css';

const getCategoryIcon = (cat) => {
  switch(cat) {
    case 'protein': return <svg width={24} height={24} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.601a8.983 8.983 0 013.361-6.866 8.21 8.21 0 003 2.48z" /></svg>;
    case 'carb': return <svg width={24} height={24} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c1.414.022 2.848-.422 3.966-1.352 2.13-1.77 3.33-4.645 3.33-7.398 0-3.314-1.993-6.237-4.992-7.464M12 20.25c-1.414.022-2.848-.422-3.966-1.352-2.13-1.77-3.33-4.645-3.33-7.398 0-3.314 1.993-6.237 4.992-7.464" /></svg>;
    case 'vegetable': return <svg width={24} height={24} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>;
    case 'fat': return <svg width={24} height={24} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" /></svg>;
    default: return <svg width={24} height={24} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>;
  }
}

export default function GroceryListView({ mealPlan }) {
  const { preferences } = usePreferences();
  const [viewMode, setViewMode] = useState('need-to-buy'); // 'need-to-buy' or 'full'

  const { fullList, shoppingList } = useMemo(() => {
    if (!mealPlan) return { fullList: null, shoppingList: null };
    
    const full = generateGroceryList(mealPlan, sampleIngredients);
    const needed = excludeAvailableIngredients(full, preferences.availableIngredientIds);
    return { fullList: full, shoppingList: needed };
  }, [mealPlan, preferences.availableIngredientIds]);

  if (!mealPlan) {
    return (
      <div className="grocery-empty">
        <p>Generate a meal plan to see your grocery list.</p>
      </div>
    );
  }

  const currentList = viewMode === 'need-to-buy' ? shoppingList : fullList;
  const categories = Object.keys(currentList);

  return (
    <div className="grocery-list-view">
      <div className="grocery-header">
        <h2>
          <svg width={28} height={28} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>
          Grocery List
        </h2>
        <div className="toggle-group">
          <button 
            className={`toggle-btn ${viewMode === 'full' ? 'active' : ''}`}
            onClick={() => setViewMode('full')}
          >
            Full Recipe Needs
          </button>
          <button 
            className={`toggle-btn ${viewMode === 'need-to-buy' ? 'active' : ''}`}
            onClick={() => setViewMode('need-to-buy')}
          >
            What to Buy
          </button>
        </div>
      </div>

      {categories.length === 0 ? (
        <p className="no-items">You already have everything you need in your pantry!</p>
      ) : (
        <div className="grocery-categories">
          {categories.map(category => (
            <div key={category} className="category-section">
              <h3 className="category-title">
                {getCategoryIcon(category)}
                {category}
              </h3>
              <ul className="ingredient-list">
                {currentList[category].map(item => (
                  <li key={item.ingredientId} className="ingredient-item">
                    <span className="ingredient-name">{item.name}</span>
                    <span className="ingredient-qty">
                      {item.displayQuantity}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
