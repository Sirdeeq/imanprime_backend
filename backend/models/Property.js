import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  bedrooms: {
    type: Number,
    required: true,
    min: 0
  },
  bathrooms: {
    type: Number,
    required: true,
    min: 0
  },
  parking: {
    type: Boolean,
    default: false
  },
  image: {
    type: String,
    required: true
  },
  images: [{
    type: String
  }],
  amenities: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['draft', 'active', 'inactive', 'deleted'],
    default: 'draft'
  },
  area: {
    type: String,
    required: true,
    trim: true
  },
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    required: true
  },
  category: {
    type: String,
    enum: ['residential', 'commercial', 'luxury', 'rental', 'investment'],
    required: true
  },
  virtual_tour: {
    type: String,
    default: ''
  },
  floor_plans: [{
    name: String,
    image: String
  }],
  property_certifications: [{
    type: String,
    trim: true
  }],
  featured: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  coordinates: {
    lat: Number,
    lng: Number
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Validate property_certifications array length
propertySchema.pre('save', function(next) {
  if (this.property_certifications && this.property_certifications.length > 20) {
    const error = new Error('Property certifications cannot exceed 20 items');
    error.name = 'ValidationError';
    return next(error);
  }
  next();
});

// Index for search and filtering
propertySchema.index({ 
  title: 'text', 
  description: 'text', 
  location: 'text' 
});
propertySchema.index({ category: 1, status: 1 });
propertySchema.index({ price: 1 });
propertySchema.index({ bedrooms: 1, bathrooms: 1 });

export default mongoose.model('Property', propertySchema);