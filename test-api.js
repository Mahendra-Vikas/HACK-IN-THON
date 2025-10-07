#!/usr/bin/env node

// Simple API tester for the Volunteer Hub backend
const API_BASE = 'http://localhost:3001/api';

async function testAPI() {
  console.log('🧪 Testing Volunteer Hub API...\n');

  // Test 1: Health Check
  try {
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${API_BASE}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.status);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    return;
  }

  // Test 2: Get Events
  try {
    console.log('\n2. Testing events endpoint...');
    const eventsResponse = await fetch(`${API_BASE}/events`);
    const eventsData = await eventsResponse.json();
    console.log(`✅ Events loaded: ${eventsData.total} events`);
  } catch (error) {
    console.log('❌ Events test failed:', error.message);
  }

  // Test 3: Get Categories
  try {
    console.log('\n3. Testing categories endpoint...');
    const categoriesResponse = await fetch(`${API_BASE}/categories`);
    const categoriesData = await categoriesResponse.json();
    console.log(`✅ Categories loaded: ${categoriesData.categories.length} categories`);
    console.log('   Categories:', categoriesData.categories.join(', '));
  } catch (error) {
    console.log('❌ Categories test failed:', error.message);
  }

  // Test 4: Chat with AI
  try {
    console.log('\n4. Testing chat endpoint...');
    const chatResponse = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Hello! Can you tell me about upcoming volunteer events?',
        sessionId: 'test-session'
      })
    });
    
    const chatData = await chatResponse.json();
    if (chatData.success) {
      console.log('✅ Chat test successful');
      console.log('   AI Response:', chatData.response.substring(0, 100) + '...');
    } else {
      console.log('❌ Chat test failed:', chatData.error);
    }
  } catch (error) {
    console.log('❌ Chat test failed:', error.message);
  }

  console.log('\n🎉 API testing complete!');
}

// Check if fetch is available (Node.js 18+)
if (typeof fetch === 'undefined') {
  console.log('❌ This script requires Node.js 18+ (for native fetch support)');
  console.log('   Or run: npm install node-fetch');
  process.exit(1);
}

testAPI().catch(console.error);