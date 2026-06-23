import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AuthPages.css';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phoneNumber: '',
    roleName: 'Patient',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const errors = err.response?.data?.errors;
      setError(errors?.join(', ') || err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card auth-card--wide" onSubmit={handleSubmit}>
        <h1>Create Account</h1>
        <p className="auth-subtitle">Register as a patient to book appointments</p>

        <div className="auth-grid">
          <div>
            <label htmlFor="fullName">Full Name</label>
            <input id="fullName" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
          </div>
          <div>
            <label htmlFor="username">Username</label>
            <input id="username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
          </div>
          <div>
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <label htmlFor="phoneNumber">Phone</label>
            <input id="phoneNumber" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
          <div>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input id="confirmPassword" type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required />
          </div>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <button type="submit" className="auth-btn" disabled={loading}>
          {loading ? 'Creating account...' : 'Register'}
        </button>

        <div className="auth-links">
          <Link to="/login">Already have an account? Sign in</Link>
        </div>
      </form>
    </div>
  );
}
