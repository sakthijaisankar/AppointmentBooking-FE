import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDoctors, useCreateDoctor, useSpecializations } from '../../hooks/useDoctor';
import './DoctorPages.css';

export default function DoctorListPage() {
  const [search, setSearch] = useState('');
  const [specFilter, setSpecFilter] = useState('');
  const [page, setPage] = useState(1);
  const { data: doctorsData, isLoading: loadingDoctors } = useDoctors(search, specFilter ? parseInt(specFilter, 10) : undefined, page);
  const { data: specializations } = useSpecializations();
  const createDoctorMutation = useCreateDoctor();

  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({
    clinicId: 1, // Default to 1 (Downtown Medical Center)
    userId: '',
    firstName: '',
    lastName: '',
    specializationId: '',
    licenseNumber: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await createDoctorMutation.mutateAsync({
        ...form,
        userId: parseInt(form.userId, 10),
        specializationId: parseInt(form.specializationId, 10),
      });
      setSuccess('Doctor profile created successfully!');
      setForm({
        clinicId: 1,
        userId: '',
        firstName: '',
        lastName: '',
        specializationId: '',
        licenseNumber: '',
      });
      setShowAddForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create doctor profile.');
    }
  };

  return (
    <div className="doctor-page">
      <div className="doctor-header-row">
        <h1>Doctors Directory</h1>
        <button type="button" className="doctor-btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Cancel' : 'Add Doctor Profile'}
        </button>
      </div>

      {success && <div className="doctor-success">{success}</div>}
      {error && <div className="doctor-error">{error}</div>}

      {showAddForm && (
        <form className="doctor-card doctor-form-add" onSubmit={handleAddDoctor}>
          <h2>New Doctor Profile</h2>
          <p className="form-info-text">Make sure the user is already created in system and assigned the "Doctor" role.</p>
          <div className="doctor-grid">
            <div>
              <label>User ID</label>
              <input type="number" value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })} required />
            </div>
            <div>
              <label>License Number</label>
              <input value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} required />
            </div>
            <div>
              <label>First Name</label>
              <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
            </div>
            <div>
              <label>Last Name</label>
              <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
            </div>
            <div>
              <label>Specialization</label>
              <select value={form.specializationId} onChange={(e) => setForm({ ...form, specializationId: e.target.value })} required>
                <option value="">Select Specialization</option>
                {(specializations || []).map((s) => (
                  <option key={s.specializationId} value={s.specializationId}>{s.specializationName}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Clinic ID</label>
              <input type="number" value={form.clinicId} onChange={(e) => setForm({ ...form, clinicId: e.target.value })} required />
            </div>
          </div>
          <button type="submit" className="doctor-btn-primary mt-3" disabled={createDoctorMutation.isPending}>
            {createDoctorMutation.isPending ? 'Creating...' : 'Create Profile'}
          </button>
        </form>
      )}

      <div className="doctor-filter-bar">
        <input
          className="doctor-search"
          placeholder="Search doctor name or license..."
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
        <p>Loading doctors...</p>
      ) : (
        <>
          <table className="doctor-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Specialization</th>
                <th>License Number</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(doctorsData?.items || []).map((d) => (
                <tr key={d.doctorId}>
                  <td>Dr. {d.firstName} {d.lastName}</td>
                  <td>{d.specializationName}</td>
                  <td>{d.licenseNumber}</td>
                  <td>
                    <span className={`status-badge ${d.isActive ? 'active' : 'inactive'}`}>
                      {d.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <Link to={`/admin/doctors/${d.doctorId}`} className="doctor-link-action">Manage Profile & Schedules</Link>
                  </td>
                </tr>
              ))}
              {(doctorsData?.items || []).length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No doctors found.</td>
                </tr>
              )}
            </tbody>
          </table>
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
