const express = require('express');
const router = express.Router();
const { ai, GEMINI_MODEL, isRateLimitError, getErrorCategory } = require('../geminiClient');

/**
 * Calculates the total macros and calories for a given recipe based on its ingredients.
 */
function calculateRecipeMacros(recipe, ingredients) {
  const totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  
  if (recipe && Array.isArray(recipe.ingredients)) {
    recipe.ingredients.forEach(req => {
      const ingredient = ingredients.find(ing => ing.id === req.ingredientId);
      if (ingredient) {
        totals.calories += (ingredient.caloriesPerUnit * req.quantity);
        totals.protein += (ingredient.proteinPerUnit * req.quantity);
        totals.carbs += (ingredient.carbsPerUnit * req.quantity);
        totals.fat += (ingredient.fatPerUnit * req.quantity);
      }
    });
  }

  return {
    calories: Math.round(totals.calories),
    protein: Math.round(totals.protein * 10) / 10,
    carbs: Math.round(totals.carbs * 10) / 10,
    fat: Math.round(totals.fat * 10) / 10
  };
}

/**
 * Calculates theoretical minimum and maximum calories possible.
 */
function calculateTheoreticalRange(recipes, ingredients, dietaryRestrictions = []) {
  const filtered = (!dietaryRestrictions || dietaryRestrictions.length === 0)
    ? recipes
    : recipes.filter(r => dietaryRestrictions.every(tag => r.dietaryTags?.includes(tag)));

  const byType = {
    breakfast: filtered.filter(r => r.mealType === 'breakfast'),
    lunch: filtered.filter(r => r.mealType === 'lunch'),
    dinner: filtered.filter(r => r.mealType === 'dinner'),
    snack: filtered.filter(r => r.mealType === 'snack')
  };

  const getExtremes = (list) => {
    if (!list || list.length === 0) return { min: 0, max: 0 };
    const cals = list.map(r => calculateRecipeMacros(r, ingredients).calories);
    return { min: Math.min(...cals), max: Math.max(...cals) };
  };

  const b = getExtremes(byType.breakfast);
  const l = getExtremes(byType.lunch);
  const d = getExtremes(byType.dinner);
  const s = getExtremes(byType.snack);

  return {
    min: b.min + l.min + d.min + s.min,
    max: b.max + l.max + d.max + s.max
  };
}

router.post('/', async (req, res) => {
  try {
    const { preferences, recipes, ingredients } = req.body;
    const userPreferences = preferences || req.body;

    if (!recipes || !Array.isArray(recipes) || recipes.length === 0) {
      return res.status(400).json({ error: 'Missing or empty recipes dataset in request body.' });
    }

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ error: 'Missing or empty ingredients dataset in request body.' });
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_key_here') {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
    }

    const {
      dietaryRestrictions = [],
      dailyCalorieGoal = 2000,
      macroGoals = { protein: 30, carbs: 40, fat: 30 },
      availableIngredientIds = []
    } = userPreferences;

    // Filter recipes by dietary restrictions so the AI only selects appropriate recipes
    const eligibleRecipes = (dietaryRestrictions && dietaryRestrictions.length > 0)
      ? recipes.filter(r => dietaryRestrictions.every(tag => r.dietaryTags?.includes(tag)))
      : recipes;

    if (eligibleRecipes.length === 0) {
      return res.status(400).json({
        error: 'No recipes match the selected dietary restrictions. Please loosen restrictions.'
      });
    }

    // Prepare recipes with calculated macros and mealType for the prompt
    const recipesSummary = eligibleRecipes.map(r => {
      const macros = calculateRecipeMacros(r, ingredients);
      return {
        id: r.id,
        name: r.name,
        mealType: r.mealType,
        dietaryTags: r.dietaryTags,
        calories: macros.calories,
        proteinGrams: macros.protein,
        carbsGrams: macros.carbs,
        fatGrams: macros.fat,
        usesAvailableIngredients: r.ingredients?.some(ing => availableIngredientIds.includes(ing.ingredientId)) || false
      };
    });

    const systemPrompt = `You are an expert nutritionist and meal planner AI.
Your task is to build an optimal 7-day weekly meal plan (Monday through Sunday) for a user with 4 meals each day: breakfast, lunch, dinner, and snack.

STRICT CONSTRAINTS:
1. ONLY select recipe IDs from the provided Available Recipes JSON list. DO NOT invent or fabricate recipe IDs or meal names.
2. Match the mealType for each slot: 'breakfast' must use a breakfast recipe, 'lunch' must use a lunch recipe, 'dinner' must use a dinner recipe, and 'snack' must use a snack recipe.
3. Strictly adhere to the user's dietary restrictions. Every chosen recipe must satisfy all restrictions.
4. Calorie Target: Aim for the daily total calories across the 4 meals to be as close to the target of ${dailyCalorieGoal} kcal as possible.
5. Macro Target: Balance daily protein (${macroGoals.protein}%), carbs (${macroGoals.carbs}%), and fat (${macroGoals.fat}%) goals.
6. Variety: Avoid excessive repetition. Do not repeat the same meal on consecutive days if alternatives exist.
7. Pantry: When possible, prioritize recipes that use the user's available pantry ingredients.
8. Reasoning: Provide a concise 1-2 sentence explanation of your overall strategy for the week.

OUTPUT FORMAT:
Respond ONLY with a valid, raw JSON object (no markdown, no backticks, no comments).
Strict JSON structure:
{
  "days": [
    {
      "day": "Monday",
      "meals": {
        "breakfast": "recipeId",
        "lunch": "recipeId",
        "dinner": "recipeId",
        "snack": "recipeId"
      }
    },
    ... (exactly 7 days: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday)
  ],
  "reasoning": "1-2 sentences summarizing your strategic planning decisions for this week."
}`;

    const userPrompt = `User Preferences:
- Daily Calorie Goal: ${dailyCalorieGoal} kcal
- Macro Target (% calories): Protein ${macroGoals.protein}%, Carbs ${macroGoals.carbs}%, Fat ${macroGoals.fat}%
- Dietary Restrictions: ${dietaryRestrictions.length > 0 ? dietaryRestrictions.join(', ') : 'None'}
- Available Pantry Ingredient IDs: ${availableIngredientIds.length > 0 ? availableIngredientIds.join(', ') : 'None'}

Available Recipes:
${JSON.stringify(recipesSummary, null, 2)}

Please construct the 7-day meal plan and respond with the strict JSON output.`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      }
    });

    let rawText = (response.text || '').trim();

    // Strip markdown code fences if present
    if (rawText.startsWith('```')) {
      rawText = rawText.replace(/^```(json)?\n?/, '').replace(/\n?```$/, '').trim();
    }

    let parsedResult;
    try {
      parsedResult = JSON.parse(rawText);
    } catch (parseErr) {
      console.error('Failed to parse AI meal plan JSON response:', rawText);
      return res.status(500).json({
        error: 'AI returned invalid JSON format. Unable to parse meal plan.'
      });
    }

    if (!parsedResult.days || !Array.isArray(parsedResult.days) || parsedResult.days.length === 0) {
      return res.status(500).json({
        error: 'AI meal plan response is missing the "days" array.'
      });
    }

    // Map recipes by ID for fast lookup and validation
    const recipeMap = new Map(recipes.map(r => [r.id, r]));

    // Validate that all returned recipe IDs exist in the dataset
    const expectedDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const hydratedDays = [];

    for (let i = 0; i < parsedResult.days.length; i++) {
      const dayItem = parsedResult.days[i];
      const dayName = dayItem.day || expectedDays[i] || `Day ${i + 1}`;
      const meals = dayItem.meals || {};

      const mealKeys = ['breakfast', 'lunch', 'dinner', 'snack'];
      const hydratedMeals = {};

      for (const mealKey of mealKeys) {
        const recipeId = meals[mealKey];
        if (!recipeId || !recipeMap.has(recipeId)) {
          console.error(`Invalid recipe ID "${recipeId}" returned by AI for ${dayName} ${mealKey}`);
          return res.status(500).json({
            error: `AI returned unrecognized recipe ID "${recipeId}". Falling back to local planner.`
          });
        }
        hydratedMeals[mealKey] = recipeMap.get(recipeId);
      }

      // Calculate total daily macros
      const totalMacros = { calories: 0, protein: 0, carbs: 0, fat: 0 };
      mealKeys.forEach(key => {
        const mealRecipe = hydratedMeals[key];
        if (mealRecipe) {
          const macros = calculateRecipeMacros(mealRecipe, ingredients);
          totalMacros.calories += macros.calories;
          totalMacros.protein += macros.protein;
          totalMacros.carbs += macros.carbs;
          totalMacros.fat += macros.fat;
        }
      });

      hydratedDays.push({
        day: dayName,
        meals: hydratedMeals,
        totalMacros: {
          calories: Math.round(totalMacros.calories),
          protein: Math.round(totalMacros.protein * 10) / 10,
          carbs: Math.round(totalMacros.carbs * 10) / 10,
          fat: Math.round(totalMacros.fat * 10) / 10
        }
      });
    }

    const theoreticalRange = calculateTheoreticalRange(recipes, ingredients, dietaryRestrictions);

    res.json({
      days: hydratedDays,
      reasoning: parsedResult.reasoning || "AI personalized weekly plan generated to meet your nutritional goals.",
      theoreticalMin: theoreticalRange.min,
      theoreticalMax: theoreticalRange.max
    });

  } catch (err) {
    console.error('Error generating AI meal plan:');
    console.error('Status:', err.status || err.statusCode || 'N/A');
    console.error('Message:', err.message || err);
    console.error('Raw response:', err.response?.text || err.response?.data || 'N/A');
    
    const errorType = getErrorCategory(err);

    if (errorType === 'rate_limit') {
      return res.status(429).json({ error: "AI rate limit reached, please wait a minute and try again", errorType });
    }
    res.status(500).json({
      error: 'The AI service returned an error. Please try again.',
      errorType
    });
  }
});

module.exports = router;
