import apiClient from './client';

const BASE = '/api/patient-priority';

export async function getPriorityLevels() {
  const { data } = await apiClient.get(`${BASE}/levels`);
  return data;
}

export async function getActiveModel() {
  const { data } = await apiClient.get(`${BASE}/model/active`);
  return data;
}

export async function classifyPatient(patientId, clinicalData) {
  const { data } = await apiClient.post(`${BASE}/patients/${patientId}/classify`, clinicalData);
  return data;
}

export async function getCurrentClassification(patientId) {
  const { data } = await apiClient.get(`${BASE}/patients/${patientId}/current`);
  return data;
}

export async function getClassificationHistory(patientId, pageNumber = 1, pageSize = 10) {
  const { data } = await apiClient.get(`${BASE}/patients/${patientId}/history`, {
    params: { pageNumber, pageSize },
  });
  return data;
}

export async function overrideClassification(classificationId, overrideData) {
  const { data } = await apiClient.post(`${BASE}/classifications/${classificationId}/override`, overrideData);
  return data;
}
