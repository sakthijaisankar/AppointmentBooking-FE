import { Link, useNavigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AppLayout.css';

export default function AppLayout() {
  const { user, logout, hasAnyRole } = useAuth();
  const navigate = useNavigate();

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
            <Link to="/staff/patients">Patients</Link>
            <Link to="/admin/patient-priority/1">Patient Priority</Link>
          </>
        )}
        {hasAnyRole(['Patient']) && (
          <Link to="/patient/profile">My Health Profile</Link>
        )}
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
