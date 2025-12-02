const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  general: {
    siteName: {
      type: String,
      default: 'Fixly'
    },
    siteDescription: {
      type: String,
      default: ''
    },
    contactEmail: {
      type: String,
      default: ''
    },
    contactPhone: {
      type: String,
      default: ''
    },
    logo: {
      type: String,
      default: ''
    }
  },
  commission: {
    rate: {
      type: Number,
      default: 10,
      min: 0,
      max: 100
    },
    minimumPayout: {
      type: Number,
      default: 50
    },
    payoutSchedule: {
      type: String,
      enum: ['weekly', 'biweekly', 'monthly'],
      default: 'monthly'
    }
  },
  notifications: {
    email: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: false
    },
    push: {
      type: Boolean,
      default: true
    }
  },
  security: {
    requireEmailVerification: {
      type: Boolean,
      default: true
    },
    requirePhoneVerification: {
      type: Boolean,
      default: false
    },
    requireProviderDocuments: {
      type: Boolean,
      default: true
    },
    maintenanceMode: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Ensure there's always one settings document
settingsSchema.statics.getOrCreate = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = new this();
    await settings.save();
  }
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);