import { useMyPatientProfile } from '../../hooks/usePatient';
import { usePatientQueueStatus } from '../../hooks/useQueue';
import './PatientQueuePage.css';

export default function PatientQueuePage() {
  const { data: profile, isLoading: loadingProfile } = useMyPatientProfile();
  
  const patientId = profile?.patientId;
  const { data: queueStatusData, isLoading: loadingQueue, refetch } = usePatientQueueStatus(patientId);
  const status = queueStatusData?.data;

  if (loadingProfile || (patientId && loadingQueue)) {
    return (
      <div className="patient-queue-page loading">
        <div className="spinner"></div>
        <p>Loading your queue status details...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="patient-queue-page">
        <div className="status-card error">
          <h3>No Profile Found</h3>
          <p>Please complete your patient clinical profile before checking queue statistics.</p>
        </div>
      </div>
    );
  }

  const isCheckedIn = status?.isCheckedIn;

  return (
    <div className="patient-queue-page">
      <header className="page-header">
        <h1>My Live Queue Status</h1>
        <p className="page-subtitle">Track your appointment progress and estimated wait times in real time.</p>
      </header>

      {!isCheckedIn ? (
        <div className="status-card not-checked-in">
          <div className="status-icon info">ℹ</div>
          <h2>Not Currently in Queue</h2>
          <p className="status-desc">
            You do not have a live check-in record for today.
          </p>
          <div className="instructions-box">
            <h4>How to get in queue:</h4>
            <ol>
              <li>Ensure you have a confirmed appointment scheduled for today.</li>
              <li>When you arrive at the clinic, check in at the reception desk.</li>
              <li>Once checked in, this dashboard will update automatically with your ticket number.</li>
            </ol>
          </div>
          <button type="button" className="btn-refresh" onClick={() => refetch()}>
            Refresh Status
          </button>
        </div>
      ) : (
        <div className="queue-status-dashboard">
          {/* Main Ticket Glassmorphic Card */}
          <div className={`ticket-card ${status.statusCode.toLowerCase()}`}>
            <div className="ticket-header">
              <span className="clinic-title">Clinic Queue Pass</span>
              <span className={`status-badge ${status.statusCode.toLowerCase()}`}>
                {status.statusName}
              </span>
            </div>

            <div className="ticket-body">
              <div className="ticket-num-box">
                <span className="lbl">Ticket Number</span>
                <span className="num">{status.queueNumber}</span>
              </div>

              <div className="ticket-details">
                <div className="detail-item">
                  <span className="label">Practitioner</span>
                  <span className="value">{status.doctorName}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Patient Name</span>
                  <span className="value">{profile.firstName} {profile.lastName}</span>
                </div>
              </div>
            </div>

            <div className="ticket-footer">
              <div className="footer-circle left"></div>
              <div className="footer-circle right"></div>
              <p>Please keep this tab open. Vitals check is completed.</p>
            </div>
          </div>

          {/* Wait Time and Position Summary Metrics */}
          <div className="metrics-grid">
            <div className="metric-card wait-time">
              <div className="icon">⏳</div>
              <div className="info">
                <h3>Estimated Wait Time</h3>
                <div className="value">
                  {status.estimatedWaitTimeMinutes > 0 ? (
                    <>
                      <span>{status.estimatedWaitTimeMinutes}</span>
                      <span className="unit">mins</span>
                    </>
                  ) : (
                    <span className="immediate-val">Immediate</span>
                  )}
                </div>
                <p className="desc">Wait times are dynamic based on patient triage priority.</p>
              </div>
            </div>

            <div className="metric-card position">
              <div className="icon">👥</div>
              <div className="info">
                <h3>Patients Ahead</h3>
                <div className="value">
                  <span>{status.positionAhead}</span>
                </div>
                <p className="desc">
                  {status.statusCode === 'CALLING' ? (
                    <strong className="text-calling">You are being called! Enter room.</strong>
                  ) : status.statusCode === 'IN_CONSULTATION' ? (
                    <strong className="text-consulting">Currently in consultation.</strong>
                  ) : status.positionAhead === 0 ? (
                    <strong className="text-next">You are next in line!</strong>
                  ) : (
                    <span>Patients waiting ahead of your turn.</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="refresh-container">
            <button type="button" className="btn-refresh secondary" onClick={() => refetch()}>
              Update Wait Times
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
