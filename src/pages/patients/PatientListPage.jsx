import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePatients } from '../../hooks/usePatient';
import './PatientPages.css';

export default function PatientListPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = usePatients(search, page);

  return (
    <div className="patient-page">
      <h1>Patients</h1>
      <input
        className="patient-search"
        placeholder="Search by name, code, email..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
      />

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <>
          <table className="patient-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>DOB</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {(data?.items || []).map((p) => (
                <tr key={p.patientId}>
                  <td>{p.patientCode}</td>
                  <td>{p.fullName}</td>
                  <td>{p.email || '—'}</td>
                  <td>{p.phoneNumber || '—'}</td>
                  <td>{p.dateOfBirth}</td>
                  <td>
                    <Link to={`/staff/patients/${p.patientId}`}>View</Link>
                    {' · '}
                    <Link to={`/admin/patient-priority/${p.patientId}`}>Priority</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="patient-pagination">
            <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
            <span>Page {page}</span>
            <button type="button" disabled={(data?.items?.length || 0) < 10} onClick={() => setPage(page + 1)}>Next</button>
          </div>
        </>
      )}
    </div>
  );
}
