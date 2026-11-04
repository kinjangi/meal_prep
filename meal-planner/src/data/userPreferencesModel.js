/**
 * Defines the default shape and initial state of a user's meal planning preferences.
 */
export const defaultUserPreferences = {
  // Array of dietary restriction strings that recipes must adhere to.
  // Examples: "vegan", "vegetarian", "gluten-free", "dairy-free", "pescatarian"
  dietaryRestrictions: [],
  
  // Total target calories for a single day.
  // Used as the baseline for the daily meal plan generator.
  dailyCalorieGoal: 2000,
  
  // Target macros expressed as percentages of the dailyCalorieGoal (summing to 100).
  // Using percentages instead of absolute grams allows the macros to dynamically 
  // scale up or down if the user changes their dailyCalorieGoal, without requiring
  // them to manually recalculate gram targets to ensure they add up correctly.
  macroGoals: {
    protein: 30, // 30% of total calories
    carbs: 40,   // 40% of total calories
    fat: 30      // 30% of total calories
  },
  
  // Array of ingredient IDs representing what the user currently has in their pantry.
  // The planner can prioritize recipes that use these ingredients.
  availableIngredientIds: [
    "ing-1", "ing-5", "ing-9", "ing-13" // e.g. Chicken, Brown Rice, Broccoli, Olive Oil
  ],

  // Array of user-added or AI-logged custom ingredients
  customIngredients: []
};
