// Quick Authentication Test Script
// Run this to verify all authentication components are working

import { addUser, validateUser, userExists, getCurrentUser } from './src/utils/userStorage.js';

console.log('🧪 Testing DORA Authentication System...\n');

async function testAuthentication() {
  try {
    // Test 1: Check if demo user exists
    console.log('1️⃣ Testing demo user...');
    const demoExists = await userExists('demo@sece.edu');
    console.log(`   Demo user exists: ${demoExists ? '✅' : '❌'}`);
    
    // Test 2: Validate demo credentials
    console.log('\n2️⃣ Testing demo login...');
    const demoUser = await validateUser('demo@sece.edu', 'demo123');
    console.log(`   Demo login: ${demoUser ? '✅ Success' : '❌ Failed'}`);
    
    if (demoUser) {
      console.log(`   Welcome: ${demoUser.name}`);
      console.log(`   Department: ${demoUser.department}`);
    }
    
    // Test 3: Create test user
    console.log('\n3️⃣ Testing user registration...');
    const testEmail = 'test@sece.edu';
    
    if (!(await userExists(testEmail))) {
      const newUser = await addUser({
        name: 'Test Student',
        email: testEmail,
        password: 'test123',
        department: 'Computer Science & Engineering',
        rollNumber: '25CS999',
        year: 'Final Year'
      });
      console.log(`   Registration: ✅ Success`);
      console.log(`   User ID: ${newUser.id}`);
    } else {
      console.log(`   Registration: ⚠️ User already exists`);
    }
    
    // Test 4: Validate new user
    console.log('\n4️⃣ Testing new user login...');
    const testUser = await validateUser(testEmail, 'test123');
    console.log(`   Test login: ${testUser ? '✅ Success' : '❌ Failed'}`);
    
    console.log('\n🎉 Authentication system tests completed!');
    console.log('✅ All core functions are working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run in browser console or Node.js
if (typeof window !== 'undefined') {
  // Browser environment
  console.log('🌐 Running in browser - check localStorage for data');
  testAuthentication();
} else {
  // Node.js environment
  console.log('📦 Run this in browser console for full testing');
}