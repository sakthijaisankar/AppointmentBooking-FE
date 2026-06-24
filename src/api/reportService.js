import client from './client';

export const reportService = {
  getSummary: async () => {
    const response = await client.get('/api/reports/summary');
    return response.data;
  },

  getAppointments: async () => {
    const response = await client.get('/api/reports/appointments');
    return response.data;
  },

  getQueueEmergency: async () => {
    const response = await client.get('/api/reports/queue-emergency');
    return response.data;
  },

  getDoctors: async () => {
    const response = await client.get('/api/reports/doctors');
    return response.data;
  },

  getPatients: async () => {
    const response = await client.get('/api/reports/patients');
    return response.data;
  },
};

export default reportService;
