const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const Application = require('../models/Application');
const { processDecision } = require('../services/decisionEngine');
const { validateApplication } = require('../middleware/validation');
const { protect } = require('../middleware/auth');

// Rate limiting: 10 requests per minute
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    error: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many applications submitted. Please try again later.'
  }
});

/**
 * @route   POST /api/applications/submit
 * @desc    Submit a new loan application and get a decision
 * @access  Public
 */
router.post('/submit', limiter, validateApplication, async (req, res) => {
  const start = Date.now();
  try {
    const {
      businessName,
      pan,
      businessType,
      monthlyRevenue,
      loanAmount,
      loanTenure,
      loanPurpose
    } = req.body;

    // 1. Simulate Async Processing (as requested)
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 2. Run Decision Engine
    const decision = processDecision({
      monthlyRevenue,
      loanAmount,
      loanTenure
    });

    const end = Date.now();

    // 3. Save to MongoDB
    const newApplication = new Application({
      businessName,
      pan,
      businessType,
      monthlyRevenue,
      loanAmount,
      loanTenure,
      loanPurpose,
      status: decision.status,
      creditScore: decision.score,
      riskLevel: decision.riskLevel,
      breakdown: decision.breakdown,
      reasonCodes: decision.reasonCodes,
      decisionTime: new Date(),
      processingTimeMs: end - start
    });

    await newApplication.save();

    // 4. Return structured response
    res.status(201).json({
      success: true,
      data: {
        applicationId: newApplication._id,
        decision: {
          status: decision.status,
          score: decision.score,
          reasonCodes: decision.reasonCodes,
          estimatedEMI: decision.emi,
          processingTimeMs: end - start
        }
      }
    });

  } catch (error) {
    console.error('Submission Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'INTERNAL_ERROR', 
      message: 'Failed to process application' 
    });
  }
});

/**
 * @route   POST /api/applications/decision/:id
 * @desc    Run decision engine for an existing application
 * @access  Public
 */
router.post('/decision/:id', async (req, res) => {
  const start = Date.now();
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Application not found' });
    }

    // Run Decision Engine
    const decision = processDecision({
      monthlyRevenue: application.monthlyRevenue,
      loanAmount: application.loanAmount,
      loanTenure: application.loanTenure
    });

    const end = Date.now();

    // Update application with new decision
    application.status = decision.status;
    application.creditScore = decision.score;
    application.riskLevel = decision.riskLevel;
    application.breakdown = decision.breakdown;
    application.reasonCodes = decision.reasonCodes;
    application.decisionTime = new Date();
    application.processingTimeMs = end - start;
    
    await application.save();

    res.json({
      success: true,
      data: {
        applicationId: application._id,
        decision: {
          status: decision.status,
          score: decision.score,
          reasonCodes: decision.reasonCodes,
          estimatedEMI: decision.emi,
          processingTimeMs: end - start
        }
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: error.message });
  }
});

/**
 * @route   PATCH /api/applications/:id/override
 * @desc    Manually override a decision (Admin only)
 * @access  Private
 */
router.patch('/:id/override', protect, async (req, res) => {
  try {
    const { status, notes } = req.body;

    // Role check
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        error: 'FORBIDDEN', 
        message: 'Only administrators can perform manual overrides' 
      });
    }

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, error: 'INVALID_STATUS', message: 'Status must be Approved or Rejected' });
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Application not found' });
    }

    const previousStatus = application.status;
    
    application.status = status;
    
    // Add override to history
    application.overrides.push({
      previousStatus,
      newStatus: status,
      note: notes,
      reviewedById: req.user.id,
      reviewedByName: req.user.username,
      reviewedAt: new Date()
    });

    await application.save();

    res.json({
      success: true,
      data: application,
      message: `Application manually ${status.toLowerCase()}`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: error.message });
  }
});

/**
 * @route   GET /api/applications
 * @desc    Get all applications (Audit Trail) with optional filtering
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) {
      query.status = status;
    }

    const applications = await Application.find(query).sort({ submittedAt: -1 });
    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: 'Failed to fetch applications' });
  }
});

module.exports = router;
