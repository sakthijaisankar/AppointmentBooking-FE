import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDoctors, useSpecializations, useDoctorSchedules } from '../../hooks/useDoctor';
import './DoctorPages.css';

export default function DoctorBrowsePage() {
  const [search, setSearch] = useState('');
  const [specFilter, setSpecFilter] = useState('');
  const [page, setPage] = useState(1);
  const { data: doctorsData, isLoading: loadingDoctors } = useDoctors(search, specFilter ? parseInt(specFilter, 10) : undefined, page);
  const { data: specializations } = useSpecializations();

  return (
    <div className="doctor-page">
      <h1>Find a Doctor</h1>
      <p className="page-subtitle">Browse clinical specialists and check their weekly work schedules.</p>

      <div className="doctor-filter-bar">
        <input
          className="doctor-search"
          placeholder="Search by doctor name..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <select
          className="doctor-select-filter"
          value={specFilter}
          onChange={(e) => { setSpecFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Specializations</option>
          {(specializations || []).map((s) => (
            <option key={s.specializationId} value={s.specializationId}>{s.specializationName}</option>
          ))}
        </select>
      </div>

      {loadingDoctors ? (
        <p>Loading specialists...</p>
      ) : (
        <>
          <div className="doctor-card-grid">
            {(doctorsData?.items || []).map((d) => (
              <DoctorExpandableCard key={d.doctorId} doctor={d} />
            ))}
            {(doctorsData?.items || []).length === 0 && (
              <p className="no-data-text">No matching doctors found.</p>
            )}
          </div>

          <div className="doctor-pagination">
            <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
            <span>Page {page}</span>
            <button type="button" disabled={(doctorsData?.items || []).length < 10} onClick={() => setPage(page + 1)}>Next</button>
          </div>
        </>
      )}
    </div>
  );
}

function DoctorExpandableCard({ doctor }) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const { data: schedules, isLoading: loadingSchedules } = useDoctorSchedules(expanded ? doctor.doctorId : null);

  return (
    <div className={`doctor-browse-card ${expanded ? 'expanded' : ''}`}>
      <div className="card-top" onClick={() => setExpanded(!expanded)}>
        <div className="doctor-avatar">
          {doctor.firstName.charAt(0)}{doctor.lastName.charAt(0)}
        </div>
        <div className="doctor-info">
          <h3>Dr. {doctor.firstName} {doctor.lastName}</h3>
          <span className="spec-tag">{doctor.specializationName}</span>
          <span className="license-info">License: {doctor.licenseNumber}</span>
          <button
            type="button"
            className="patient-btn"
            style={{ marginTop: '0.5rem', padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/patient/book-appointment?doctorId=${doctor.doctorId}`);
            }}
          >
            Book Appointment
          </button>
        </div>
        <button type="button" className="expand-indicator-btn">
          {expanded ? '▲ Hide Hours' : '▼ View Hours'}
        </button>
      </div>

      {expanded && (
        <div className="card-schedules-drawer">
          <h4>Weekly Availability Schedules</h4>
          {loadingSchedules ? (
            <p>Loading work hours...</p>
          ) : (schedules || []).length === 0 ? (
            <p className="no-schedules-p">No active office hours registered.</p>
          ) : (
            <div className="schedules-grid-compact">
              {schedules.map((s) => (
                <div key={s.doctorScheduleId} className="schedule-compact-cell">
                  <span className="day-lbl">{s.dayName}</span>
                  <span className="time-lbl">{s.startTime} - {s.endTime}</span>
                  <span className="slot-lbl">{s.slotDurationMinutes} min slots</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
