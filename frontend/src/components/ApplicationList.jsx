import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ApplicationList = ({ token, onAuthError }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const [reviewingApp, setReviewingApp] = useState(null);
  const [viewingHistory, setViewingHistory] = useState(null);

  const riskColors = {
    LOW: '#10b981',
    MEDIUM: '#f59e0b',
    HIGH: '#ef4444'
  };

  const fetchApplications = async (statusFilter = '') => {
    setLoading(true);
    try {
      const url = statusFilter 
        ? `${BASE_URL}/api/applications?status=${statusFilter}`
        : `${BASE_URL}/api/applications`;
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setApplications(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch applications', err);
      if (err.response?.status === 401) {
        onAuthError();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOverride = async (appId, status, notes) => {
    try {
      const response = await axios.patch(`${BASE_URL}/api/applications/${appId}/override`, {
        status,
        notes
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setReviewingApp(null);
        fetchApplications(filter);
      }
    } catch (err) {
      console.error('Failed to override application', err);
      if (err.response?.status === 401) {
        onAuthError();
      }
    }
  };
  useEffect(() => {
    fetchApplications(filter);
  }, [filter]);

  return (
    <div className="card fade-in" style={{ maxWidth: '1000px', marginTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>Application Audit Trail</h2>
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          style={{ width: 'auto', margin: 0 }}
        >
          <option value="">All Statuses</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="Pending">Pending</option>
        </select>
      </div>

      {loading ? (
        <p>Loading audit trail...</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.8rem' }}>Business</th>
                <th style={{ padding: '0.8rem' }}>Date</th>
                <th style={{ padding: '0.8rem' }}>Amount</th>
                <th style={{ padding: '0.8rem' }}>Score</th>
                <th style={{ padding: '0.8rem' }}>Risk</th>
                <th style={{ padding: '0.8rem' }}>Status</th>
                <th style={{ padding: '0.8rem' }}>Processing</th>
                <th style={{ padding: '0.8rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.8rem' }}>
                    {app.businessName}<br/>
                    <small style={{ color: 'var(--text-muted)' }}>{app.pan}</small>
                  </td>
                  <td style={{ padding: '0.8rem' }}>{new Date(app.submittedAt).toLocaleDateString()}</td>
                  <td style={{ padding: '0.8rem' }}>₹{app.loanAmount.toLocaleString()}</td>
                  <td style={{ padding: '0.8rem' }}>{app.creditScore}</td>
                  <td style={{ padding: '0.8rem' }}>
                    <span style={{ 
                      color: riskColors[app.riskLevel] || 'var(--text-muted)',
                      fontSize: '0.8rem', fontWeight: 'bold'
                    }}>
                      {app.riskLevel}
                    </span>
                  </td>
                  <td style={{ padding: '0.8rem' }}>
                    <span className={`reason-tag`} style={{ 
                      color: app.status === 'Approved' ? 'var(--success)' : (app.status === 'Rejected' ? 'var(--error)' : 'var(--warning)'),
                      borderColor: app.status === 'Approved' ? 'var(--success)' : (app.status === 'Rejected' ? 'var(--error)' : 'var(--warning)')
                    }}>
                      {app.status}
                    </span>
                    {app.overrides && app.overrides.length > 0 && (
                      <div 
                        style={{ fontSize: '0.7rem', color: 'var(--success)', marginTop: '0.2rem', cursor: 'pointer' }}
                        onClick={() => setViewingHistory(app)}
                      >
                        ⓘ View History
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '0.8rem' }}>{app.processingTimeMs || 0}ms</td>
                  <td style={{ padding: '0.8rem' }}>
                    <button 
                      className="reset-btn" 
                      style={{ margin: 0, padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}
                      onClick={() => setReviewingApp(app)}
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
              {applications.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No applications found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* History Modal */}
      {viewingHistory && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <div className="card fade-in" style={{ maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3>Audit History</h3>
              <button 
                className="reset-btn" 
                style={{ margin: 0, padding: '0.3rem 0.8rem' }} 
                onClick={() => setViewingHistory(null)}
              >
                Close
              </button>
            </div>
            
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Decision history for <strong>{viewingHistory.businessName}</strong>
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[...viewingHistory.overrides].reverse().map((override, i) => (
                <div key={i} style={{ 
                  padding: '1rem', background: 'rgba(255,255,255,0.05)', 
                  borderRadius: '0.75rem', borderLeft: '4px solid var(--primary)' 
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>
                      {override.previousStatus} → {override.newStatus}
                    </span>
                    <small style={{ color: 'var(--text-muted)' }}>
                      {new Date(override.reviewedAt).toLocaleString()}
                    </small>
                  </div>
                  <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>"{override.note}"</p>
                  <small style={{ color: 'var(--text-muted)' }}>
                    Reviewed by: <strong>{override.reviewedByName}</strong> ({override.reviewedById})
                  </small>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewingApp && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <div className="card fade-in" style={{ maxWidth: '500px' }}>
            <h3>Manual Review</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Overriding decision for <strong>{reviewingApp.businessName}</strong>
            </p>
            
            <ReviewForm 
              onClose={() => setReviewingApp(null)} 
              onSubmit={(status, notes) => handleOverride(reviewingApp._id, status, notes)} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

const ReviewForm = ({ onClose, onSubmit }) => {
  const [status, setStatus] = useState('Approved');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(status, notes);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="input-group" style={{ marginBottom: '1rem' }}>
        <label>Final Decision</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="Approved">Approve</option>
          <option value="Rejected">Reject</option>
        </select>
      </div>
      <div className="input-group" style={{ marginBottom: '1.5rem' }}>
        <label>Review Notes (Justification)</label>
        <textarea 
          value={notes} 
          onChange={(e) => setNotes(e.target.value)}
          required
          rows="3"
          placeholder="e.g. Audited bank statements show sufficient cash flow..."
          style={{ width: '100%', resize: 'none' }}
        />
      </div>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button type="button" className="reset-btn full-width" onClick={onClose}>Cancel</button>
        <button type="submit" className="full-width">Submit Decision</button>
      </div>
    </form>
  );
};

export default ApplicationList;
