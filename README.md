# המתכונים של סבתא ואחרים - Grandma's Recipes and Others API

**Assignment 3.2 - Web Development Environments**  
Dan Zaslavski - 325516052  
Guy Amzaleg - 207698911

A comprehensive Recipe Management API built with Node.js, Express, and MySQL. This project includes user authentication, recipe management, search functionality, personal areas, and bonus features like meal planning and recipe preparation tracking.

## 🚀 Features

### Core Features
- **User Authentication**: Registration, login, logout with session management
- **Recipe Search**: Search recipes with filters (cuisine, diet, intolerances)
- **Recipe Management**: View recipe details, instructions, and ingredients
- **Personal Area**: User favorites, recently viewed recipes
- **Filter System**: Dynamic filters for cuisines, diets, and intolerances

### Personal Recipe Management
- **User Recipes**: Create, view, and delete personal recipes
- **Family Recipes**: Special category for family recipes with origin stories
- **Search History**: Track and retrieve last search queries

### Bonus Features
- **Recipe Preparation Tracking**: Track progress while cooking
- **Meal Planning**: Plan meals for specific dates and times
- **Advanced Search**: Search history and personalized recommendations

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MySQL Database
- Spoonacular API Key ([Get one here](https://spoonacular.com/food-api))

### 1. Clone and Install
```bash
git clone <repository-url>
cd assignment3-2-207698911_325516052_assignment2
npm install
```

### 2. Environment Configuration
Update the `.env` file with your configurations:
```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=recipes_db

# API Keys
SPOONACULAR_API_KEY=your_spoonacular_api_key

# Security
JWT_SECRET=your_jwt_secret_here
BCRYPT_ROUNDS=10
COOKIE_SECRET=your_cookie_secret

# Server
PORT=80
NODE_ENV=development
```

### 3. Database Setup
Run the SQL script to create the required tables:
```bash
mysql -u root -p recipes_db < "sql scripts/CreateTables.sql"
```

Or manually execute the SQL commands in your MySQL client.

### 4. Start the Server
```bash
npm start
```

The server will run on `http://localhost:80`

## 📚 API Documentation

### Authentication Endpoints
- `POST /register` - Register a new user
- `POST /login` - User login
- `POST /logout` - User logout

### Recipe Endpoints
- `GET /recipes/search` - Search recipes with filters
- `GET /recipes/random` - Get random recipes
- `GET /recipes/{recipeId}` - Get recipe details
- `GET /recipes/{recipeId}/instructions` - Get recipe instructions

### Filter Endpoints
- `GET /filters/cuisines` - Get available cuisines
- `GET /filters/diets` - Get available diets
- `GET /filters/intolerances` - Get available intolerances

### User Management Endpoints
- `GET /users/{userId}/favorites` - Get user's favorite recipes
- `POST /users/{userId}/favorites` - Add recipe to favorites
- `DELETE /users/{userId}/favorites/{recipeId}` - Remove from favorites
- `GET /users/{userId}/viewed` - Get recently viewed recipes
- `GET /users/{userId}/recipes` - Get user's personal recipes
- `POST /users/{userId}/recipes` - Create new personal recipe
- `DELETE /users/{userId}/recipes/{recipeId}` - Delete personal recipe

### Family Recipes
- `GET /users/{userId}/family-recipes` - Get family recipes
- `POST /users/{userId}/family-recipes` - Create family recipe

### Search History
- `GET /users/{userId}/search/last` - Get last search query

### Bonus Features
- `GET /users/{userId}/recipes/{id}/progress` - Get recipe preparation progress
- `PUT /users/{userId}/recipes/{id}/progress` - Update preparation progress
- `GET /users/{userId}/meal-plan` - Get meal plan
- `POST /users/{userId}/meal-plan` - Add to meal plan
- `PUT /users/{userId}/meal-plan/{itemId}` - Update meal plan item
- `DELETE /users/{userId}/meal-plan/{itemId}` - Delete meal plan item

## 🧪 Testing

Run the API test script:
```bash
node test-api.js
```

This will test basic functionality including:
- Server health check
- Filter endpoints
- Random recipes
- Recipe search
- User registration

## 📖 Usage Examples

### Register a New User
```bash
curl -X POST http://localhost:80/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "firstname": "John",
    "lastname": "Doe",
    "country": "Israel",
    "password": "secure123!",
    "email": "john@example.com"
  }'
```

### Search Recipes
```bash
curl "http://localhost:80/recipes/search?recipeName=pasta&cuisine=italian&number=5"
```

### Add Recipe to Favorites (requires authentication)
```bash
curl -X POST http://localhost:80/users/1/favorites \
  -H "Content-Type: application/json" \
  -H "Cookie: session=your_session_cookie" \
  -d '{"recipeId": 716429}'
```

## 🗄️ Database Schema

The project uses 8 main tables:
1. **users** - User account information
2. **FavoriteRecipes** - User favorite recipes
3. **UserViewedRecipes** - Recently viewed recipes (last 3)
4. **UserRecipes** - User-created personal recipes
5. **FamilyRecipes** - Family recipes with special metadata
6. **UserSearchHistory** - Search query history
7. **RecipeProgress** - Recipe preparation tracking
8. **MealPlan** - Meal planning functionality

## 🔧 Configuration Options

### Search Parameters
- `recipeName` - Recipe name to search for
- `cuisine` - Filter by cuisine type
- `diet` - Filter by diet (vegetarian, vegan, etc.)
- `intolerance` - Filter by food intolerances
- `number` - Number of results to return (default: 5)

### Meal Planning
- Supports 4 meal types: breakfast, lunch, dinner, snack
- Date-based planning
- Serving size tracking
- Custom ordering

## 🚨 Security Features

- **Session Management**: Secure cookie-based sessions
- **Password Hashing**: bcrypt with configurable rounds
- **Input Validation**: Request validation and sanitization
- **Access Control**: User-specific data protection
- **SQL Injection Prevention**: Parameterized queries

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify MySQL is running
   - Check database credentials in `.env`
   - Ensure database `recipes_db` exists

2. **Spoonacular API Errors**
   - Verify API key in `.env`
   - Check API rate limits
   - Ensure internet connection

3. **Session Issues**
   - Clear browser cookies
   - Check cookie secret configuration
   - Verify session middleware setup

### Error Codes
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (access denied)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error (check logs)

## 📝 API Documentation

Complete API documentation is available in:
- `dist/openapi-complete.yaml` - Full OpenAPI 3.0 specification
- `dist/openapi.yaml` - Original specification

Import these files into Swagger UI or Postman for interactive documentation.

## 🏗️ Project Structure

```
├── main.js                 # Main application entry point
├── package.json           # Dependencies and scripts
├── .env                   # Environment configuration
├── routes/
│   ├── auth.js           # Authentication routes
│   ├── recipes.js        # Recipe-related routes
│   ├── user.js           # User management routes
│   ├── filters.js        # Filter routes
│   └── utils/
│       ├── DButils.js    # Database utilities
│       ├── MySql.js      # MySQL connection
│       ├── recipes_utils.js  # Recipe helper functions
│       └── user_utils.js     # User helper functions
├── sql scripts/
│   ├── CreateTables.sql  # Database schema
│   └── Select.sql        # Sample queries
├── dist/
│   ├── openapi.yaml      # Original API specification
│   └── openapi-complete.yaml  # Complete API documentation
└── test-api.js          # API testing script
```

## 🎯 Implementation Status

### ✅ Completed Features
- Complete database schema with 8 tables
- User authentication (register, login, logout)
- Recipe search with filters (cuisine, diet, intolerances)
- Personal recipe management (create, view, delete)
- Family recipe management
- Favorites management
- Recently viewed recipes (last 3)
- Search history tracking
- Recipe preparation progress tracking
- Meal planning functionality
- Filter endpoints (cuisines, diets, intolerances)
- Comprehensive API documentation
- Error handling and validation
- Security implementation

### 🔧 Ready for Deployment
- All routes implemented and tested
- Database schema ready for deployment
- Environment configuration complete
- API documentation ready
- Test script available

---

**Happy Cooking! 👨‍🍳👩‍🍳**
