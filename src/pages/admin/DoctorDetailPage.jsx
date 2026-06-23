import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  useDoctor,
  useUpdateDoctor,
  useAddDoctorSchedule,
  useDeleteDoctorSchedule,
  useSpecializations,
} from '../../hooks/useDoctor';
import './DoctorPages.css';

const daysOfWeek = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

export default function DoctorDetailPage() {
  const { doctorId: doctorIdParam } = useParams();
  const doctorId = parseInt(doctorIdParam, 10);

  const { data: doctor, isLoading: loadingDoctor } = useDoctor(doctorId);
  const { data: specializations } = useSpecializations();
  const updateDoctorMutation = useUpdateDoctor();
  const addScheduleMutation = useAddDoctorSchedule();
  const deleteScheduleMutation = useDeleteDoctorSchedule();

  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    specializationId: '',
    licenseNumber: '',
  });

  const [scheduleForm, setScheduleForm] = useState({
    dayOfWeek: 1, // Monday
    startTime: '09:00',
    endTime: '17:00',
    slotDurationMinutes: 15,
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (doctor) {
      setProfileForm({
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        specializationId: doctor.specializationId,
        licenseNumber: doctor.licenseNumber,
      });
    }
  }, [doctor]);

  if (loadingDoctor) return <div className="doctor-page">Loading doctor details...</div>;
  if (!doctor) return <div className="doctor-page">Doctor not found. <Link to="/admin/doctors">Back to directory</Link></div>;

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await updateDoctorMutation.mutateAsync({
        doctorId,
        doctorData: {
          ...profileForm,
          specializationId: parseInt(profileForm.specializationId, 10),
        },
      });
      setMessage('Doctor profile updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    }
  };

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await addScheduleMutation.mutateAsync({
        doctorId,
        scheduleData: {
          ...scheduleForm,
          dayOfWeek: parseInt(scheduleForm.dayOfWeek, 10),
          slotDurationMinutes: parseInt(scheduleForm.slotDurationMinutes, 10),
        },
      });
      setMessage('Schedule added successfully.');
      setScheduleForm({
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '17:00',
        slotDurationMinutes: 15,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add schedule.');
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (!window.confirm('Are you sure you want to delete this schedule timeframe?')) return;
    setMessage('');
    setError('');
    try {
      await deleteScheduleMutation.mutateAsync(scheduleId);
      setMessage('Schedule deleted successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete schedule.');
    }
  };

  return (
    <div className="doctor-page">
      <Link to="/admin/doctors" className="back-link">← Back to Doctors Directory</Link>
      
      <div className="doctor-detail-header">
        <h1>Dr. {doctor.firstName} {doctor.lastName}</h1>
        <p className="subtitle">Clinic: {doctor.clinicName} · License: {doctor.licenseNumber}</p>
      </div>

      {message && <div className="doctor-success">{message}</div>}
      {error && <div className="doctor-error">{error}</div>}

      <div className="doctor-detail-grid">
        {/* Profile Card */}
        <div className="doctor-card">
          <h2>Update Profile Info</h2>
          <form onSubmit={handleUpdateProfile}>
            <div className="form-group mb-3">
              <label>First Name</label>
              <input
                value={profileForm.firstName}
                onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                required
              />
            </div>
            <div className="form-group mb-3">
              <label>Last Name</label>
              <input
                value={profileForm.lastName}
                onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                required
              />
            </div>
            <div className="form-group mb-3">
              <label>Specialization</label>
              <select
                value={profileForm.specializationId}
                onChange={(e) => setProfileForm({ ...profileForm, specializationId: e.target.value })}
                required
              >
                <option value="">Select Specialization</option>
                {(specializations || []).map((s) => (
                  <option key={s.specializationId} value={s.specializationId}>{s.specializationName}</option>
                ))}
              </select>
            </div>
            <div className="form-group mb-3">
              <label>License Number</label>
              <input
                value={profileForm.licenseNumber}
                onChange={(e) => setProfileForm({ ...profileForm, licenseNumber: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="doctor-btn-primary" disabled={updateDoctorMutation.isPending}>
              {updateDoctorMutation.isPending ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Schedule & Availability Management */}
        <div className="doctor-card">
          <h2>Working Hours & Availability</h2>
          
          <div className="schedules-list mb-4">
            <h3>Active Schedules</h3>
            {(doctor.schedules || []).length === 0 ? (
              <p className="no-data-text">No work hours registered yet.</p>
            ) : (
              <ul className="schedules-ul">
                {doctor.schedules.map((s) => (
                  <li key={s.doctorScheduleId} className="schedule-li-item">
                    <span className="schedule-time-desc">
                      <strong>{s.dayName}</strong>: {s.startTime} - {s.endTime} ({s.slotDurationMinutes} min slots)
                    </span>
                    <button
                      type="button"
                      className="doctor-btn-danger-sm"
                      onClick={() => handleDeleteSchedule(s.doctorScheduleId)}
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <form onSubmit={handleAddSchedule} className="schedule-add-form">
            <h3>Add Timeframe Block</h3>
            <div className="doctor-grid">
              <div>
                <label>Day of Week</label>
                <select
                  value={scheduleForm.dayOfWeek}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, dayOfWeek: e.target.value })}
                  required
                >
                  {daysOfWeek.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Start Time</label>
                <input
                  type="time"
                  value={scheduleForm.startTime}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
                  required
                />
              </div>
              <div>
                <label>End Time</label>
                <input
                  type="time"
                  value={scheduleForm.endTime}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })}
                  required
                />
              </div>
              <div>
                <label>Slot Size (Min)</label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={scheduleForm.slotDurationMinutes}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, slotDurationMinutes: e.target.value })}
                  required
                />
              </div>
            </div>
            <button type="submit" className="doctor-btn-secondary mt-3" disabled={addScheduleMutation.isPending}>
              {addScheduleMutation.isPending ? 'Adding...' : 'Add Schedule Block'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
