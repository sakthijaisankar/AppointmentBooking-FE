import apiClient from './client';

const BASE = '/api/patients';

export async function createPatientProfile(data) {
  const { data: res } = await apiClient.post(`${BASE}/profile`, data);
  return res;
}

export async function getMyPatientProfile() {
  const { data: res } = await apiClient.get(`${BASE}/me`);
  return res;
}

export async function updateMyPatientProfile(data) {
  const { data: res } = await apiClient.put(`${BASE}/me`, data);
  return res;
}

export async function getPatients(search, pageNumber = 1, pageSize = 10) {
  const { data: res } = await apiClient.get(BASE, { params: { search, pageNumber, pageSize } });
  return res;
}

export async function getPatientById(patientId) {
  const { data: res } = await apiClient.get(`${BASE}/${patientId}`);
  return res;
}

// Emergency Contacts
export async function getEmergencyContacts() {
  const { data: res } = await apiClient.get(`${BASE}/me/emergency-contacts`);
  return res;
}

export async function addEmergencyContact(data) {
  const { data: res } = await apiClient.post(`${BASE}/me/emergency-contacts`, data);
  return res;
}

export async function updateEmergencyContact(contactId, data) {
  const { data: res } = await apiClient.put(`${BASE}/emergency-contacts/${contactId}`, data);
  return res;
}

export async function deleteEmergencyContact(contactId) {
  const { data: res } = await apiClient.delete(`${BASE}/emergency-contacts/${contactId}`);
  return res;
}

// Medical History
export async function getMedicalHistory() {
  const { data: res } = await apiClient.get(`${BASE}/me/medical-history`);
  return res;
}

export async function addMedicalHistory(data) {
  const { data: res } = await apiClient.post(`${BASE}/me/medical-history`, data);
  return res;
}

export async function updateMedicalHistory(historyId, data) {
  const { data: res } = await apiClient.put(`${BASE}/medical-history/${historyId}`, data);
  return res;
}

export async function deleteMedicalHistory(historyId) {
  const { data: res } = await apiClient.delete(`${BASE}/medical-history/${historyId}`);
  return res;
}

// Documents
export async function getDocuments() {
  const { data: res } = await apiClient.get(`${BASE}/me/documents`);
  return res;
}

export async function uploadDocument(metadata, file) {
  const formData = new FormData();
  formData.append('documentName', metadata.documentName);
  formData.append('documentType', metadata.documentType);
  formData.append('file', file);
  const { data: res } = await apiClient.post(`${BASE}/me/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res;
}

export async function deleteDocument(documentId) {
  const { data: res } = await apiClient.delete(`${BASE}/documents/${documentId}`);
  return res;
}

export function getDocumentDownloadUrl(documentId) {
  return `${apiClient.defaults.baseURL || ''}/api/patients/documents/${documentId}/download`;
}
