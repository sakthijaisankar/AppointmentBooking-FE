import apiClient from './client';

const BASE = '/api/doctors';

export async function getDoctors(search, specializationId, pageNumber = 1, pageSize = 10) {
  const { data } = await apiClient.get(BASE, {
    params: { 
      search: search || undefined, 
      specializationId: specializationId || undefined, 
      pageNumber, 
      pageSize 
    },
  });
  return data;
}

export async function getDoctorById(doctorId) {
  const { data } = await apiClient.get(`${BASE}/${doctorId}`);
  return data;
}

export async function getMyDoctorProfile() {
  const { data } = await apiClient.get(`${BASE}/me`);
  return data;
}

export async function createDoctorProfile(doctorData) {
  const { data } = await apiClient.post(BASE, doctorData);
  return data;
}

export async function updateDoctorProfile(doctorId, doctorData) {
  const { data } = await apiClient.put(`${BASE}/${doctorId}`, doctorData);
  return data;
}

export async function deleteDoctorProfile(doctorId) {
  const { data } = await apiClient.delete(`${BASE}/${doctorId}`);
  return data;
}

// Schedules
export async function getDoctorSchedules(doctorId) {
  const { data } = await apiClient.get(`${BASE}/${doctorId}/schedules`);
  return data;
}

export async function addDoctorSchedule(doctorId, scheduleData) {
  const { data } = await apiClient.post(`${BASE}/${doctorId}/schedules`, scheduleData);
  return data;
}

export async function updateDoctorSchedule(scheduleId, scheduleData) {
  const { data } = await apiClient.put(`${BASE}/schedules/${scheduleId}`, scheduleData);
  return data;
}

export async function deleteDoctorSchedule(scheduleId) {
  const { data } = await apiClient.delete(`${BASE}/schedules/${scheduleId}`);
  return data;
}

// Specializations
export async function getSpecializations() {
  const { data } = await apiClient.get(`${BASE}/specializations`);
  return data;
}

export async function createSpecialization(specData) {
  const { data } = await apiClient.post(`${BASE}/specializations`, specData);
  return data;
}

export async function updateSpecialization(specId, specData) {
  const { data } = await apiClient.put(`${BASE}/specializations/${specId}`, specData);
  return data;
}

export async function deleteSpecialization(specId) {
  const { data } = await apiClient.delete(`${BASE}/specializations/${specId}`);
  return data;
}
