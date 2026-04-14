/**
 * Decision Engine Service
 * Calculates credit score and generates reason codes based on MSME application data.
 */

const calculateEMI = (principal, tenureMonths, annualRate = 18) => {
  const monthlyRate = annualRate / 12 / 100;
  if (monthlyRate === 0) return principal / tenureMonths;
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / (Math.pow(1 + monthlyRate, tenureMonths) - 1);
  return emi;
};

const processDecision = (data) => {
  const { monthlyRevenue, loanAmount, loanTenure } = data;
  let score = 400; // Base score
  const reasonCodes = [];
  
  // 1. Revenue Multiple Check
  const revenueMultiple = loanAmount / monthlyRevenue;
  if (revenueMultiple > 6) {
    reasonCodes.push('HIGH_LOAN_RATIO');
    score -= 100;
  } else if (revenueMultiple <= 2) {
    score += 200;
  } else if (revenueMultiple <= 4) {
    score += 100;
  }

  // 2. EMI to Revenue ratio
  const emi = calculateEMI(loanAmount, loanTenure);
  const emiToRevenue = emi / monthlyRevenue;

  if (emiToRevenue > 0.4) {
    reasonCodes.push('LOW_REVENUE_FOR_EMI');
    score -= 100;
  } else if (emiToRevenue <= 0.2) {
    score += 200;
  } else if (emiToRevenue <= 0.3) {
    score += 100;
  }

  // 3. Consistency / Fraud Check
  if (loanAmount > monthlyRevenue * 10) {
    reasonCodes.push('DATA_INCONSISTENCY');
    score -= 200;
  } else {
    score += 100;
  }

  // 4. Tenure Adjustments
  if (loanTenure < 6 || loanTenure > 60) {
    reasonCodes.push('RISKY_TENURE');
    score -= 50;
  } else if (loanTenure >= 12 && loanTenure <= 36) {
    score += 100;
  }

  // Final Decision
  const criticalReasons = ['DATA_INCONSISTENCY'];
  const hasCritical = reasonCodes.some(code => criticalReasons.includes(code));
  
  // Requirement: score >= 650 and no critical reasons
  const finalScore = Math.min(Math.max(score, 0), 1000);
  const approved = finalScore >= 650 && !hasCritical;
  const status = approved ? 'Approved' : 'Rejected';

  // Risk Level
  let riskLevel = 'HIGH';
  if (finalScore >= 800 && !hasCritical) {
    riskLevel = 'LOW';
  } else if (finalScore >= 650) {
    riskLevel = 'MEDIUM';
  }

  return {
    score: finalScore,
    status,
    riskLevel,
    reasonCodes: reasonCodes.length > 0 ? reasonCodes : ['CLEAN_PROFILE'],
    emi: Math.round(emi),
    breakdown: {
      emiToRevenue: parseFloat(emiToRevenue.toFixed(4)),
      revenueMultiple: parseFloat(revenueMultiple.toFixed(2))
    }
  };
};

module.exports = { processDecision };
