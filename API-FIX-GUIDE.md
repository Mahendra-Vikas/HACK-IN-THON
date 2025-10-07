# 🚨 DORA API Error Resolution Guide

## Problem Identified
The Gemini API key `AIzaSyDjwsRlPhNh5gGhOE2NTMJ7TqhtqtyVb58` is **INVALID** or **EXPIRED**.

**Error Details:**
- Status: 400 Bad Request
- Message: "API key not valid. Please pass a valid API key."
- Reason: API_KEY_INVALID

## 🔧 Solution Steps

### Step 1: Get a New Gemini API Key

1. **Go to Google AI Studio:**
   - Visit: https://aistudio.google.com/
   - Sign in with your Google account

2. **Create a New API Key:**
   - Click "Get API Key" button
   - Select "Create API key in new project" (or use existing project)
   - Copy the new API key (it will start with `AIza`)

3. **Enable the API:**
   - Make sure Gemini API is enabled for your project
   - Check quotas and usage limits

### Step 2: Update DORA Configuration

1. **Update .env.local file:**
```bash
# Replace the old key with your new valid key
VITE_GEMINI_API_KEY=YOUR_NEW_API_KEY_HERE
```

2. **Restart your development server:**
```bash
npm run dev
```

### Step 3: Test the New Configuration

Run this command to test the new API key:
```bash
node simple-gemini-test.cjs
```

## 🔒 API Key Security Tips

1. **Never commit API keys to version control**
2. **Use environment variables (.env.local)**
3. **Restrict API key usage to specific domains/IPs**
4. **Monitor API usage and quotas**
5. **Rotate keys regularly**

## 🚀 Expected Results After Fix

Once you have a valid API key:
- ✅ DORA will respond to chat messages
- ✅ Smart context switching will work
- ✅ Both Campus Navigator and Volunteer Hub modes will function
- ✅ No more "Connection is unstable" errors

## 📞 Support

If you need help getting a new API key:
1. Check Google AI Studio documentation
2. Verify your Google Cloud project billing
3. Ensure you have proper permissions

---
**Status:** 🔴 API Key Invalid - Action Required
**Priority:** High - DORA is non-functional without valid API key