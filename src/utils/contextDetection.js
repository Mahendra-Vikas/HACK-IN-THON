/**
 * 🧠 Enhanced Context Detection for DORA
 * Intelligently detects user intent and switches between Campus Navigator and Volunteer Hub modes
 */

import { handleCampusNavigation, isCampusNavigatorReady } from './campusNavigator.js';

/**
 * Campus-related keywords and patterns
 */
const CAMPUS_KEYWORDS = {
  // Direct location names (from your campus data)
  locations: [
    'main gate', 'main block', 'ai & ml block', 'ai ml block', 'artificial intelligence',
    'amenity centre', 'amenity center', 'open air theatre', 'open air theater',
    'temple', 'atm', 'lawn area', 'transport facility', 'reception', 'office',
    'girls hostel', 'boys hostel', 'mech block', 'medical centre', 'medical center',
    'ncc block', 'chat corner', 'mario', 'xerox centre', 'xerox center', 'dining'
  ],
  
  // Navigation-related terms
  navigation: [
    'where is', 'how to reach', 'find', 'locate', 'direction', 'directions',
    'way to', 'path to', 'route to', 'navigate to', 'go to', 'get to',
    'show me', 'take me to', 'guide me to', 'help me find'
  ],
  
  // Campus facilities and amenities
  facilities: [
    'canteen', 'library', 'parking', 'washroom', 'restroom', 'toilet',
    'elevator', 'lift', 'stairs', 'entrance', 'exit', 'gate',
    'classroom', 'lab', 'laboratory', 'auditorium', 'hall'
  ],
  
  // Department and academic terms
  academic: [
    'department', 'block', 'building', 'faculty', 'office', 'admin',
    'computer science', 'mechanical', 'civil', 'electrical', 'ece',
    'cse', 'it', 'information technology', 'engineering'
  ],

  // Campus-specific terms
  campus: [
    'campus', 'college', 'sri eshwar', 'sece', 'kinathukadavu',
    'coimbatore', 'campus map', 'campus tour', 'campus guide'
  ]
};

/**
 * Volunteer-related keywords and patterns
 */
const VOLUNTEER_KEYWORDS = {
  events: [
    'event', 'events', 'volunteer', 'volunteering', 'opportunity', 'opportunities',
    'activity', 'activities', 'program', 'programs', 'initiative', 'initiatives'
  ],
  
  actions: [
    'join', 'participate', 'register', 'sign up', 'enroll', 'apply',
    'help', 'contribute', 'serve', 'assist', 'support'
  ],
  
  categories: [
    'social', 'environmental', 'educational', 'community', 'charity',
    'fundraising', 'awareness', 'campaign', 'drive', 'workshop'
  ],

  time: [
    'upcoming', 'today', 'tomorrow', 'this week', 'next week',
    'weekend', 'schedule', 'calendar', 'when', 'time'
  ]
};

/**
 * Analyze user query to determine context and intent
 */
export function analyzeUserIntent(userQuery) {
  const query = userQuery.toLowerCase().trim();
  
  // Calculate context scores
  const campusScore = calculateContextScore(query, CAMPUS_KEYWORDS);
  const volunteerScore = calculateContextScore(query, VOLUNTEER_KEYWORDS);
  
  // Determine primary context
  let primaryContext = 'general';
  let confidence = 0;
  
  if (campusScore > volunteerScore && campusScore > 0) {
    primaryContext = 'campus';
    confidence = campusScore;
  } else if (volunteerScore > campusScore && volunteerScore > 0) {
    primaryContext = 'volunteer';
    confidence = volunteerScore;
  }

  // Special patterns for high-confidence detection
  const specialPatterns = detectSpecialPatterns(query);
  if (specialPatterns.context !== 'general') {
    primaryContext = specialPatterns.context;
    confidence = Math.max(confidence, specialPatterns.confidence);
  }

  return {
    primaryContext,
    confidence,
    campusScore,
    volunteerScore,
    specialPatterns: specialPatterns.patterns,
    requiresEnhancement: primaryContext === 'campus' && confidence > 0.3
  };
}

/**
 * Calculate context score based on keyword matching
 */
function calculateContextScore(query, keywordCategories) {
  let totalScore = 0;
  let matchCount = 0;
  
  Object.entries(keywordCategories).forEach(([category, keywords]) => {
    const categoryScore = keywords.reduce((score, keyword) => {
      if (query.includes(keyword)) {
        matchCount++;
        // Give higher weight to longer, more specific keywords
        return score + (keyword.length / 10) + 1;
      }
      return score;
    }, 0);
    
    totalScore += categoryScore;
  });
  
  // Normalize score (0-1 range)
  const normalizedScore = Math.min(totalScore / 10, 1);
  
  return {
    score: normalizedScore,
    matchCount,
    totalScore
  };
}

/**
 * Detect special patterns that strongly indicate context
 */
function detectSpecialPatterns(query) {
  const patterns = [];
  let context = 'general';
  let confidence = 0;

  // Strong campus indicators
  const campusPatterns = [
    /where\s+is\s+(the\s+)?[\w\s&]+(?:block|building|center|centre|gate|theatre|theater)/i,
    /how\s+to\s+(?:reach|get\s+to|find)\s+(the\s+)?[\w\s&]+(?:block|building|center|centre)/i,
    /(?:direction|directions|route|path)\s+to\s+(the\s+)?[\w\s&]+/i,
    /show\s+me\s+(the\s+)?(?:way\s+to\s+)?[\w\s&]+(?:block|building|center|centre)/i,
    /sri\s+eshwar|sece|campus\s+map|college\s+map/i,
    /ai\s*&?\s*ml|artificial\s+intelligence|machine\s+learning/i
  ];

  campusPatterns.forEach((pattern, index) => {
    if (pattern.test(query)) {
      patterns.push(`campus_pattern_${index + 1}`);
      context = 'campus';
      confidence = Math.max(confidence, 0.8);
    }
  });

  // Strong volunteer indicators
  const volunteerPatterns = [
    /(?:volunteer|volunteering)\s+(?:opportunity|opportunities|event|events)/i,
    /(?:upcoming|next|this\s+week)\s+(?:event|events|volunteer|activity)/i,
    /(?:register|sign\s+up|join)\s+(?:for\s+)?(?:event|volunteer|activity)/i,
    /what\s+(?:volunteer|events|activities)\s+(?:are\s+)?(?:available|happening)/i
  ];

  volunteerPatterns.forEach((pattern, index) => {
    if (pattern.test(query)) {
      patterns.push(`volunteer_pattern_${index + 1}`);
      context = 'volunteer';
      confidence = Math.max(confidence, 0.8);
    }
  });

  return { context, confidence, patterns };
}

/**
 * Enhanced message processing with campus navigation integration
 */
export async function processEnhancedMessage(userMessage, options = {}) {
  const { useAI = true, currentMode = 'auto' } = options;
  
  try {
    // Analyze user intent
    const intent = analyzeUserIntent(userMessage);
    
    // Handle campus navigation queries
    if (intent.primaryContext === 'campus' && intent.confidence > 0.3) {
      
      // Check if campus navigator is ready
      if (!isCampusNavigatorReady()) {
        return {
          type: 'campus_loading',
          message: '🏫 Loading campus navigation data... Please wait a moment and try again.',
          intent
        };
      }

      // Handle campus navigation
      const campusResult = await handleCampusNavigation(userMessage, useAI);
      
      if (campusResult.source === 'ai_enhanced' && useAI) {
        // Return prompt for AI processing
        return {
          type: 'campus_ai_enhanced',
          prompt: campusResult.prompt,
          fallbackResponse: campusResult.fallbackResponse,
          localMatches: campusResult.localMatches,
          intent
        };
      } else {
        // Return local campus response
        return {
          type: 'campus_local',
          message: campusResult.response,
          matches: campusResult.matches,
          intent
        };
      }
    }

    // Handle volunteer queries (existing logic)
    if (intent.primaryContext === 'volunteer' && intent.confidence > 0.4) {
      return {
        type: 'volunteer',
        needsProcessing: true,
        enhancedPrompt: createVolunteerPrompt(userMessage, intent),
        intent
      };
    }

    // General DORA query
    return {
      type: 'general',
      needsProcessing: true,
      message: userMessage,
      intent
    };

  } catch (error) {
    console.error('❌ Error in enhanced message processing:', error);
    return {
      type: 'error',
      message: '🤖 I encountered an issue processing your request. Please try again.',
      error: error.message
    };
  }
}

/**
 * Create enhanced volunteer prompt
 */
function createVolunteerPrompt(userMessage, intent) {
  return `🙋‍♀️ VOLUNTEER HUB ASSISTANT - Sri Eshwar College of Engineering

USER QUERY: "${userMessage}"

CONTEXT ANALYSIS:
- Primary Context: ${intent.primaryContext}
- Confidence: ${(intent.confidence * 100).toFixed(1)}%
- Detected Patterns: ${intent.specialPatterns?.join(', ') || 'General inquiry'}

As a helpful volunteer coordinator, provide information about:
- Upcoming volunteer opportunities and events
- Ways students can get involved in community service
- Registration processes and requirements
- Event schedules and timings
- Social impact and learning opportunities

Be enthusiastic, informative, and encourage student participation!`;
}

/**
 * Create enhanced campus navigation prompt
 */
export function createCampusPrompt(userMessage, campusData) {
  return `🏫 CAMPUS NAVIGATION ASSISTANT - Sri Eshwar College of Engineering

USER QUERY: "${userMessage}"

INSTRUCTIONS: Use the provided campus data to give accurate, helpful navigation assistance. 
Be specific with directions, landmarks, and accessibility information.

${campusData}`;
}

// Export utility functions
export { CAMPUS_KEYWORDS, VOLUNTEER_KEYWORDS };

// Default export
export default {
  analyzeUserIntent,
  processEnhancedMessage,
  createCampusPrompt,
  createVolunteerPrompt
};