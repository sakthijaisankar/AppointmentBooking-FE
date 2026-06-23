import client from './client';

export const queueService = {
  checkInPatient: async (appointmentId) => {
    const response = await client.post('/api/queue/check-in', { appointmentId });
    return response.data;
  },

  getActiveQueue: async (doctorId) => {
    const params = doctorId ? { doctorId } : {};
    const response = await client.get('/api/queue/active', { params });
    return response.data;
  },

  updateQueueStatus: async (queueId, statusCode) => {
    const response = await client.post(`/api/queue/${queueId}/status`, { statusCode });
    return response.data;
  },

  getPatientQueueStatus: async (patientId) => {
    const response = await client.get(`/api/queue/patient/${patientId}/status`);
    return response.data;
  },

  getQueueStatuses: async () => {
    const response = await client.get('/api/queue/statuses');
    return response.data;
  },
};

export default queueService;
