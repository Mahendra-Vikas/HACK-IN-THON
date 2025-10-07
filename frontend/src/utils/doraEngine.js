// 🤖 DORA - Digital Outreach & Resource Assistant
// Smart Context Switching System for Campus Navigation & Volunteer Hub
// ====================================================================

/**
 * DORA's Intelligence Engine
 * Automatically detects user intent and switches between:
 * 🏫 Campus Navigator Mode (location/direction queries)
 * 🙋‍♀️ Volunteer Hub Mode (events/volunteer opportunities)
 */

// Intent detection keywords
const CAMPUS_KEYWORDS = [
  // Location-based
  'campus', 'building', 'block', 'department', 'office', 'room', 'location', 'where',
  'directions', 'navigate', 'find', 'route', 'way to', 'how to get', 'path to',
  
  // Specific campus areas
  'main gate', 'main block', 'amenity', 'theatre', 'hostel', 'canteen', 'library',
  'ai block', 'ml block', 'cse', 'parking', 'atm', 'medical', 'reception',
  
  // Navigation verbs
  'reach', 'visit', 'go to', 'located', 'entrance', 'exit', 'near', 'beside',
  'opposite', 'next to', 'ground floor', 'first floor', 'accessibility'
];

const VOLUNTEER_KEYWORDS = [
  // Volunteer activities
  'volunteer', 'event', 'registration', 'participate', 'join', 'organize',
  'community', 'service', 'help', 'contribute', 'donate', 'support',
  
  // Event categories
  'environment', 'education', 'health', 'technology', 'awareness', 'social',
  'tree plantation', 'blood donation', 'coding', 'workshop', 'seminar',
  
  // Time-based
  'upcoming', 'today', 'tomorrow', 'this week', 'next week', 'schedule',
  'when', 'date', 'time', 'register', 'sign up', 'apply'
];

/**
 * DORA's Intent Detection Engine
 */
export const detectUserIntent = (userMessage) => {
  const message = userMessage.toLowerCase();
  
  // Calculate relevance scores
  const campusScore = CAMPUS_KEYWORDS.reduce((score, keyword) => {
    return message.includes(keyword) ? score + 1 : score;
  }, 0);
  
  const volunteerScore = VOLUNTEER_KEYWORDS.reduce((score, keyword) => {
    return message.includes(keyword) ? score + 1 : score;
  }, 0);
  
  // Advanced pattern matching
  const campusPatterns = [
    /where\s+is\s+(?:the\s+)?([a-z\s]+)/i,
    /how\s+to\s+(?:get\s+to|reach|find)\s+([a-z\s]+)/i,
    /directions?\s+to\s+([a-z\s]+)/i,
    /location\s+of\s+([a-z\s]+)/i,
    /way\s+to\s+([a-z\s]+)/i
  ];
  
  const volunteerPatterns = [
    /volunteer\s+(?:for|in|at)\s+([a-z\s]+)/i,
    /events?\s+(?:for|about|related to)\s+([a-z\s]+)/i,
    /register\s+(?:for|to)\s+([a-z\s]+)/i,
    /join\s+([a-z\s]+)\s+(?:event|activity|program)/i
  ];
  
  // Check for specific patterns
  const hasCampusPattern = campusPatterns.some(pattern => pattern.test(message));
  const hasVolunteerPattern = volunteerPatterns.some(pattern => pattern.test(message));
  
  // Determine intent with confidence score
  if (hasCampusPattern || campusScore > volunteerScore) {
    return {
      mode: 'campus',
      confidence: campusScore + (hasCampusPattern ? 2 : 0),
      keywords: CAMPUS_KEYWORDS.filter(keyword => message.includes(keyword))
    };
  } else if (hasVolunteerPattern || volunteerScore > 0) {
    return {
      mode: 'volunteer',
      confidence: volunteerScore + (hasVolunteerPattern ? 2 : 0),
      keywords: VOLUNTEER_KEYWORDS.filter(keyword => message.includes(keyword))
    };
  }
  
  // Default to volunteer mode for general queries
  return {
    mode: 'volunteer',
    confidence: 0,
    keywords: []
  };
};

/**
 * Campus Navigator Data Manager
 */
class CampusNavigator {
  constructor() {
    this.campusData = [];
    this.isLoaded = false;
  }
  
  async loadCampusData() {
    try {
      const response = await fetch('/campus-navigator-data.json');
      this.campusData = await response.json();
      this.isLoaded = true;
      console.log('🏫 Campus Navigator data loaded successfully');
      return true;
    } catch (error) {
      console.error('Failed to load campus data:', error);
      this.campusData = [];
      this.isLoaded = false;
      return false;
    }
  }
  
  searchLocation(query) {
    if (!this.isLoaded) return null;
    
    const searchTerm = query.toLowerCase();
    
    // Find exact or partial matches
    const matches = this.campusData.filter(location => {
      const node = location.node.toLowerCase();
      const category = location.category.toLowerCase();
      const description = location.describe.toLowerCase();
      
      return node.includes(searchTerm) || 
             category.includes(searchTerm) || 
             description.includes(searchTerm) ||
             location.landmarks_nearby.some(landmark => 
               landmark.toLowerCase().includes(searchTerm)
             );
    });
    
    return matches.length > 0 ? matches : null;
  }
  
  findDirections(from, to) {
    if (!this.isLoaded) return null;
    
    const fromLocation = this.searchLocation(from);
    const toLocation = this.searchLocation(to);
    
    if (fromLocation && toLocation) {
      return {
        from: fromLocation[0],
        to: toLocation[0],
        route: this.calculateRoute(fromLocation[0], toLocation[0])
      };
    }
    
    return null;
  }
  
  calculateRoute(fromLoc, toLoc) {
    // Simple pathfinding based on connections
    // This could be enhanced with more sophisticated algorithms
    const commonConnections = fromLoc.connections.filter(conn => 
      toLoc.connections.includes(conn)
    );
    
    if (commonConnections.length > 0) {
      return {
        path: [fromLoc.node, commonConnections[0], toLoc.node],
        instructions: [
          `Start from ${fromLoc.node}`,
          `Head towards ${commonConnections[0]}`,
          `Continue to ${toLoc.node}`
        ]
      };
    }
    
    return {
      path: [fromLoc.node, toLoc.node],
      instructions: [
        `Navigate from ${fromLoc.node} to ${toLoc.node}`,
        `Use the main pathways and follow campus signage`
      ]
    };
  }
  
  generateResponse(userQuery, intent) {
    if (!this.isLoaded) {
      return "🏫 I'm still loading campus information. Please try again in a moment!";
    }
    
    const matches = this.searchLocation(userQuery);
    
    if (!matches) {
      return "🏫 I couldn't find that location on campus. Could you be more specific? You can ask about buildings like 'Main Block', 'AI & ML Block', 'Amenity Centre', or facilities like 'canteen', 'library', etc.";
    }
    
    const location = matches[0];
    
    // Generate natural language response
    let response = `🏫 **${location.node}** - *Campus Navigator Mode*\n\n`;
    response += `📍 **Description:** ${location.describe}\n\n`;
    
    if (location.voice_hint) {
      response += `🧭 **Navigation Hint:** ${location.voice_hint}\n\n`;
    }
    
    if (location.landmarks_nearby && location.landmarks_nearby.length > 0) {
      response += `🏛️ **Nearby Landmarks:** ${location.landmarks_nearby.join(', ')}\n\n`;
    }
    
    if (location.accessibility && location.accessibility.length > 0) {
      response += `♿ **Accessibility:** ${Array.isArray(location.accessibility) 
        ? location.accessibility.join(', ') 
        : location.accessibility}\n\n`;
    }
    
    if (location.connections && location.connections.length > 0) {
      response += `🔗 **Connected Areas:** ${location.connections.join(', ')}\n\n`;
    }
    
    response += `💡 **Need directions?** Just ask "How to get to [destination] from ${location.node}"`;
    
    return response;
  }
}

/**
 * DORA Response Generator
 */
export class DoraResponseGenerator {
  constructor() {
    this.campusNavigator = new CampusNavigator();
    this.initializeNavigator();
  }
  
  async initializeNavigator() {
    await this.campusNavigator.loadCampusData();
  }
  
  async generateResponse(userMessage, intent) {
    const detectedIntent = intent || detectUserIntent(userMessage);
    
    if (detectedIntent.mode === 'campus') {
      return {
        response: this.campusNavigator.generateResponse(userMessage, detectedIntent),
        mode: 'campus',
        confidence: detectedIntent.confidence,
        source: 'Campus Navigator'
      };
    } else {
      return {
        response: null, // Will be handled by existing Volunteer Hub logic
        mode: 'volunteer',
        confidence: detectedIntent.confidence,
        source: 'Volunteer Hub'
      };
    }
  }
  
  getWelcomeMessage() {
    return `🎒 **Hello! I'm DORA** - your Digital Outreach & Resource Assistant!\n\n` +
           `I can help you with:\n` +
           `🏫 **Campus Navigation** - Find buildings, directions, and facilities\n` +
           `🙋‍♀️ **Volunteer Opportunities** - Discover events and register for activities\n\n` +
           `**Try asking me:**\n` +
           `• "Where is the AI & ML Block?"\n` +
           `• "Show me upcoming volunteer events"\n` +
           `• "How to get to the Main Block?"\n` +
           `• "What health-related volunteer opportunities are available?"\n\n` +
           `I automatically detect what you need and switch between Campus Navigator and Volunteer Hub modes! 🤖✨`;
  }
}

// Export singleton instance
export const doraEngine = new DoraResponseGenerator();

// Helper functions for UI integration
export const getModeIcon = (mode) => {
  return mode === 'campus' ? '🏫' : '🙋‍♀️';
};

export const getModeLabel = (mode) => {
  return mode === 'campus' ? 'Campus Navigator Mode' : 'Volunteer Hub Mode';
};

export const getModeColor = (mode) => {
  return mode === 'campus' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700' 
                           : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700';
};