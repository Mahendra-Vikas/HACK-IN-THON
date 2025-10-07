import { v4 as uuidv4 } from 'uuid';
import EventRegistration from '../models/EventRegistration.js';

class RegistrationService {
  
  // Parse registration intent from user message
  static parseRegistrationIntent(message, events) {
    const lowerMessage = message.toLowerCase();
    
    // Check for registration keywords
    const registrationKeywords = [
      'register', 'signup', 'sign up', 'join', 'participate',
      'interested in', 'want to join', 'enroll', 'book'
    ];
    
    const hasRegistrationIntent = registrationKeywords.some(keyword => 
      lowerMessage.includes(keyword)
    );
    
    if (!hasRegistrationIntent) {
      return null;
    }
    
    // Find matching event
    const matchedEvent = events.find(event => 
      lowerMessage.includes(event.title.toLowerCase()) ||
      lowerMessage.includes(event.category.toLowerCase())
    );
    
    if (matchedEvent) {
      return {
        intent: 'register',
        event: matchedEvent,
        stage: 'initial'
      };
    }
    
    return {
      intent: 'register',
      event: null,
      stage: 'event_selection'
    };
  }
  
  // Handle registration flow
  static async handleRegistrationFlow(chatSession, message, events) {
    const registrationState = chatSession.registrationState || {};
    
    if (!registrationState.active) {
      // Check if this is a new registration request
      const intent = this.parseRegistrationIntent(message, events);
      if (intent) {
        chatSession.registrationState = {
          active: true,
          stage: intent.event ? 'collect_info' : 'event_selection',
          event: intent.event,
          data: {}
        };
        
        if (intent.event) {
          return this.getInfoCollectionPrompt('name', intent.event);
        } else {
          return this.getEventSelectionPrompt(events);
        }
      }
      return null;
    }
    
    // Handle ongoing registration flow
    return await this.processRegistrationStep(chatSession, message, events);
  }
  
  // Process each step of registration
  static async processRegistrationStep(chatSession, message, events) {
    const { stage, event, data, currentField } = chatSession.registrationState;
    
    switch (stage) {
      case 'event_selection':
        return this.handleEventSelection(chatSession, message, events);
      
      case 'collect_info':
        return this.handleInfoCollection(chatSession, message);
      
      case 'confirmation':
        return await this.handleConfirmation(chatSession, message);
      
      default:
        return null;
    }
  }
  
  // Handle event selection
  static handleEventSelection(chatSession, message, events) {
    const matchedEvent = events.find(event => 
      message.toLowerCase().includes(event.title.toLowerCase())
    );
    
    if (matchedEvent) {
      chatSession.registrationState.event = matchedEvent;
      chatSession.registrationState.stage = 'collect_info';
      return this.getInfoCollectionPrompt('name', matchedEvent);
    }
    
    return `I couldn't find that event. Please choose from these available events:\n\n` +
      events.map((event, index) => `${index + 1}. ${event.title}`).join('\n');
  }
  
  // Handle information collection
  static handleInfoCollection(chatSession, message) {
    const { data, currentField, event } = chatSession.registrationState;
    const trimmedMessage = message.trim();
    
    // Determine current field if not set
    if (!currentField) {
      chatSession.registrationState.currentField = 'name';
    }
    
    const field = chatSession.registrationState.currentField;
    
    // Validate and store field data
    const validation = this.validateField(field, trimmedMessage);
    if (!validation.isValid) {
      return validation.message;
    }
    
    data[field] = validation.value;
    
    // Move to next field
    const nextField = this.getNextField(field);
    if (nextField) {
      chatSession.registrationState.currentField = nextField;
      return this.getInfoCollectionPrompt(nextField, event);
    }
    
    // All fields collected, move to confirmation
    chatSession.registrationState.stage = 'confirmation';
    return this.getConfirmationPrompt(data, event);
  }
  
  // Handle final confirmation
  static async handleConfirmation(chatSession, message) {
    const lowerMessage = message.toLowerCase();
    const { data, event } = chatSession.registrationState;
    
    if (lowerMessage.includes('yes') || lowerMessage.includes('confirm')) {
      try {
        // Check if already registered
        const existingRegistration = await EventRegistration.isAlreadyRegistered(
          event.title, 
          data.rollNumber
        );
        
        if (existingRegistration) {
          this.clearRegistrationState(chatSession);
          return `❌ You are already registered for "${event.title}".\n\n` +
            `Registration ID: ${existingRegistration.registrationId}\n` +
            `If you need to make changes, please contact ${event.contact}`;
        }
        
        // Create new registration
        const registration = new EventRegistration({
          registrationId: uuidv4(),
          eventTitle: event.title,
          eventDate: event.date,
          eventCategory: event.category,
          studentInfo: {
            name: data.name,
            rollNumber: data.rollNumber.toUpperCase(),
            department: data.department,
            year: parseInt(data.year),
            email: data.email,
            phone: data.phone
          },
          chatSessionId: chatSession.sessionId
        });
        
        await registration.save();
        this.clearRegistrationState(chatSession);
        
        return registration.getConfirmationMessage() + 
          `\n\nFor any queries, contact: ${event.contact}`;
        
      } catch (error) {
        console.error('Registration error:', error);
        this.clearRegistrationState(chatSession);
        return '❌ Registration failed due to a technical error. Please try again later.';
      }
    }
    
    if (lowerMessage.includes('no') || lowerMessage.includes('cancel')) {
      this.clearRegistrationState(chatSession);
      return '❌ Registration cancelled. Feel free to ask about other volunteer opportunities!';
    }
    
    return 'Please reply with "yes" to confirm your registration or "no" to cancel.';
  }
  
  // Validate field input
  static validateField(field, value) {
    switch (field) {
      case 'name':
        if (value.length < 2 || value.length > 100) {
          return { isValid: false, message: 'Please enter a valid name (2-100 characters).' };
        }
        return { isValid: true, value };
      
      case 'rollNumber':
        if (!/^[A-Za-z0-9]+$/.test(value)) {
          return { isValid: false, message: 'Please enter a valid roll number (alphanumeric only).' };
        }
        return { isValid: true, value: value.toUpperCase() };
      
      case 'department':
        const departments = [
          'Computer Science and Engineering', 'Information Technology',
          'Electronics and Communication Engineering', 'Electrical and Electronics Engineering',
          'Mechanical Engineering', 'Civil Engineering', 'Automobile Engineering',
          'Biomedical Engineering', 'AI and Data Science', 'Cyber Security'
        ];
        
        const matchedDept = departments.find(dept => 
          dept.toLowerCase().includes(value.toLowerCase()) ||
          value.toLowerCase().includes(dept.toLowerCase())
        );
        
        if (!matchedDept) {
          return { 
            isValid: false, 
            message: `Please choose from these departments:\n${departments.map((d, i) => `${i + 1}. ${d}`).join('\n')}` 
          };
        }
        return { isValid: true, value: matchedDept };
      
      case 'year':
        const year = parseInt(value);
        if (isNaN(year) || year < 1 || year > 4) {
          return { isValid: false, message: 'Please enter a valid year (1-4).' };
        }
        return { isValid: true, value: year.toString() };
      
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return { isValid: false, message: 'Please enter a valid email address.' };
        }
        return { isValid: true, value: value.toLowerCase() };
      
      case 'phone':
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(value)) {
          return { isValid: false, message: 'Please enter a valid 10-digit Indian mobile number.' };
        }
        return { isValid: true, value };
      
      default:
        return { isValid: true, value };
    }
  }
  
  // Get next field in sequence
  static getNextField(currentField) {
    const fieldOrder = ['name', 'rollNumber', 'department', 'year', 'email', 'phone'];
    const currentIndex = fieldOrder.indexOf(currentField);
    return currentIndex < fieldOrder.length - 1 ? fieldOrder[currentIndex + 1] : null;
  }
  
  // Generate prompts for each field
  static getInfoCollectionPrompt(field, event) {
    const prompts = {
      name: `Great! I'll help you register for "${event.title}".\n\nFirst, please tell me your full name:`,
      rollNumber: `Thank you! Now, please provide your roll number:`,
      department: `Please tell me your department:`,
      year: `What year are you currently in? (1st, 2nd, 3rd, or 4th year):`,
      email: `Please provide your email address for updates:`,
      phone: `Finally, please provide your mobile number:`
    };
    
    return prompts[field] || 'Please provide the requested information:';
  }
  
  // Generate event selection prompt
  static getEventSelectionPrompt(events) {
    return `I'd be happy to help you register for a volunteer event! Here are the available opportunities:\n\n` +
      events.map((event, index) => 
        `${index + 1}. **${event.title}**\n   📅 ${event.date}\n   📍 ${event.location}\n   🏷️ ${event.category}\n`
      ).join('\n') +
      `\nPlease tell me which event you'd like to register for:`;
  }
  
  // Generate confirmation prompt
  static getConfirmationPrompt(data, event) {
    return `Please confirm your registration details:\n\n` +
      `**Event:** ${event.title}\n` +
      `**Date:** ${event.date}\n` +
      `**Location:** ${event.location}\n\n` +
      `**Your Details:**\n` +
      `Name: ${data.name}\n` +
      `Roll Number: ${data.rollNumber}\n` +
      `Department: ${data.department}\n` +
      `Year: ${data.year}\n` +
      `Email: ${data.email}\n` +
      `Phone: ${data.phone}\n\n` +
      `Is this information correct? Reply "yes" to confirm or "no" to cancel.`;
  }
  
  // Clear registration state
  static clearRegistrationState(chatSession) {
    delete chatSession.registrationState;
  }
}

export default RegistrationService;