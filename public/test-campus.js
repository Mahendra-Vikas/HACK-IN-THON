/**
 * 🧪 Simple test to verify enhanced campus navigation
 * Run this in browser console to test the system
 */

// Test function to be run in browser console
window.testCampusNavigation = async function() {
  console.log('🧪 Testing Enhanced Campus Navigation System');
  
  // Test 1: Simple location query
  console.log('\n📍 Test 1: "Where is the AI & ML block?"');
  
  try {
    // Import the functions (they should be available globally)
    const query = "Where is the AI & ML block?";
    
    // Check if campus data loads
    const response = await fetch('/campus-navigator-data.json');
    const campusData = await response.json();
    
    console.log('✅ Campus data loaded:', campusData.length, 'locations');
    console.log('📋 Available locations:', campusData.map(loc => loc.node));
    
    // Check if AI & ML block is in data
    const aiMlBlock = campusData.find(loc => 
      loc.node.toLowerCase().includes('ai') || 
      loc.node.toLowerCase().includes('ml') ||
      loc.node.toLowerCase().includes('artificial intelligence')
    );
    
    if (aiMlBlock) {
      console.log('✅ AI & ML Block found in data:', aiMlBlock.node);
      console.log('📝 Description:', aiMlBlock.describe.substring(0, 100) + '...');
    } else {
      console.log('❌ AI & ML Block not found in campus data');
    }
    
    return {
      success: true,
      dataLoaded: true,
      locationCount: campusData.length,
      aiMlFound: !!aiMlBlock
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Test campus queries
window.testCampusQueries = [
  "Where is the AI & ML block?",
  "Find the amenity centre", 
  "How to reach main block?",
  "Show me the open air theatre",
  "Where is the canteen?"
];

console.log('🧪 Campus Navigation Test Functions Loaded!');
console.log('Run: window.testCampusNavigation()');
console.log('Available test queries:', window.testCampusQueries);