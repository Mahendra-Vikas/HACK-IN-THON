#!/usr/bin/env node

// Demo script showcasing AI capabilities
const API_BASE = 'http://localhost:3001/api';

const demoQueries = [
  {
    query: "Hello! What volunteer opportunities are available at SECE?",
    description: "General greeting and overview request"
  },
  {
    query: "I'm interested in environment-related volunteering. What options do I have?",
    description: "Category-specific search"
  },
  {
    query: "Show me upcoming events this week",
    description: "Time-based filtering"
  },
  {
    query: "Where is the Blood Donation Camp happening?",
    description: "Specific event location query"
  },
  {
    query: "I want to register for the Tree Plantation Drive. How do I sign up?",
    description: "Registration guidance"
  },
  {
    query: "What health-related volunteer events are available?",
    description: "Another category search"
  },
  {
    query: "Tell me about the Digital Literacy Workshop",
    description: "Specific event details"
  }
];

async function runDemo() {
  console.log('🤖 Volunteer Hub AI Assistant Demo\n');
  console.log('This demo showcases the AI assistant\'s capabilities.\n');
  
  const sessionId = `demo_${Date.now()}`;
  
  for (let i = 0; i < demoQueries.length; i++) {
    const { query, description } = demoQueries[i];
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Demo ${i + 1}/7: ${description}`);
    console.log(`${'='.repeat(60)}`);
    console.log(`\n👤 User: ${query}`);
    console.log('\n🤖 AI Assistant: ');
    
    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: query,
          sessionId: sessionId
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Format and display response
        const aiResponse = data.response;
        console.log(aiResponse);
      } else {
        console.log('❌ Error:', data.error);
      }
    } catch (error) {
      console.log('❌ Network error:', error.message);
      break;
    }
    
    // Wait before next query
    if (i < demoQueries.length - 1) {
      console.log('\n⏳ Waiting 2 seconds before next query...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log('\n🎉 Demo completed!');
  console.log('\nThe AI assistant can help with:');
  console.log('✅ Finding events by category, date, or keywords');
  console.log('✅ Providing event details and registration info');
  console.log('✅ Recommending events based on user interests');
  console.log('✅ Answering questions about volunteer opportunities');
  console.log('\nTry the web interface at http://localhost:5173');
}

// Check if backend is running
async function checkBackend() {
  try {
    const response = await fetch(`${API_BASE}/health`);
    const data = await response.json();
    if (data.status === 'healthy') {
      console.log('✅ Backend is running and healthy');
      return true;
    }
  } catch (error) {
    console.log('❌ Backend is not running or not accessible');
    console.log('Please start the backend first with: npm run server');
    return false;
  }
}

// Main execution
(async () => {
  if (typeof fetch === 'undefined') {
    console.log('❌ This script requires Node.js 18+ (for native fetch support)');
    process.exit(1);
  }
  
  const backendReady = await checkBackend();
  if (backendReady) {
    await runDemo();
  }
})().catch(console.error);