import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './AuthPages.css';

export default function ProfilePage() {
  const { user, updateProfile, changePassword } = useAuth();
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await updateProfile(profileForm);
      setMessage('Profile updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Profile update failed.');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await changePassword(passwordForm);
      setMessage('Password changed successfully.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Password change failed.');
    }
  };

  return (
    <div className="profile-page">
      <h1>My Profile</h1>
      <p className="profile-meta">
        Role: <strong>{user?.roles?.join(', ')}</strong> · User ID: <strong>{user?.userId}</strong>
      </p>

      {message && <div className="auth-success">{message}</div>}
      {error && <div className="auth-error">{error}</div>}

      <div className="profile-grid">
        <form className="auth-card" onSubmit={handleProfileSubmit}>
          <h2>Update Profile</h2>
          <label htmlFor="fullName">Full Name</label>
          <input id="fullName" value={profileForm.fullName} onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })} required />

          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} required />

          <label htmlFor="phone">Phone</label>
          <input id="phone" value={profileForm.phoneNumber} onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })} />

          <button type="submit" className="auth-btn">Save Profile</button>
        </form>

        <form className="auth-card" onSubmit={handlePasswordSubmit}>
          <h2>Change Password</h2>
          <label htmlFor="currentPassword">Current Password</label>
          <input id="currentPassword" type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} required />

          <label htmlFor="newPassword">New Password</label>
          <input id="newPassword" type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} required />

          <label htmlFor="confirmNewPassword">Confirm New Password</label>
          <input id="confirmNewPassword" type="password" value={passwordForm.confirmNewPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value })} required />

          <button type="submit" className="auth-btn">Change Password</button>
        </form>
      </div>
    </div>
  );
}
