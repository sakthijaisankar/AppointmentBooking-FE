import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAllAppointments, useStatuses, useUpdateAppointmentStatus } from '../../hooks/useAppointment';
import { useAppointmentSymptoms } from '../../hooks/useSymptom';
import '../patients/AppointmentPages.css';

export default function StaffAppointmentsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusId, setStatusId] = useState('');
  const [page, setPage] = useState(1);

  // Modal states
  const [symptomsModalAptId, setSymptomsModalAptId] = useState(null);
  const [selectedAptId, setSelectedAptId] = useState(null);
  const [targetStatusName, setTargetStatusName] = useState('');
  const [actionNotes, setActionNotes] = useState('');
  const [actionError, setActionError] = useState('');

  // Fetch statuses for filters
  const { data: statuses } = useStatuses();

  // Fetch appointments
  const { data: appointmentPaged, isLoading, error, refetch } = useAllAppointments(
    search,
    statusId ? parseInt(statusId, 10) : undefined,
    page
  );

  const { mutate: updateStatus, isPending: updatingStatus } = useUpdateAppointmentStatus();

  const handleActionClick = (aptId, statusName) => {
    setSelectedAptId(aptId);
    setTargetStatusName(statusName);
    setActionNotes('');
    setActionError('');
  };

  const handleActionConfirm = () => {
    updateStatus(
      { id: selectedAptId, statusName: targetStatusName, notes: actionNotes },
      {
        onSuccess: () => {
          setSelectedAptId(null);
          refetch();
        },
        onError: (err) => {
          setActionError(err.response?.data?.message || 'Failed to update status. Please try again.');
        },
      }
    );
  };

  const formatDateTime = (dateTimeStr) => {
    const d = new Date(dateTimeStr);
    return d.toLocaleString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (error) {
    return (
      <div className="appointment-page">
        <div className="patient-error">Failed to load appointments: {error.message}</div>
      </div>
    );
  }

  const items = appointmentPaged?.items || [];
  const totalCount = appointmentPaged?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / 10) || 1;

  return (
    <div className="appointment-page">
      <div className="page-header">
        <h1>Appointment Dashboard</h1>
        <p>Monitor patient registrations, manage visit statuses, and check priority classifications.</p>
      </div>

      <div className="staff-dashboard">
        {/* Search & Filter Bar */}
        <div className="filter-card">
          <input
            type="text"
            className="filter-input"
            placeholder="Search by Patient, Doctor or Apt #..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />

          <select
            className="filter-select"
            value={statusId}
            onChange={(e) => {
              setStatusId(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Statuses</option>
            {(statuses || []).map((s) => (
              <option key={s.appointmentStatusId} value={s.appointmentStatusId}>
                {s.statusName}
              </option>
            ))}
          </select>
        </div>

        {/* List Table */}
        {isLoading ? (
          <p>Loading dashboard records...</p>
        ) : (
          <div className="dashboard-table-container">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Apt Number</th>
                  <th>Patient</th>
                  <th>Practitioner</th>
                  <th>Scheduled Date</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((apt) => (
                  <tr key={apt.appointmentId}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{apt.appointmentNumber}</td>
                    <td>{apt.patientName}</td>
                    <td>
                      <div>{apt.doctorName}</div>
                      <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{apt.specializationName}</div>
                    </td>
                    <td>{formatDateTime(apt.scheduledDateTime)}</td>
                    <td>
                      <span className={`status-badge ${apt.statusName.toLowerCase()}`}>
                        {apt.statusName}
                      </span>
                    </td>
                    <td>
                      {apt.currentPriorityLevelName ? (
                        <span
                          className="priority-badge"
                          style={{ backgroundColor: apt.currentPriorityColorHex || '#6b7280' }}
                        >
                          {apt.currentPriorityLevelName}
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Unclassified</span>
                      )}
                    </td>
                    <td>
                      <div className="table-actions">
                        {apt.statusName === 'Pending' && (
                          <button
                            type="button"
                            className="action-btn-sm confirm"
                            onClick={() => handleActionClick(apt.appointmentId, 'Confirmed')}
                          >
                            Confirm
                          </button>
                        )}
                        {apt.statusName === 'Confirmed' && (
                          <button
                            type="button"
                            className="action-btn-sm start"
                            onClick={() => handleActionClick(apt.appointmentId, 'InProgress')}
                          >
                            Start Visit
                          </button>
                        )}
                        {apt.statusName === 'InProgress' && (
                          <button
                            type="button"
                            className="action-btn-sm complete"
                            onClick={() => handleActionClick(apt.appointmentId, 'Completed')}
                          >
                            Complete
                          </button>
                        )}
                        {(apt.statusName === 'InProgress' || apt.statusName === 'Completed') && (
                          <button
                            type="button"
                            className="action-btn-sm start"
                            onClick={() => navigate(`/admin/consultations/${apt.appointmentId}`)}
                          >
                            Consultation
                          </button>
                        )}
                        {(apt.statusName === 'Pending' ||
                          apt.statusName === 'Confirmed' ||
                          apt.statusName === 'InProgress') && (
                          <button
                            type="button"
                            className="action-btn-sm cancel"
                            onClick={() => handleActionClick(apt.appointmentId, 'Cancelled')}
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          type="button"
                          className="action-btn-sm start"
                          onClick={() => setSymptomsModalAptId(apt.appointmentId)}
                        >
                          Symptoms
                        </button>
                        <button
                          type="button"
                          className="action-btn-sm priority-btn"
                          onClick={() => navigate(`/admin/patient-priority/${apt.patientId}`)}
                        >
                          Triage
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                      No appointment records found matching criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls */}
        {!isLoading && items.length > 0 && (
          <div className="doctor-pagination">
            <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button type="button" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              Next
            </button>
          </div>
        )}
      </div>

      {/* Action modal for notes (Confirm, Start, Complete, Cancel) */}
      {selectedAptId && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Update Appointment State</h3>
            <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#4b5563' }}>
              You are changing the status to <strong>{targetStatusName}</strong>. You can optionally include clinical notes below.
            </p>

            {actionError && <div className="patient-error" style={{ marginBottom: '1rem' }}>{actionError}</div>}

            <div className="form-group">
              <label>Status Notes (Optional)</label>
              <textarea
                rows={3}
                placeholder="Include details about checked symptoms, check-in offsets, or cancellation reasons..."
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
              />
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary"
                disabled={updatingStatus}
                onClick={() => setSelectedAptId(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn-primary"
                disabled={updatingStatus}
                onClick={handleActionConfirm}
              >
                {updatingStatus ? 'Saving...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Symptoms details modal */}
      {symptomsModalAptId && (
        <SymptomDetailsModal
          appointmentId={symptomsModalAptId}
          onClose={() => setSymptomsModalAptId(null)}
        />
      )}
    </div>
  );
}

function SymptomDetailsModal({ appointmentId, onClose }) {
  const { data: submission, isLoading, error } = useAppointmentSymptoms(appointmentId);

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '650px', width: '95%' }}>
        <h3>Patient Symptom Report</h3>

        {isLoading ? (
          <p>Loading reported symptoms...</p>
        ) : error || !submission ? (
          <div style={{ textAlign: 'center', padding: '2rem', border: '1px dashed #d1d5db', borderRadius: '8px' }}>
            <p style={{ color: '#dc2626', fontWeight: 600 }}>No Symptoms Reported</p>
            <p style={{ fontSize: '0.9rem', color: '#6b7280', marginTop: '0.5rem' }}>
              The patient has not submitted any symptom checklist reports for this appointment yet.
            </p>
          </div>
        ) : (
          <div style={{ maxHeight: '450px', overflowY: 'auto', paddingRight: '0.5rem' }}>
            <p style={{ marginBottom: '1rem' }}>
              <strong>Appointment Number:</strong> {submission.appointmentNumber}<br />
              <strong>Patient Name:</strong> {submission.patientName}
            </p>

            {submission.existingConditions && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' }}>
                <strong style={{ color: '#991b1b', display: 'block', marginBottom: '0.25rem' }}>Existing Conditions / Comorbidities:</strong>
                <p style={{ fontSize: '0.95rem', color: '#7f1d1d', margin: 0 }}>{submission.existingConditions}</p>
              </div>
            )}

            <h4 style={{ marginBottom: '0.5rem' }}>Symptoms Checklist</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {submission.symptoms.map((s) => (
                <div key={s.patientSymptomId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9fafb', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                  <div style={{ flex: 1 }}>
                    <strong style={{ fontSize: '1rem' }}>{s.symptomName}</strong>
                    {s.notes && (
                      <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' }}>
                        Notes: {s.notes}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Severity:</span>
                    <strong style={{
                      background: s.severityLevel >= 8 ? '#fee2e2' : s.severityLevel >= 5 ? '#fef3c7' : '#d1fae5',
                      color: s.severityLevel >= 8 ? '#dc2626' : s.severityLevel >= 5 ? '#d97706' : '#059669',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '6px',
                      fontSize: '0.9rem'
                    }}>
                      {s.severityLevel} / 10
                    </strong>
                  </div>
                </div>
              ))}
            </div>

            {submission.submissionNotes && (
              <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', padding: '0.75rem', borderRadius: '8px' }}>
                <strong>General Submission Notes:</strong>
                <p style={{ fontSize: '0.95rem', color: '#4b5563', margin: '0.25rem 0 0' }}>{submission.submissionNotes}</p>
              </div>
            )}
          </div>
        )}

        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
