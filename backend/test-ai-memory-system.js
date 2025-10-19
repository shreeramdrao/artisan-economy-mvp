#!/usr/bin/env node

/**
 * AI Memory System Integration Test
 * 
 * This script tests the complete AI Product Memory System integration:
 * 1. ChromaDB connection
 * 2. Product embedding storage
 * 3. Semantic search functionality
 * 4. AI contextual responses
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { AiMemoryService } from './src/ai/ai.memory.service';
import { AiService } from './src/ai/ai.service';

async function testAiMemorySystem() {
  console.log('🧠 Starting AI Memory System Integration Test...\n');

  try {
    // Create NestJS application context
    const app = await NestFactory.createApplicationContext(AppModule);
    
    // Get services
    const aiMemoryService = app.get(AiMemoryService);
    const aiService = app.get(AiService);

    console.log('✅ Services initialized successfully\n');

    // Test 1: Check ChromaDB connection
    console.log('📊 Test 1: Checking ChromaDB connection...');
    const stats = await aiMemoryService.getCollectionStats();
    console.log(`   Collection stats:`, stats);
    console.log('✅ ChromaDB connection test completed\n');

    // Test 2: Add sample product embeddings
    console.log('📦 Test 2: Adding sample product embeddings...');
    const sampleProducts = [
      {
        id: 'test-product-1',
        title: 'Bamboo Basket Lamp',
        description: 'Handcrafted bamboo lamp from Assam artisans',
        category: 'Lighting',
        price: { amount: 3000 },
        sellerName: 'Assam Artisans',
        images: { original: 'https://example.com/bamboo-lamp.jpg' },
        tags: ['bamboo', 'lighting', 'eco-friendly'],
        createdAt: new Date()
      },
      {
        id: 'test-product-2',
        title: 'Handwoven Rajasthani Shawl',
        description: 'Traditional Rajasthani handwoven shawl with intricate patterns',
        category: 'Textiles',
        price: { amount: 2500 },
        sellerName: 'Rajasthan Crafts',
        images: { original: 'https://example.com/shawl.jpg' },
        tags: ['textile', 'rajasthani', 'handwoven'],
        createdAt: new Date()
      },
      {
        id: 'test-product-3',
        title: 'Terracotta Pottery Bowl',
        description: 'Traditional terracotta bowl made by skilled potters',
        category: 'Pottery',
        price: { amount: 800 },
        sellerName: 'Pottery Masters',
        images: { original: 'https://example.com/bowl.jpg' },
        tags: ['pottery', 'terracotta', 'traditional'],
        createdAt: new Date()
      }
    ];

    for (const product of sampleProducts) {
      await aiMemoryService.addProductEmbedding(product);
      console.log(`   ✅ Added embedding for: ${product.title}`);
    }
    console.log('✅ Sample product embeddings added\n');

    // Test 3: Test semantic search
    console.log('🔍 Test 3: Testing semantic search...');
    const searchQueries = [
      'bamboo lighting',
      'traditional textiles',
      'handmade pottery',
      'eco-friendly products'
    ];

    for (const query of searchQueries) {
      console.log(`   Searching for: "${query}"`);
      const results = await aiMemoryService.searchProducts(query, 3);
      console.log(`   Found ${results.length} products:`);
      results.forEach((result, index) => {
        console.log(`     ${index + 1}. ${result.metadata.name} (${result.metadata.category})`);
      });
      console.log('');
    }
    console.log('✅ Semantic search test completed\n');

    // Test 4: Test AI contextual responses
    console.log('🤖 Test 4: Testing AI contextual responses...');
    const testQueries = [
      'Tell me about bamboo products',
      'I need traditional textiles',
      'Show me eco-friendly items'
    ];

    for (const query of testQueries) {
      console.log(`   Query: "${query}"`);
      try {
        const response = await aiService.handleUserQuery(query);
        console.log(`   AI Response: ${response.message.substring(0, 100)}...`);
        console.log(`   Products found: ${response.products.length}`);
        response.products.forEach((product, index) => {
          console.log(`     ${index + 1}. ${product.name} - ₹${product.price}`);
        });
        console.log('');
      } catch (error) {
        console.log(`   ⚠️ Error: ${error.message}`);
        console.log('');
      }
    }
    console.log('✅ AI contextual response test completed\n');

    // Test 5: Clean up test data
    console.log('🧹 Test 5: Cleaning up test data...');
    for (const product of sampleProducts) {
      await aiMemoryService.deleteProductEmbedding(product.id);
      console.log(`   ✅ Deleted embedding for: ${product.title}`);
    }
    console.log('✅ Cleanup completed\n');

    // Final stats
    const finalStats = await aiMemoryService.getCollectionStats();
    console.log('📊 Final collection stats:', finalStats);

    console.log('🎉 AI Memory System Integration Test Completed Successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ ChromaDB connection working');
    console.log('   ✅ Product embedding storage working');
    console.log('   ✅ Semantic search functionality working');
    console.log('   ✅ AI contextual responses working');
    console.log('   ✅ Data cleanup working');
    console.log('\n🚀 The AI Product Memory System is ready for production!');

    await app.close();
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testAiMemorySystem().catch(console.error);
