var express = require("express");
var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");

/**
 * @swagger
 * /filters/cuisines:
 *   get:
 *     tags:
 *       - Search
 *     summary: קבלת רשימת סוגי מטבחים זמינים
 *     responses:
 *       200:
 *         description: List of available cuisines
 */
router.get("/cuisines", async (req, res, next) => {
  try {
    const cuisines = await recipes_utils.getCuisines();
    res.status(200).send(cuisines);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /filters/diets:
 *   get:
 *     tags:
 *       - Search
 *     summary: קבלת רשימת סוגי דיאטות זמינות
 *     responses:
 *       200:
 *         description: List of available diets
 */
router.get("/diets", async (req, res, next) => {
  try {
    const diets = await recipes_utils.getDiets();
    res.status(200).send(diets);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /filters/intolerances:
 *   get:
 *     tags:
 *       - Search
 *     summary: קבלת רשימת אי סבילויות זמינות
 *     responses:
 *       200:
 *         description: List of available intolerances
 */
router.get("/intolerances", async (req, res, next) => {
  try {
    const intolerances = await recipes_utils.getIntolerances();
    res.status(200).send(intolerances);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
