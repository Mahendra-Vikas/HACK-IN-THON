// 🧪 Gemini API Tester for DORA
// Test the Gemini API directly to debug issues

const GEMINI_API_KEY = 'AIzaSyDm0TqiDui3FB9xZ_0ftfbgMSTeEOGS1rw';

async function testGeminiAPI() {
  console.log('🧪 Testing Gemini API...');
  
  try {
    // Test with simple request
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: 'Hello! Please respond with "DORA API Test Successful" if you can see this message.'
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 100,
        }
      }),
    });

    console.log('📡 Response Status:', response.status);
    console.log('📡 Response Headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', response.status, errorText);
      return false;
    }

    const data = await response.json();
    console.log('✅ Full Response:', data);
    
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log('🎯 AI Response:', text);
    
    return text ? true : false;
    
  } catch (error) {
    console.error('💥 Network Error:', error);
    return false;
  }
}

// Run test when page loads
window.testGeminiAPI = testGeminiAPI;

// Auto-run test
setTimeout(() => {
  console.log('🚀 Auto-running Gemini API test...');
  testGeminiAPI().then(success => {
    if (success) {
      console.log('🎉 Gemini API is working!');
    } else {
      console.log('🚫 Gemini API test failed');
    }
  });
}, 2000);