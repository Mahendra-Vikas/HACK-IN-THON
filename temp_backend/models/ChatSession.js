import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  isError: {
    type: Boolean,
    default: false
  }
});

const chatSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  messages: [messageSchema],
  lastActivity: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  userInfo: {
    ipAddress: String,
    userAgent: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better query performance
chatSessionSchema.index({ lastActivity: -1 });
chatSessionSchema.index({ sessionId: 1, isActive: 1 });

// Virtual for message count
chatSessionSchema.virtual('messageCount').get(function() {
  return this.messages.length;
});

// Method to add message
chatSessionSchema.methods.addMessage = function(role, content, isError = false) {
  this.messages.push({ role, content, isError });
  this.lastActivity = new Date();
  return this.save();
};

// Method to generate title from first message
chatSessionSchema.methods.generateTitle = function() {
  const firstUserMessage = this.messages.find(msg => msg.role === 'user');
  if (firstUserMessage) {
    // Take first 50 characters and add ellipsis if longer
    const title = firstUserMessage.content.substring(0, 50);
    this.title = title.length < firstUserMessage.content.length ? title + '...' : title;
  } else {
    this.title = 'New Chat';
  }
  return this.save();
};

// Static method to get recent sessions
chatSessionSchema.statics.getRecentSessions = function(limit = 20) {
  return this.find({ isActive: true })
    .select('sessionId title lastActivity messageCount')
    .sort({ lastActivity: -1 })
    .limit(limit);
};

export default mongoose.model('ChatSession', chatSessionSchema);