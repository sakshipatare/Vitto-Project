/**
 * Validation Middleware for MSME Lending Application
 */
const validateApplication = (req, res, next) => {
  const { 
    businessName, 
    pan, 
    businessType, 
    monthlyRevenue, 
    loanAmount, 
    loanTenure, 
    loanPurpose 
  } = req.body;

  // 1. Check for missing fields
  if (!businessName || !pan || !businessType || !monthlyRevenue || !loanAmount || !loanTenure || !loanPurpose) {
    return res.status(400).json({
      success: false,
      error: 'MISSING_FIELDS',
      message: 'All fields are required'
    });
  }

  // 2. Numeric validations
  if (monthlyRevenue < 0 || loanAmount < 0 || loanTenure <= 0) {
    return res.status(400).json({
      success: false,
      error: 'INVALID_INPUT',
      message: 'Revenue and Amount must be positive. Tenure must be at least 1 month.'
    });
  }

  // 3. PAN validation
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  if (!panRegex.test(pan)) {
    return res.status(400).json({
      success: false,
      error: 'INVALID_PAN',
      message: 'Invalid PAN format. Expected: ABCDE1234F'
    });
  }

  next();
};

module.exports = { validateApplication };
