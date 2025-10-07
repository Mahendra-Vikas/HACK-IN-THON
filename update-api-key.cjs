#!/usr/bin/env node

/**
 * DORA API Key Updater
 * Updates the Gemini API key in .env.local and tests it
 * Usage: node update-api-key.cjs YOUR_NEW_API_KEY
 */

const fs = require('fs');
const path = require('path');

function updateApiKey(newApiKey) {
    console.log('🔑 DORA API Key Updater\n');
    
    // Validate the new API key format
    if (!newApiKey) {
        console.log('❌ No API key provided. Usage: node update-api-key.cjs YOUR_NEW_API_KEY');
        return false;
    }
    
    if (!newApiKey.startsWith('AIza')) {
        console.log('❌ Invalid API key format. Gemini API keys should start with "AIza"');
        return false;
    }
    
    if (newApiKey.length < 30) {
        console.log('❌ API key seems too short. Please check if it\'s complete.');
        return false;
    }
    
    console.log(`✅ API key format looks valid: ${newApiKey.substring(0, 10)}...`);
    
    // Read current .env.local file
    const envPath = path.join(__dirname, '.env.local');
    let envContent = '';
    
    try {
        if (fs.existsSync(envPath)) {
            envContent = fs.readFileSync(envPath, 'utf8');
            console.log('📄 Found existing .env.local file');
        } else {
            console.log('📄 Creating new .env.local file');
        }
    } catch (error) {
        console.log(`❌ Error reading .env.local: ${error.message}`);
        return false;
    }
    
    // Update or add the API key
    const lines = envContent.split('\n');
    let keyUpdated = false;
    
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('VITE_GEMINI_API_KEY=')) {
            lines[i] = `VITE_GEMINI_API_KEY=${newApiKey}`;
            keyUpdated = true;
            console.log('🔄 Updated existing API key');
            break;
        }
    }
    
    if (!keyUpdated) {
        lines.push(`VITE_GEMINI_API_KEY=${newApiKey}`);
        console.log('➕ Added new API key');
    }
    
    // Write the updated content
    const updatedContent = lines.join('\n');
    
    try {
        fs.writeFileSync(envPath, updatedContent);
        console.log('✅ .env.local file updated successfully');
    } catch (error) {
        console.log(`❌ Error writing .env.local: ${error.message}`);
        return false;
    }
    
    return true;
}

async function testNewApiKey(apiKey) {
    console.log('\n🧪 Testing new API key...');
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const requestBody = {
        contents: [{
            parts: [{
                text: "Hello! This is a test to verify the API key is working. Please respond with a simple greeting."
            }]
        }],
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 100,
        }
    };
    
    try {
        const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                const reply = data.candidates[0].content.parts[0].text;
                console.log('✅ API test successful!');
                console.log(`🤖 AI Response: "${reply.substring(0, 100)}..."`);
                return true;
            }
        } else {
            const errorText = await response.text();
            console.log(`❌ API test failed: ${response.status} ${response.statusText}`);
            console.log(`Error: ${errorText}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ API test error: ${error.message}`);
        return false;
    }
    
    return false;
}

async function main() {
    const newApiKey = process.argv[2];
    
    if (!newApiKey) {
        console.log('🔑 DORA API Key Updater');
        console.log('');
        console.log('Usage: node update-api-key.cjs YOUR_NEW_API_KEY');
        console.log('');
        console.log('Example: node update-api-key.cjs AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
        console.log('');
        console.log('To get a new API key:');
        console.log('1. Visit https://aistudio.google.com/');
        console.log('2. Sign in and create a new API key');
        console.log('3. Run this script with your new key');
        return;
    }
    
    // Update the API key
    const updated = updateApiKey(newApiKey);
    
    if (updated) {
        // Test the new API key
        const testPassed = await testNewApiKey(newApiKey);
        
        if (testPassed) {
            console.log('\n🎉 Success! Your new API key is working correctly.');
            console.log('✅ DORA should now respond to messages properly.');
            console.log('');
            console.log('Next steps:');
            console.log('1. Restart your development server: npm run dev');
            console.log('2. Test DORA in the browser');
            console.log('3. Try both Campus Navigator and Volunteer Hub modes');
        } else {
            console.log('\n⚠️ API key was updated but the test failed.');
            console.log('Please check:');
            console.log('- Is the API key correct and complete?');
            console.log('- Is the Gemini API enabled in your Google Cloud project?');
            console.log('- Do you have sufficient quota?');
        }
    }
}

main().catch(console.error);