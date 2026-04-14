const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  businessName: {
    type: String,
    required: true,
    trim: true
  },
  pan: {
    type: String,
    required: true,
    match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format']
  },
  businessType: {
    type: String,
    required: true,
    enum: ['retail', 'manufacturing', 'services', 'other']
  },
  monthlyRevenue: {
    type: Number,
    required: true,
    min: 0
  },
  loanAmount: {
    type: Number,
    required: true,
    min: 0
  },
  loanTenure: {
    type: Number,
    required: true,
    min: 1 // months
  },
  loanPurpose: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  creditScore: {
    type: Number,
    default: 0
  },
  reasonCodes: [String],
  riskLevel: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH'],
    default: 'HIGH'
  },
  breakdown: {
    emiToRevenue: Number,
    revenueMultiple: Number
  },
  decisionTime: {
    type: Date
  },
  processingTimeMs: {
    type: Number
  },
  overrides: [{
    previousStatus: String,
    newStatus: String,
    note: String,
    reviewedById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedByName: String,
    reviewedAt: {
      type: Date,
      default: Date.now
    }
  }],
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Application', applicationSchema);
