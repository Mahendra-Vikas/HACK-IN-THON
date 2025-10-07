// Simple Gemini API Test for DORA
// Run with: node simple-gemini-test.cjs

const GEMINI_API_KEY = 'AIzaSyDm0TqiDui3FB9xZ_0ftfbgMSTeEOGS1rw';

async function testGeminiAPI() {
    console.log('🤖 DORA Gemini API Simple Test\n');
    
    // Test 1: Validate API Key
    console.log('🔑 API Key Validation:');
    console.log(`   Key: ${GEMINI_API_KEY.substring(0, 10)}...`);
    console.log(`   Length: ${GEMINI_API_KEY.length} characters`);
    console.log(`   Format: ${GEMINI_API_KEY.startsWith('AIza') ? '✅ Valid' : '❌ Invalid'}`);
    
    if (!GEMINI_API_KEY.startsWith('AIza') || GEMINI_API_KEY.length < 30) {
        console.log('❌ Invalid API key format. Cannot proceed.\n');
        return;
    }
    
    // Test 2: Network Connectivity
    console.log('\n🌐 Network Connectivity Test:');
    try {
        const testResponse = await fetch('https://www.google.com/robots.txt');
        console.log(`   Internet: ${testResponse.ok ? '✅ Connected' : '❌ Failed'}`);
    } catch (error) {
        console.log(`   Internet: ❌ Failed - ${error.message}`);
        return;
    }
    
    // Test 3: Gemini API Call
    console.log('\n📡 Gemini API Test:');
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const requestBody = {
        contents: [{
            parts: [{
                text: "Hello! I'm testing the DORA AI assistant. Please respond with a friendly greeting and confirm you're working correctly."
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
    
    console.log(`   URL: ${url.replace(GEMINI_API_KEY, 'API_KEY_HIDDEN')}`);
    console.log(`   Request Size: ${JSON.stringify(requestBody).length} bytes`);
    
    try {
        const startTime = Date.now();
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'DORA-Test/1.0.0'
            },
            body: JSON.stringify(requestBody)
        });
        
        const responseTime = Date.now() - startTime;
        console.log(`   Response Time: ${responseTime}ms`);
        console.log(`   Status: ${response.status} ${response.statusText}`);
        
        // Log all response headers
        console.log('   Response Headers:');
        for (const [key, value] of response.headers.entries()) {
            console.log(`     ${key}: ${value}`);
        }
        
        const responseText = await response.text();
        console.log(`   Response Length: ${responseText.length} bytes`);
        
        if (!response.ok) {
            console.log(`   ❌ API Error: ${responseText}`);
            
            // Try to parse error details
            try {
                const errorData = JSON.parse(responseText);
                if (errorData.error) {
                    console.log(`   Error Details: ${JSON.stringify(errorData.error, null, 2)}`);
                }
            } catch (parseError) {
                console.log(`   Raw Error: ${responseText}`);
            }
            return;
        }
        
        // Parse successful response
        try {
            const data = JSON.parse(responseText);
            console.log(`   ✅ Valid JSON Response`);
            
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                const aiReply = data.candidates[0].content.parts[0].text;
                console.log(`   AI Response: "${aiReply.substring(0, 200)}${aiReply.length > 200 ? '...' : ''}"`);
                console.log('\n🎉 Test PASSED! Gemini API is working correctly.');
            } else {
                console.log(`   ❌ Invalid response structure:`);
                console.log(`   ${JSON.stringify(data, null, 2)}`);
            }
            
        } catch (parseError) {
            console.log(`   ❌ JSON Parse Error: ${parseError.message}`);
            console.log(`   Raw Response: ${responseText.substring(0, 500)}...`);
        }
        
    } catch (error) {
        console.log(`   ❌ Request Failed: ${error.message}`);
        console.log(`   Error Type: ${error.name}`);
        if (error.stack) {
            console.log(`   Stack: ${error.stack}`);
        }
    }
}

// Check if we're in Node.js environment
if (typeof window === 'undefined') {
    // Node.js environment
    const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
    testGeminiAPI().catch(console.error);
} else {
    // Browser environment
    console.log('Run this in Node.js for full testing capabilities.');
}