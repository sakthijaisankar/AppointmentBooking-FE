import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppointment } from '../../hooks/useAppointment';
import {
  useConsultationByAppointment,
  useCreateConsultation,
  useUpdateConsultation,
  useAddPrescription,
  useDeletePrescription
} from '../../hooks/useConsultation';
import './ConsultationFormPage.css';

export default function ConsultationFormPage() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const aptIdInt = parseInt(appointmentId, 10);

  // Fetch appointment details
  const { data: appointment, isLoading: loadingApt } = useAppointment(aptIdInt);

  // Fetch existing consultation
  const {
    data: consultationResponse,
    isLoading: loadingConsultation,
    error: consultationError,
    refetch: refetchConsultation
  } = useConsultationByAppointment(aptIdInt);

  // Check if consultation exists (if error is 404, it doesn't exist yet)
  const isNew = !consultationResponse || consultationError?.response?.status === 404;
  const consultation = consultationResponse?.data;

  // Mutations
  const createMutation = useCreateConsultation();
  const updateMutation = useUpdateConsultation(consultation?.consultationId);
  const addPrescriptionMutation = useAddPrescription(consultation?.consultationId);
  const deletePrescriptionMutation = useDeletePrescription(consultation?.consultationId);

  // Consultation fields
  const [diagnosis, setDiagnosis] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [followUpRequired, setFollowUpRequired] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');

  // Local prescriptions state (only used for creating new consultation)
  const [newPrescriptions, setNewPrescriptions] = useState([]);

  // Form input state for adding a single prescription (both for new and existing)
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medFreq, setMedFreq] = useState('');
  const [medDuration, setMedDuration] = useState('');
  const [medInst, setMedInst] = useState('');

  // Status/Error messages
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Pre-populate fields if editing
  useEffect(() => {
    if (consultation) {
      setDiagnosis(consultation.diagnosis || '');
      setClinicalNotes(consultation.clinicalNotes || '');
      setFollowUpRequired(consultation.followUpRequired || false);
      if (consultation.followUpDate) {
        setFollowUpDate(consultation.followUpDate);
      }
    }
  }, [consultation]);

  const handleAddLocalPrescription = (e) => {
    e.preventDefault();
    if (!medName || !medDosage || !medFreq || !medDuration) {
      alert('Please fill out all medicine details (Name, Dosage, Frequency, Duration).');
      return;
    }

    const durationInt = parseInt(medDuration, 10);
    if (isNaN(durationInt) || durationInt <= 0) {
      alert('Duration must be a positive number of days.');
      return;
    }

    // For new consultations, add to local array
    if (isNew) {
      setNewPrescriptions((prev) => [
        ...prev,
        {
          medicineName: medName,
          dosage: medDosage,
          frequency: medFreq,
          durationDays: durationInt,
          instructions: medInst || null,
        },
      ]);
      clearPrescriptionInputs();
    } else {
      // For existing consultations, add to DB immediately
      const payload = {
        medicineName: medName,
        dosage: medDosage,
        frequency: medFreq,
        durationDays: durationInt,
        instructions: medInst || null,
      };

      addPrescriptionMutation.mutate(payload, {
        onSuccess: () => {
          setSuccessMsg('Prescription added successfully.');
          clearPrescriptionInputs();
          refetchConsultation();
          setTimeout(() => setSuccessMsg(''), 3000);
        },
        onError: (err) => {
          setErrorMsg(err.response?.data?.message || 'Failed to add prescription.');
        },
      });
    }
  };

  const handleRemoveLocalPrescription = (index) => {
    setNewPrescriptions((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleRemoveDbPrescription = (prescriptionId) => {
    if (window.confirm('Are you sure you want to remove this prescription?')) {
      deletePrescriptionMutation.mutate(prescriptionId, {
        onSuccess: () => {
          setSuccessMsg('Prescription removed successfully.');
          refetchConsultation();
          setTimeout(() => setSuccessMsg(''), 3000);
        },
        onError: (err) => {
          setErrorMsg(err.response?.data?.message || 'Failed to delete prescription.');
        },
      });
    }
  };

  const clearPrescriptionInputs = () => {
    setMedName('');
    setMedDosage('');
    setMedFreq('');
    setMedDuration('');
    setMedInst('');
  };

  const handleSaveConsultation = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!diagnosis.trim()) {
      setErrorMsg('Diagnosis is a required field.');
      return;
    }

    const payloadDate = followUpRequired && followUpDate ? followUpDate : null;

    if (isNew) {
      // Create request payload
      const payload = {
        appointmentId: aptIdInt,
        diagnosis: diagnosis.trim(),
        clinicalNotes: clinicalNotes.trim() || null,
        followUpRequired,
        followUpDate: payloadDate,
        prescriptions: newPrescriptions,
      };

      createMutation.mutate(payload, {
        onSuccess: (res) => {
          setSuccessMsg('Consultation created successfully.');
          setTimeout(() => {
            navigate('/staff/appointments');
          }, 1500);
        },
        onError: (err) => {
          setErrorMsg(err.response?.data?.message || 'Failed to save consultation details.');
        },
      });
    } else {
      // Update request payload
      const payload = {
        diagnosis: diagnosis.trim(),
        clinicalNotes: clinicalNotes.trim() || null,
        followUpRequired,
        followUpDate: payloadDate,
      };

      updateMutation.mutate(payload, {
        onSuccess: () => {
          setSuccessMsg('Consultation updated successfully.');
          refetchConsultation();
          setTimeout(() => setSuccessMsg(''), 3000);
        },
        onError: (err) => {
          setErrorMsg(err.response?.data?.message || 'Failed to update consultation details.');
        },
      });
    }
  };

  const isLoading = loadingApt || (loadingConsultation && !consultationError);

  if (isLoading) {
    return (
      <div className="consultation-form-container">
        <div className="spinner-container">
          <div className="spinner"></div>
          <span>Loading consultation session...</span>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="consultation-form-container">
        <div className="error-message">Appointment record not found.</div>
        <button onClick={() => navigate('/staff/appointments')} className="btn-back">
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Ensure appointment status allows consultation (InProgress or Completed)
  const isAllowedStatus = appointment.statusName === 'InProgress' || appointment.statusName === 'Completed';

  return (
    <div className="consultation-form-container">
      <header className="page-header">
        <h1>{isNew ? 'Create Consultation Slip' : 'Modify Consultation Records'}</h1>
        <p className="subtitle">
          File prescription details, diagnosis checklists, and follow-up schedules.
        </p>
      </header>

      {/* Patient & Visit Information Header */}
      <div className="patient-summary-panel">
        <div className="summary-block">
          <span className="summary-block-label">Patient Details</span>
          <span className="summary-block-value">{appointment.patientName}</span>
          <span className="summary-block-sub">{appointment.patientCode || 'PAT-NEW'}</span>
        </div>
        <div className="summary-block">
          <span className="summary-block-label">Appointment #</span>
          <span className="summary-block-value" style={{ fontFamily: 'monospace' }}>
            {appointment.appointmentNumber}
          </span>
          <span className="summary-block-sub">
            Status: <strong style={{ color: appointment.statusName === 'Completed' ? '#4f46e5' : '#2563eb' }}>{appointment.statusName}</strong>
          </span>
        </div>
        <div className="summary-block">
          <span className="summary-block-label">Assigned Practitioner</span>
          <span className="summary-block-value">Dr. {appointment.doctorName}</span>
          <span className="summary-block-sub">{appointment.specializationName}</span>
        </div>
        <div className="summary-block">
          <span className="summary-block-label">Scheduled Date/Time</span>
          <span className="summary-block-value">
            {new Date(appointment.scheduledDateTime).toLocaleDateString([], {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </span>
          <span className="summary-block-sub">
            {new Date(appointment.scheduledDateTime).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
      </div>

      {!isAllowedStatus && (
        <div className="error-message" style={{ marginBottom: '2rem' }}>
          <strong>Caution:</strong> Current appointment status is "<strong>{appointment.statusName}</strong>". 
          Consultation records should only be filed when a patient is marked "InProgress" or "Completed".
        </div>
      )}

      {errorMsg && <div className="error-message">{errorMsg}</div>}
      {successMsg && <div className="success-message">{successMsg}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        {/* Main Consultation Form */}
        <form onSubmit={handleSaveConsultation}>
          <div className="form-card">
            <h2>Clinical Notes & Diagnosis</h2>
            
            <div className="form-group">
              <label htmlFor="diagnosis">Diagnosis (Required)</label>
              <textarea
                id="diagnosis"
                rows={3}
                placeholder="Enter final or provisional clinical diagnosis..."
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                disabled={!isAllowedStatus}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="clinicalNotes">Clinical Observations & Consultation Notes</label>
              <textarea
                id="clinicalNotes"
                rows={4}
                placeholder="Note general symptoms, physical examinations, vitals, test recommendations..."
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                disabled={!isAllowedStatus}
              />
            </div>
          </div>

          <div className="form-card">
            <h2>Follow-up Details</h2>
            
            <div className="followup-toggle-area">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  className="checkbox-input"
                  checked={followUpRequired}
                  onChange={(e) => setFollowUpRequired(e.target.checked)}
                  disabled={!isAllowedStatus}
                />
                Schedule follow-up visit for this patient
              </label>
            </div>

            {followUpRequired && (
              <div className="form-group" style={{ maxWidth: '300px' }}>
                <label htmlFor="followUpDate">Suggested Return Date</label>
                <input
                  type="date"
                  id="followUpDate"
                  value={followUpDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  disabled={!isAllowedStatus}
                  required={followUpRequired}
                />
              </div>
            )}
          </div>

          {/* Action buttons for main form */}
          <div className="form-actions-bar">
            <button
              type="button"
              className="btn-back"
              onClick={() => navigate('/staff/appointments')}
            >
              Back to Appointments
            </button>
            <button
              type="submit"
              className="btn-save"
              disabled={!isAllowedStatus || createMutation.isPending || updateMutation.isPending}
            >
              {isNew 
                ? (createMutation.isPending ? 'Filing...' : 'Save & Close Consultation')
                : (updateMutation.isPending ? 'Saving...' : 'Update Clinical Notes')
              }
            </button>
          </div>
        </form>

        {/* Prescriptions Section */}
        <div className="form-card">
          <h2>Prescribed Medications</h2>

          {/* List of current prescriptions */}
          <div className="prescription-table-wrapper">
            <table className="prescription-table">
              <thead>
                <tr>
                  <th>Medicine Name</th>
                  <th style={{ width: '120px' }}>Dosage</th>
                  <th style={{ width: '150px' }}>Frequency</th>
                  <th style={{ width: '100px' }}>Duration (Days)</th>
                  <th>Special Instructions</th>
                  <th style={{ width: '50px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {/* Render local prescriptions if new consultation */}
                {isNew && newPrescriptions.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', color: '#9ca3af', padding: '1.5rem' }}>
                      No medications added yet. Use the tool below to add medicines.
                    </td>
                  </tr>
                )}
                {isNew && newPrescriptions.map((pres, idx) => (
                  <tr key={idx}>
                    <td><strong>{pres.medicineName}</strong></td>
                    <td>{pres.dosage}</td>
                    <td>{pres.frequency}</td>
                    <td>{pres.durationDays} Days</td>
                    <td>{pres.instructions || '-'}</td>
                    <td>
                      <button
                        type="button"
                        className="btn-remove-row"
                        onClick={() => handleRemoveLocalPrescription(idx)}
                        title="Remove"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}

                {/* Render DB prescriptions if existing consultation */}
                {!isNew && (!consultation?.prescriptions || consultation.prescriptions.length === 0) && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', color: '#9ca3af', padding: '1.5rem' }}>
                      No medications added yet. Use the tool below to add medicines.
                    </td>
                  </tr>
                )}
                {!isNew && consultation?.prescriptions?.map((pres) => (
                  <tr key={pres.prescriptionId}>
                    <td><strong>{pres.medicineName}</strong></td>
                    <td>{pres.dosage}</td>
                    <td>{pres.frequency}</td>
                    <td>{pres.durationDays} Days</td>
                    <td>{pres.instructions || '-'}</td>
                    <td>
                      <button
                        type="button"
                        className="btn-remove-row"
                        disabled={deletePrescriptionMutation.isPending}
                        onClick={() => handleRemoveDbPrescription(pres.prescriptionId)}
                        title="Delete"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Prescription form row/area */}
          {isAllowedStatus && (
            <div style={{ background: '#f9fafb', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <h4 style={{ margin: '0 0 1rem 0', color: '#374151' }}>Add Medication</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.8rem' }}>Medicine Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Paracetamol 500mg"
                    value={medName}
                    onChange={(e) => setMedName(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.8rem' }}>Dosage</label>
                  <input
                    type="text"
                    placeholder="e.g. 1 tablet, 5ml"
                    value={medDosage}
                    onChange={(e) => setMedDosage(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.8rem' }}>Frequency</label>
                  <select value={medFreq} onChange={(e) => setMedFreq(e.target.value)}>
                    <option value="">-- Select --</option>
                    <option value="Once daily (OD)">Once daily (OD)</option>
                    <option value="Twice daily (BD)">Twice daily (BD)</option>
                    <option value="Three times daily (TD)">Three times daily (TD)</option>
                    <option value="Four times daily (QD)">Four times daily (QD)</option>
                    <option value="Every 4 hours">Every 4 hours</option>
                    <option value="As needed (PRN)">As needed (PRN)</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.8rem' }}>Duration (Days)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 5"
                    value={medDuration}
                    onChange={(e) => setMedDuration(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.8rem' }}>Special Instructions (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Take after meals with plenty of water"
                  value={medInst}
                  onChange={(e) => setMedInst(e.target.value)}
                />
              </div>
              <button
                type="button"
                className="btn-add-row"
                onClick={handleAddLocalPrescription}
                disabled={addPrescriptionMutation.isPending}
              >
                {addPrescriptionMutation.isPending ? 'Adding...' : '+ Add to Prescription List'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
