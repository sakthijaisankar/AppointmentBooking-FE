import apiClient from './client';

const BASE = '/api/appointments';

export async function bookAppointment(appointmentData) {
  const { data } = await apiClient.post(BASE, appointmentData);
  return data;
}

export async function getAppointmentById(id) {
  const { data } = await apiClient.get(`${BASE}/${id}`);
  return data;
}

export async function updateAppointmentStatus(id, { statusName, notes }) {
  const { data } = await apiClient.put(`${BASE}/${id}/status`, { statusName, notes });
  return data;
}

export async function getMyAppointments() {
  const { data } = await apiClient.get(`${BASE}/patient/me`);
  return data;
}

export async function getDoctorAppointments() {
  const { data } = await apiClient.get(`${BASE}/doctor/me`);
  return data;
}

export async function getAllAppointments(search, statusId, pageNumber = 1, pageSize = 10) {
  const { data } = await apiClient.get(BASE, {
    params: {
      search: search || undefined,
      statusId: statusId || undefined,
      pageNumber,
      pageSize,
    },
  });
  return data;
}

export async function getAvailableSlots(doctorId, date) {
  const { data } = await apiClient.get(`${BASE}/available-slots`, {
    params: { doctorId, date },
  });
  return data;
}

export async function getStatuses() {
  const { data } = await apiClient.get(`${BASE}/statuses`);
  return data;
}
