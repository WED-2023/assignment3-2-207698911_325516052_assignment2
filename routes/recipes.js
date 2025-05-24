var express = require("express");
var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");
const user_utils = require("./utils/user_utils");
const DButils = require("./utils/DButils");

/**
 * @swagger
 * /recipes/random:
 *   get:
 *     tags:
 *       - Recipe
 *     summary: קבלת מתכונים אקראיים
 *     parameters:
 *       - name: count
 *         in: query
 *         schema:
 *           type: integer
 *         description: Number of random recipes to return (default 3)
 *     responses:
 *       200:
 *         description: List of random recipes
 */
router.get("/random", async (req, res, next) => {
  try {
    const count = req.query.count ? parseInt(req.query.count) : 3;
    
    if (isNaN(count) || count < 1) {
      return res.status(400).send({ message: "Count must be a positive number", success: false });
    }
    
    const recipes = await recipes_utils.getRandomRecipes(count);
    res.send(recipes);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /recipes/search:
 *   get:
 *     tags:
 *       - Search
 *     summary: חיפוש מתכונים
 *     parameters:
 *       - name: query
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *       - name: number
 *         in: query
 *         schema:
 *           type: integer
 *         description: Number of results (default 5)
 *       - name: cuisine
 *         in: query
 *         schema:
 *           type: string
 *         description: Filter by cuisine
 *       - name: diet
 *         in: query
 *         schema:
 *           type: string
 *         description: Filter by diet
 *       - name: intolerances
 *         in: query
 *         schema:
 *           type: string
 *         description: Filter by intolerances
 *     responses:
 *       200:
 *         description: Search results
 *       400:
 *         description: Missing search query
 */
router.get("/search", async (req, res, next) => {
  try {
    const { query, number = 5, cuisine, diet, intolerances } = req.query;

    if (!query) {
      return res.status(400).send({ message: "Search query is required", success: false });
    }

    // Save search query if user is logged in
    if (req.session && req.session.user_id) {
      await user_utils.saveSearchQuery(req.session.user_id, query);
    }

    // Build filters object
    const filters = {};
    if (cuisine) filters.cuisine = cuisine;
    if (diet) filters.diet = diet;
    if (intolerances) filters.intolerances = intolerances;

    const results = await recipes_utils.searchRecipes(query, parseInt(number), filters);
    res.status(200).send(results);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /recipes/{id}:
 *   get:
 *     tags:
 *       - Recipe
 *     summary: קבלת פרטי מתכון
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Recipe ID
 *     responses:
 *       200:
 *         description: Recipe details
 */
router.get("/:recipeId", async (req, res, next) => {
  try {
    const recipe = await recipes_utils.getRecipeDetails(req.params.recipeId);
    
    // Mark as viewed if user is logged in
    if (req.session && req.session.user_id) {
      await user_utils.markAsViewed(req.session.user_id, req.params.recipeId);
    }
    
    res.send(recipe);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /recipes/{id}/instructions:
 *   get:
 *     tags:
 *       - Bonus - Preparation
 *     summary: קבלת הוראות הכנה למתכון
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Recipe ID
 *     responses:
 *       200:
 *         description: Recipe instructions
 */
router.get("/:recipeId/instructions", async (req, res, next) => {
  try {
    const instructions = await recipes_utils.getRecipeInstructions(req.params.recipeId);
    res.send(instructions);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
