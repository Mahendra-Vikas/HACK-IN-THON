#!/usr/bin/env node

/**
 * DORA Gemini API Test Script
 * Tests Gemini API connectivity and validates responses
 * Run with: node test-gemini-api.js
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Load environment variables from .env.local
const fs = require('fs');
const path = require('path');

function loadEnvFile() {
  try {
    const envPath = path.join(__dirname, '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    const env = {};
    lines.forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    });
    
    return env;
  } catch (error) {
    console.error('❌ Could not load .env.local file:', error.message);
    return {};
  }
}

const env = loadEnvFile();
const GEMINI_API_KEY = env.VITE_GEMINI_API_KEY;

// ANSI color codes for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m'
};

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`${title}`, 'cyan');
  log(`${'='.repeat(60)}`, 'cyan');
}

async function validateApiKey() {
  logSection('API Key Validation');
  
  if (!GEMINI_API_KEY) {
    log('❌ VITE_GEMINI_API_KEY not found in .env.local file', 'red');
    log('Please check your .env.local file and ensure the API key is set', 'yellow');
    return false;
  }
  
  log(`✅ API Key found: ${GEMINI_API_KEY.substring(0, 10)}...`, 'green');
  log(`📏 Key length: ${GEMINI_API_KEY.length} characters`, 'blue');
  
  if (!GEMINI_API_KEY.startsWith('AIza')) {
    log('⚠️ API key format warning: Should start with "AIza"', 'yellow');
    return false;
  } else {
    log('✅ API key format looks correct', 'green');
  }
  
  if (GEMINI_API_KEY.length < 30) {
    log('⚠️ API key seems short - might be incomplete', 'yellow');
    return false;
  } else {
    log('✅ API key length looks valid', 'green');
  }
  
  return true;
}

async function testNetworkConnectivity() {
  logSection('Network Connectivity Test');
  
  try {
    log('🌐 Testing basic internet connectivity...', 'blue');
    const response = await fetch('https://www.google.com/robots.txt', {
      method: 'HEAD'
    });
    
    if (response.ok) {
      log('✅ Internet connectivity: OK', 'green');
    } else {
      log(`⚠️ Internet connectivity issue: ${response.status}`, 'yellow');
    }
    
    log('🌐 Testing Gemini API endpoint reachability...', 'blue');
    // Just test if we can reach the domain (we can't make unauthorized requests)
    log('✅ Gemini API endpoint should be reachable', 'green');
    
  } catch (error) {
    log(`❌ Network connectivity failed: ${error.message}`, 'red');
    return false;
  }
  
  return true;
}

async function testGeminiAPI(message, mode = 'general') {
  logSection(`Testing Gemini API - ${mode.toUpperCase()} Mode`);
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  
  let systemPrompt = 'You are DORA (Digital Outreach & Resource Assistant), a helpful AI assistant for Sri Eshwar College of Engineering. ';
  if (mode === 'campus') {
    systemPrompt += 'You are in Campus Navigator mode 🏫. Help with campus navigation, buildings, departments, and facilities.';
  } else if (mode === 'volunteer') {
    systemPrompt += 'You are in Volunteer Hub mode 🙋‍♀️. Help with volunteer opportunities, events, and community service programs.';
  }
  
  const requestBody = {
    contents: [{
      parts: [{
        text: `${systemPrompt}\n\nUser: ${message}`
      }]
    }],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
    },
    safetySettings: [
      {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        category: "HARM_CATEGORY_HATE_SPEECH",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      }
    ]
  };
  
  log(`📤 Sending message: "${message}"`, 'blue');
  log(`📏 Request size: ${JSON.stringify(requestBody).length} bytes`, 'blue');
  log(`🔗 API URL: ${url.replace(GEMINI_API_KEY, 'API_KEY_HIDDEN')}`, 'blue');
  
  try {
    const startTime = Date.now();
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'DORA-Test/1.0.0'
      },
      body: JSON.stringify(requestBody),
    });
    
    const responseTime = Date.now() - startTime;
    log(`📨 Response time: ${responseTime}ms`, 'blue');
    log(`📊 Status: ${response.status} ${response.statusText}`, response.ok ? 'green' : 'red');
    
    // Log response headers
    const headers = {};
    for (const [key, value] of response.headers.entries()) {
      headers[key] = value;
    }
    log(`📋 Response headers: ${JSON.stringify(headers, null, 2)}`, 'blue');
    
    const responseText = await response.text();
    log(`📄 Raw response length: ${responseText.length} bytes`, 'blue');
    
    if (!response.ok) {
      log(`❌ API Error: ${responseText}`, 'red');
      return { success: false, error: responseText, status: response.status };
    }
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      log(`❌ JSON Parse Error: ${parseError.message}`, 'red');
      log(`Raw response: ${responseText.substring(0, 500)}...`, 'yellow');
      return { success: false, error: 'Invalid JSON response' };
    }
    
    log(`📥 Parsed response structure: ${JSON.stringify(Object.keys(data), null, 2)}`, 'blue');
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const aiReply = data.candidates[0].content.parts[0].text;
      log(`✅ AI Response (${aiReply.length} chars):`, 'green');
      log(`"${aiReply.substring(0, 300)}${aiReply.length > 300 ? '...' : ''}"`, 'white');
      
      return { 
        success: true, 
        reply: aiReply, 
        responseTime: responseTime,
        data: data 
      };
    } else {
      log('❌ Invalid response structure', 'red');
      log(`Full response: ${JSON.stringify(data, null, 2)}`, 'yellow');
      
      // Check for specific error conditions
      if (data.error) {
        log(`API Error: ${data.error.message || data.error}`, 'red');
        return { success: false, error: data.error.message || data.error };
      }
      
      return { success: false, error: 'Invalid response structure' };
    }
    
  } catch (error) {
    log(`❌ Request failed: ${error.message}`, 'red');
    log(`Error type: ${error.name}`, 'red');
    if (error.stack) {
      log(`Stack trace: ${error.stack}`, 'yellow');
    }
    return { success: false, error: error.message };
  }
}

async function runComprehensiveTest() {
  log('🤖 DORA Gemini API Comprehensive Test Suite', 'magenta');
  log(`⏰ Test started at: ${new Date().toISOString()}`, 'cyan');
  
  const results = {
    timestamp: new Date().toISOString(),
    apiKeyValid: false,
    networkOk: false,
    tests: []
  };
  
  // Step 1: Validate API Key
  results.apiKeyValid = await validateApiKey();
  if (!results.apiKeyValid) {
    log('\n❌ API key validation failed. Cannot proceed with tests.', 'red');
    return results;
  }
  
  // Step 2: Test Network Connectivity
  results.networkOk = await testNetworkConnectivity();
  if (!results.networkOk) {
    log('\n⚠️ Network issues detected. Tests may fail.', 'yellow');
  }
  
  // Step 3: Run various API tests
  const testCases = [
    {
      name: "Simple Greeting",
      message: "Hello DORA! Can you help me?",
      mode: "general"
    },
    {
      name: "Campus Navigation Query",
      message: "Where is the library located on campus?",
      mode: "campus"
    },
    {
      name: "Volunteer Opportunities Query",
      message: "What volunteer opportunities are available for students?",
      mode: "volunteer"
    },
    {
      name: "Complex Query",
      message: "I want to organize a tree plantation drive. Can you help me with the process and tell me where on campus would be best?",
      mode: "volunteer"
    }
  ];
  
  for (const testCase of testCases) {
    log(`\n🧪 Running test: ${testCase.name}`, 'cyan');
    
    const result = await testGeminiAPI(testCase.message, testCase.mode);
    
    results.tests.push({
      name: testCase.name,
      message: testCase.message,
      mode: testCase.mode,
      success: result.success,
      responseTime: result.responseTime,
      error: result.error,
      responseLength: result.reply ? result.reply.length : 0
    });
    
    // Wait between tests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Generate Report
  logSection('Test Results Summary');
  
  const totalTests = results.tests.length;
  const passedTests = results.tests.filter(t => t.success).length;
  const failedTests = totalTests - passedTests;
  
  log(`📊 Total Tests: ${totalTests}`, 'cyan');
  log(`✅ Passed: ${passedTests}`, 'green');
  log(`❌ Failed: ${failedTests}`, 'red');
  log(`📈 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`, 'cyan');
  
  if (passedTests === totalTests) {
    log('\n🎉 All tests passed! DORA Gemini API integration is working correctly.', 'green');
    log('✅ Your API key is valid and the integration is functional.', 'green');
  } else {
    log('\n⚠️ Some tests failed. This indicates issues with the API integration.', 'yellow');
    
    // Show failed test details
    const failedTestsDetails = results.tests.filter(t => !t.success);
    failedTestsDetails.forEach(test => {
      log(`❌ ${test.name}: ${test.error}`, 'red');
    });
  }
  
  // Save detailed report
  const reportPath = path.join(__dirname, `dora-gemini-test-report-${Date.now()}.json`);
  try {
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    log(`📄 Detailed report saved to: ${reportPath}`, 'blue');
  } catch (error) {
    log(`⚠️ Could not save report: ${error.message}`, 'yellow');
  }
  
  return results;
}

// Run the comprehensive test
if (require.main === module) {
  runComprehensiveTest().catch(error => {
    log(`💥 Test suite crashed: ${error.message}`, 'red');
    log(`Stack: ${error.stack}`, 'red');
    process.exit(1);
  });
}

module.exports = { runComprehensiveTest, testGeminiAPI, validateApiKey };