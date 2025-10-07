# 🤖 DORA - Digital Outreach & Resource Assistant

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Mahendra-Vikas/HACK-IN-THON)

DORA is an intelligent AI assistant for Sri Eshwar College of Engineering that combines Campus Navigation and Volunteer Hub functionality with smart context switching.

## 🌟 Features

### 🏫 Campus Navigator Mode
- **Building & Department Locations** - Find any building, department, or facility on campus
- **Turn-by-turn Directions** - Get detailed walking directions between locations
- **Accessibility Information** - Wheelchair access, elevators, and accessible routes
- **Landmark Recognition** - Find locations using nearby landmarks
- **Voice Navigation Hints** - Audio cues for better navigation

### 🙋‍♀️ Volunteer Hub Mode
- **Event Discovery** - Browse upcoming volunteer opportunities
- **Smart Filtering** - Filter by category, date, and type
- **Registration Assistance** - Get help with event registration
- **Community Impact** - Track your volunteer contributions
- **Personalized Recommendations** - Events tailored to your interests

### 🧠 Smart Context Switching
- **Automatic Intent Detection** - Understands whether you need campus directions or volunteer info
- **Keyword Recognition** - Detects context from natural language queries
- **Confidence Scoring** - Shows how certain DORA is about the context
- **Mode Indicators** - Visual cues showing current mode (🏫 or 🙋‍♀️)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/Mahendra-Vikas/HACK-IN-THON.git
cd HACK-IN-THON
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

4. **Open in browser**
```
http://localhost:5173
```

### Production Build

```bash
npm run build
npm run preview
```

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. **One-click deploy:**
   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Mahendra-Vikas/HACK-IN-THON)

2. **Manual deployment:**
```bash
npm install -g vercel
vercel --prod
```

### Deploy to Netlify

```bash
npm run build
# Upload dist/ folder to Netlify
```

## 🎯 Usage Examples

### Campus Navigation Queries
- "Where is the AI & ML Block?"
- "How to get to the Main Block from parking?"
- "Find the library location"
- "Directions to the canteen from hostel"

### Volunteer Hub Queries  
- "Show me upcoming volunteer events"
- "What health-related volunteer opportunities are available?"
- "I'm interested in environment volunteering"
- "Register for blood donation drive"

## 🏗️ Project Structure

```
DORA/
├── src/                    # React source code
│   ├── components/         # React components
│   ├── store/             # Zustand state management
│   ├── utils/             # Utility functions & DORA engine
│   └── main.jsx           # Application entry point
├── public/                # Static assets
│   ├── campus-navigator-data.json
│   ├── data.json          # Volunteer events data
│   └── dora-icon.svg      # DORA logo
├── index.html             # Main HTML template
├── package.json           # Dependencies & scripts
├── vercel.json           # Vercel deployment config
└── vite.config.js        # Vite build configuration
```

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_APP_NAME=DORA
VITE_APP_VERSION=1.0.0
```

### API Keys
- **Gemini AI**: Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏫 About SECE

Sri Eshwar College of Engineering is committed to providing innovative technological solutions for campus life and community engagement.

## 💡 Tech Stack

- **Frontend**: React 18, Vite, TailwindCSS
- **State Management**: Zustand
- **Animations**: Framer Motion
- **AI**: Google Gemini API
- **Icons**: Lucide React
- **Deployment**: Vercel

---

Made with ❤️ by the SECE Development Team