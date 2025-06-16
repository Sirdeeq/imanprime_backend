import mongoose from 'mongoose';

const agentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  whatsappNumber: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    required: true
  },
  bio: {
    type: String,
    maxlength: 1000
  },
  specialization: {
    type: String,
    enum: ['residential', 'commercial', 'luxury', 'rental', 'investment', 'interior-design', 'exterior-design'],
    default: 'residential'
  },
  experience: {
    type: Number,
    default: 0
  },
  languages: [{
    type: String,
    trim: true
  }],
  certifications: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    issuedBy: {
      type: String,
      trim: true
    },
    issuedDate: Date,
    expiryDate: Date
  }],
  socialMedia: {
    linkedin: String,
    twitter: String,
    facebook: String,
    instagram: String,
    website: String
  },
  workingHours: {
    monday: { start: String, end: String, available: { type: Boolean, default: true } },
    tuesday: { start: String, end: String, available: { type: Boolean, default: true } },
    wednesday: { start: String, end: String, available: { type: Boolean, default: true } },
    thursday: { start: String, end: String, available: { type: Boolean, default: true } },
    friday: { start: String, end: String, available: { type: Boolean, default: true } },
    saturday: { start: String, end: String, available: { type: Boolean, default: false } },
    sunday: { start: String, end: String, available: { type: Boolean, default: false } }
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for search
agentSchema.index({ name: 'text', email: 'text', specialization: 'text' });
agentSchema.index({ specialization: 1, isActive: 1 });
agentSchema.index({ 'rating.average': -1 });

export default mongoose.model('Agent', agentSchema);