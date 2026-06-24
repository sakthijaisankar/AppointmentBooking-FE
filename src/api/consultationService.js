import client from './client';

export const consultationService = {
  // Create a new consultation (with prescriptions)
  createConsultation: async (data) => {
    const response = await client.post('/api/consultations', data);
    return response.data;
  },

  // Get consultation by appointment ID
  getByAppointmentId: async (appointmentId) => {
    const response = await client.get(`/api/consultations/appointment/${appointmentId}`);
    return response.data;
  },

  // Get consultation by consultation ID
  getById: async (consultationId) => {
    const response = await client.get(`/api/consultations/${consultationId}`);
    return response.data;
  },

  // Update diagnosis / notes / follow-up
  updateConsultation: async (consultationId, data) => {
    const response = await client.put(`/api/consultations/${consultationId}`, data);
    return response.data;
  },

  // Add a prescription to an existing consultation
  addPrescription: async (consultationId, data) => {
    const response = await client.post(`/api/consultations/${consultationId}/prescriptions`, data);
    return response.data;
  },

  // Remove a prescription
  deletePrescription: async (consultationId, prescriptionId) => {
    const response = await client.delete(`/api/consultations/${consultationId}/prescriptions/${prescriptionId}`);
    return response.data;
  },

  // Patient's full consultation history
  getPatientHistory: async (patientId, page = 1, pageSize = 10) => {
    const response = await client.get(`/api/consultations/patient/${patientId}`, {
      params: { page, pageSize },
    });
    return response.data;
  },

  // Doctor's consultation list
  getDoctorConsultations: async (doctorId, page = 1, pageSize = 10) => {
    const response = await client.get(`/api/consultations/doctor/${doctorId}`, {
      params: { page, pageSize },
    });
    return response.data;
  },
};

export default consultationService;
