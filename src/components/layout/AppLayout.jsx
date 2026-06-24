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
        <div className="app-nav__brand-box">
          <Link to="/dashboard" className="app-nav__brand">
            <span className="brand-logo">🏥</span> ClinixCare
          </Link>
        </div>

        <div className="app-nav__menu">
          <Link to="/dashboard" className="nav-menu-link">Dashboard</Link>
          {hasAnyRole(['Admin', 'Doctor', 'Receptionist']) && (
            <>
              <Link to="/admin/dashboard" className="nav-menu-link">Analytics</Link>
              <Link to="/staff/patients" className="nav-menu-link">Patients</Link>
              <Link to="/staff/appointments" className="nav-menu-link">Appointments</Link>
              <Link to="/admin/queue" className="nav-menu-link">Queue Board</Link>
              <Link to="/admin/doctors" className="nav-menu-link">Doctors</Link>
            </>
          )}
          {hasAnyRole(['Patient']) && (
            <>
              <Link to="/patient/profile" className="nav-menu-link">My Health</Link>
              <Link to="/doctors" className="nav-menu-link">Find Doctors</Link>
              <Link to="/patient/book-appointment" className="nav-menu-link">Book Consult</Link>
              <Link to="/patient/appointments" className="nav-menu-link">My Booking</Link>
              <Link to="/patient/queue" className="nav-menu-link">Queue Status</Link>
            </>
          )}
        </div>

        <div className="app-nav__user-zone">
          <Link to="/notifications" className="app-nav__bell" title="My Notifications">
            🔔
            {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
          </Link>
          <div className="app-nav__user-pill">
            <span className="user-icon">👤</span>
            <span className="user-name" title={user?.fullName}>{user?.fullName?.split(' ')[0]}</span>
          </div>
          <button type="button" className="app-nav__logout-btn" onClick={handleLogout}>
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
