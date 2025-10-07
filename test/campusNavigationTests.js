/**
 * 🧪 Test Suite for Enhanced Campus Navigation System
 * Test cases to verify AI-powered semantic understanding
 */

import { campusNavigator, handleCampusNavigation } from '../src/utils/campusNavigator.js';
import { processEnhancedMessage, analyzeUserIntent } from '../src/utils/contextDetection.js';

// Test queries that should work with the enhanced system
const testQueries = [
  // Direct location queries
  "Where is the AI & ML block?",
  "Find the AI ML block",
  "How to reach artificial intelligence department?",
  "Show me the AI and ML building",
  
  // Facility queries
  "Where is the canteen?",
  "Find the amenity centre",
  "How to get to the dining hall?",
  "Show me the food court",
  
  // Navigation queries
  "Directions to Main Block",
  "How to reach the main building?",
  "Guide me to the main gate",
  "Take me to the entrance",
  
  // Department queries
  "Where is the mechanical department?",
  "Find the mech block",
  "Computer science building location",
  "Engineering departments",
  
  // General campus queries
  "Campus map",
  "College tour",
  "Show me around campus",
  "What buildings are available?",
  
  // Volunteer queries (should switch context)
  "Show me volunteer opportunities",
  "Upcoming events",
  "How to register for volunteering?",
  
  // Mixed queries
  "Events at the open air theatre",
  "Volunteer activities near amenity centre"
];

async function runTests() {
  console.log('🧪 Starting Enhanced Campus Navigation Tests');
  console.log('=' * 50);
  
  // Wait for campus data to load
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  for (let i = 0; i < testQueries.length; i++) {
    const query = testQueries[i];
    console.log(`\n🔍 Test ${i + 1}: "${query}"`);
    console.log('-'.repeat(40));
    
    try {
      // Test intent analysis
      const intent = analyzeUserIntent(query);
      console.log(`📊 Intent Analysis:`, {
        context: intent.primaryContext,
        confidence: intent.confidence,
        patterns: intent.specialPatterns
      });
      
      // Test enhanced message processing
      const result = await processEnhancedMessage(query, { useAI: false });
      console.log(`🤖 Processing Result:`, {
        type: result.type,
        hasResponse: !!result.message,
        hasMatches: !!result.matches?.length
      });
      
      if (result.message) {
        console.log(`💬 Response Preview:`, result.message.substring(0, 100) + '...');
      }
      
      // Test direct campus navigation
      if (intent.primaryContext === 'campus') {
        const campusResult = await handleCampusNavigation(query, false);
        console.log(`🏫 Campus Result:`, {
          source: campusResult.source,
          matchCount: campusResult.matches?.length || 0
        });
      }
      
      console.log('✅ Test completed');
      
    } catch (error) {
      console.error(`❌ Test failed:`, error.message);
    }
  }
  
  console.log('\n🎉 All tests completed!');
  console.log('Check the results above to verify enhanced campus navigation is working.');
}

// Auto-run tests when in browser environment
if (typeof window !== 'undefined') {
  window.runCampusNavigationTests = runTests;
  console.log('🧪 Campus Navigation Tests loaded! Run window.runCampusNavigationTests() in browser console.');
}

export { runTests as runCampusNavigationTests, testQueries };