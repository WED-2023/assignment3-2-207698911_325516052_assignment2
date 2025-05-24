const DButils = require("./DButils");

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
    return recipes;
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
    return recipes;
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
exports.deleteUserRecipe = deleteUserRecipe;
exports.deleteFamilyRecipe = deleteFamilyRecipe;
