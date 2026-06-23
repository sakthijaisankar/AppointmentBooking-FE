import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getActiveSymptoms,
  submitSymptoms,
  getSymptomsByAppointmentId
} from '../api/symptomService';

export function useActiveSymptoms() {
  return useQuery({
    queryKey: ['symptoms', 'active'],
    queryFn: async () => {
      const res = await getActiveSymptoms();
      return res.data ?? [];
    },
  });
}

export function useAppointmentSymptoms(appointmentId) {
  return useQuery({
    queryKey: ['appointment-symptoms', appointmentId],
    queryFn: async () => {
      const res = await getSymptomsByAppointmentId(appointmentId);
      return res.data;
    },
    enabled: !!appointmentId,
    retry: false, // Don't retry if not found
  });
}

export function useSubmitSymptoms() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ appointmentId, submissionData }) => submitSymptoms(appointmentId, submissionData),
    onSuccess: (data, variables) => {
      qc.invalidateQueries({ queryKey: ['appointment-symptoms', variables.appointmentId] });
      qc.invalidateQueries({ queryKey: ['appointments'] });
      qc.invalidateQueries({ queryKey: ['appointment', variables.appointmentId] });
    },
  });
}
