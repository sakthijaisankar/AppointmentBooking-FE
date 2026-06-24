import { useParams, useNavigate } from 'react-router-dom';
import { useConsultationByAppointment } from '../../hooks/useConsultation';
import './ConsultationViewPage.css';

export default function ConsultationViewPage() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const aptIdInt = parseInt(appointmentId, 10);

  const {
    data: consultationResponse,
    isLoading,
    error
  } = useConsultationByAppointment(aptIdInt);

  const consultation = consultationResponse?.data;

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="prescription-view-container">
        <div className="spinner-container">
          <div className="spinner"></div>
          <span>Retrieving clinical record...</span>
        </div>
      </div>
    );
  }

  // Handle case where consultation is not found (404 status)
  const isNotFound = error?.response?.status === 404 || !consultation;

  if (isNotFound) {
    return (
      <div className="prescription-view-container">
        <div className="error-message" style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', color: '#b45309' }}>
          <strong>No consultation summary available yet:</strong> The consultation details and prescription slip have not yet been finalized by the consulting practitioner. Please check back shortly.
        </div>
        <button onClick={() => navigate(-1)} className="btn-back">
          ← Back to Appointments
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="prescription-view-container">
        <div className="error-message">
          Error retrieving prescription: {error.message || 'Failed to load details.'}
        </div>
        <button onClick={() => navigate(-1)} className="btn-back">
          ← Back
        </button>
      </div>
    );
  }

  const formattedDate = new Date(consultation.scheduledDateTime).toLocaleDateString([], {
    weekday: 'short',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const formattedTime = new Date(consultation.scheduledDateTime).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="prescription-view-container">
      {/* Action Header */}
      <div className="view-actions-header">
        <button onClick={() => navigate(-1)} className="btn-back">
          ← Back to Appointments
        </button>
        <button onClick={handlePrint} className="btn-print">
          🖨️ Print Prescription Slip
        </button>
      </div>

      {/* Official Rx Slip Card */}
      <div className="rx-slip-card">
        {/* Clinic Header */}
        <div className="rx-clinic-header">
          <div className="rx-clinic-title">
            <h2>HEALWELL MEDICAL CLINIC</h2>
            <p>100 Health Sciences Plaza, Suite 400</p>
            <p>Phone: (555) 019-2834 | Fax: (555) 019-2835</p>
          </div>
          <div className="rx-doctor-info">
            <h3 className="rx-doctor-name">Dr. {consultation.doctorName}</h3>
            <p className="rx-doctor-specialty">{consultation.specializationName}</p>
            <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: 0 }}>Lic No: LIC-{(consultation.doctorId * 179 + 3000)}</p>
          </div>
        </div>

        {/* Patient and Visit Details Grid */}
        <div className="rx-meta-grid">
          <div className="rx-meta-item">
            <span className="rx-meta-label">Patient Name:</span>
            <span className="rx-meta-value">{consultation.patientName}</span>
          </div>
          <div className="rx-meta-item">
            <span className="rx-meta-label">Consult Date:</span>
            <span className="rx-meta-value">{formattedDate}</span>
          </div>
          <div className="rx-meta-item">
            <span className="rx-meta-label">Patient Code:</span>
            <span className="rx-meta-value" style={{ fontFamily: 'monospace' }}>
              {consultation.patientCode}
            </span>
          </div>
          <div className="rx-meta-item">
            <span className="rx-meta-label">Time Registered:</span>
            <span className="rx-meta-value">{formattedTime}</span>
          </div>
          <div className="rx-meta-item">
            <span className="rx-meta-label">Appointment #:</span>
            <span className="rx-meta-value" style={{ fontFamily: 'monospace' }}>
              {consultation.appointmentNumber}
            </span>
          </div>
          <div className="rx-meta-item">
            <span className="rx-meta-label">Consulted By:</span>
            <span className="rx-meta-value">{consultation.consultedByName || `Dr. ${consultation.doctorName}`}</span>
          </div>
        </div>

        {/* Prescription Title Symbol */}
        <div className="rx-symbol-label">℞</div>

        {/* Prescriptions Medication Table */}
        <table className="rx-prescriptions-table">
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Medication Description</th>
              <th style={{ width: '130px', textAlign: 'left' }}>Dosage</th>
              <th style={{ width: '180px', textAlign: 'left' }}>Frequency</th>
              <th style={{ width: '100px', textAlign: 'right' }}>Duration</th>
            </tr>
          </thead>
          <tbody>
            {(!consultation.prescriptions || consultation.prescriptions.length === 0) ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem' }}>
                  No medications were prescribed during this visit.
                </td>
              </tr>
            ) : (
              consultation.prescriptions.map((pres) => (
                <tr key={pres.prescriptionId}>
                  <td>
                    <span className="rx-medicine-title">{pres.medicineName}</span>
                    {pres.instructions && (
                      <span className="rx-medicine-inst">Instructions: {pres.instructions}</span>
                    )}
                  </td>
                  <td>{pres.dosage}</td>
                  <td>{pres.frequency}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{pres.durationDays} Days</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Diagnosis, Clinical Notes, and Signature Footer */}
        <div className="rx-footer-grid">
          <div>
            <div className="rx-diagnosis-card">
              <h3>Primary Diagnosis</h3>
              <p>{consultation.diagnosis}</p>
            </div>
            {consultation.clinicalNotes && (
              <div className="rx-notes-card">
                <h3>Clinical Advice & Summary</h3>
                <p>{consultation.clinicalNotes}</p>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', justifyContent: 'space-between' }}>
            {consultation.followUpRequired && consultation.followUpDate ? (
              <div className="rx-followup-card">
                <span className="rx-followup-title">Follow-up Requested</span>
                <span className="rx-followup-date">
                  {new Date(consultation.followUpDate).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
                <span className="rx-followup-note">Please schedule this return visit at front reception.</span>
              </div>
            ) : (
              <div></div>
            )}

            <div className="rx-signature-area">
              <div className="rx-signature-line"></div>
              <span className="rx-signature-title">Authorized Practitioner Signature</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
