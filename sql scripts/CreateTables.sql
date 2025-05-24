-- Database Schema for Recipe Management System
CREATE DATABASE IF NOT EXISTS myDB;
USE myDB;
-- Users table
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    firstname VARCHAR(255) NOT NULL,
    lastname VARCHAR(255) NOT NULL,
    country VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    profilePic VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Favorite Recipes table (many-to-many relationship between users and recipes)
CREATE TABLE IF NOT EXISTS FavoriteRecipes (
    user_id INT,
    recipe_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, recipe_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- User's viewed recipes (to track last 3 watched recipes)
CREATE TABLE IF NOT EXISTS UserViewedRecipes (
    user_id INT,
    recipe_id INT,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, recipe_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- User's personal recipes
CREATE TABLE IF NOT EXISTS UserRecipes (
    recipe_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    image VARCHAR(500),
    readyInMinutes INT,
    aggregateLikes INT DEFAULT 0,
    vegan BOOLEAN DEFAULT FALSE,
    vegetarian BOOLEAN DEFAULT FALSE,
    glutenFree BOOLEAN DEFAULT FALSE,
    ingredients TEXT,
    instructions TEXT,
    servings INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Family recipes
CREATE TABLE IF NOT EXISTS FamilyRecipes (
    recipe_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    image VARCHAR(500),
    readyInMinutes INT,
    ingredients TEXT,
    instructions TEXT,
    servings INT,
    author VARCHAR(255), -- Who originally made this recipe in the family
    occasion VARCHAR(255), -- When this recipe is traditionally made
    story TEXT, -- Family story about the recipe
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- User search history
CREATE TABLE IF NOT EXISTS UserSearchHistory (
    search_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    search_query VARCHAR(500) NOT NULL,
    search_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Recipe preparation progress
CREATE TABLE IF NOT EXISTS RecipeProgress (
    user_id INT,
    recipe_id INT,
    current_step INT DEFAULT 0,
    total_steps INT,
    completed BOOLEAN DEFAULT FALSE,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, recipe_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Meal planning
CREATE TABLE IF NOT EXISTS MealPlan (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    recipe_id INT,
    recipe_title VARCHAR(255),
    meal_type ENUM('breakfast', 'lunch', 'dinner', 'snack') NOT NULL,
    planned_date DATE NOT NULL,
    servings INT DEFAULT 1,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
