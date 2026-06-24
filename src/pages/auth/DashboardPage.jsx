import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './DashboardPage.css';

export default function DashboardPage() {
  const { user, hasAnyRole } = useAuth();
  const roles = user?.roles || [];

  const isStaff = hasAnyRole(['Admin', 'Doctor', 'Receptionist']);
  const isPatient = hasAnyRole(['Patient']);

  return (
    <div className="dashboard-portal">
      {/* Hero Welcome Banner */}
      <header className="portal-hero">
        <div className="hero-content">
          <span className="role-tag">{roles.join(' & ')} Portal</span>
          <h1>Welcome back, {user?.fullName}</h1>
          <p className="hero-sub">
            {isStaff 
              ? "Access administrative commands, patient registries, live queue boards, and clinical triage tools."
              : "Schedule clinical consultations, track your real-time queue position, and review medical prescriptions."}
          </p>
        </div>
        <div className="hero-badge-icon">🏥</div>
      </header>

      {/* Staff Dashboard */}
      {isStaff && (
        <section className="portal-section">
          <div className="section-title-bar">
            <h2>Operations Command Panel</h2>
            <p>Select a clinical module to manage operations</p>
          </div>

          <div className="command-grid">
            <Link to="/admin/dashboard" className="command-card primary-gradient">
              <div className="card-top">
                <span className="command-icon">📊</span>
                <span className="go-arrow">→</span>
              </div>
              <h3>Admin & Reports</h3>
              <p>View clinic performance analytics, monthly trends, emergency overrides, and demographic reports.</p>
            </Link>

            <Link to="/staff/appointments" className="command-card">
              <div className="card-top">
                <span className="command-icon">🗓️</span>
                <span className="go-arrow">→</span>
              </div>
              <h3>Manage Appointments</h3>
              <p>Review scheduled slots, confirm patient requests, filter bookings, and manage clinic calendars.</p>
            </Link>

            <Link to="/admin/queue" className="command-card">
              <div className="card-top">
                <span className="command-icon">🚨</span>
                <span className="go-arrow">→</span>
              </div>
              <h3>Live Queue Board</h3>
              <p>Check in patients, classify urgency, call next-up tokens, and monitor wait times in real-time.</p>
            </Link>

            <Link to="/staff/patients" className="command-card">
              <div className="card-top">
                <span className="command-icon">👥</span>
                <span className="go-arrow">→</span>
              </div>
              <h3>Patient Registry</h3>
              <p>Browse registered clinic patients, check health histories, and view priority predictions.</p>
            </Link>

            <Link to="/admin/doctors" className="command-card">
              <div className="card-top">
                <span className="command-icon">🥼</span>
                <span className="go-arrow">→</span>
              </div>
              <h3>Manage Doctors</h3>
              <p>Register new practitioners, configure clinic specializations, and audit clinical hours.</p>
            </Link>

            <Link to="/admin/notifications/templates" className="command-card">
              <div className="card-top">
                <span className="command-icon">⚙️</span>
                <span className="go-arrow">→</span>
              </div>
              <h3>Template Settings</h3>
              <p>Edit system notification alerts and configure SMS/Email auto-dispatch rules.</p>
            </Link>
          </div>
        </section>
      )}

      {/* Patient Dashboard */}
      {isPatient && (
        <section className="portal-section">
          <div className="section-title-bar">
            <h2>Patient Care Services</h2>
            <p>Manage your health records and consultations</p>
          </div>

          <div className="command-grid">
            <Link to="/patient/book-appointment" className="command-card primary-gradient">
              <div className="card-top">
                <span className="command-icon">📅</span>
                <span className="go-arrow">→</span>
              </div>
              <h3>Book Appointment</h3>
              <p>Schedule a consult with specialized practitioners, select date and time slots online.</p>
            </Link>

            <Link to="/patient/queue" className="command-card">
              <div className="card-top">
                <span className="command-icon">⏳</span>
                <span className="go-arrow">→</span>
              </div>
              <h3>Track Queue Status</h3>
              <p>Check your live queue position, estimated consultation delay, and active calling tokens.</p>
            </Link>

            <Link to="/patient/appointments" className="command-card">
              <div className="card-top">
                <span className="command-icon">📋</span>
                <span className="go-arrow">→</span>
              </div>
              <h3>My Appointments</h3>
              <p>View upcoming bookings, cancel slots, and download printable consultation reports.</p>
            </Link>

            <Link to="/patient/profile" className="command-card">
              <div className="card-top">
                <span className="command-icon">🩺</span>
                <span className="go-arrow">→</span>
              </div>
              <h3>My Health Profile</h3>
              <p>Update personal medical history, chronic conditions, and track recent logs.</p>
            </Link>
          </div>
        </section>
      )}
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
