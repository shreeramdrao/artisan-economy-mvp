#!/usr/bin/env node

/**
 * Test script for AI Recommendations API
 * Tests the enhanced AI service with real product data
 */

const axios = require('axios');

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

async function testRecommendations() {
  console.log('🧪 Testing AI Recommendations API...\n');

  const testCases = [
    {
      name: 'Pottery Query',
      query: 'I want to buy pottery',
      expectedCategory: 'pottery'
    },
    {
      name: 'Rajasthani Cloth Query',
      query: 'Suggest some Rajasthani cloth',
      expectedCategory: 'textiles'
    },
    {
      name: 'Home Decor Query',
      query: 'What home decor do you have?',
      expectedCategory: 'home-decor'
    },
    {
      name: 'Jewelry Query',
      query: 'Show me some jewelry',
      expectedCategory: 'jewelry'
    },
    {
      name: 'Wooden Items Query',
      query: 'I need wooden furniture',
      expectedCategory: 'woodwork'
    }
  ];

  for (const testCase of testCases) {
    console.log(`📝 Testing: ${testCase.name}`);
    console.log(`   Query: "${testCase.query}"`);
    console.log(`   Expected Category: ${testCase.expectedCategory}`);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/ai/recommendations`, {
        userId: 'test-user',
        history: [],
        query: testCase.query
      });

      const data = response.data;
      
      if (data && data.data && data.data.products) {
        console.log(`   ✅ Found ${data.data.products.length} products`);
        console.log(`   📊 Category: ${data.data.category || 'none'}`);
        console.log(`   💭 Reasoning: ${data.data.reasoning || 'none'}`);
        
        if (data.data.products.length > 0) {
          console.log(`   🎯 Sample Product: ${data.data.products[0].title || data.data.products[0].name}`);
          console.log(`   💰 Price: ₹${data.data.products[0].price || 'N/A'}`);
        }
        
        // Verify category mapping
        if (data.data.category === testCase.expectedCategory) {
          console.log(`   ✅ Category mapping correct!`);
        } else {
          console.log(`   ⚠️  Category mapping: expected ${testCase.expectedCategory}, got ${data.data.category}`);
        }
      } else {
        console.log(`   ❌ No products returned`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      if (error.response) {
        console.log(`   📄 Response: ${JSON.stringify(error.response.data)}`);
      }
    }
    
    console.log(''); // Empty line for readability
  }

  console.log('🏁 Test completed!');
}

// Run the test
testRecommendations().catch(console.error);
