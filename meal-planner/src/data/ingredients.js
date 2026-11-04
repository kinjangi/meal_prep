/**
 * Represents a library of raw ingredients available for use in recipes.
 * Each ingredient specifies its macro breakdown per standardized unit.
 */
export const sampleIngredients = [
  // PROTEINS
  { id: "ing-1", name: "Chicken Breast", category: "protein", caloriesPerUnit: 165, proteinPerUnit: 31, carbsPerUnit: 0, fatPerUnit: 3.6, unit: "100g", dietaryTags: ["gluten-free", "dairy-free"] },
  { id: "ing-2", name: "Tofu", category: "protein", caloriesPerUnit: 144, proteinPerUnit: 16, carbsPerUnit: 3, fatPerUnit: 9, unit: "100g", dietaryTags: ["vegan", "vegetarian", "gluten-free", "dairy-free"] },
  { id: "ing-3", name: "Salmon", category: "protein", caloriesPerUnit: 208, proteinPerUnit: 20, carbsPerUnit: 0, fatPerUnit: 13, unit: "100g", dietaryTags: ["pescatarian", "gluten-free", "dairy-free"] },
  { id: "ing-4", name: "Lean Ground Beef", category: "protein", caloriesPerUnit: 250, proteinPerUnit: 26, carbsPerUnit: 0, fatPerUnit: 15, unit: "100g", dietaryTags: ["gluten-free", "dairy-free"] },
  
  // CARBS
  { id: "ing-5", name: "Brown Rice", category: "carb", caloriesPerUnit: 112, proteinPerUnit: 2.6, carbsPerUnit: 24, fatPerUnit: 0.9, unit: "100g (cooked)", dietaryTags: ["vegan", "vegetarian", "gluten-free", "dairy-free"] },
  { id: "ing-6", name: "Sweet Potato", category: "carb", caloriesPerUnit: 86, proteinPerUnit: 1.6, carbsPerUnit: 20, fatPerUnit: 0.1, unit: "100g (raw)", dietaryTags: ["vegan", "vegetarian", "gluten-free", "dairy-free"] },
  { id: "ing-7", name: "Oats", category: "carb", caloriesPerUnit: 389, proteinPerUnit: 17, carbsPerUnit: 66, fatPerUnit: 7, unit: "100g (raw)", dietaryTags: ["vegan", "vegetarian", "dairy-free"] }, // Note: Oats can be cross-contaminated with gluten
  { id: "ing-8", name: "Quinoa", category: "carb", caloriesPerUnit: 120, proteinPerUnit: 4.4, carbsPerUnit: 21, fatPerUnit: 1.9, unit: "100g (cooked)", dietaryTags: ["vegan", "vegetarian", "gluten-free", "dairy-free"] },

  // VEGETABLES
  { id: "ing-9", name: "Broccoli", category: "vegetable", caloriesPerUnit: 34, proteinPerUnit: 2.8, carbsPerUnit: 6.6, fatPerUnit: 0.4, unit: "100g", dietaryTags: ["vegan", "vegetarian", "gluten-free", "dairy-free"] },
  { id: "ing-10", name: "Spinach", category: "vegetable", caloriesPerUnit: 23, proteinPerUnit: 2.9, carbsPerUnit: 3.6, fatPerUnit: 0.4, unit: "100g", dietaryTags: ["vegan", "vegetarian", "gluten-free", "dairy-free"] },
  { id: "ing-11", name: "Bell Pepper", category: "vegetable", caloriesPerUnit: 20, proteinPerUnit: 0.9, carbsPerUnit: 4.6, fatPerUnit: 0.2, unit: "100g", dietaryTags: ["vegan", "vegetarian", "gluten-free", "dairy-free"] },
  { id: "ing-12", name: "Carrots", category: "vegetable", caloriesPerUnit: 41, proteinPerUnit: 0.9, carbsPerUnit: 9.6, fatPerUnit: 0.2, unit: "100g", dietaryTags: ["vegan", "vegetarian", "gluten-free", "dairy-free"] },

  // FATS
  { id: "ing-13", name: "Olive Oil", category: "fat", caloriesPerUnit: 119, proteinPerUnit: 0, carbsPerUnit: 0, fatPerUnit: 13.5, unit: "1 tbsp (15ml)", dietaryTags: ["vegan", "vegetarian", "gluten-free", "dairy-free"] },
  { id: "ing-14", name: "Avocado", category: "fat", caloriesPerUnit: 160, proteinPerUnit: 2, carbsPerUnit: 8.5, fatPerUnit: 14.7, unit: "100g", dietaryTags: ["vegan", "vegetarian", "gluten-free", "dairy-free"] },
  { id: "ing-15", name: "Almonds", category: "fat", caloriesPerUnit: 579, proteinPerUnit: 21, carbsPerUnit: 21.6, fatPerUnit: 49.9, unit: "100g", dietaryTags: ["vegan", "vegetarian", "gluten-free", "dairy-free"] },
  { id: "ing-16", name: "Peanut Butter", category: "fat", caloriesPerUnit: 94, proteinPerUnit: 4, carbsPerUnit: 3, fatPerUnit: 8, unit: "1 tbsp (16g)", dietaryTags: ["vegan", "vegetarian", "gluten-free", "dairy-free"] },

  // DAIRY / ALTERNATIVES
  { id: "ing-17", name: "Greek Yogurt", category: "dairy", caloriesPerUnit: 59, proteinPerUnit: 10, carbsPerUnit: 3.6, fatPerUnit: 0.4, unit: "100g", dietaryTags: ["vegetarian", "gluten-free"] },
  { id: "ing-18", name: "Almond Milk", category: "dairy-alternative", caloriesPerUnit: 15, proteinPerUnit: 0.5, carbsPerUnit: 0.3, fatPerUnit: 1.2, unit: "100ml", dietaryTags: ["vegan", "vegetarian", "gluten-free", "dairy-free"] },
  { id: "ing-19", name: "Cheddar Cheese", category: "dairy", caloriesPerUnit: 402, proteinPerUnit: 25, carbsPerUnit: 1.3, fatPerUnit: 33, unit: "100g", dietaryTags: ["vegetarian", "gluten-free"] },
  
  // EXTRAS
  { id: "ing-20", name: "Eggs", category: "protein", caloriesPerUnit: 68, proteinPerUnit: 5.5, carbsPerUnit: 0.4, fatPerUnit: 4.8, unit: "1 large egg", dietaryTags: ["gluten-free", "dairy-free"] },
  { id: "ing-21", name: "Honey", category: "carb", caloriesPerUnit: 64, proteinPerUnit: 0.1, carbsPerUnit: 17, fatPerUnit: 0, unit: "1 tbsp (21g)", dietaryTags: ["vegetarian", "gluten-free", "dairy-free"] },
];
