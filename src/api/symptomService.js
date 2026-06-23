import apiClient from './client';

const BASE = '/api/symptoms';

export async function getActiveSymptoms() {
  const { data } = await apiClient.get(BASE);
  return data;
}

export async function submitSymptoms(appointmentId, submissionData) {
  const { data } = await apiClient.post(`${BASE}/appointment/${appointmentId}`, submissionData);
  return data;
}

export async function getSymptomsByAppointmentId(appointmentId) {
  const { data } = await apiClient.get(`${BASE}/appointment/${appointmentId}`);
  return data;
}
