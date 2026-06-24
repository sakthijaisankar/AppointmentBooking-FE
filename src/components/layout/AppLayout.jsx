import { Link, useNavigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotificationUnreadCount } from '../../hooks/useNotification';
import './AppLayout.css';

export default function AppLayout() {
  const { user, logout, hasAnyRole } = useAuth();
  const navigate = useNavigate();

  const { data: unreadResponse } = useNotificationUnreadCount();
  const unreadCount = unreadResponse?.data || 0;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      <nav className="app-nav">
        <Link to="/dashboard" className="app-nav__brand">
          Clinic Appointment Booking
        </Link>
        <div className="app-nav__links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/profile">Profile</Link>
          {hasAnyRole(['Admin', 'Doctor', 'Receptionist']) && (
            <>
              <Link to="/admin/dashboard">Admin Dashboard</Link>
              <Link to="/staff/patients">Patients</Link>
              <Link to="/staff/appointments">Appointments</Link>
              <Link to="/admin/patient-priority/1">Patient Priority</Link>
              <Link to="/admin/doctors">Manage Doctors</Link>
              <Link to="/admin/queue">Queue Board</Link>
              <Link to="/admin/notifications/templates">Template Settings</Link>
            </>
          )}
          {hasAnyRole(['Patient']) && (
            <>
              <Link to="/patient/profile">My Health Profile</Link>
              <Link to="/doctors">Find Doctors</Link>
              <Link to="/patient/book-appointment">Book Appointment</Link>
              <Link to="/patient/appointments">My Appointments</Link>
              <Link to="/patient/queue">Queue Status</Link>
            </>
          )}
          <Link to="/notifications" className="app-nav__bell" title="My Notifications">
            🔔
            {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
          </Link>
          <span className="app-nav__user">{user?.fullName}</span>
          <button type="button" className="app-nav__logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
