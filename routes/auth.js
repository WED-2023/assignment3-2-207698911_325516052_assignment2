var express = require("express");
var router = express.Router();
const MySql = require("../routes/utils/MySql");
const DButils = require("../routes/utils/DButils");
const bcrypt = require("bcrypt");

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: הרשמת משתמש חדש
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - firstname
 *               - lastname
 *               - country
 *               - password
 *               - email
 *             properties:
 *               username:
 *                 type: string
 *               firstname:
 *                 type: string
 *               lastname:
 *                 type: string
 *               country:
 *                 type: string
 *               password:
 *                 type: string
 *               email:
 *                 type: string
 *               profilePic:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       409:
 *         description: Username already taken
 *       400:
 *         description: Missing required fields
 */
router.post("/register", async (req, res, next) => {
  try {
    // Validate required fields
    const requiredFields = ['username', 'firstname', 'lastname', 'country', 'password', 'email'];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).send({ 
        message: `Missing required fields: ${missingFields.join(', ')}`, 
        success: false ,
        missingFields: missingFields
      });
    }

    let user_details = {
      username: req.body.username,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      country: req.body.country,
      password: req.body.password,
      email: req.body.email,
      profilePic: req.body.profilePic || ''
    };
    // res.send(user_details);

    // Check if username already exists
    let users = await DButils.execQuery("SELECT username from users");
    if (users.find((x) => x.username === user_details.username)) {
      throw { status: 409, message: "Username taken" };
    }

    // Check if email already exists
    let emails = await DButils.execQuery("SELECT email from users");
    if (emails.find((x) => x.email === user_details.email)) {
      throw { status: 409, message: "Email already registered" };
    }

    // Hash password
    let hash_password = bcrypt.hashSync(
      user_details.password,
      parseInt(process.env.bcrypt_saltRounds)
    );

    // Insert new user
    await DButils.execQuery(
      `INSERT INTO users (username, firstname, lastname, country, password, email, profilePic) 
       VALUES ('${user_details.username}', '${user_details.firstname}', '${user_details.lastname}',
       '${user_details.country}', '${hash_password}', '${user_details.email}', '${user_details.profilePic}')`
    );
    
    res.status(201).send({ message: "user created", success: true });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: התחברות משתמש
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Username or Password incorrect
 *       400:
 *         description: Missing username or password
 */
router.post("/login", async (req, res, next) => {
  try {
    // Validate required fields
    if (!req.body.username || !req.body.password) {
      return res.status(400).send({ 
        message: "Username and password are required", 
        success: false 
      });
    }

    // Check that username exists
    const users = await DButils.execQuery("SELECT username FROM users");
    if (!users.find((x) => x.username === req.body.username)) {
      throw { status: 401, message: "Username or Password incorrect" };
    }

    // Get user and check password
    const user = (
      await DButils.execQuery(
        `SELECT * FROM users WHERE username = '${req.body.username}'`
      )
    )[0];

    if (!bcrypt.compareSync(req.body.password, user.password)) {
      throw { status: 401, message: "Username or Password incorrect" };
    }

    // Set session
    req.session.user_id = user.user_id;
    console.log("session user_id login: " + req.session.user_id);

    res.status(200).send({ message: "login succeeded", success: true });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags:
 *       - Auth
 *     summary: התנתקות משתמש
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post("/logout", function (req, res) {
  console.log("session user_id Logout: " + req.session.user_id);
  req.session.reset();
  res.send({ success: true, message: "logout succeeded" });
});

module.exports = router;