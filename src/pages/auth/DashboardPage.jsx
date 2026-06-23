import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AuthPages.css';

export default function DashboardPage() {
  const { user, hasAnyRole } = useAuth();

  return (
    <div className="dashboard-page">
      <h1>Welcome, {user?.fullName}</h1>
      <p>You are signed in as <strong>{user?.roles?.join(', ')}</strong>.</p>

      <div className="dashboard-cards">
        <Link to="/profile" className="dashboard-card">My Profile</Link>
        {hasAnyRole(['Patient']) && (
          <Link to="/patient/profile" className="dashboard-card">My Health Profile</Link>
        )}
        {hasAnyRole(['Admin', 'Doctor', 'Receptionist']) && (
          <Link to="/staff/patients" className="dashboard-card">Patient Registry</Link>
        )}
        {hasAnyRole(['Admin', 'Doctor', 'Receptionist']) && (
          <Link to="/admin/patient-priority/1" className="dashboard-card">Patient Priority</Link>
        )}
        {hasAnyRole(['Patient']) && (
          <span className="dashboard-card dashboard-card--muted">Appointments (coming soon)</span>
        )}
      </div>
    </div>
  );
}

export function UnauthorizedPage() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Access Denied</h1>
        <p className="auth-subtitle">You do not have permission to view this page.</p>
        <Link to="/dashboard" className="auth-btn" style={{ display: 'inline-block', textAlign: 'center', textDecoration: 'none' }}>
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
