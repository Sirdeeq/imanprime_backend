import mongoose from 'mongoose';

const quoteRequestSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  projectType: {
    type: String,
    required: true,
    enum: [
      'interior-design',
      'exterior-design',
      'both-interior-exterior',
      'renovation',
      'new-construction',
      'commercial',
      'residential'
    ]
  },
  budgetRange: {
    type: String,
    required: true,
    enum: [
      'under-10k',
      '10k-25k',
      '25k-50k',
      '50k-100k',
      '100k-250k',
      '250k-500k',
      'over-500k'
    ]
  },
  timeline: {
    type: String,
    required: true,
    enum: [
      'asap',
      '1-3-months',
      '3-6-months',
      '6-12-months',
      'over-1-year',
      'flexible'
    ]
  },
  projectDescription: {
    type: String,
    required: true,
    maxlength: 2000
  },
  propertyType: {
    type: String,
    enum: ['residential', 'commercial', 'mixed-use', 'other']
  },
  propertySize: {
    type: String,
    trim: true
  },
  preferredContactMethod: {
    type: String,
    enum: ['email', 'phone', 'whatsapp'],
    default: 'email'
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'in-progress', 'quoted', 'accepted', 'rejected', 'completed'],
    default: 'new'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent'
  },
  notes: [{
    content: {
      type: String,
      required: true
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  followUpDate: {
    type: Date
  },
  estimatedQuoteAmount: {
    type: Number,
    min: 0
  },
  attachments: [{
    name: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for search and filtering
quoteRequestSchema.index({ 
  fullName: 'text', 
  email: 'text',
  projectDescription: 'text'
});
quoteRequestSchema.index({ status: 1, priority: 1 });
quoteRequestSchema.index({ createdAt: -1 });
quoteRequestSchema.index({ assignedTo: 1 });

export default mongoose.model('QuoteRequest', quoteRequestSchema);