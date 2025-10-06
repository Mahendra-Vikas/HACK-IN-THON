# 🧠 Friday - Your Personal AI Assistant

This is a Python-based AI assistant inspired by _Jarvis_, capable of:

- 🔍 Searching the web
- 🌤️ Weather checking
- 📨 Sending Emails
- 📷 Vision through camera (Web app
- 🗣️ Speech
- 📝 Chat (Web app)

This agent uses LiveKit that is 100% free!

---

## 📽️ Tutorial Video

Before you start, **make sure to follow this tutorial to set up the voice agent correctly**:  
🎥 [Watch here](https://youtu.be/An4NwL8QSQ4?si=v1dNDDonmpCG1Els)

---

1. Create the Virtual Envrionment first!
2. Activate it
3. Install all the required libraries in the requirements.txt file
4. In the .ENV - File you should paste your API-Keys and your LiveKit Secret, LiveKit URL.
   If you want to use the Send Email Tool also specify your Gmail Account and App Password.
5. Make sure that your LiveKit Account is set-up correctly.

## Laptop setup (Windows)

Follow these steps on your Windows laptop (PowerShell):

1. Open PowerShell and navigate to the project folder.
2. Run the bundled setup script to create a virtual environment and install dependencies:

```powershell
./setup-laptop.ps1
```

3. When the script opens `.env`, paste your secret keys (do not commit this file):

- LIVEKIT_URL
- LIVEKIT_API_KEY
- LIVEKIT_API_SECRET
- GEMINI_API_KEY
- GEMINI_FLASH_URL

4. Activate the virtual environment (if not already active):

```powershell
.\.venv\Scripts\Activate.ps1
```

5. Run the agent:

```powershell
python agent.py
```

Notes:

- If you plan to use the email tool, set `GMAIL_USER` and `GMAIL_APP_PASSWORD` in your `.env` (use an App Password for Gmail).
- Keep your API keys secret. Use `.env.example` as a reference and avoid committing `.env` to git.

---

# 🧠 Friday - Your Personal AI Assistant

This is a Python-based AI assistant inspired by _Jarvis_, capable of:

- 🔍 Searching the web
- 🌤️ Weather checking
- 📨 Sending Emails
- 📷 Vision through camera (Web app
- 🗣️ Speech
- 📝 Chat (Web app)

This agent uses LiveKit that is 100% free!

---

## 📽️ Tutorial Video

Before you start, **make sure to follow this tutorial to set up the voice agent correctly**:  
🎥 [Watch here](https://youtu.be/An4NwL8QSQ4?si=v1dNDDonmpCG1Els)

---

1. Create the Virtual Envrionment first!
2. Activate it
3. Install all the required libraries in the requirements.txt file
4. In the .ENV - File you should paste your API-Keys and your LiveKit Secret, LiveKit URL.
   If you want to use the Send Email Tool also specify your Gmail Account and App Password.
5. Make sure that your LiveKit Account is set-up correctly.
