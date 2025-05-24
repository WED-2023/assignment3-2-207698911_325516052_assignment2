const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";
const api_key = process.env.spooncular_apiKey;

/**
 * Get recipes list from spoonacular response and extract the relevant recipe data for preview
 * @param {*} recipes_info 
 */
async function getRecipeInformation(recipe_id) {
    try {
        return await axios.get(`${api_domain}/${recipe_id}/information`, {
            params: {
                includeNutrition: false,
                apiKey: api_key
            }
        });
    } catch (error) {
        console.error(`Error fetching recipe information for ID ${recipe_id}:`, error.message);
        throw error;
    }
}

/**
 * Get recipe details by recipe ID
 * @param {number} recipe_id - The ID of the recipe to fetch details for
 * @returns {Promise<Object>} An object containing detailed information about the recipe
 */
async function getRecipeDetails(recipe_id) {
    try {
        let recipe_info = await getRecipeInformation(recipe_id);
        let { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree, 
              analyzedInstructions, extendedIngredients, servings, summary } = recipe_info.data;
        
        return {
            id: id,
            title: title,
            readyInMinutes: readyInMinutes,
            image: image,
            popularity: aggregateLikes,
            vegan: vegan,
            vegetarian: vegetarian,
            glutenFree: glutenFree,
            servings: servings,
            summary: summary,
            ingredients: extendedIngredients,
            instructions: analyzedInstructions
        }
    } catch (error) {
        console.error(`Error getting recipe details for ID ${recipe_id}:`, error.message);
        throw error;
    }
}

/**
 * Get random recipes from Spoonacular API
 * @param {number} number - Number of recipes to return
 * @returns {Promise<Array>} Array of recipe objects
 */
async function getRandomRecipes(number = 3) {
    try {
        const response = await axios.get(`${api_domain}/random`, {
            params: {
                number: number,
                apiKey: api_key
            }
        });
        return response.data.recipes.map(recipe => ({
            id: recipe.id,
            title: recipe.title,
            image: recipe.image,
            readyInMinutes: recipe.readyInMinutes,
            popularity: recipe.aggregateLikes,
            vegan: recipe.vegan,
            vegetarian: recipe.vegetarian,
            glutenFree: recipe.glutenFree
        }));
    } catch (error) {
        console.error(`Error getting random recipes:`, error.message);
        throw error;
    }
}

/**
 * Search recipes from Spoonacular API
 * @param {string} query - Search query
 * @param {number} number - Number of recipes to return
 * @param {Object} filters - Additional filters (cuisine, diet, intolerances)
 * @returns {Promise<Array>} Array of recipe objects
 */
async function searchRecipes(query, number = 5, filters = {}) {
    try {
        const params = {
            query: query,
            number: number,
            addRecipeInformation: true,
            apiKey: api_key,
            ...filters
        };

        const response = await axios.get(`${api_domain}/complexSearch`, { params });
        
        return response.data.results.map(recipe => ({
            id: recipe.id,
            title: recipe.title,
            image: recipe.image,
            readyInMinutes: recipe.readyInMinutes,
            popularity: recipe.aggregateLikes,
            vegan: recipe.vegan,
            vegetarian: recipe.vegetarian,
            glutenFree: recipe.glutenFree
        }));
    } catch (error) {
        console.error(`Error searching recipes:`, error.message);
        throw error;
    }
}

/**
 * Get recipes preview by array of recipe IDs
 * @param {Array} recipe_ids - Array of recipe IDs
 * @returns {Promise<Array>} Array of recipe preview objects
 */
async function getRecipesPreview(recipe_ids) {
    try {
        const promises = recipe_ids.map(async (id) => {
            try {
                const recipe_info = await getRecipeInformation(id);
                const { id: recipeId, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree } = recipe_info.data;
                
                return {
                    id: recipeId,
                    title: title,
                    readyInMinutes: readyInMinutes,
                    image: image,
                    popularity: aggregateLikes,
                    vegan: vegan,
                    vegetarian: vegetarian,
                    glutenFree: glutenFree
                };
            } catch (error) {
                console.error(`Error getting preview for recipe ID ${id}:`, error.message);
                return null; // Return null for failed requests
            }
        });
        
        const results = await Promise.all(promises);
        return results.filter(recipe => recipe !== null); // Filter out failed requests
    } catch (error) {
        console.error(`Error getting recipes preview:`, error.message);
        throw error;
    }
}

/**
 * Get recipe instructions
 * @param {number} recipe_id - Recipe ID
 * @returns {Promise<Array>} Array of instruction steps
 */
async function getRecipeInstructions(recipe_id) {
    try {
        const response = await axios.get(`${api_domain}/${recipe_id}/analyzedInstructions`, {
            params: {
                apiKey: api_key
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Error getting recipe instructions for ID ${recipe_id}:`, error.message);
        throw error;
    }
}

/**
 * Get available cuisines from Spoonacular
 * @returns {Promise<Array>} Array of cuisine types
 */
async function getCuisines() {
    // Spoonacular supported cuisines (static list as they don't change often)
    return [
        'African', 'Asian', 'American', 'British', 'Cajun', 'Caribbean', 'Chinese', 'Eastern European',
        'European', 'French', 'German', 'Greek', 'Indian', 'Irish', 'Italian', 'Japanese', 'Jewish',
        'Korean', 'Latin American', 'Mediterranean', 'Mexican', 'Middle Eastern', 'Nordic', 'Southern',
        'Spanish', 'Thai', 'Vietnamese'
    ];
}

/**
 * Get available diets from Spoonacular
 * @returns {Promise<Array>} Array of diet types
 */
async function getDiets() {
    return [
        'Gluten Free', 'Ketogenic', 'Vegetarian', 'Lacto-Vegetarian', 'Ovo-Vegetarian', 'Vegan',
        'Pescetarian', 'Paleo', 'Primal', 'Whole30'
    ];
}

/**
 * Get available intolerances from Spoonacular
 * @returns {Promise<Array>} Array of intolerance types
 */
async function getIntolerances() {
    return [
        'Dairy', 'Egg', 'Gluten', 'Grain', 'Peanut', 'Seafood', 'Sesame', 'Shellfish', 'Soy',
        'Sulfite', 'Tree Nut', 'Wheat'
    ];
}

exports.getRecipeDetails = getRecipeDetails;
exports.getRecipesPreview = getRecipesPreview;
exports.getRandomRecipes = getRandomRecipes;
exports.searchRecipes = searchRecipes;
exports.getRecipeInstructions = getRecipeInstructions;
exports.getCuisines = getCuisines;
exports.getDiets = getDiets;
exports.getIntolerances = getIntolerances;
