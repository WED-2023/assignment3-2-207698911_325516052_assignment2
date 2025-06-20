var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const user_utils = require("./utils/user_utils");
const recipe_utils = require("./utils/recipes_utils");

/**
 * Authenticate all incoming requests by middleware
 */
router.use(async function (req, res, next) {
  if (req.session && req.session.user_id) {
    DButils.execQuery("SELECT user_id FROM users").then((users) => {
      if (users.find((x) => x.user_id === req.session.user_id)) {
        req.user_id = req.session.user_id;
        next();
      } else {
        res.sendStatus(401);
      }
    }).catch(err => next(err));
  } else {
    res.sendStatus(401);
  }
});

/**
 * @swagger
 * /users/{userId}/view:
 *   post:
 *     tags:
 *       - User
 *     summary: סימון מתכון כנצפה
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               recipeId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Recipe marked as viewed
 */
router.post('/:userId/view', async (req, res, next) => {
  try {
    const user_id = req.params.userId;
    const recipe_id = req.body.recipeId;
    
    if (user_id != req.session.user_id) {
      return res.status(403).send({ message: "Access denied", success: false });
    }
    
    await user_utils.markAsViewed(user_id, recipe_id);
    res.status(200).send({ message: "Recipe marked as viewed", success: true });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /users/{userId}/favorites:
 *   get:
 *     tags:
 *       - Personal Area
 *     summary: קבלת רשימת מתכונים מועדפים
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of favorite recipes
 *   post:
 *     tags:
 *       - Personal Area
 *     summary: הוספת מתכון למועדפים
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               recipeId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Recipe added to favorites
 */
router.post('/:userId/favorites', async (req, res, next) => {
  try {
    const user_name = req.params.userId;
    const recipe_id = req.body.recipeId;
    //get from the database the username of the user_id
    const session_user_name_arr = await DButils.execQuery(`SELECT username FROM users WHERE user_id = '${req.session.user_id}'`);
    const session_user_name = session_user_name_arr[0].username;

    if (user_name != session_user_name) {
      return res.status(403).send({ message: "Access denied", success: false });
    }

    await user_utils.markAsFavorite(req.session.user_id, recipe_id);
    res.status(200).send({ message: "The Recipe successfully saved as favorite", success: true });
  } catch (error) {
    next(error);
  }
});

router.get('/:userId/favorites', async (req, res, next) => {
  try {
    const user_name = req.params.userId;

    //get from the database the username of the user_id
    const session_user_name_arr = await DButils.execQuery(`SELECT username FROM users WHERE user_id = '${req.session.user_id}'`);
    const session_user_name = session_user_name_arr[0].username;

    if (user_name != session_user_name) {
      return res.status(403).send({ message: "Access denied", success: false });
    }

    const recipes_id = await user_utils.getFavoriteRecipes(req.session.user_id);
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipe_id));
    const results = await recipe_utils.getRecipesPreview(recipes_id_array);
    res.status(200).send(results);
  } catch (error) {
    next(error);
  }
});

router.delete('/:userId/favorites/:recipeId', async (req, res, next) => {
  try {
    const user_name = req.params.userId;
    const recipe_id = req.params.recipeId;
    //get from the database the username of the user_id
    const session_user_name_arr = await DButils.execQuery(`SELECT username FROM users WHERE user_id = '${req.session.user_id}'`);
    const session_user_name = session_user_name_arr[0].username;

    if (user_name != session_user_name) {
      return res.status(403).send({ message: "Access denied", success: false });
    }
    await user_utils.removeFavorite(req.session.user_id, recipe_id);
    res.status(200).send({ message: "Recipe removed from favorites", success: true });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /users/{userId}/recipes:
 *   get:
 *     tags:
 *       - Personal Area
 *     summary: קבלת המתכונים האישיים של המשתמש
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of user's personal recipes
 */
router.get('/:userId/recipes', async (req, res, next) => {
  try {
     const user_name = req.params.userId;
    //get from the database the username of the user_id
    const session_user_name_arr = await DButils.execQuery(`SELECT username FROM users WHERE user_id = '${req.session.user_id}'`);
    const session_user_name = session_user_name_arr[0].username;
    if (user_name != session_user_name) {
      return res.status(403).send({ message: "Access denied", success: false });
    }

    const recipes = await user_utils.getUserRecipes(req.session.user_id);
    res.status(200).send(recipes);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /users/{userId}/recipes:
 *   post:
 *     tags:
 *       - Personal Area
 *     summary: יצירת מתכון אישי חדש
  *     parameters:
  *       - name: userId
  *         in: path
  *         required: true
  *         schema:
  *           type: integer
  *       - name: recipe
  *         in: body
  *         required: true
  *         schema:
  *           type: object
  *           properties:
  *             title:
  *               type: string
  *             image:
  *               type: string
  *             readyInMinutes:
  *               type: integer
  *             servings:
  *               type: integer
  *             instructions:
  *               type: array
  *               items:
  *                 type: string
  *             ingredients:
  *               type: array
  *               items:
  *                 type: string
  *             is_vegetarian:
  *               type: boolean
  *             is_vegan:
  *               type: boolean
  *             is_gluten_free:
  *               type: boolean
  *          responses:
  *          201:
  *           description: Recipe created successfully
  * */

router.post('/:userId/recipes', async (req, res, next) => {
  try {
    const user_name = req.params.userId;
    //get from the database the username of the user_id
    const session_user_name_arr = await DButils.execQuery(`SELECT username FROM users WHERE user_id = '${req.session.user_id}'`);
    const session_user_name = session_user_name_arr[0].username;
    if (user_name != session_user_name) {
      return res.status(403).send({ message: "Access denied", success: false });
    }
    const { title, image, readyInMinutes, servings, instructions, ingredients, is_vegetarian, is_vegan, is_gluten_free } = req.body;
    if (!title || !instructions || !ingredients) {
      return res.status(400).send({ message: "Missing required fields: title, instructions, ingredients", success: false });
    }
    
    const recipeData = {
      title,
      image: image || '',
      readyInMinutes,
      vegan: is_vegan || false,
      vegetarian: is_vegetarian || false,
      glutenFree: is_gluten_free || false,
      ingredients,
      instructions,
      servings
    };
    
    const recipe_id = await user_utils.createUserRecipe(req.session.user_id, recipeData);
    res.status(201).send({ message: "Recipe created successfully", recipe_id });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /users/{userId}/family-recipes:
 *   get:
 *     tags:
 *       - Personal Area
 *     summary: קבלת המתכונים המשפחתיים של המשתמש
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of user's family recipes
 */
router.get('/:userId/family-recipes', async (req, res, next) => {
  try {
    const user_id = req.params.userId;
    
    if (user_id != req.session.user_id) {
      return res.status(403).send({ message: "Access denied", success: false });
    }
    
    const recipes = await user_utils.getFamilyRecipes(user_id);
    res.status(200).send(recipes);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /users/{userId}/search/last:
 *   get:
 *     tags:
 *       - Search
 *     summary: קבלת החיפוש האחרון של המשתמש
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Last search query
 */
router.get('/:userId/search/last', async (req, res, next) => {
  try {
    const user_id = req.params.userId;
    
    if (user_id != req.session.user_id) {
      return res.status(403).send({ message: "Access denied", success: false });
    }
    
    const lastSearch = await user_utils.getLastSearch(user_id);
    res.status(200).send(lastSearch || { search_query: null });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /users/{userId}/recipes/{id}/progress:
 *   get:
 *     tags:
 *       - Bonus - Preparation
 *     summary: קבלת התקדמות הכנת מתכון
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Recipe preparation progress
 *   post:
 *     tags:
 *       - Bonus - Preparation
 *     summary: עדכון התקדמות הכנת מתכון
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               current_step:
 *                 type: integer
 *               total_steps:
 *                 type: integer
 *               completed:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Progress updated successfully
 */
router.get('/:userId/recipes/:recipeId/progress', async (req, res, next) => {
  try {
    const user_id = req.params.userId;
    const recipe_id = req.params.recipeId;
    
    if (user_id != req.session.user_id) {
      return res.status(403).send({ message: "Access denied", success: false });
    }
    
    const progress = await user_utils.getRecipeProgress(user_id, recipe_id);
    res.status(200).send(progress || { current_step: 0, total_steps: 0, completed: false });
  } catch (error) {
    next(error);
  }
});

router.post('/:userId/recipes/:recipeId/progress', async (req, res, next) => {
  try {
    const user_id = req.params.userId;
    const recipe_id = req.params.recipeId;
    const { current_step, total_steps, completed } = req.body;
    
    if (user_id != req.session.user_id) {
      return res.status(403).send({ message: "Access denied", success: false });
    }
    
    await user_utils.updateRecipeProgress(user_id, recipe_id, current_step, total_steps, completed);
    res.status(200).send({ message: "Progress updated successfully", success: true });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /users/{userId}/meal-plan:
 *   get:
 *     tags:
 *       - Bonus - Meal Planning
 *     summary: קבלת תכנון הארוחות של המשתמש
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User's meal plan
 *   post:
 *     tags:
 *       - Bonus - Meal Planning
 *     summary: הוספת פריט לתכנון ארוחות
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               recipe_id:
 *                 type: integer
 *               recipe_title:
 *                 type: string
 *               meal_type:
 *                 type: string
 *               planned_date:
 *                 type: string
 *               servings:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Item added to meal plan
 *   delete:
 *     tags:
 *       - Bonus - Meal Planning
 *     summary: מחיקת תכנון ארוחות
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Meal plan cleared
 */
router.get('/:userId/meal-plan', async (req, res, next) => {
  try {
    const user_id = req.params.userId;
    
    if (user_id != req.session.user_id) {
      return res.status(403).send({ message: "Access denied", success: false });
    }
    
    const mealPlan = await user_utils.getMealPlan(user_id);
    res.status(200).send(mealPlan);
  } catch (error) {
    next(error);
  }
});

router.post('/:userId/meal-plan', async (req, res, next) => {
  try {
    const user_id = req.params.userId;
    
    if (user_id != req.session.user_id) {
      return res.status(403).send({ message: "Access denied", success: false });
    }
    
    const item_id = await user_utils.addToMealPlan(user_id, req.body);
    res.status(200).send({ message: "Item added to meal plan", item_id: item_id, success: true });
  } catch (error) {
    next(error);
  }
});

router.delete('/:userId/meal-plan', async (req, res, next) => {
  try {
    const user_id = req.params.userId;
    
    if (user_id != req.session.user_id) {
      return res.status(403).send({ message: "Access denied", success: false });
    }
    
    await DButils.execQuery(`DELETE FROM MealPlan WHERE user_id='${user_id}'`);
    res.status(200).send({ message: "Meal plan cleared", success: true });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /users/{userId}/meal-plan/{itemId}:
 *   put:
 *     tags:
 *       - Bonus - Meal Planning
 *     summary: עדכון פריט בתכנון ארוחות
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *       - name: itemId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Meal plan item updated
 *   delete:
 *     tags:
 *       - Bonus - Meal Planning
 *     summary: מחיקת פריט מתכנון ארוחות
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *       - name: itemId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Meal plan item deleted
 */
router.put('/:userId/meal-plan/:itemId', async (req, res, next) => {
  try {
    const user_id = req.params.userId;
    const item_id = req.params.itemId;
    
    if (user_id != req.session.user_id) {
      return res.status(403).send({ message: "Access denied", success: false });
    }
    
    await user_utils.updateMealPlanItem(user_id, item_id, req.body);
    res.status(200).send({ message: "Meal plan item updated", success: true });
  } catch (error) {
    next(error);
  }
});

router.delete('/:userId/meal-plan/:itemId', async (req, res, next) => {
  try {
    const user_id = req.params.userId;
    const item_id = req.params.itemId;
    
    if (user_id != req.session.user_id) {
      return res.status(403).send({ message: "Access denied", success: false });
    }
    
    await user_utils.removeMealPlanItem(user_id, item_id);
    res.status(200).send({ message: "Meal plan item deleted", success: true });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /users/{userId}/recipes:
 *   post:
 *     tags:
 *       - Personal
 *     summary: יצירת מתכון אישי חדש
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               image:
 *                 type: string
 *               readyInMinutes:
 *                 type: integer
 *               servings:
 *                 type: integer
 *               instructions:
 *                 type: array
 *                 items:
 *                   type: string
 *               ingredients:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     amount:
 *                       type: number
 *                     unit:
 *                       type: string
 *               is_vegetarian:
 *                 type: boolean
 *               is_vegan:
 *                 type: boolean
 *               is_gluten_free:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Recipe created successfully
 */
router.post('/:userId/recipes', async (req, res, next) => {
  try {
    const user_id = req.params.userId;
    
    if (user_id != req.session.user_id) {
      return res.status(403).send({ message: "Access denied", success: false });
    }
    
    const { title, image, readyInMinutes, servings, instructions, ingredients, is_vegetarian, is_vegan, is_gluten_free } = req.body;
    
    if (!title || !instructions || !ingredients) {
      return res.status(400).send({ message: "Missing required fields: title, instructions, ingredients", success: false });
    }
    
    const recipe_id = await user_utils.createUserRecipe({
      user_id,
      title,
      image: image || null,
      readyInMinutes: readyInMinutes || null,
      servings: servings || null,
      instructions: JSON.stringify(instructions),
      ingredients: JSON.stringify(ingredients),
      is_vegetarian: is_vegetarian || false,
      is_vegan: is_vegan || false,
      is_gluten_free: is_gluten_free || false
    });
    
    res.status(201).send({ message: "Recipe created successfully", recipe_id, success: true });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /users/{userId}/recipes/{recipeId}:
 *   delete:
 *     tags:
 *       - Personal
 *     summary: מחיקת מתכון אישי
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *       - name: recipeId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Recipe deleted successfully
 */
router.delete('/:userId/recipes/:recipeId', async (req, res, next) => {
  try {
    const user_id = req.params.userId;
    const recipe_id = req.params.recipeId;
    
    if (user_id != req.session.user_id) {
      return res.status(403).send({ message: "Access denied", success: false });
    }
    
    await user_utils.deleteUserRecipe(user_id, recipe_id);
    res.status(200).send({ message: "Recipe deleted successfully", success: true });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /users/{userId}/family-recipes:
 *   post:
 *     tags:
 *       - Family
 *     summary: יצירת מתכון משפחתי חדש
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               image:
 *                 type: string
 *               readyInMinutes:
 *                 type: integer
 *               servings:
 *                 type: integer
 *               instructions:
 *                 type: array
 *                 items:
 *                   type: string
 *               ingredients:
 *                 type: array
 *                 items:
 *                   type: object
 *               family_origin:
 *                 type: string
 *               family_member:
 *                 type: string
 *               when_to_prepare:
 *                 type: string
 *     responses:
 *       201:
 *         description: Family recipe created successfully
 */
router.post('/:userId/family-recipes', async (req, res, next) => {
  try {
    const user_id = req.params.userId;
    
    if (user_id != req.session.user_id) {
      return res.status(403).send({ message: "Access denied", success: false });
    }
    
    const { title, image, readyInMinutes, servings, instructions, ingredients, family_origin, family_member, when_to_prepare } = req.body;
    
    if (!title || !instructions || !ingredients) {
      return res.status(400).send({ message: "Missing required fields: title, instructions, ingredients", success: false });
    }
    
    const recipe_id = await user_utils.createFamilyRecipe({
      user_id,
      title,
      image: image || null,
      readyInMinutes: readyInMinutes || null,
      servings: servings || null,
      instructions: JSON.stringify(instructions),
      ingredients: JSON.stringify(ingredients),
      family_origin: family_origin || null,
      family_member: family_member || null,
      when_to_prepare: when_to_prepare || null
    });
    
    res.status(201).send({ message: "Family recipe created successfully", recipe_id, success: true });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /users/{userId}/favorites/{recipeId}:
 *   delete:
 *     tags:
 *       - Favorites
 *     summary: הסרת מתכון מהמועדפים
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *       - name: recipeId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Recipe removed from favorites
 */
router.delete('/:userId/favorites/:recipeId', async (req, res, next) => {
  try {
    const user_id = req.params.userId;
    const recipe_id = req.params.recipeId;
    
    if (user_id != req.session.user_id) {
      return res.status(403).send({ message: "Access denied", success: false });
    }
    
    await user_utils.removeFavorite(user_id, recipe_id);
    res.status(200).send({ message: "Recipe removed from favorites", success: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
