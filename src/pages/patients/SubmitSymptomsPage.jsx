import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppointment } from '../../hooks/useAppointment';
import { useActiveSymptoms, useAppointmentSymptoms, useSubmitSymptoms } from '../../hooks/useSymptom';
import './AppointmentPages.css';

export default function SubmitSymptomsPage() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const aptIdInt = parseInt(appointmentId, 10);

  const { data: appointment, isLoading: loadingApt } = useAppointment(aptIdInt);
  const { data: activeSymptoms, isLoading: loadingActive } = useActiveSymptoms();
  const { data: existingSubmission, isLoading: loadingExisting } = useAppointmentSymptoms(aptIdInt);
  
  const { mutate: submitMutate, isPending: submitting } = useSubmitSymptoms();

  // Submission state
  const [selectedSymptoms, setSelectedSymptoms] = useState({}); // maps symptomId -> { severityLevel, notes }
  const [existingConditions, setExistingConditions] = useState('');
  const [generalNotes, setGeneralNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Pre-populate if editing an existing submission
  useEffect(() => {
    if (existingSubmission) {
      setExistingConditions(existingSubmission.existingConditions || '');
      setGeneralNotes(existingSubmission.submissionNotes || '');
      
      const mapped = {};
      existingSubmission.symptoms.forEach((s) => {
        mapped[s.symptomId] = {
          severityLevel: s.severityLevel,
          notes: s.notes || '',
        };
      });
      setSelectedSymptoms(mapped);
    }
  }, [existingSubmission]);

  const handleSymptomCheckbox = (symptomId) => {
    setSelectedSymptoms((prev) => {
      const next = { ...prev };
      if (next[symptomId]) {
        delete next[symptomId];
      } else {
        next[symptomId] = { severityLevel: 5, notes: '' }; // default severity 5
      }
      return next;
    });
  };

  const handleSeverityChange = (symptomId, val) => {
    setSelectedSymptoms((prev) => ({
      ...prev,
      [symptomId]: {
        ...prev[symptomId],
        severityLevel: parseInt(val, 10),
      },
    }));
  };

  const handleSymptomNoteChange = (symptomId, text) => {
    setSelectedSymptoms((prev) => ({
      ...prev,
      [symptomId]: {
        ...prev[symptomId],
        notes: text,
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const symptomList = Object.keys(selectedSymptoms).map((id) => ({
      symptomId: parseInt(id, 10),
      severityLevel: selectedSymptoms[id].severityLevel,
      notes: selectedSymptoms[id].notes || null,
    }));

    if (symptomList.length === 0) {
      setErrorMsg('Please select at least one symptom to submit.');
      return;
    }

    const payload = {
      appointmentId: aptIdInt,
      existingConditions: existingConditions.trim() || null,
      notes: generalNotes.trim() || null,
      symptoms: symptomList,
    };

    submitMutate(
      { appointmentId: aptIdInt, submissionData: payload },
      {
        onSuccess: () => {
          navigate('/patient/appointments');
        },
        onError: (err) => {
          setErrorMsg(err.response?.data?.message || 'Failed to submit symptoms. Please try again.');
        },
      }
    );
  };

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

  const isLoading = loadingApt || loadingActive || loadingExisting;

  if (isLoading) {
    return <div className="appointment-page"><p>Loading symptoms workflow...</p></div>;
  }

  if (!appointment) {
    return (
      <div className="appointment-page">
        <div className="patient-error">Appointment not found.</div>
      </div>
    );
  }

  return (
    <div className="appointment-page">
      <div className="page-header">
        <h1>Submit Symptoms</h1>
        <p>Report symptom checklists, severity indices, and health conditions before your consultation.</p>
      </div>

      <div className="wizard-card" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--accent, #aa3bff)' }}>
        <h3>Appointment Summary</h3>
        <p style={{ marginTop: '0.5rem' }}><strong>Appointment Number:</strong> {appointment.appointmentNumber}</p>
        <p><strong>Practitioner:</strong> Dr. {appointment.doctorName} ({appointment.specializationName})</p>
        <p><strong>Scheduled Date:</strong> {formatDateTime(appointment.scheduledDateTime)}</p>
      </div>

      {errorMsg && <div className="patient-error">{errorMsg}</div>}

      <form onSubmit={handleSubmit} className="wizard-card">
        <h2>Select Symptoms & Severity Indices</h2>
        <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Select the checkbox next to any symptoms you are experiencing. For each selected symptom, use the slider to grade its severity (1 = minimal discomfort, 10 = extreme severity).
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
          {(activeSymptoms || []).map((sym) => {
            const isSelected = !!selectedSymptoms[sym.symptomId];
            return (
              <div
                key={sym.symptomId}
                style={{
                  border: isSelected ? '1px solid var(--accent, #aa3bff)' : '1px solid var(--border, #e5e7eb)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  background: isSelected ? 'rgba(170, 59, 255, 0.02)' : 'transparent',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <input
                    type="checkbox"
                    id={`sym-chk-${sym.symptomId}`}
                    checked={isSelected}
                    onChange={() => handleSymptomCheckbox(sym.symptomId)}
                    style={{ width: '18px', height: '18px', marginTop: '3px', cursor: 'pointer' }}
                  />
                  <div style={{ flex: 1 }}>
                    <label
                      htmlFor={`sym-chk-${sym.symptomId}`}
                      style={{ fontWeight: 'bold', cursor: 'pointer', display: 'block', fontSize: '1.05rem' }}
                    >
                      {sym.symptomName}
                    </label>
                    <span style={{ fontSize: '0.85rem', color: '#6b7280', display: 'block', marginTop: '0.25rem' }}>
                      {sym.description}
                    </span>
                  </div>
                </div>

                {isSelected && (
                  <div style={{ marginTop: '1.25rem', borderTop: '1px solid #f3f4f6', paddingTop: '1rem' }}>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Severity level (1 - 10):</span>
                        <strong style={{ color: 'var(--accent, #aa3bff)', fontSize: '1.1rem' }}>
                          {selectedSymptoms[sym.symptomId].severityLevel} / 10
                        </strong>
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={selectedSymptoms[sym.symptomId].severityLevel}
                        onChange={(e) => handleSeverityChange(sym.symptomId, e.target.value)}
                        style={{ width: '100%', cursor: 'pointer' }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#9ca3af' }}>
                        <span>Mild</span>
                        <span>Moderate</span>
                        <span>Severe</span>
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Symptom-specific notes / Duration (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Started 3 days ago, hurts worst in mornings..."
                        value={selectedSymptoms[sym.symptomId].notes || ''}
                        onChange={(e) => handleSymptomNoteChange(sym.symptomId, e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <hr style={{ border: 0, borderTop: '1px solid #e5e7eb', margin: '2rem 0' }} />

        <div className="form-group">
          <label>Existing Medical Conditions / Comorbidities (Optional)</label>
          <textarea
            rows={3}
            placeholder="e.g. Asthma, Diabetes, Hypertension, heart conditions..."
            value={existingConditions}
            onChange={(e) => setExistingConditions(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>General Submission Notes / Symptoms Summary (Optional)</label>
          <textarea
            rows={4}
            placeholder="Include any general comments about how you are feeling, body temperature, recent hospital visits, etc."
            value={generalNotes}
            onChange={(e) => setGeneralNotes(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate('/patient/appointments')}
            disabled={submitting}
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Save & Submit'}
          </button>
        </div>
      </form>
    </div>
  );
}
