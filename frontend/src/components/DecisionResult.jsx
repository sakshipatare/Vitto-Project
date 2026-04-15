import React from 'react';

const DecisionResult = ({ decision, onReset }) => {
  const { status, score, reasonCodes, estimatedEMI, processingTimeMs, riskLevel, breakdown } = decision;
  const isApproved = status === 'Approved';
  const isPending = status === 'Pending';

  const riskColors = {
    LOW: 'var(--success)',
    MEDIUM: 'var(--warning)',
    HIGH: 'var(--error)'
  };

  return (
    <div className="card fade-in result-container">
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div className={`status-badge ${isApproved ? 'status-approved' : (isPending ? 'status-pending' : 'status-rejected')}`}>
          {status.toUpperCase()}
        </div>
        
        <div className="status-badge" style={{ 
          background: 'rgba(255,255,255,0.05)', 
          color: riskColors[riskLevel], 
          borderColor: riskColors[riskLevel],
          border: '1px solid'
        }}>
          {riskLevel} RISK
        </div>
      </div>

      <div className="score-container">
        <p className="score-label">Credit Score</p>
        <h2 className="score-value">{score}</h2>
        <p className="score-label">out of 1000</p>
      </div>

      {breakdown && (
        <div className="metrics-grid" style={{ 
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', 
          marginBottom: '2rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '1rem' 
        }}>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>EMI / Revenue</p>
            <p style={{ fontWeight: '600' }}>{(breakdown.emiToRevenue * 100).toFixed(2)}%</p>
          </div>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Loan Multiple</p>
            <p style={{ fontWeight: '600' }}>{breakdown.revenueMultiple}x</p>
          </div>
        </div>
      )}

      {isApproved && estimatedEMI && (
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>Estimated Monthly Payment</p>
          <h3 style={{ fontSize: '1.5rem' }}>₹{estimatedEMI.toLocaleString()}</h3>
        </div>
      )}

      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
          Decision Logic Markers:
        </p>
        <div className="reason-codes">
          {reasonCodes.map((code, index) => (
            <span key={index} className="reason-tag">
              {code.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      </div>

      {processingTimeMs && (
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem', fontStyle: 'italic' }}>
          System Processing Time: {processingTimeMs}ms
        </div>
      )}

      <button onClick={onReset} className="full-width reset-btn">
        New Application
      </button>
    </div>
  );
};

export default DecisionResult;
