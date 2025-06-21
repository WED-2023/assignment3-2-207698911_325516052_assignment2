const DButils = require("./DButils");

// Transform database recipe to match API format
async function transformUserRecipe(dbRecipe) {
    // Parse ingredients and instructions if they're stored as strings
    let ingredients = dbRecipe.ingredients;
    let instructions = dbRecipe.instructions;
    
    try {
        if (typeof ingredients === 'string') {
            ingredients = JSON.parse(ingredients);
        }
        
        // Ensure ingredients match the extendedIngredients format from the API
        if (Array.isArray(ingredients)) {
            // If ingredients is an array of strings, convert to extendedIngredients format
            if (ingredients.length > 0 && typeof ingredients[0] === 'string') {
                ingredients = ingredients.map((ingredient, index) => ({
                    id: index,
                    name: ingredient,
                    original: ingredient,
                    originalName: ingredient,
                    amount: 1,
                    unit: '',
                    aisle: '',
                    consistency: 'solid',
                    image: '',
                    meta: [],
                    metaInformation: [],
                    measures: {
                        us: { amount: 1, unitShort: '', unitLong: '' },
                        metric: { amount: 1, unitShort: '', unitLong: '' }
                    }
                }));
            } 
            // If ingredients is an array of objects but missing key properties
            else if (ingredients.length > 0 && typeof ingredients[0] === 'object') {
                ingredients = ingredients.map((ingredient, index) => {
                    // Check if the ingredient already has the complete structure needed
                    if (ingredient.id && ingredient.name && ingredient.original && 
                        ingredient.measures && ingredient.measures.us && ingredient.measures.metric) {
                        return ingredient;
                    }
                    
                    // Start with existing properties
                    const enhancedIngredient = { ...ingredient };
                    
                    // Ensure all required properties exist
                    if (!enhancedIngredient.id) enhancedIngredient.id = index;
                    if (!enhancedIngredient.name) enhancedIngredient.name = ingredient.original || ingredient.originalName || "Ingredient";
                    if (!enhancedIngredient.original) enhancedIngredient.original = ingredient.name || "Ingredient";
                    if (!enhancedIngredient.originalName) enhancedIngredient.originalName = enhancedIngredient.name;
                    if (enhancedIngredient.amount === undefined) enhancedIngredient.amount = 1;
                    if (!enhancedIngredient.unit) enhancedIngredient.unit = '';
                    if (!enhancedIngredient.aisle) enhancedIngredient.aisle = '';
                    if (!enhancedIngredient.consistency) enhancedIngredient.consistency = 'solid';
                    if (!enhancedIngredient.image) enhancedIngredient.image = '';
                    if (!enhancedIngredient.meta) enhancedIngredient.meta = [];
                    if (!enhancedIngredient.metaInformation) enhancedIngredient.metaInformation = [];
                    
                    // Create measures object if it doesn't exist
                    if (!enhancedIngredient.measures) {
                        enhancedIngredient.measures = {
                            us: { 
                                amount: enhancedIngredient.amount, 
                                unitShort: enhancedIngredient.unit, 
                                unitLong: enhancedIngredient.unit 
                            },
                            metric: { 
                                amount: enhancedIngredient.amount, 
                                unitShort: enhancedIngredient.unit, 
                                unitLong: enhancedIngredient.unit 
                            }
                        };
                    } else {
                        // Make sure both us and metric exist
                        if (!enhancedIngredient.measures.us) {
                            enhancedIngredient.measures.us = {
                                amount: enhancedIngredient.amount,
                                unitShort: enhancedIngredient.unit,
                                unitLong: enhancedIngredient.unit
                            };
                        }
                        if (!enhancedIngredient.measures.metric) {
                            enhancedIngredient.measures.metric = {
                                amount: enhancedIngredient.amount,
                                unitShort: enhancedIngredient.unit,
                                unitLong: enhancedIngredient.unit
                            };
                        }
                    }
                    
                    return enhancedIngredient;
                });
            }
        } else {
            // If ingredients is not an array, create an empty array
            ingredients = [];
        }
    } catch (error) {
        console.error("Error processing ingredients:", error);
        ingredients = []; // Fallback to empty array if parsing fails
    }
    
    try {
        if (typeof instructions === 'string') {
            instructions = JSON.parse(instructions);
        }
        
        // If instructions is not in the expected format, transform it
        // API format typically has analyzedInstructions as an array with objects containing steps
        if (!Array.isArray(instructions) || 
            (instructions.length > 0 && !instructions[0].steps)) {
            // Convert to API format
            if (Array.isArray(instructions) && typeof instructions[0] === 'string') {
                instructions = [{
                    name: "",
                    steps: instructions.map((step, index) => ({
                        number: index + 1,
                        step: step
                    }))
                }];
            } else if (Array.isArray(instructions) && instructions[0].number) {
                // If it's already an array of step objects, wrap it in the expected structure
                instructions = [{
                    name: "",
                    steps: instructions
                }];
            }
        }
    } catch (error) {
        console.error("Error parsing instructions:", error);
        instructions = []; // Fallback to empty array if parsing fails
    }
    
    // Match format of recipes from the API (getRecipeDetails in recipes_utils.js)
    return {
        id: dbRecipe.recipe_id,
        title: dbRecipe.title,
        readyInMinutes: dbRecipe.readyInMinutes,
        image: dbRecipe.image,
        popularity: 0, // User recipes don't have aggregateLikes/popularity
        vegan: dbRecipe.vegan === 1,
        vegetarian: dbRecipe.vegetarian === 1,
        glutenFree: dbRecipe.glutenFree === 1,
        ingredients: ingredients, // This should be an array matching extendedIngredients
        instructions: instructions, // This should match analyzedInstructions format
        servings: dbRecipe.servings
    };
}

// Transform family recipe to match API format
async function transformFamilyRecipe(dbRecipe) {
    // Parse ingredients and instructions if they're stored as strings
    let ingredients = dbRecipe.ingredients;
    let instructions = dbRecipe.instructions;
    
    try {
        if (typeof ingredients === 'string') {
            ingredients = JSON.parse(ingredients);
        }
        
        // Ensure ingredients match the extendedIngredients format from the API
        if (Array.isArray(ingredients)) {
            // If ingredients is an array of strings, convert to extendedIngredients format
            if (ingredients.length > 0 && typeof ingredients[0] === 'string') {
                ingredients = ingredients.map((ingredient, index) => ({
                    id: index,
                    name: ingredient,
                    original: ingredient,
                    originalName: ingredient,
                    amount: 1,
                    unit: '',
                    aisle: '',
                    consistency: 'solid',
                    image: '',
                    meta: [],
                    metaInformation: [],
                    measures: {
                        us: { amount: 1, unitShort: '', unitLong: '' },
                        metric: { amount: 1, unitShort: '', unitLong: '' }
                    }
                }));
            } 
            // If ingredients is an array of objects but missing key properties
            else if (ingredients.length > 0 && typeof ingredients[0] === 'object') {
                ingredients = ingredients.map((ingredient, index) => {
                    // Check if the ingredient already has the complete structure needed
                    if (ingredient.id && ingredient.name && ingredient.original && 
                        ingredient.measures && ingredient.measures.us && ingredient.measures.metric) {
                        return ingredient;
                    }
                    
                    // Start with existing properties
                    const enhancedIngredient = { ...ingredient };
                    
                    // Ensure all required properties exist
                    if (!enhancedIngredient.id) enhancedIngredient.id = index;
                    if (!enhancedIngredient.name) enhancedIngredient.name = ingredient.original || ingredient.originalName || "Ingredient";
                    if (!enhancedIngredient.original) enhancedIngredient.original = ingredient.name || "Ingredient";
                    if (!enhancedIngredient.originalName) enhancedIngredient.originalName = enhancedIngredient.name;
                    if (enhancedIngredient.amount === undefined) enhancedIngredient.amount = 1;
                    if (!enhancedIngredient.unit) enhancedIngredient.unit = '';
                    if (!enhancedIngredient.aisle) enhancedIngredient.aisle = '';
                    if (!enhancedIngredient.consistency) enhancedIngredient.consistency = 'solid';
                    if (!enhancedIngredient.image) enhancedIngredient.image = '';
                    if (!enhancedIngredient.meta) enhancedIngredient.meta = [];
                    if (!enhancedIngredient.metaInformation) enhancedIngredient.metaInformation = [];
                    
                    // Create measures object if it doesn't exist
                    if (!enhancedIngredient.measures) {
                        enhancedIngredient.measures = {
                            us: { 
                                amount: enhancedIngredient.amount, 
                                unitShort: enhancedIngredient.unit, 
                                unitLong: enhancedIngredient.unit 
                            },
                            metric: { 
                                amount: enhancedIngredient.amount, 
                                unitShort: enhancedIngredient.unit, 
                                unitLong: enhancedIngredient.unit 
                            }
                        };
                    } else {
                        // Make sure both us and metric exist
                        if (!enhancedIngredient.measures.us) {
                            enhancedIngredient.measures.us = {
                                amount: enhancedIngredient.amount,
                                unitShort: enhancedIngredient.unit,
                                unitLong: enhancedIngredient.unit
                            };
                        }
                        if (!enhancedIngredient.measures.metric) {
                            enhancedIngredient.measures.metric = {
                                amount: enhancedIngredient.amount,
                                unitShort: enhancedIngredient.unit,
                                unitLong: enhancedIngredient.unit
                            };
                        }
                    }
                    
                    return enhancedIngredient;
                });
            }
        } else {
            // If ingredients is not an array, create an empty array
            ingredients = [];
        }
    } catch (error) {
        console.error("Error processing ingredients:", error);
        ingredients = []; // Fallback to empty array if parsing fails
    }
    
    try {
        if (typeof instructions === 'string') {
            instructions = JSON.parse(instructions);
        }
        
        // If instructions is not in the expected format, transform it
        // API format typically has analyzedInstructions as an array with objects containing steps
        if (!Array.isArray(instructions) || 
            (instructions.length > 0 && !instructions[0].steps)) {
            // Convert to API format
            if (Array.isArray(instructions) && typeof instructions[0] === 'string') {
                instructions = [{
                    name: "",
                    steps: instructions.map((step, index) => ({
                        number: index + 1,
                        step: step
                    }))
                }];
            } else if (Array.isArray(instructions) && instructions[0].number) {
                // If it's already an array of step objects, wrap it in the expected structure
                instructions = [{
                    name: "",
                    steps: instructions
                }];
            }
        }
    } catch (error) {
        console.error("Error parsing instructions:", error);
        instructions = []; // Fallback to empty array if parsing fails
    }
    
    return {
        id: dbRecipe.recipe_id,
        title: dbRecipe.title,
        readyInMinutes: dbRecipe.readyInMinutes,
        image: dbRecipe.image,
        popularity: 0, // Family recipes don't have popularity metrics
        vegan: false, // Default values for dietary restrictions (modify if needed)
        vegetarian: false,
        glutenFree: false,
        ingredients: ingredients,
        instructions: instructions,
        servings: dbRecipe.servings,
        // Family recipe specific fields
        author: dbRecipe.author,
        occasion: dbRecipe.occasion,
        story: dbRecipe.story
    };
}

async function markAsFavorite(user_id, recipe_id){
    await DButils.execQuery(`INSERT IGNORE INTO FavoriteRecipes (user_id, recipe_id) VALUES ('${user_id}', ${recipe_id})`);
}

async function removeFavorite(user_id, recipe_id){
    await DButils.execQuery(`DELETE FROM FavoriteRecipes WHERE user_id='${user_id}' AND recipe_id=${recipe_id}`);
}

async function getFavoriteRecipes(user_id){
    const recipes_id = await DButils.execQuery(`SELECT recipe_id FROM FavoriteRecipes WHERE user_id='${user_id}'`);
    return recipes_id;
}

async function markAsViewed(user_id, recipe_id){
    // First, remove if already exists to update the timestamp
    await DButils.execQuery(`DELETE FROM UserViewedRecipes WHERE user_id='${user_id}' AND recipe_id=${recipe_id}`);
    // Then add/re-add the viewed recipe
    await DButils.execQuery(`INSERT INTO UserViewedRecipes (user_id, recipe_id) VALUES ('${user_id}', ${recipe_id})`);
    
    // Keep only the last 3 viewed recipes per user
    await DButils.execQuery(`
        DELETE FROM UserViewedRecipes 
        WHERE user_id='${user_id}' 
        AND recipe_id NOT IN (
            SELECT recipe_id FROM (
                SELECT recipe_id FROM UserViewedRecipes 
                WHERE user_id='${user_id}' 
                ORDER BY viewed_at DESC 
                LIMIT 3
            ) as t
        )
    `);
}

async function getViewedRecipes(user_id){
    const recipes = await DButils.execQuery(`
        SELECT recipe_id FROM UserViewedRecipes 
        WHERE user_id='${user_id}' 
        ORDER BY viewed_at DESC 
        LIMIT 3
    `);
    return recipes;
}

async function getUserRecipes(user_id){
    const recipes = await DButils.execQuery(`
        SELECT * FROM UserRecipes 
        WHERE user_id='${user_id}' 
        ORDER BY created_at DESC
    `);
    
    // Transform each recipe to match the API format
    const transformedRecipes = await Promise.all(recipes.map(recipe => transformUserRecipe(recipe)));
    
    return transformedRecipes;
}
async function getUserRecipe(user_id, recipe_id){
    const recipes = await DButils.execQuery(`
        SELECT * FROM UserRecipes 
        WHERE user_id='${user_id}' AND recipe_id=${recipe_id}
    `);
    
    if (recipes.length > 0) {
        // Transform the recipe to match the API format
        const transformedRecipe = await transformUserRecipe(recipes[0]);
        
        
        return transformedRecipe;
    }
    return null;
}
async function createUserRecipe(user_id, recipeData){
    const { title, image, readyInMinutes, vegan, vegetarian, glutenFree, ingredients, instructions, servings } = recipeData;
    
    const result = await DButils.execQuery(`
        INSERT INTO UserRecipes (user_id, title, image, readyInMinutes, vegan, vegetarian, glutenFree, ingredients, instructions, servings)
        VALUES ('${user_id}', '${title}', '${image || ''}', ${readyInMinutes || 'NULL'}, ${vegan || false}, ${vegetarian || false}, ${glutenFree || false}, '${JSON.stringify(ingredients)}', '${JSON.stringify(instructions)}', ${servings || 'NULL'})
    `);
    
    return result.insertId;
}

async function getFamilyRecipes(user_id){
    const recipes = await DButils.execQuery(`
        SELECT * FROM FamilyRecipes 
        WHERE user_id='${user_id}' 
        ORDER BY created_at DESC
    `);
    
    // Transform each recipe to match the API format
    const transformedRecipes = await Promise.all(recipes.map(recipe => transformFamilyRecipe(recipe)));
    return transformedRecipes;
}

async function createFamilyRecipe(user_id, recipeData){
    const { title, image, readyInMinutes, ingredients, instructions, servings, author, occasion, story } = recipeData;
    
    const result = await DButils.execQuery(`
        INSERT INTO FamilyRecipes (user_id, title, image, readyInMinutes, ingredients, instructions, servings, author, occasion, story)
        VALUES ('${user_id}', '${title}', '${image || ''}', ${readyInMinutes || 'NULL'}, '${JSON.stringify(ingredients)}', '${JSON.stringify(instructions)}', ${servings || 'NULL'}, '${author || ''}', '${occasion || ''}', '${story || ''}')
    `);
    
    return result.insertId;
}

async function saveSearchQuery(user_id, query){
    await DButils.execQuery(`
        INSERT INTO UserSearchHistory (user_id, search_query) 
        VALUES ('${user_id}', '${query}')
    `);
}

async function getLastSearch(user_id){
    const result = await DButils.execQuery(`
        SELECT search_query FROM UserSearchHistory 
        WHERE user_id='${user_id}' 
        ORDER BY search_date DESC 
        LIMIT 1
    `);
    return result.length > 0 ? result[0] : null;
}

async function getRecipeProgress(user_id, recipe_id){
    const result = await DButils.execQuery(`
        SELECT * FROM RecipeProgress 
        WHERE user_id='${user_id}' AND recipe_id=${recipe_id}
    `);
    return result.length > 0 ? result[0] : null;
}

async function updateRecipeProgress(user_id, recipe_id, current_step, total_steps, completed = false){
    await DButils.execQuery(`
        INSERT INTO RecipeProgress (user_id, recipe_id, current_step, total_steps, completed)
        VALUES ('${user_id}', ${recipe_id}, ${current_step}, ${total_steps}, ${completed})
        ON DUPLICATE KEY UPDATE 
        current_step = ${current_step}, 
        total_steps = ${total_steps}, 
        completed = ${completed},
        updated_at = CURRENT_TIMESTAMP
    `);
}

async function getMealPlan(user_id){
    const mealPlan = await DButils.execQuery(`
        SELECT * FROM MealPlan 
        WHERE user_id='${user_id}' 
        ORDER BY planned_date ASC, meal_type ASC, order_index ASC
    `);
    return mealPlan;
}

async function addToMealPlan(user_id, meal_data){
    const { recipe_id, recipe_title, meal_type, planned_date, servings, order_index } = meal_data;
    
    const result = await DButils.execQuery(`
        INSERT INTO MealPlan (user_id, recipe_id, recipe_title, meal_type, planned_date, servings, order_index)
        VALUES ('${user_id}', ${recipe_id || 'NULL'}, '${recipe_title}', '${meal_type}', '${planned_date}', ${servings || 1}, ${order_index || 0})
    `);
    
    return result.insertId;
}

async function removeMealPlanItem(user_id, item_id){
    await DButils.execQuery(`
        DELETE FROM MealPlan 
        WHERE user_id='${user_id}' AND item_id=${item_id}
    `);
}

async function updateMealPlanItem(user_id, item_id, updates){
    const updateFields = [];
    const { meal_type, planned_date, servings, order_index } = updates;
    
    if (meal_type) updateFields.push(`meal_type = '${meal_type}'`);
    if (planned_date) updateFields.push(`planned_date = '${planned_date}'`);
    if (servings) updateFields.push(`servings = ${servings}`);
    if (order_index !== undefined) updateFields.push(`order_index = ${order_index}`);
    
    if (updateFields.length > 0) {
        await DButils.execQuery(`
            UPDATE MealPlan 
            SET ${updateFields.join(', ')}
            WHERE user_id='${user_id}' AND item_id=${item_id}
        `);
    }
}

async function deleteUserRecipe(user_id, recipe_id){
    await DButils.execQuery(`
        DELETE FROM UserRecipes 
        WHERE user_id='${user_id}' AND recipe_id=${recipe_id}
    `);
}

async function deleteFamilyRecipe(user_id, recipe_id){
    await DButils.execQuery(`
        DELETE FROM FamilyRecipes 
        WHERE user_id='${user_id}' AND recipe_id=${recipe_id}
    `);
}

exports.markAsFavorite = markAsFavorite;
exports.removeFavorite = removeFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
exports.markAsViewed = markAsViewed;
exports.getViewedRecipes = getViewedRecipes;
exports.getUserRecipes = getUserRecipes;
exports.getUserRecipe = getUserRecipe;
exports.createUserRecipe = createUserRecipe;
exports.deleteUserRecipe = deleteUserRecipe;
exports.getFamilyRecipes = getFamilyRecipes;
exports.createFamilyRecipe = createFamilyRecipe;
exports.deleteFamilyRecipe = deleteFamilyRecipe;
exports.saveSearchQuery = saveSearchQuery;
exports.getLastSearch = getLastSearch;
exports.getRecipeProgress = getRecipeProgress;
exports.updateRecipeProgress = updateRecipeProgress;
exports.getMealPlan = getMealPlan;
exports.addToMealPlan = addToMealPlan;
exports.removeMealPlanItem = removeMealPlanItem;
exports.updateMealPlanItem = updateMealPlanItem;
exports.transformUserRecipe = transformUserRecipe;
exports.transformFamilyRecipe = transformFamilyRecipe;

