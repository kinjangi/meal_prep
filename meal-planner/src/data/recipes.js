/**
 * Represents a collection of recipes built from the available ingredients.
 * Each recipe lists the required ingredients by ID and the quantity needed.
 */
export const sampleRecipes = [
  {
    id: "rec-1",
    name: "Classic Chicken & Rice",
    mealType: "dinner",
    ingredients: [
      { ingredientId: "ing-1", quantity: 2 },   // 200g Chicken Breast
      { ingredientId: "ing-5", quantity: 1.5 }, // 150g Brown Rice
      { ingredientId: "ing-9", quantity: 1 }    // 100g Broccoli
    ],
    dietaryTags: ["gluten-free", "dairy-free"],
    instructions: "Grill the chicken breast. Steam the broccoli. Serve over cooked brown rice."
  },
  {
    id: "rec-2",
    name: "Tofu Stir-fry",
    mealType: "lunch",
    ingredients: [
      { ingredientId: "ing-2", quantity: 1.5 }, // 150g Tofu
      { ingredientId: "ing-11", quantity: 1 },  // 100g Bell Pepper
      { ingredientId: "ing-9", quantity: 1 },   // 100g Broccoli
      { ingredientId: "ing-13", quantity: 1 }   // 1 tbsp Olive Oil
    ],
    dietaryTags: ["vegan", "vegetarian", "gluten-free", "dairy-free"],
    instructions: "Cube tofu and pan-fry with olive oil. Add chopped bell peppers and broccoli. Stir-fry until tender."
  },
  {
    id: "rec-3",
    name: "Salmon & Sweet Potato Mash",
    mealType: "dinner",
    ingredients: [
      { ingredientId: "ing-3", quantity: 1.5 }, // 150g Salmon
      { ingredientId: "ing-6", quantity: 2 },   // 200g Sweet Potato
      { ingredientId: "ing-10", quantity: 1 }   // 100g Spinach
    ],
    dietaryTags: ["pescatarian", "gluten-free", "dairy-free"],
    instructions: "Bake salmon at 400F for 15 mins. Boil and mash sweet potatoes. Sauté spinach lightly. Serve together."
  },
  {
    id: "rec-4",
    name: "Lean Beef & Quinoa Bowl",
    mealType: "lunch",
    ingredients: [
      { ingredientId: "ing-4", quantity: 1.5 }, // 150g Lean Beef
      { ingredientId: "ing-8", quantity: 1 },   // 100g Quinoa
      { ingredientId: "ing-12", quantity: 0.5 } // 50g Carrots
    ],
    dietaryTags: ["gluten-free", "dairy-free"],
    instructions: "Brown the beef in a pan. Grate carrots. Serve beef and carrots over cooked quinoa."
  },
  {
    id: "rec-5",
    name: "Overnight Oats",
    mealType: "breakfast",
    ingredients: [
      { ingredientId: "ing-7", quantity: 0.5 }, // 50g Oats
      { ingredientId: "ing-18", quantity: 2 },  // 200ml Almond Milk
      { ingredientId: "ing-16", quantity: 1 },  // 1 tbsp Peanut Butter
      { ingredientId: "ing-21", quantity: 0.5 } // 0.5 tbsp Honey
    ],
    dietaryTags: ["vegetarian", "dairy-free"], // Oats might have gluten
    instructions: "Mix oats and almond milk in a jar. Stir in peanut butter and honey. Refrigerate overnight."
  },
  {
    id: "rec-6",
    name: "Greek Yogurt Parfait",
    mealType: "breakfast",
    ingredients: [
      { ingredientId: "ing-17", quantity: 2 },  // 200g Greek Yogurt
      { ingredientId: "ing-15", quantity: 0.3 },// 30g Almonds
      { ingredientId: "ing-21", quantity: 1 }   // 1 tbsp Honey
    ],
    dietaryTags: ["vegetarian", "gluten-free"],
    instructions: "Layer Greek yogurt in a bowl. Top with crushed almonds and a drizzle of honey."
  },
  {
    id: "rec-7",
    name: "Avocado Toast with Egg",
    mealType: "breakfast",
    ingredients: [
      { ingredientId: "ing-14", quantity: 0.5 },// 50g Avocado
      { ingredientId: "ing-20", quantity: 2 }   // 2 Eggs
      // Assuming bread is implicitly covered by carbs or a missing ingredient for now, 
      // but sticking strictly to provided IDs, we focus on the toppings.
    ],
    dietaryTags: ["dairy-free", "gluten-free"],
    instructions: "Mash avocado. Fry or poach eggs. Serve egg over the mashed avocado."
  },
  {
    id: "rec-8",
    name: "Protein Shake",
    mealType: "snack",
    ingredients: [
      { ingredientId: "ing-18", quantity: 2.5 },// 250ml Almond Milk
      { ingredientId: "ing-16", quantity: 1 },  // 1 tbsp Peanut Butter
      { ingredientId: "ing-7", quantity: 0.3 }  // 30g Oats
    ],
    dietaryTags: ["vegan", "vegetarian", "dairy-free"],
    instructions: "Blend all ingredients until smooth."
  },
  {
    id: "rec-9",
    name: "Almond & Apple Snack",
    mealType: "snack",
    ingredients: [
      { ingredientId: "ing-15", quantity: 0.5 } // 50g Almonds
      // Plus an apple, but keeping to strictly available IDs for simplicity
    ],
    dietaryTags: ["vegan", "vegetarian", "gluten-free", "dairy-free"],
    instructions: "Enjoy almonds as a quick crunchy snack."
  },
  {
    id: "rec-10",
    name: "Cheesy Scrambled Eggs",
    mealType: "breakfast",
    ingredients: [
      { ingredientId: "ing-20", quantity: 3 },  // 3 Eggs
      { ingredientId: "ing-19", quantity: 0.3 } // 30g Cheddar Cheese
    ],
    dietaryTags: ["gluten-free"],
    instructions: "Whisk eggs and scramble in a pan. Fold in grated cheese just before removing from heat."
  },
  {
    id: "rec-11",
    name: "Roasted Vegetable Bowl",
    mealType: "lunch",
    ingredients: [
      { ingredientId: "ing-9", quantity: 1.5 }, // 150g Broccoli
      { ingredientId: "ing-11", quantity: 1 },  // 100g Bell Pepper
      { ingredientId: "ing-12", quantity: 1 },  // 100g Carrots
      { ingredientId: "ing-13", quantity: 1.5 } // 1.5 tbsp Olive Oil
    ],
    dietaryTags: ["vegan", "vegetarian", "gluten-free", "dairy-free"],
    instructions: "Chop all vegetables. Toss with olive oil, salt, and pepper. Roast at 400F for 20 minutes."
  },
  {
    id: "rec-12",
    name: "Chicken & Quinoa Salad",
    mealType: "lunch",
    ingredients: [
      { ingredientId: "ing-1", quantity: 1.5 }, // 150g Chicken Breast
      { ingredientId: "ing-8", quantity: 1 },   // 100g Quinoa
      { ingredientId: "ing-10", quantity: 0.5 },// 50g Spinach
      { ingredientId: "ing-13", quantity: 0.5 } // 0.5 tbsp Olive Oil (dressing)
    ],
    dietaryTags: ["gluten-free", "dairy-free"],
    instructions: "Dice cooked chicken. Toss with cooked quinoa, fresh spinach, and a drizzle of olive oil."
  },
  {
    id: "rec-13",
    name: "Hearty Tofu & Quinoa Dinner",
    mealType: "dinner",
    ingredients: [
      { ingredientId: "ing-2", quantity: 2 },   // Tofu
      { ingredientId: "ing-8", quantity: 1.5 }, // Quinoa
      { ingredientId: "ing-9", quantity: 1 }    // Broccoli
    ],
    dietaryTags: ["vegan", "vegetarian", "gluten-free", "dairy-free"],
    instructions: "Bake tofu until crispy. Serve over warm quinoa with steamed broccoli."
  },
  {
    id: "rec-14",
    name: "Roasted Veggie & Sweet Potato Mash",
    mealType: "dinner",
    ingredients: [
      { ingredientId: "ing-6", quantity: 1.5 }, // Sweet Potato
      { ingredientId: "ing-12", quantity: 1 },  // Carrots
      { ingredientId: "ing-11", quantity: 1 },  // Bell Pepper
      { ingredientId: "ing-13", quantity: 1 }   // Olive oil
    ],
    dietaryTags: ["vegan", "vegetarian", "gluten-free", "dairy-free"],
    instructions: "Roast peppers and carrots. Serve over mashed sweet potatoes."
  },
  {
    id: "rec-15",
    name: "Cheesy Baked Sweet Potato",
    mealType: "dinner",
    ingredients: [
      { ingredientId: "ing-6", quantity: 2 },   // Sweet Potato
      { ingredientId: "ing-19", quantity: 0.5 },// Cheddar
      { ingredientId: "ing-9", quantity: 1 }    // Broccoli
    ],
    dietaryTags: ["vegetarian", "gluten-free"],
    instructions: "Bake sweet potato until tender. Top with melted cheese and steamed broccoli."
  },
  {
    id: "rec-16",
    name: "Vegan Tofu Scramble",
    mealType: "breakfast",
    ingredients: [
      { ingredientId: "ing-2", quantity: 1.5 }, // Tofu
      { ingredientId: "ing-10", quantity: 1 },  // Spinach
      { ingredientId: "ing-13", quantity: 0.5 } // Olive Oil
    ],
    dietaryTags: ["vegan", "vegetarian", "gluten-free", "dairy-free"],
    instructions: "Crumble tofu and sauté in olive oil. Fold in spinach until wilted."
  }
];
