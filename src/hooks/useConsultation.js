import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import consultationService from '../api/consultationService';

export const useConsultationByAppointment = (appointmentId) =>
  useQuery({
    queryKey: ['consultation', 'appointment', appointmentId],
    queryFn: () => consultationService.getByAppointmentId(appointmentId),
    enabled: !!appointmentId,
    retry: (failureCount, error) => {
      // Don't retry on 404 (no consultation yet)
      if (error?.response?.status === 404) return false;
      return failureCount < 1;
    },
  });

export const useConsultationById = (consultationId) =>
  useQuery({
    queryKey: ['consultation', consultationId],
    queryFn: () => consultationService.getById(consultationId),
    enabled: !!consultationId,
  });

export const usePatientConsultationHistory = (patientId, page = 1) =>
  useQuery({
    queryKey: ['consultations', 'patient', patientId, page],
    queryFn: () => consultationService.getPatientHistory(patientId, page),
    enabled: !!patientId,
  });

export const useDoctorConsultations = (doctorId, page = 1) =>
  useQuery({
    queryKey: ['consultations', 'doctor', doctorId, page],
    queryFn: () => consultationService.getDoctorConsultations(doctorId, page),
    enabled: !!doctorId,
  });

export const useCreateConsultation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => consultationService.createConsultation(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['consultation', 'appointment', variables.appointmentId] });
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
    },
  });
};

export const useUpdateConsultation = (consultationId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => consultationService.updateConsultation(consultationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultation', consultationId] });
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
    },
  });
};

export const useAddPrescription = (consultationId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => consultationService.addPrescription(consultationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultation'] });
    },
  });
};

export const useDeletePrescription = (consultationId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (prescriptionId) => consultationService.deletePrescription(consultationId, prescriptionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultation'] });
    },
  });
};
