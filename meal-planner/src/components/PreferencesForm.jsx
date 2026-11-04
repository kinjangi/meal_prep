import { useState, useEffect } from 'react';
import { sampleIngredients } from '../data/ingredients';
import { usePreferences } from '../state/PreferencesContext';

const DIETARY_OPTIONS = [
  'vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free', 'low-carb'
];

export default function PreferencesForm() {
  const { preferences, updatePreferences } = usePreferences();

  const [dietaryRestrictions, setDietaryRestrictions] = useState(preferences.dietaryRestrictions || []);
  const [dailyCalorieGoal, setDailyCalorieGoal] = useState(preferences.dailyCalorieGoal || 2000);
  const [macros, setMacros] = useState(preferences.macroGoals || { protein: 30, carbs: 40, fat: 30 });
  const [availableIngredientIds, setAvailableIngredientIds] = useState(preferences.availableIngredientIds || []);
  const [ingredientSearch, setIngredientSearch] = useState('');

  const [customIngredients, setCustomIngredients] = useState(preferences.customIngredients || []);

  useEffect(() => {
    setCustomIngredients(preferences.customIngredients || []);
    setAvailableIngredientIds(preferences.availableIngredientIds || []);
  }, [preferences.customIngredients, preferences.availableIngredientIds]);
  const [newIngName, setNewIngName] = useState("");
  const [newIngCategory, setNewIngCategory] = useState("other");
  const [newIngCals, setNewIngCals] = useState("");
  const [newIngProtein, setNewIngProtein] = useState("");
  const [newIngCarbs, setNewIngCarbs] = useState("");
  const [newIngFat, setNewIngFat] = useState("");
  const [newIngUnit, setNewIngUnit] = useState("g");

  const handleDietaryChange = (option) => {
    setDietaryRestrictions(prev => 
      prev.includes(option) ? prev.filter(item => item !== option) : [...prev, option]
    );
  };

  const handleMacroChange = (field, value) => {
    setMacros(prev => ({ ...prev, [field]: Number(value) }));
  };

  const handleIngredientToggle = (id) => {
    setAvailableIngredientIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const macrosSum = Number(macros.protein) + Number(macros.carbs) + Number(macros.fat);
  const isMacrosValid = macrosSum === 100;
  const isCaloriesValid = Number(dailyCalorieGoal) > 0;
  
  const allIngredients = [...sampleIngredients, ...customIngredients];
  const filteredIngredients = allIngredients.filter(ing => 
    ing.name.toLowerCase().includes(ingredientSearch.toLowerCase())
  );

  const handleAddCustomIngredient = (e) => {
    e.preventDefault();
    if (!newIngName.trim() || Number(newIngCals) <= 0) return;
    
    const newIng = {
      id: `custom-${Date.now()}`,
      name: newIngName.trim(),
      category: newIngCategory,
      caloriesPerUnit: Number(newIngCals),
      proteinPerUnit: Number(newIngProtein || 0),
      carbsPerUnit: Number(newIngCarbs || 0),
      fatPerUnit: Number(newIngFat || 0),
      unit: newIngUnit.trim() || "g",
      isCustom: true
    };

    setCustomIngredients(prev => [...prev, newIng]);
    setAvailableIngredientIds(prev => [...prev, newIng.id]);

    setNewIngName('');
    setNewIngCategory('other');
    setNewIngCals('');
    setNewIngProtein('');
    setNewIngCarbs('');
    setNewIngFat('');
    setNewIngUnit('g');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isMacrosValid || !isCaloriesValid) return;

    updatePreferences({
      dietaryRestrictions,
      dailyCalorieGoal: Math.round(Number(dailyCalorieGoal)), // Prevent NaN or trailing decimals
      macroGoals: {
        protein: Number(macros.protein),
        carbs: Number(macros.carbs),
        fat: Number(macros.fat)
      },
      availableIngredientIds,
      customIngredients
    });
  };

  return (
    <form onSubmit={handleSubmit} className="preferences-form">
      
      {/* 1. Dietary Restrictions */}
      <section className="form-section section-dietary">
        <h3>
          <svg width={24} height={24} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.246.562 1.5 1.5 0 00-.91 1.637l.453 2.766a9.7 9.7 0 002.827 5.617l1.096 1.096c.64.64 1.556.885 2.456.671a9.743 9.743 0 005.158-3.415l1.637-2.348a1.5 1.5 0 00-.28-1.92l-2.036-1.527a9.722 9.722 0 00-1.897-.905z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 15.75L12 12m0 0l-7.5 3.75M12 12v9" /></svg>
          Dietary Restrictions
        </h3>
        <div className="checkbox-group">
          {DIETARY_OPTIONS.map(option => (
            <label key={option} className="checkbox-label">
              <input 
                type="checkbox"
                checked={dietaryRestrictions.includes(option)}
                onChange={() => handleDietaryChange(option)}
              />
              {option}
            </label>
          ))}
        </div>
      </section>

      {/* 2. Caloric & Macro Goals */}
      <section className="form-section section-macros">
        <h3>
          <svg width={24} height={24} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.601a8.983 8.983 0 013.361-6.866 8.21 8.21 0 003 2.48z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" /></svg>
          Goals & Macros
        </h3>
        <div className="input-group">
          <label className="text-label">
            Daily Calorie Goal:
            <input 
              type="number" 
              value={dailyCalorieGoal}
              onChange={(e) => setDailyCalorieGoal(e.target.value)}
              min="1"
              step="1"
              className="text-input"
            />
          </label>
        </div>
        
        <div className="macro-group">
          <label className="text-label">
            Protein %:
            <input 
              type="number" 
              value={macros.protein}
              onChange={(e) => handleMacroChange('protein', e.target.value)}
              min="0" max="100"
              className="text-input small"
            />
          </label>
          <label className="text-label">
            Carbs %:
            <input 
              type="number" 
              value={macros.carbs}
              onChange={(e) => handleMacroChange('carbs', e.target.value)}
              min="0" max="100"
              className="text-input small"
            />
          </label>
          <label className="text-label">
            Fat %:
            <input 
              type="number" 
              value={macros.fat}
              onChange={(e) => handleMacroChange('fat', e.target.value)}
              min="0" max="100"
              className="text-input small"
            />
          </label>
        </div>
        {!isMacrosValid && (
          <p className="validation-error">
            Macros must sum to 100%. Current sum is {macrosSum}%.
          </p>
        )}
      </section>

      {/* 3. Available Ingredients */}
      <section className="form-section section-ingredients">
        <h3>
          <svg width={24} height={24} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>
          Available Ingredients
        </h3>
        <input 
          type="text" 
          placeholder="Search ingredients..." 
          value={ingredientSearch}
          onChange={(e) => setIngredientSearch(e.target.value)}
          className="text-input search-input"
        />
        <div className="ingredients-list">
          {filteredIngredients.map(ing => (
            <label key={ing.id} className="checkbox-label ingredient-label">
              <input 
                type="checkbox"
                checked={availableIngredientIds.includes(ing.id)}
                onChange={() => handleIngredientToggle(ing.id)}
              />
              <span>
                {ing.name} <small className="unit-hint">({ing.unit})</small>
                {ing.isCustom && <span style={{marginLeft: '4px', background: 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', color: 'var(--color-text-muted)'}}>Custom</span>}
              </span>
            </label>
          ))}
          {filteredIngredients.length === 0 && <p className="empty-state">No ingredients found.</p>}
        </div>
      </section>

      {/* 3.5 Add Custom Ingredient */}
      <section className="form-section section-custom" style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.07)' }}>
        <h4 style={{ margin: '0 0 8px 0', color: 'var(--color-text-main)' }}>Add Custom Ingredient</h4>
        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
          Note: Custom ingredients help exclude items from your shopping list but aren't yet used in recipe suggestions.
        </p>
        
        <div style={{ display: 'grid', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <label className="text-label" style={{ flex: 1, minWidth: '150px' }}>
              Name
              <input type="text" className="text-input" value={newIngName} onChange={(e) => setNewIngName(e.target.value)} placeholder="e.g. Soy Sauce" />
            </label>
            <label className="text-label">
              Category
              <select className="text-input" value={newIngCategory} onChange={(e) => setNewIngCategory(e.target.value)}>
                <option value="protein">Protein</option>
                <option value="carb">Carb</option>
                <option value="vegetable">Vegetable</option>
                <option value="fat">Fat</option>
                <option value="dairy">Dairy</option>
                <option value="other">Other</option>
              </select>
            </label>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <label className="text-label" style={{ width: '80px' }}>
              Unit
              <input type="text" className="text-input" value={newIngUnit} onChange={(e) => setNewIngUnit(e.target.value)} placeholder="g" />
            </label>
            <label className="text-label" style={{ width: '80px' }}>
              Cals
              <input type="number" className="text-input" value={newIngCals} onChange={(e) => setNewIngCals(e.target.value)} min="1" />
            </label>
            <label className="text-label" style={{ width: '80px' }}>
              Protein
              <input type="number" className="text-input" value={newIngProtein} onChange={(e) => setNewIngProtein(e.target.value)} min="0" />
            </label>
            <label className="text-label" style={{ width: '80px' }}>
              Carbs
              <input type="number" className="text-input" value={newIngCarbs} onChange={(e) => setNewIngCarbs(e.target.value)} min="0" />
            </label>
            <label className="text-label" style={{ width: '80px' }}>
              Fat
              <input type="number" className="text-input" value={newIngFat} onChange={(e) => setNewIngFat(e.target.value)} min="0" />
            </label>
          </div>
          
          <button 
            type="button" 
            onClick={handleAddCustomIngredient}
            disabled={!newIngName.trim() || Number(newIngCals) <= 0}
            style={{ padding: '8px 16px', background: 'var(--color-accent)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', alignSelf: 'flex-start' }}
          >
            Add Ingredient
          </button>
        </div>
      </section>

      {/* 4. Submit */}
      <button 
        type="submit" 
        className="submit-btn"
        disabled={!isMacrosValid || !isCaloriesValid}
      >
        Save Preferences
      </button>
    </form>
  );
}
