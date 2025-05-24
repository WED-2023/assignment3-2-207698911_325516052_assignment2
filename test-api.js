// Test script for Recipe API endpoints
// Run this after starting the server to test basic functionality

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testAPI() {
    console.log('🧪 Starting Recipe API Tests...\n');

    try {
        // Test 1: Check if server is alive
        console.log('1. Testing server health...');
        const healthResponse = await axios.get(`${BASE_URL}/alive`);
        console.log('✅ Server is alive:', healthResponse.data);

        // Test 2: Test filters endpoints
        console.log('\n2. Testing filters...');
        
        try {
            const cuisinesResponse = await axios.get(`${BASE_URL}/filters/cuisines`);
            console.log('✅ Cuisines loaded:', cuisinesResponse.data.length, 'cuisines');
        } catch (error) {
            console.log('❌ Cuisines failed:', error.message);
        }

        try {
            const dietsResponse = await axios.get(`${BASE_URL}/filters/diets`);
            console.log('✅ Diets loaded:', dietsResponse.data.length, 'diets');
        } catch (error) {
            console.log('❌ Diets failed:', error.message);
        }

        try {
            const intolerancesResponse = await axios.get(`${BASE_URL}/filters/intolerances`);
            console.log('✅ Intolerances loaded:', intolerancesResponse.data.length, 'intolerances');
        } catch (error) {
            console.log('❌ Intolerances failed:', error.message);
        }

        // Test 3: Test random recipes
        console.log('\n3. Testing random recipes...');
        try {
            const randomResponse = await axios.get(`${BASE_URL}/recipes/random?number=3`);
            console.log('✅ Random recipes loaded:', randomResponse.data.length, 'recipes');
        } catch (error) {
            console.log('❌ Random recipes failed:', error.response?.data || error.message);
        }

        // Test 4: Test recipe search
        console.log('\n4. Testing recipe search...');
        try {
            const searchResponse = await axios.get(`${BASE_URL}/recipes/search?recipeName=pasta&number=5`);
            console.log('✅ Search results:', searchResponse.data.length, 'recipes found');
        } catch (error) {
            console.log('❌ Search failed:', error.response?.data || error.message);
        }

        // Test 5: Test registration (optional - will fail if user exists)
        console.log('\n5. Testing user registration...');
        try {
            const registerResponse = await axios.post(`${BASE_URL}/register`, {
                username: 'testuser2',
                firstname: 'Test2',
                lastname: 'User2',
                country: 'Israel2',
                password: 'test123!2',
                email: 'test@example.com2'
            });
            console.log('✅ Registration successful');
        } catch (error) {
            console.log('ℹ️ Registration skipped (user may already exist):', error.response?.data?.message || error.message);
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }

    console.log('\n🎉 API Tests Completed!');
    console.log('\n📝 Next Steps:');
    console.log('1. Create database tables using the SQL script');
    console.log('2. Update .env file with your Spoonacular API key');
    console.log('3. Test user authentication and personal features');
    console.log('4. Test meal planning and recipe progress features');
}

// Run tests
testAPI();
