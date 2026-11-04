
/**
 * Filters recipes to ensure they meet all user dietary restrictions.
 * 
 * @param {Array} recipes - Array of recipe objects.
 * @param {Array<string>} dietaryRestrictions - Array of dietary tags required by the user.
 * @returns {Array} - Array of recipes that contain every tag specified in dietaryRestrictions.
 */
export function filterRecipesByRestrictions(recipes, dietaryRestrictions) {
  if (!dietaryRestrictions || dietaryRestrictions.length === 0) return recipes;
  
  return recipes.filter(recipe => {
    // A recipe must include EVERY tag the user requires to pass the filter
    return dietaryRestrictions.every(restriction => 
      recipe.dietaryTags.includes(restriction)
    );
  });
}

/**
 * Calculates the total macros and calories for a given recipe based on its ingredients.
 * 
 * @param {Object} recipe - The recipe object containing an ingredients array.
 * @param {Array} ingredients - The library of all available ingredient objects.
 * @returns {Object} - An object containing total { calories, protein, carbs, fat } for the recipe.
 */
export function calculateRecipeMacros(recipe, ingredients) {
  const totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  
  recipe.ingredients.forEach(req => {
    const ingredient = ingredients.find(ing => ing.id === req.ingredientId);
    if (ingredient) {
      totals.calories += (ingredient.caloriesPerUnit * req.quantity);
      totals.protein += (ingredient.proteinPerUnit * req.quantity);
      totals.carbs += (ingredient.carbsPerUnit * req.quantity);
      totals.fat += (ingredient.fatPerUnit * req.quantity);
    }
  });

  // Round values for cleaner UI presentation later
  return {
    calories: Math.round(totals.calories),
    protein: Math.round(totals.protein * 10) / 10,
    carbs: Math.round(totals.carbs * 10) / 10,
    fat: Math.round(totals.fat * 10) / 10
  };
}

/**
 * Generates a sample of random meal combinations and selects the one closest to the target calories.
 * Uses a random sampling approach (e.g. 25 iterations) rather than full brute-force cartesian product 
 * to ensure high performance even if the recipe database grows large.
 * 
 * @param {Array} breakfastOptions 
 * @param {Array} lunchOptions 
 * @param {Array} dinnerOptions 
 * @param {Array} snackOptions 
 * @param {number} targetCalories 
 * @param {Array} ingredients 
 * @param {Array} allFiltered 
 * @returns {Object} The best { breakfast, lunch, dinner, snack } combo
 */
export function pickBestMealCombo(breakfastOptions, lunchOptions, dinnerOptions, snackOptions, targetCalories, ingredients, allFiltered) {
  const getRand = (arr, fallback) => {
    if (arr && arr.length > 0) return arr[Math.floor(Math.random() * arr.length)];
    if (fallback && fallback.length > 0) return fallback[Math.floor(Math.random() * fallback.length)];
    return null;
  };

  let bestCombo = null;
  let bestDiff = Infinity;
  
  // Try 25 random combinations
  for (let i = 0; i < 25; i++) {
    const combo = {
      breakfast: getRand(breakfastOptions, allFiltered),
      lunch: getRand(lunchOptions, allFiltered),
      dinner: getRand(dinnerOptions, allFiltered),
      snack: getRand(snackOptions, allFiltered)
    };
    
    let totalCals = 0;
    if (combo.breakfast) totalCals += calculateRecipeMacros(combo.breakfast, ingredients).calories;
    if (combo.lunch) totalCals += calculateRecipeMacros(combo.lunch, ingredients).calories;
    if (combo.dinner) totalCals += calculateRecipeMacros(combo.dinner, ingredients).calories;
    if (combo.snack) totalCals += calculateRecipeMacros(combo.snack, ingredients).calories;
    
    const diff = Math.abs(totalCals - targetCalories);
    
    if (diff < bestDiff) {
      bestDiff = diff;
      bestCombo = combo;
    }
  }
  
  return bestCombo;
}

/**
 * Calculates the theoretical minimum and maximum possible daily calories 
 * from the provided filtered options.
 */
export function calculateMinMaxPossibleCalories(breakfastOptions, lunchOptions, dinnerOptions, snackOptions, ingredients) {
  const getExtremes = (options) => {
    if (!options || options.length === 0) return { min: 0, max: 0 };
    const cals = options.map(r => calculateRecipeMacros(r, ingredients).calories);
    return { min: Math.min(...cals), max: Math.max(...cals) };
  };

  const bExtremes = getExtremes(breakfastOptions);
  const lExtremes = getExtremes(lunchOptions);
  const dExtremes = getExtremes(dinnerOptions);
  const sExtremes = getExtremes(snackOptions);

  return {
    min: bExtremes.min + lExtremes.min + dExtremes.min + sExtremes.min,
    max: bExtremes.max + lExtremes.max + dExtremes.max + sExtremes.max
  };
}

/**
 * Generates a 7-day meal plan based on user preferences and available recipes.
 * 
 * @param {Object} preferences - User preferences object containing dietaryRestrictions.
 * @param {Array} recipes - The library of all available recipes.
 * @param {Array} ingredients - The library of all available ingredients.
 * @returns {Object} - A structured meal plan object with a 'days' array containing meals and daily macros.
 */
export function generateWeeklyMealPlan(preferences, recipes, ingredients) {
  const filteredRecipes = filterRecipesByRestrictions(recipes, preferences.dietaryRestrictions);
  
  // Categorize available recipes by meal type for easier selection
  const recipesByType = {
    breakfast: filteredRecipes.filter(r => r.mealType === 'breakfast'),
    lunch: filteredRecipes.filter(r => r.mealType === 'lunch'),
    dinner: filteredRecipes.filter(r => r.mealType === 'dinner'),
    snack: filteredRecipes.filter(r => r.mealType === 'snack')
  };

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const plan = { days: [] };
  const previousPicks = { breakfast: null, lunch: null, dinner: null, snack: null };

  const getOptionsWithoutPrevious = (list, previousPickId) => {
    if (!list || list.length === 0) return [];
    if (previousPickId && list.length > 1) {
      const filtered = list.filter(r => r.id !== previousPickId);
      if (filtered.length > 0) return filtered;
    }
    return list;
  };

  for (const day of daysOfWeek) {
    const bOpts = getOptionsWithoutPrevious(recipesByType.breakfast, previousPicks.breakfast);
    const lOpts = getOptionsWithoutPrevious(recipesByType.lunch, previousPicks.lunch);
    const dOpts = getOptionsWithoutPrevious(recipesByType.dinner, previousPicks.dinner);
    const sOpts = getOptionsWithoutPrevious(recipesByType.snack, previousPicks.snack);
    
    const meals = pickBestMealCombo(bOpts, lOpts, dOpts, sOpts, preferences.dailyCalorieGoal, ingredients, filteredRecipes);

    // Store today's picks so we don't repeat them tomorrow
    previousPicks.breakfast = meals.breakfast?.id || null;
    previousPicks.lunch = meals.lunch?.id || null;
    previousPicks.dinner = meals.dinner?.id || null;
    previousPicks.snack = meals.snack?.id || null;

    // Sum up the daily macros by calculating each selected recipe
    const totalMacros = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    
    Object.values(meals).forEach(meal => {
      if (meal) {
        const macros = calculateRecipeMacros(meal, ingredients);
        totalMacros.calories += macros.calories;
        totalMacros.protein += macros.protein;
        totalMacros.carbs += macros.carbs;
        totalMacros.fat += macros.fat;
      }
    });

    plan.days.push({
      day,
      meals,
      totalMacros: {
        calories: Math.round(totalMacros.calories),
        protein: Math.round(totalMacros.protein * 10) / 10,
        carbs: Math.round(totalMacros.carbs * 10) / 10,
        fat: Math.round(totalMacros.fat * 10) / 10
      }
    });
  }

  // Calculate theoretical min and max range based on available recipes for UI warning
  const range = calculateMinMaxPossibleCalories(
    recipesByType.breakfast, 
    recipesByType.lunch, 
    recipesByType.dinner, 
    recipesByType.snack, 
    ingredients
  );
  plan.theoreticalMin = range.min;
  plan.theoreticalMax = range.max;

  return plan;
}


