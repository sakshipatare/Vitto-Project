import React, { useState } from 'react';
import axios from 'axios';
import LoanForm from './components/LoanForm';
import DecisionResult from './components/DecisionResult';
import ApplicationList from './components/ApplicationList';
import Login from './components/Login';
import './index.css';

const API_URL = 'http://localhost:5000/api/applications';

function App() {
  const [loading, setLoading] = useState(false);
  const [decision, setDecision] = useState(null);
  const [error, setError] = useState(null);
  const [view, setView] = useState('form'); // 'form', 'history', or 'login'
  const [token, setToken] = useState(localStorage.getItem('vitto_token'));

  const handleFormSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/submit`, formData);
      if (response.data.success) {
        setDecision(response.data.data.decision);
      } else {
        throw new Error(response.data.message || 'Failed to process application');
      }
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to process application. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setDecision(null);
    setError(null);
    setView('form');
  };

  const handleLoginSuccess = (newToken) => {
    setToken(newToken);
    localStorage.setItem('vitto_token', newToken);
    setView('history');
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('vitto_token');
    setView('form');
  };

  const navigateToHistory = () => {
    if (token) {
      setView('history');
    } else {
      setView('login');
    }
  };

  return (
    <div className="app-container">
      <header className="fade-in">
        <h1>Vitto Lending</h1>
        <p>Intelligent MSME Decisioning & Credit Scoring</p>
        
        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button 
            className={view === 'form' ? '' : 'reset-btn'} 
            style={{ margin: 0, padding: '0.5rem 1.5rem' }}
            onClick={() => setView('form')}
          >
            New Application
          </button>
          <button 
            className={(view === 'history' || view === 'login') ? '' : 'reset-btn'} 
            style={{ margin: 0, padding: '0.5rem 1.5rem' }}
            onClick={navigateToHistory}
          >
            Audit Trail
          </button>
          {token && (
            <button 
              className="reset-btn" 
              style={{ margin: 0, padding: '0.5rem 1.5rem', color: 'var(--error)', borderColor: 'var(--error)' }}
              onClick={handleLogout}
            >
              Sign Out
            </button>
          )}
        </div>
      </header>

      {error && (
        <div className="card fade-in" style={{ border: '1px solid var(--error)', padding: '1rem', color: 'var(--error)' }}>
          {error}
        </div>
      )}

      {view === 'form' ? (
        !decision ? (
          <LoanForm onSubmit={handleFormSubmit} loading={loading} />
        ) : (
          <DecisionResult decision={decision} onReset={handleReset} />
        )
      ) : view === 'login' ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (
        <ApplicationList token={token} onAuthError={handleLogout} />
      )}

      <footer style={{ marginTop: '2rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        &copy; 2026 Vitto Financial Systems. All rights reserved.
      </footer>
    </div>
  );
}

export default App;
