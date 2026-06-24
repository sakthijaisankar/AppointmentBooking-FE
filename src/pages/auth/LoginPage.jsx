import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AuthPages.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-split-left">
        <div className="auth-brand-content">
          <div className="brand-icon">🏥</div>
          <span className="brand-name">ClinixCare</span>
          <h2 className="brand-tagline">Advanced Patient Triage & Queue Intelligence</h2>
          <p className="brand-description">
            Experience next-generation clinical workflows powered by ML-driven priority predictions, real-time consultation tracking, and automated patient notifications.
          </p>
          <div className="feature-bullets">
            <div className="feature-bullet">
              <span className="bullet-icon">⚡</span>
              <div>
                <strong>ML Priority Triage:</strong> Immediate symptom severity assessment.
              </div>
            </div>
            <div className="feature-bullet">
              <span className="bullet-icon">📊</span>
              <div>
                <strong>Command Center:</strong> Real-time operations & demographic dashboard.
              </div>
            </div>
            <div className="feature-bullet">
              <span className="bullet-icon">🔔</span>
              <div>
                <strong>Omnichannel Alerts:</strong> Dynamic templates via Email, SMS & Push.
              </div>
            </div>
          </div>
        </div>
        <div className="auth-footer-text">© 2026 ClinixCare Systems. All rights reserved.</div>
      </div>

      <div className="auth-split-right">
        <div className="auth-form-wrapper">
          <div className="form-header">
            <h1>Welcome Back</h1>
            <p className="form-subtitle">Please sign in to access your dashboard</p>
          </div>

          <form className="auth-full-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="username">
                <span className="input-icon">👤</span> Username or Email
              </label>
              <input
                id="username"
                placeholder="Enter your username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                autoComplete="username"
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">
                <span className="input-icon">🔒</span> Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                autoComplete="current-password"
                required
              />
            </div>

            {error && <div className="auth-error-banner">⚠️ {error}</div>}

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? 'Authenticating credentials...' : 'Sign In to Dashboard'}
            </button>
          </form>

          <div className="auth-extra-links">
            <Link to="/forgot-password">Forgot password?</Link>
            <span className="separator">•</span>
            <Link to="/register">Create new account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
