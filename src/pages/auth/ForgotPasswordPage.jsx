import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../api/authService';
import './AuthPages.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setResetToken('');
    setLoading(true);
    try {
      const response = await forgotPassword(email);
      setMessage(response.data.message);
      if (response.data.resetToken) {
        setResetToken(response.data.resetToken);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Request failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Forgot Password</h1>
        <p className="auth-subtitle">Enter your email to receive a reset link</p>

        <label htmlFor="email">Email</label>
        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        {error && <div className="auth-error">{error}</div>}
        {message && <div className="auth-success">{message}</div>}
        {resetToken && (
          <div className="auth-dev-token">
            <strong>Dev reset token:</strong>
            <code>{resetToken}</code>
            <Link to={`/reset-password?token=${encodeURIComponent(resetToken)}`}>Reset password</Link>
          </div>
        )}

        <button type="submit" className="auth-btn" disabled={loading}>
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>

        <div className="auth-links">
          <Link to="/login">Back to sign in</Link>
        </div>
      </form>
    </div>
  );
}
