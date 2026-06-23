import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDoctors } from '../../hooks/useDoctor';
import { useAllAppointments } from '../../hooks/useAppointment';
import { useActiveQueue, useCheckInPatient, useUpdateQueueStatus } from '../../hooks/useQueue';
import './QueueDashboardPage.css';

export default function QueueDashboardPage() {
  const navigate = useNavigate();
  const [selectedDoctorId, setSelectedDoctorId] = useState('');

  // Fetch doctors for filter
  const { data: doctorsData } = useDoctors('', undefined, 1);
  const doctorsList = doctorsData?.items || [];

  // Fetch active queue
  const { data: queueData, isLoading: loadingQueue, error: queueError } = useActiveQueue(
    selectedDoctorId ? parseInt(selectedDoctorId, 10) : undefined
  );
  const queueEntries = queueData?.data || [];

  // Fetch today's confirmed appointments for check-in
  // Confirmed status ID is typically 2 (verify from lookup or use statusName filter)
  const { data: appointmentsData, isLoading: loadingAppointments } = useAllAppointments(
    '',
    undefined, // fetch all, filter today's confirmed in JS
    1
  );
  
  const checkInMutation = useCheckInPatient();
  const updateStatusMutation = useUpdateQueueStatus();

  // Filter today's confirmed appointments that are not already checked in
  const todayDateStr = new Date().toDateString();
  const checkInReadyAppointments = (appointmentsData?.items || []).filter((apt) => {
    const isToday = new Date(apt.scheduledDateTime).toDateString() === todayDateStr;
    const isConfirmed = apt.statusName === 'Confirmed';
    
    // Ensure not already checked in
    const isAlreadyInQueue = queueEntries.some((q) => q.appointmentId === apt.appointmentId);
    
    return isToday && isConfirmed && !isAlreadyInQueue;
  });

  const handleCheckIn = (appointmentId, hasPriority) => {
    if (!hasPriority) {
      alert('Please classify patient priority first.');
      return;
    }
    checkInMutation.mutate(appointmentId);
  };

  const handleStatusUpdate = (queueId, statusCode) => {
    updateStatusMutation.mutate({ queueId, statusCode });
  };

  return (
    <div className="queue-dashboard">
      <header className="page-header">
        <div>
          <h1>Queue Management Board</h1>
          <p className="page-subtitle">Real-time triage queue, patient flows, and check-in controls.</p>
        </div>
        
        <div className="filter-controls">
          <label htmlFor="doctor-select">Filter by Practitioner:</label>
          <select
            id="doctor-select"
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
            className="filter-select"
          >
            <option value="">All Doctors</option>
            {doctorsList.map((doc) => (
              <option key={doc.doctorId} value={doc.doctorId}>
                Dr. {doc.firstName} {doc.lastName} ({doc.specializationName})
              </option>
            ))}
          </select>
        </div>
      </header>

      {queueError && (
        <div className="error-alert">Error loading queue data: {queueError.message}</div>
      )}

      <div className="dashboard-grid">
        {/* Left Section: Active Queue Board */}
        <section className="active-queue-section">
          <div className="section-header">
            <h2>Active Consultation Queue</h2>
            <span className="badge-count">{queueEntries.length} Patients Active</span>
          </div>

          {loadingQueue ? (
            <p className="loading-text">Loading live queue entries...</p>
          ) : queueEntries.length === 0 ? (
            <div className="empty-queue-state">
              <div className="icon">✓</div>
              <h3>No Patients Waiting</h3>
              <p>Queue is empty. Check in patients from the side panel when they arrive.</p>
            </div>
          ) : (
            <div className="queue-list">
              {queueEntries.map((item, index) => {
                const isFirst = index === 0;
                return (
                  <div 
                    key={item.queueId} 
                    className={`queue-card ${item.queueStatus.statusCode.toLowerCase()} ${isFirst ? 'next-up' : ''}`}
                  >
                    <div className="queue-badge-container">
                      <div className="queue-num">{item.queueNumber}</div>
                      <span 
                        className="priority-badge" 
                        style={{ backgroundColor: item.priorityColorHex }}
                      >
                        {item.priorityLevelCode}
                      </span>
                    </div>

                    <div className="queue-details">
                      <h3>{item.patientName}</h3>
                      <div className="sub-detail">
                        <span>Patient Code: <strong>{item.patientCode}</strong></span>
                        <span className="dot">•</span>
                        <span>Practitioner: <strong>{item.doctorName}</strong></span>
                      </div>
                      <div className="time-details">
                        <span>Checked In: {new Date(item.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="dot">•</span>
                        <span className={`status-pill ${item.queueStatus.statusCode.toLowerCase()}`}>
                          {item.queueStatus.statusName}
                        </span>
                      </div>
                    </div>

                    <div className="wait-time-indicator">
                      <div className="time-val">{item.estimatedWaitTimeMinutes}</div>
                      <div className="time-lbl">mins wait</div>
                    </div>

                    <div className="queue-actions">
                      {item.queueStatus.statusCode === 'WAITING' && (
                        <button
                          type="button"
                          className="btn-call"
                          onClick={() => handleStatusUpdate(item.queueId, 'CALLING')}
                          disabled={updateStatusMutation.isPending}
                        >
                          Call Patient
                        </button>
                      )}

                      {item.queueStatus.statusCode === 'CALLING' && (
                        <button
                          type="button"
                          className="btn-start"
                          onClick={() => handleStatusUpdate(item.queueId, 'IN_CONSULTATION')}
                          disabled={updateStatusMutation.isPending}
                        >
                          Start Visit
                        </button>
                      )}

                      {item.queueStatus.statusCode === 'IN_CONSULTATION' && (
                        <div className="btn-group">
                          <button
                            type="button"
                            className="btn-complete"
                            onClick={() => handleStatusUpdate(item.queueId, 'COMPLETED')}
                            disabled={updateStatusMutation.isPending}
                          >
                            Complete
                          </button>
                          <button
                            type="button"
                            className="btn-skip"
                            onClick={() => handleStatusUpdate(item.queueId, 'SKIPPED')}
                            disabled={updateStatusMutation.isPending}
                          >
                            No Show
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Right Section: Today's Scheduled Appointments (Check-In) */}
        <section className="check-in-section">
          <h2>Check-In Registry (Today)</h2>
          <p className="description-text">Select checked-in patients to assign queue tickets.</p>

          {loadingAppointments ? (
            <p className="loading-text">Loading today's schedule...</p>
          ) : checkInReadyAppointments.length === 0 ? (
            <div className="empty-registry-state">
              <p>No appointments pending check-in for today.</p>
            </div>
          ) : (
            <div className="check-in-list">
              {checkInReadyAppointments.map((apt) => {
                const hasPriority = !!apt.currentPriorityLevelName;
                return (
                  <div key={apt.appointmentId} className="check-in-card">
                    <div className="check-in-info">
                      <div className="title">
                        <h4>{apt.patientName}</h4>
                        <span className="time">
                          {new Date(apt.scheduledDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="doctor">Assignee: {apt.doctorName}</div>
                      
                      <div className="triage-status">
                        Triage: {' '}
                        {hasPriority ? (
                          <span 
                            className="priority-label-sm"
                            style={{ color: apt.currentPriorityColorHex }}
                          >
                            {apt.currentPriorityLevelName}
                          </span>
                        ) : (
                          <span className="unclassified-lbl">Pending Classification</span>
                        )}
                      </div>
                    </div>

                    <div className="check-in-action">
                      {hasPriority ? (
                        <button
                          type="button"
                          className="btn-checkin"
                          onClick={() => handleCheckIn(apt.appointmentId, true)}
                          disabled={checkInMutation.isPending}
                        >
                          Check In
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn-classify"
                          onClick={() => navigate(`/admin/patient-priority/${apt.patientId}`)}
                        >
                          Classify
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
