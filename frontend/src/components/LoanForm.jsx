import React, { useState } from 'react';

const LoanForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    businessName: '',
    pan: '',
    businessType: 'retail',
    monthlyRevenue: '',
    loanAmount: '',
    loanTenure: '',
    loanPurpose: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="card fade-in">
      <form onSubmit={handleSubmit} className="form-grid">
        <div className="input-group full-width">
          <label>Business Name</label>
          <input
            type="text"
            name="businessName"
            value={formData.businessName}
            onChange={handleChange}
            required
            placeholder="e.g. Phoenix Enterprises"
          />
        </div>

        <div className="input-group">
          <label>PAN Number</label>
          <input
            type="text"
            name="pan"
            value={formData.pan}
            onChange={handleChange}
            required
            placeholder="ABCDE1234F"
            pattern="^[A-Z]{5}[0-9]{4}[A-Z]{1}$"
          />
        </div>

        <div className="input-group">
          <label>Business Type</label>
          <select name="businessType" value={formData.businessType} onChange={handleChange}>
            <option value="retail">Retail</option>
            <option value="manufacturing">Manufacturing</option>
            <option value="services">Services</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="input-group">
          <label>Monthly Revenue (₹)</label>
          <input
            type="number"
            name="monthlyRevenue"
            value={formData.monthlyRevenue}
            onChange={handleChange}
            required
            min="0"
            placeholder="500000"
          />
        </div>

        <div className="input-group">
          <label>Requested Amount (₹)</label>
          <input
            type="number"
            name="loanAmount"
            value={formData.loanAmount}
            onChange={handleChange}
            required
            min="0"
            placeholder="1000000"
          />
        </div>

        <div className="input-group">
          <label>Tenure (Months)</label>
          <input
            type="number"
            name="loanTenure"
            value={formData.loanTenure}
            onChange={handleChange}
            required
            min="1"
            max="120"
            placeholder="24"
          />
        </div>

        <div className="input-group">
          <label>Loan Purpose</label>
          <input
            type="text"
            name="loanPurpose"
            value={formData.loanPurpose}
            onChange={handleChange}
            required
            placeholder="Working Capital"
          />
        </div>

        <button type="submit" className="full-width" disabled={loading}>
          {loading ? 'Processing Decision...' : 'Generate Credit Decision'}
        </button>
      </form>
    </div>
  );
};

export default LoanForm;
