import mongoose from 'mongoose';
import validator from 'validator';

const eventRegistrationSchema = new mongoose.Schema({
  registrationId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  eventTitle: {
    type: String,
    required: true,
    trim: true
  },
  eventDate: {
    type: String,
    required: true
  },
  eventCategory: {
    type: String,
    required: true
  },
  
  // Student Information
  studentInfo: {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100
    },
    rollNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      match: /^[A-Z0-9]+$/
    },
    department: {
      type: String,
      required: true,
      trim: true,
      enum: [
        'Computer Science and Engineering',
        'Information Technology',
        'Electronics and Communication Engineering',
        'Electrical and Electronics Engineering',
        'Mechanical Engineering',
        'Civil Engineering',
        'Automobile Engineering',
        'Biomedical Engineering',
        'AI and Data Science',
        'Cyber Security',
        'Other'
      ]
    },
    year: {
      type: Number,
      required: true,
      min: 1,
      max: 4
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email']
    },
    phone: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return /^[6-9]\d{9}$/.test(v);
        },
        message: 'Please provide a valid 10-digit Indian mobile number'
      }
    }
  },
  
  // Registration Metadata
  registrationDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'confirmed'
  },
  chatSessionId: {
    type: String,
    required: true
  },
  
  // Additional Info
  motivation: {
    type: String,
    maxlength: 500
  },
  previousExperience: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
eventRegistrationSchema.index({ eventTitle: 1, 'studentInfo.rollNumber': 1 }, { unique: true });
eventRegistrationSchema.index({ registrationDate: -1 });
eventRegistrationSchema.index({ chatSessionId: 1 });
eventRegistrationSchema.index({ status: 1 });

// Virtual for full student name with roll number
eventRegistrationSchema.virtual('studentFullInfo').get(function() {
  return `${this.studentInfo.name} (${this.studentInfo.rollNumber})`;
});

// Static method to check if student already registered for an event
eventRegistrationSchema.statics.isAlreadyRegistered = function(eventTitle, rollNumber) {
  return this.findOne({
    eventTitle,
    'studentInfo.rollNumber': rollNumber.toUpperCase(),
    status: { $ne: 'cancelled' }
  });
};

// Static method to get registrations by event
eventRegistrationSchema.statics.getEventRegistrations = function(eventTitle) {
  return this.find({ eventTitle, status: 'confirmed' })
    .select('studentInfo registrationDate')
    .sort({ registrationDate: -1 });
};

// Method to generate registration confirmation
eventRegistrationSchema.methods.getConfirmationMessage = function() {
  return `✅ Registration Confirmed!\n\n` +
    `Event: ${this.eventTitle}\n` +
    `Student: ${this.studentInfo.name}\n` +
    `Roll Number: ${this.studentInfo.rollNumber}\n` +
    `Department: ${this.studentInfo.department}\n` +
    `Year: ${this.studentInfo.year}\n` +
    `Registration ID: ${this.registrationId}\n\n` +
    `You will receive further updates on your registered email: ${this.studentInfo.email}`;
};

export default mongoose.model('EventRegistration', eventRegistrationSchema);