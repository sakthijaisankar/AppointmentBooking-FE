import { useEffect, useState } from 'react';
import {
  useAddEmergencyContact,
  useAddMedicalHistory,
  useCreatePatientProfile,
  useDeleteDocument,
  useDeleteEmergencyContact,
  useDeleteMedicalHistory,
  useMyPatientProfile,
  useUpdatePatientProfile,
  useUploadDocument,
} from '../../hooks/usePatient';
import './PatientPages.css';

const emptyProfile = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  gender: 'Male',
  phoneNumber: '',
  email: '',
  address: '',
  bloodGroup: '',
};

export default function PatientProfilePage() {
  const { data: profile, isLoading } = useMyPatientProfile();
  const createMutation = useCreatePatientProfile();
  const updateMutation = useUpdatePatientProfile();
  const addContact = useAddEmergencyContact();
  const addHistory = useAddMedicalHistory();
  const uploadDoc = useUploadDocument();
  const deleteContact = useDeleteEmergencyContact();
  const deleteHistory = useDeleteMedicalHistory();
  const deleteDoc = useDeleteDocument();

  const [form, setForm] = useState(emptyProfile);
  const [tab, setTab] = useState('profile');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [contactForm, setContactForm] = useState({
    contactName: '', relationship: '', phoneNumber: '', email: '', isPrimary: false,
  });
  const [historyForm, setHistoryForm] = useState({
    conditionName: '', diagnosisDate: '', description: '', isChronic: false,
  });
  const [docForm, setDocForm] = useState({ documentName: '', documentType: 'LabReport', file: null });

  if (isLoading) return <div className="patient-page">Loading...</div>;

  const hasProfile = !!profile?.patientId;

  useEffect(() => {
    if (profile?.patientId) {
      setForm({
        firstName: profile.firstName,
        lastName: profile.lastName,
        dateOfBirth: profile.dateOfBirth,
        gender: profile.gender,
        phoneNumber: profile.phoneNumber || '',
        email: profile.email || '',
        address: profile.address || '',
        bloodGroup: profile.bloodGroup || '',
      });
    }
  }, [profile]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    const payload = {
      ...form,
      dateOfBirth: form.dateOfBirth,
    };
    try {
      if (hasProfile) {
        await updateMutation.mutateAsync(payload);
        setMessage('Profile updated successfully.');
      } else {
        await createMutation.mutateAsync(payload);
        setMessage('Profile created successfully.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed.');
    }
  };

  return (
    <div className="patient-page">
      <h1>{hasProfile ? 'My Patient Profile' : 'Create Patient Profile'}</h1>
      {hasProfile && (
        <p className="patient-code">Patient ID: {profile.patientId} · Code: {profile.patientCode}</p>
      )}

      {message && <div className="patient-success">{message}</div>}
      {error && <div className="patient-error">{error}</div>}

      {hasProfile && (
        <div className="patient-tabs">
          {['profile', 'contacts', 'history', 'documents'].map((t) => (
            <button key={t} type="button" className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      )}

      {(tab === 'profile' || !hasProfile) && (
        <form className="patient-card" onSubmit={handleProfileSubmit}>
          <div className="patient-grid">
            <div>
              <label>First Name</label>
              <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
            </div>
            <div>
              <label>Last Name</label>
              <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
            </div>
            <div>
              <label>Date of Birth</label>
              <input type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} required />
            </div>
            <div>
              <label>Gender</label>
              <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                <option>Male</option><option>Female</option><option>Other</option><option>Unknown</option>
              </select>
            </div>
            <div>
              <label>Phone</label>
              <input value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />
            </div>
            <div>
              <label>Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label>Blood Group</label>
              <select value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}>
                <option value="">Select</option>
                {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map((bg) => <option key={bg}>{bg}</option>)}
              </select>
            </div>
          </div>
          <label>Address</label>
          <textarea rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <button type="submit" className="patient-btn">{hasProfile ? 'Update Profile' : 'Create Profile'}</button>
        </form>
      )}

      {hasProfile && tab === 'contacts' && (
        <div className="patient-card">
          <h2>Emergency Contacts</h2>
          <ul className="patient-list">
            {(profile.emergencyContacts || []).map((c) => (
              <li key={c.emergencyContactId}>
                {c.contactName} ({c.relationship}) — {c.phoneNumber}
                {c.isPrimary && <span className="badge">Primary</span>}
                <button type="button" onClick={() => deleteContact.mutate(c.emergencyContactId)}>Delete</button>
              </li>
            ))}
          </ul>
          <form onSubmit={async (e) => {
            e.preventDefault();
            await addContact.mutateAsync(contactForm);
            setContactForm({ contactName: '', relationship: '', phoneNumber: '', email: '', isPrimary: false });
          }}>
            <div className="patient-grid">
              <input placeholder="Name" value={contactForm.contactName} onChange={(e) => setContactForm({ ...contactForm, contactName: e.target.value })} required />
              <input placeholder="Relationship" value={contactForm.relationship} onChange={(e) => setContactForm({ ...contactForm, relationship: e.target.value })} required />
              <input placeholder="Phone" value={contactForm.phoneNumber} onChange={(e) => setContactForm({ ...contactForm, phoneNumber: e.target.value })} required />
              <label><input type="checkbox" checked={contactForm.isPrimary} onChange={(e) => setContactForm({ ...contactForm, isPrimary: e.target.checked })} /> Primary</label>
            </div>
            <button type="submit" className="patient-btn">Add Contact</button>
          </form>
        </div>
      )}

      {hasProfile && tab === 'history' && (
        <div className="patient-card">
          <h2>Medical History</h2>
          <ul className="patient-list">
            {(profile.medicalHistory || []).map((h) => (
              <li key={h.patientMedicalHistoryId}>
                <strong>{h.conditionName}</strong> {h.isChronic && '(Chronic)'}
                {h.description && <p>{h.description}</p>}
                <button type="button" onClick={() => deleteHistory.mutate(h.patientMedicalHistoryId)}>Delete</button>
              </li>
            ))}
          </ul>
          <form onSubmit={async (e) => {
            e.preventDefault();
            await addHistory.mutateAsync({ ...historyForm, diagnosisDate: historyForm.diagnosisDate || null });
            setHistoryForm({ conditionName: '', diagnosisDate: '', description: '', isChronic: false });
          }}>
            <div className="patient-grid">
              <input placeholder="Condition" value={historyForm.conditionName} onChange={(e) => setHistoryForm({ ...historyForm, conditionName: e.target.value })} required />
              <input type="date" value={historyForm.diagnosisDate} onChange={(e) => setHistoryForm({ ...historyForm, diagnosisDate: e.target.value })} />
              <label><input type="checkbox" checked={historyForm.isChronic} onChange={(e) => setHistoryForm({ ...historyForm, isChronic: e.target.checked })} /> Chronic</label>
            </div>
            <textarea placeholder="Description" value={historyForm.description} onChange={(e) => setHistoryForm({ ...historyForm, description: e.target.value })} />
            <button type="submit" className="patient-btn">Add Record</button>
          </form>
        </div>
      )}

      {hasProfile && tab === 'documents' && (
        <div className="patient-card">
          <h2>Documents</h2>
          <ul className="patient-list">
            {(profile.documents || []).map((d) => (
              <li key={d.patientDocumentId}>
                {d.documentName} ({d.documentType}) — {(d.fileSizeBytes / 1024).toFixed(1)} KB
                <a href={`/api/patients/documents/${d.patientDocumentId}/download`} target="_blank" rel="noreferrer">Download</a>
                <button type="button" onClick={() => deleteDoc.mutate(d.patientDocumentId)}>Delete</button>
              </li>
            ))}
          </ul>
          <form onSubmit={async (e) => {
            e.preventDefault();
            if (!docForm.file) return;
            await uploadDoc.mutateAsync({ metadata: { documentName: docForm.documentName, documentType: docForm.documentType }, file: docForm.file });
            setDocForm({ documentName: '', documentType: 'LabReport', file: null });
          }}>
            <div className="patient-grid">
              <input placeholder="Document name" value={docForm.documentName} onChange={(e) => setDocForm({ ...docForm, documentName: e.target.value })} required />
              <select value={docForm.documentType} onChange={(e) => setDocForm({ ...docForm, documentType: e.target.value })}>
                {['LabReport','Prescription','Insurance','Referral','Other'].map((t) => <option key={t}>{t}</option>)}
              </select>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={(e) => setDocForm({ ...docForm, file: e.target.files[0] })} required />
            </div>
            <button type="submit" className="patient-btn">Upload</button>
          </form>
        </div>
      )}
    </div>
  );
}
