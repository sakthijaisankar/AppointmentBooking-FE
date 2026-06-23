import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMyPatientProfile } from '../../hooks/usePatient';
import { useDoctors, useSpecializations, useDoctorSchedules } from '../../hooks/useDoctor';
import { useAvailableSlots, useBookAppointment } from '../../hooks/useAppointment';
import './AppointmentPages.css';

export default function BookAppointmentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialDoctorId = searchParams.get('doctorId');

  const { data: patientProfile, isLoading: loadingProfile } = useMyPatientProfile();
  const { data: specializations, isLoading: loadingSpecs } = useSpecializations();

  // Wizard state
  const [step, setStep] = useState(1);
  const [selectedSpec, setSelectedSpec] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState(initialDoctorId || '');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [reason, setReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch doctors for selected specialization
  const { data: doctorsData, isLoading: loadingDocs } = useDoctors(
    '',
    selectedSpec ? parseInt(selectedSpec, 10) : undefined,
    1
  );

  const doctors = doctorsData?.items || [];
  const selectedDoctor = doctors.find((d) => d.doctorId === parseInt(selectedDoctorId, 10));

  // If initial doctor is provided, fetch details
  useEffect(() => {
    if (initialDoctorId && doctors.length > 0) {
      const doc = doctors.find((d) => d.doctorId === parseInt(initialDoctorId, 10));
      if (doc) {
        setSelectedSpec(doc.specializationId.toString());
        setSelectedDoctorId(initialDoctorId);
      }
    }
  }, [initialDoctorId, doctors]);

  // Fetch schedules for the doctor
  const { data: doctorSchedules } = useDoctorSchedules(selectedDoctorId ? parseInt(selectedDoctorId, 10) : null);

  // Fetch available slots
  const { data: availableSlots, isLoading: loadingSlots } = useAvailableSlots(
    selectedDoctorId ? parseInt(selectedDoctorId, 10) : null,
    selectedDate
  );

  const { mutate: bookMutate, isPending: bookingPending } = useBookAppointment();

  // Get minimum date (today) in YYYY-MM-DD format
  const getMinDateStr = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleNext = () => {
    if (step === 1 && !selectedDoctorId) {
      setErrorMsg('Please select a doctor to proceed.');
      return;
    }
    if (step === 2 && !selectedDate) {
      setErrorMsg('Please select an appointment date to proceed.');
      return;
    }
    if (step === 3 && !selectedTimeSlot) {
      setErrorMsg('Please select a time slot to proceed.');
      return;
    }
    setErrorMsg('');
    setStep(step + 1);
  };

  const handleBack = () => {
    setErrorMsg('');
    setStep(step - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setErrorMsg('Please enter the reason for your visit.');
      return;
    }

    if (!patientProfile) {
      setErrorMsg('No active patient profile found. Please register a profile first.');
      return;
    }

    const scheduledDateTime = new Date(`${selectedDate}T${selectedTimeSlot.startTime}`);

    const bookingPayload = {
      patientId: patientProfile.patientId,
      doctorId: parseInt(selectedDoctorId, 10),
      clinicId: selectedDoctor.clinicId,
      scheduledDateTime: scheduledDateTime.toISOString(),
      reasonForVisit: reason,
    };

    bookMutate(bookingPayload, {
      onSuccess: () => {
        navigate('/patient/appointments');
      },
      onError: (err) => {
        setErrorMsg(err.response?.data?.message || 'Failed to book appointment. Please try again.');
      },
    });
  };

  if (loadingProfile) {
    return <div className="appointment-page"><p>Loading profile...</p></div>;
  }

  // If patient does not have a profile, redirect/prompt
  if (!patientProfile) {
    return (
      <div className="appointment-page">
        <div className="wizard-card text-center" style={{ textAlign: 'center', padding: '3rem' }}>
          <h2>Profile Required</h2>
          <p style={{ margin: '1rem 0 2rem' }}>You must configure your Patient Health Profile before you can book appointments.</p>
          <button type="button" className="btn-primary" onClick={() => navigate('/patient/profile')}>
            Set Up Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="appointment-page">
      <div className="page-header">
        <h1>Book an Appointment</h1>
        <p>Follow the steps below to schedule a visit with one of our clinical specialists.</p>
      </div>

      {/* Step Progress */}
      <div className="wizard-steps">
        <div className={`wizard-step ${step >= 1 ? (step > 1 ? 'completed' : 'active') : ''}`}>
          <span className="step-number">1</span>
          Select Doctor
        </div>
        <div className={`wizard-step ${step >= 2 ? (step > 2 ? 'completed' : 'active') : ''}`}>
          <span className="step-number">2</span>
          Choose Date
        </div>
        <div className={`wizard-step ${step >= 3 ? (step > 3 ? 'completed' : 'active') : ''}`}>
          <span className="step-number">3</span>
          Select Slot
        </div>
        <div className={`wizard-step ${step >= 4 ? 'active' : ''}`}>
          <span className="step-number">4</span>
          Confirm Visit
        </div>
      </div>

      {errorMsg && <div className="patient-error">{errorMsg}</div>}

      {/* Step Content */}
      <div className="wizard-content">
        {step === 1 && (
          <div className="wizard-card">
            <h2>Select Specialization and Doctor</h2>
            <p style={{ marginBottom: '1.5rem', color: '#6b7280' }}>
              Choose a medical department, then select a specialist from that department.
            </p>

            <div className="form-group">
              <label>Specialization / Department</label>
              <select
                value={selectedSpec}
                onChange={(e) => {
                  setSelectedSpec(e.target.value);
                  setSelectedDoctorId('');
                }}
                disabled={loadingSpecs}
              >
                <option value="">Select Specialization</option>
                {(specializations || []).map((s) => (
                  <option key={s.specializationId} value={s.specializationId}>
                    {s.specializationName}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Medical Practitioner</label>
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                disabled={!selectedSpec || loadingDocs}
              >
                <option value="">Select Doctor</option>
                {doctors.map((d) => (
                  <option key={d.doctorId} value={d.doctorId}>
                    Dr. {d.firstName} {d.lastName}
                  </option>
                ))}
              </select>
            </div>

            {selectedDoctor && (
              <div style={{ marginTop: '2rem', padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                <h4 style={{ marginBottom: '0.5rem' }}>Doctor Profile Info</h4>
                <p><strong>License Number:</strong> {selectedDoctor.licenseNumber}</p>
                <p><strong>Clinic:</strong> {selectedDoctor.clinicName || 'Main Clinic'}</p>
                
                {doctorSchedules && doctorSchedules.length > 0 && (
                  <div style={{ marginTop: '1rem' }}>
                    <h5 style={{ marginBottom: '0.25rem' }}>Weekly Shift Work Hours:</h5>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {doctorSchedules.map((s) => (
                        <div key={s.doctorScheduleId} style={{ background: '#fff', border: '1px solid #e5e7eb', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.85rem' }}>
                          <strong>{s.dayName}:</strong> {s.startTime} - {s.endTime}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="wizard-card">
            <h2>Select Appointment Date</h2>
            <p style={{ marginBottom: '1.5rem', color: '#6b7280' }}>
              Choose a future date for your appointment with <strong>Dr. {selectedDoctor?.firstName} {selectedDoctor?.lastName}</strong>.
            </p>

            <div className="form-group">
              <label>Appointment Date</label>
              <input
                type="date"
                min={getMinDateStr()}
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedTimeSlot(null);
                }}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="wizard-card">
            <h2>Select Time Slot</h2>
            <p style={{ marginBottom: '1.5rem', color: '#6b7280' }}>
              Select from the available time slots for <strong>{selectedDate}</strong>.
            </p>

            {loadingSlots ? (
              <p>Fetching doctor availability slots...</p>
            ) : (availableSlots || []).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', border: '1px dashed #d1d5db', borderRadius: '8px' }}>
                <p style={{ color: '#dc2626', fontWeight: 600 }}>No Slots Available</p>
                <p style={{ fontSize: '0.9rem', color: '#6b7280', marginTop: '0.5rem' }}>
                  The doctor is not scheduled to work on this day, or all scheduled slots are fully booked.
                </p>
              </div>
            ) : (
              <div className="slots-container">
                <div className="slots-grid">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.startTime}
                      type="button"
                      disabled={!slot.isAvailable}
                      className={`slot-btn ${selectedTimeSlot?.startTime === slot.startTime ? 'selected' : ''}`}
                      onClick={() => setSelectedTimeSlot(slot)}
                    >
                      {slot.startTime}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="wizard-card">
            <h2>Confirm Visit Details</h2>
            <p style={{ marginBottom: '1.5rem', color: '#6b7280' }}>
              Review your scheduled appointment details and tell us the reason for your clinic visit.
            </p>

            <div className="summary-grid">
              <div className="summary-item">
                <span className="summary-label">Doctor</span>
                <span className="summary-value">Dr. {selectedDoctor?.firstName} {selectedDoctor?.lastName}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Department</span>
                <span className="summary-value">{selectedDoctor?.specializationName}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Scheduled Date</span>
                <span className="summary-value">{selectedDate}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Selected Time</span>
                <span className="summary-value">{selectedTimeSlot?.startTime} - {selectedTimeSlot?.endTime}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Reason for Visit</label>
                <textarea
                  rows={4}
                  placeholder="Please briefly describe your primary symptoms or reason for scheduling..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              <div style={{ display: 'none' }}>
                <input type="submit" />
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Wizard Navigation */}
      <div className="wizard-actions">
        {step > 1 ? (
          <button type="button" className="btn-secondary" onClick={handleBack}>
            Back
          </button>
        ) : (
          <div />
        )}

        {step < 4 ? (
          <button type="button" className="btn-primary" onClick={handleNext}>
            Next
          </button>
        ) : (
          <button
            type="button"
            className="btn-primary"
            disabled={bookingPending || !reason.trim()}
            onClick={handleSubmit}
          >
            {bookingPending ? 'Scheduling...' : 'Confirm and Book'}
          </button>
        )}
      </div>
    </div>
  );
}
