import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: 'ImanPrime',
    trim: true
  },
  logo: {
    type: String,
    required: true
  },
  about: {
    story: [{
      title: {
        type: String,
        required: true,
        trim: true
      },
      content: {
        type: String,
        required: true
      }
    }],
    values: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      description: {
        type: String,
        required: true
      }
    }],
    vision: {
      type: String,
      required: true
    },
    mission: {
      type: String,
      required: true
    }
  },
  team: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    image: {
      type: String,
      required: true
    },
    position: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    socialLinks: {
      linkedin: String,
      twitter: String,
      facebook: String,
      instagram: String
    }
  }],
  partners: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    logo: {
      type: String,
      required: true
    },
    website: {
      type: String,
      trim: true
    }
  }],
  contacts: {
    addresses: [{
      type: {
        type: String,
        enum: ['main', 'branch', 'office'],
        default: 'main'
      },
      address: {
        type: String,
        required: true
      },
      city: {
        type: String,
        required: true
      },
      state: String,
      zipCode: String,
      country: {
        type: String,
        default: 'USA'
      }
    }],
    phoneNumbers: [{
      type: {
        type: String,
        enum: ['main', 'sales', 'support', 'emergency'],
        default: 'main'
      },
      number: {
        type: String,
        required: true
      },
      label: String
    }],
    emails: [{
      type: {
        type: String,
        enum: ['general', 'sales', 'support', 'careers'],
        default: 'general'
      },
      email: {
        type: String,
        required: true,
        lowercase: true
      },
      label: String
    }],
    workingHours: {
      monday: { open: String, close: String },
      tuesday: { open: String, close: String },
      wednesday: { open: String, close: String },
      thursday: { open: String, close: String },
      friday: { open: String, close: String },
      saturday: { open: String, close: String },
      sunday: { open: String, close: String }
    }
  },
  socialMedia: {
    facebook: String,
    twitter: String,
    instagram: String,
    linkedin: String,
    youtube: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Company', companySchema);