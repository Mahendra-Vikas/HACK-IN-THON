/**
 * 🏫 Enhanced Campus Navigator with AI-Powered Semantic Search
 * Combines local data matching with Gemini AI for intelligent campus navigation
 */

export class CampusNavigator {
  constructor() {
    this.campusData = [];
    this.isDataLoaded = false;
    this.loadData();
  }

  /**
   * Load campus navigation data from JSON file
   */
  async loadData() {
    try {
      const response = await fetch('/campus-navigator-data.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.campusData = await response.json();
      this.isDataLoaded = true;
      console.log('🏫 Campus data loaded successfully:', this.campusData.length, 'locations');
      return this.campusData;
    } catch (error) {
      console.error('❌ Failed to load campus data:', error);
      this.isDataLoaded = false;
      return [];
    }
  }

  /**
   * Enhanced local search with multiple matching strategies
   */
  findLocationLocal(query) {
    if (!this.isDataLoaded || this.campusData.length === 0) {
      return [];
    }

    const normalized = query.toLowerCase();
    let matches = [];

    // Strategy 1: Direct name matching (highest priority)
    matches = this.campusData.filter(loc => {
      const nodeName = loc.node.toLowerCase();
      return nodeName.includes(normalized) || 
             normalized.includes(nodeName) ||
             this.fuzzyMatch(nodeName, normalized);
    });

    if (matches.length > 0) return matches;

    // Strategy 2: Category matching
    matches = this.campusData.filter(loc => {
      const category = loc.category.toLowerCase();
      return category.includes(normalized) || 
             normalized.includes(category);
    });

    if (matches.length > 0) return matches;

    // Strategy 3: Description and keywords matching
    matches = this.campusData.filter(loc => {
      const searchText = `${loc.describe} ${loc.landmarks_nearby?.join(' ')} ${loc.front} ${loc.back} ${loc.left} ${loc.right}`.toLowerCase();
      const queryWords = normalized.split(' ').filter(word => word.length > 2);
      
      return queryWords.some(word => 
        searchText.includes(word) || 
        this.fuzzyMatch(searchText, word)
      );
    });

    if (matches.length > 0) return matches;

    // Strategy 4: Accessibility and facilities matching
    matches = this.campusData.filter(loc => {
      const facilities = `${loc.accessibility?.join(' ')} ${loc.voice_hint}`.toLowerCase();
      return facilities.includes(normalized);
    });

    return matches;
  }

  /**
   * Simple fuzzy matching for typos and variations
   */
  fuzzyMatch(str1, str2) {
    const threshold = 0.8;
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return true;
    
    const similarity = (longer.length - this.levenshteinDistance(longer, shorter)) / longer.length;
    return similarity >= threshold;
  }

  /**
   * Calculate Levenshtein distance for fuzzy matching
   */
  levenshteinDistance(str1, str2) {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[str2.length][str1.length];
  }

  /**
   * Generate AI-enhanced campus navigation prompt
   */
  generateAIPrompt(userQuery, localMatches = []) {
    const availableLocations = this.campusData.map(loc => ({
      name: loc.node,
      category: loc.category,
      description: loc.describe.substring(0, 150),
      landmarks: loc.landmarks_nearby?.slice(0, 3),
      coordinates: loc.coords
    }));

    return `🏫 CAMPUS NAVIGATION ASSISTANT - Sri Eshwar College of Engineering

USER QUERY: "${userQuery}"

CAMPUS DATA CONTEXT:
${JSON.stringify(availableLocations, null, 2)}

${localMatches.length > 0 ? `
LOCAL SEARCH FOUND ${localMatches.length} MATCHES:
${localMatches.map(loc => `- ${loc.node}: ${loc.describe.substring(0, 100)}`).join('\n')}
` : ''}

INSTRUCTIONS:
1. If the user is asking about a specific location, provide detailed directions
2. Use the campus data to give accurate location information
3. Include landmarks, accessibility info, and voice hints when available
4. If no exact match, suggest the closest/most relevant locations
5. Format response with emojis and clear structure
6. Include coordinates if helpful for navigation
7. Be conversational and helpful like a campus tour guide

RESPONSE FORMAT:
🏫 **Location Found/Suggestions**
📍 **Detailed Description**  
🧭 **Directions** (Front/Back/Left/Right)
🎯 **Voice Navigation Hint**
📍 **Nearby Landmarks**
💡 **Accessibility & Tips**

Respond as a helpful campus navigation assistant with detailed, accurate information.`;
  }

  /**
   * Generate response for successful local matches
   */
  generateLocalResponse(matches, originalQuery) {
    if (matches.length === 1) {
      return this.generateSingleLocationResponse(matches[0]);
    }

    if (matches.length > 1) {
      return this.generateMultipleLocationResponse(matches, originalQuery);
    }

    return null;
  }

  /**
   * Generate detailed response for single location
   */
  generateSingleLocationResponse(location) {
    return `🏫 **${location.node}** - Found!

📍 **Description**: ${location.describe}

🧭 **Navigation Directions**:
${location.front ? `• **Front**: ${location.front}` : ''}
${location.back ? `• **Back**: ${location.back}` : ''}
${location.left ? `• **Left**: ${location.left}` : ''}
${location.right ? `• **Right**: ${location.right}` : ''}

🎯 **Voice Navigation**: ${location.voice_hint}

📍 **Nearby Landmarks**: ${location.landmarks_nearby?.join(', ') || 'None specified'}

💡 **Accessibility**: ${location.accessibility?.join(', ') || 'Walking'}

📊 **Category**: ${location.category}
${location.coords ? `🗺️ **Coordinates**: ${location.coords.lat}, ${location.coords.lng}` : ''}

💬 Need more specific directions? Just ask "How to reach ${location.node} from [your location]"`;
  }

  /**
   * Generate response for multiple location matches
   */
  generateMultipleLocationResponse(matches, query) {
    return `🏫 Found **${matches.length} locations** matching "${query}":

${matches.map((loc, index) => 
  `**${index + 1}. ${loc.node}** - ${loc.category}
   📍 ${loc.describe.substring(0, 120)}...
   🧭 ${loc.voice_hint.substring(0, 80)}...`
).join('\n\n')}

💡 **Which location would you like detailed directions for?** 
Just say "Tell me about [location name]" or ask "How to reach [specific location]"`;
  }

  /**
   * Generate fallback response when no local matches found
   */
  generateFallbackResponse() {
    const locationNames = this.campusData.map(loc => loc.node);
    const categories = [...new Set(this.campusData.map(loc => loc.category))];

    return `🏫 **Campus Navigation Help**

🗺️ **Available Locations** (${this.campusData.length} total):
${locationNames.join(' • ')}

🏢 **Categories Available**:
${categories.join(' • ')}

💡 **Try asking**:
• "Where is the AI & ML Block?"
• "How to reach the Amenity Centre?"
• "Show me the Main Block directions"
• "Find the Open Air Theatre"

🎯 **Pro Tips**:
• Use building names, department names, or facility types
• Ask for directions between two locations
• Request accessibility information

What specific location are you looking for?`;
  }

  /**
   * Main method to handle campus navigation queries
   */
  async handleCampusQuery(userQuery, useAI = true) {
    // Ensure data is loaded
    if (!this.isDataLoaded) {
      await this.loadData();
    }

    // Try local search first
    const localMatches = this.findLocationLocal(userQuery);

    // If we have good local matches and don't need AI enhancement
    if (localMatches.length === 1) {
      return {
        source: 'local',
        response: this.generateLocalResponse(localMatches, userQuery),
        matches: localMatches
      };
    }

    // For multiple matches or no matches, use AI enhancement if requested
    if (useAI) {
      return {
        source: 'ai_enhanced',
        prompt: this.generateAIPrompt(userQuery, localMatches),
        localMatches: localMatches,
        fallbackResponse: localMatches.length > 0 
          ? this.generateLocalResponse(localMatches, userQuery)
          : this.generateFallbackResponse()
      };
    }

    // Return local results or fallback
    return {
      source: 'local',
      response: localMatches.length > 0 
        ? this.generateLocalResponse(localMatches, userQuery)
        : this.generateFallbackResponse(),
      matches: localMatches
    };
  }

  /**
   * Get all available locations for reference
   */
  getAllLocations() {
    return this.campusData.map(loc => ({
      name: loc.node,
      category: loc.category,
      description: loc.describe.substring(0, 100) + '...'
    }));
  }

  /**
   * Check if campus navigator is ready
   */
  isReady() {
    return this.isDataLoaded && this.campusData.length > 0;
  }
}

// Create singleton instance
export const campusNavigator = new CampusNavigator();

// Export utility functions
export const handleCampusNavigation = async (query, useAI = true) => {
  return await campusNavigator.handleCampusQuery(query, useAI);
};

export const getCampusLocations = () => {
  return campusNavigator.getAllLocations();
};

export const isCampusNavigatorReady = () => {
  return campusNavigator.isReady();
};