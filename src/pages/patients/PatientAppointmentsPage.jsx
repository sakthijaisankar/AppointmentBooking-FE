import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMyAppointments, useUpdateAppointmentStatus } from '../../hooks/useAppointment';
import './AppointmentPages.css';

export default function PatientAppointmentsPage() {
  const { data: appointments, isLoading, error, refetch } = useMyAppointments();
  const { mutate: updateStatus, isPending: updatingStatus } = useUpdateAppointmentStatus();
  
  const [cancellingAptId, setCancellingAptId] = useState(null);
  const [cancelNotes, setCancelNotes] = useState('');
  const [cancelError, setCancelError] = useState('');

  if (isLoading) {
    return <div className="appointment-page"><p>Loading appointments...</p></div>;
  }

  if (error) {
    return (
      <div className="appointment-page">
        <div className="patient-error">Failed to load appointments: {error.message}</div>
      </div>
    );
  }

  const handleCancelClick = (aptId) => {
    setCancellingAptId(aptId);
    setCancelNotes('');
    setCancelError('');
  };

  const handleCancelConfirm = () => {
    updateStatus(
      { id: cancellingAptId, statusName: 'Cancelled', notes: cancelNotes },
      {
        onSuccess: () => {
          setCancellingAptId(null);
          refetch();
        },
        onError: (err) => {
          setCancelError(err.response?.data?.message || 'Failed to cancel appointment. Please try again.');
        },
      }
    );
  };

  // Group appointments
  const upcomingStatuses = ['Pending', 'Confirmed', 'InProgress'];
  const upcoming = (appointments || []).filter((a) => upcomingStatuses.includes(a.statusName));
  const past = (appointments || []).filter((a) => !upcomingStatuses.includes(a.statusName));

  const formatDateTime = (dateTimeStr) => {
    const d = new Date(dateTimeStr);
    return d.toLocaleString([], {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="appointment-page">
      <div className="page-header">
        <h1>My Appointments</h1>
        <p>View your scheduled clinic consultations, doctor details, and visit history.</p>
      </div>

      {/* Upcoming appointments section */}
      <section style={{ marginBottom: '3rem' }}>
        <h2>Upcoming Appointments</h2>
        {upcoming.length === 0 ? (
          <div className="wizard-card" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
            <p>You have no upcoming consultations scheduled.</p>
          </div>
        ) : (
          <div className="appointment-list-grid">
            {upcoming.map((apt) => (
              <div key={apt.appointmentId} className="appointment-card">
                <div className="apt-main-info">
                  <div className="apt-number-row">
                    <span className="apt-num">{apt.appointmentNumber}</span>
                    <span className={`status-badge ${apt.statusName.toLowerCase()}`}>
                      {apt.statusName}
                    </span>
                    {apt.currentPriorityLevelName && (
                      <span
                        className="priority-badge"
                        style={{ backgroundColor: apt.currentPriorityColorHex || '#6b7280' }}
                      >
                        {apt.currentPriorityLevelName}
                      </span>
                    )}
                  </div>
                  <div className="apt-details">
                    <strong>Practitioner:</strong> {apt.doctorName} ({apt.specializationName})
                  </div>
                  <div className="apt-date-time">
                    <strong>Scheduled For:</strong> {formatDateTime(apt.scheduledDateTime)}
                  </div>
                  {apt.notes && (
                    <div className="notes-area">
                      <strong>Notes:</strong> {apt.notes}
                    </div>
                  )}
                </div>

                <div className="apt-actions">
                  {(apt.statusName === 'Pending' || apt.statusName === 'Confirmed') && (
                    <>
                      <Link
                        to={`/patient/submit-symptoms/${apt.appointmentId}`}
                        className="action-btn-sm confirm"
                        style={{ textDecoration: 'none', display: 'inline-block' }}
                      >
                        Symptom Report
                      </Link>
                      <button
                        type="button"
                        className="action-btn-sm cancel"
                        onClick={() => handleCancelClick(apt.appointmentId)}
                      >
                        Cancel Visit
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Past/Cancelled appointments section */}
      <section>
        <h2>Past & Cancelled Consultations</h2>
        {past.length === 0 ? (
          <div className="wizard-card" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
            <p>No historical visits or cancellations found.</p>
          </div>
        ) : (
          <div className="appointment-list-grid">
            {past.map((apt) => (
              <div key={apt.appointmentId} className="appointment-card" style={{ opacity: 0.8 }}>
                <div className="apt-main-info">
                  <div className="apt-number-row">
                    <span className="apt-num">{apt.appointmentNumber}</span>
                    <span className={`status-badge ${apt.statusName.toLowerCase()}`}>
                      {apt.statusName}
                    </span>
                  </div>
                  <div className="apt-details">
                    <strong>Practitioner:</strong> {apt.doctorName} ({apt.specializationName})
                  </div>
                  <div className="apt-date-time">
                    <strong>Scheduled For:</strong> {formatDateTime(apt.scheduledDateTime)}
                  </div>
                  {apt.notes && (
                    <div className="notes-area">
                      <strong>Notes:</strong> {apt.notes}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Cancellation confirmation modal */}
      {cancellingAptId && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Cancel Clinic Visit</h3>
            <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#4b5563' }}>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </p>

            {cancelError && <div className="patient-error" style={{ marginBottom: '1rem' }}>{cancelError}</div>}

            <div className="form-group">
              <label>Reason for Cancellation (Optional)</label>
              <textarea
                rows={3}
                placeholder="Please state why you are cancelling..."
                value={cancelNotes}
                onChange={(e) => setCancelNotes(e.target.value)}
              />
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary"
                disabled={updatingStatus}
                onClick={() => setCancellingAptId(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn-primary"
                style={{ backgroundColor: '#dc2626' }}
                disabled={updatingStatus}
                onClick={handleCancelConfirm}
              >
                {updatingStatus ? 'Cancelling...' : 'Cancel Appointment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
