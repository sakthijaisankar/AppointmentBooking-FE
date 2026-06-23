import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../../api/authService';
import './AuthPages.css';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    token: searchParams.get('token') || '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await resetPassword(form);
      setSuccess('Password reset successfully. You can now sign in.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const errors = err.response?.data?.errors;
      setError(errors?.join(', ') || err.response?.data?.message || 'Reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Reset Password</h1>

        <label htmlFor="token">Reset Token</label>
        <input id="token" value={form.token} onChange={(e) => setForm({ ...form, token: e.target.value })} required />

        <label htmlFor="newPassword">New Password</label>
        <input id="newPassword" type="password" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} required />

        <label htmlFor="confirmNewPassword">Confirm New Password</label>
        <input id="confirmNewPassword" type="password" value={form.confirmNewPassword} onChange={(e) => setForm({ ...form, confirmNewPassword: e.target.value })} required />

        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}

        <button type="submit" className="auth-btn" disabled={loading}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>

        <div className="auth-links">
          <Link to="/login">Back to sign in</Link>
        </div>
      </form>
    </div>
  );
}
