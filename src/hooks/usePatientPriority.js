import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  classifyPatient,
  getClassificationHistory,
  getCurrentClassification,
  getPriorityLevels,
  overrideClassification,
} from '../api/patientPriorityService';

export function usePriorityLevels() {
  return useQuery({
    queryKey: ['priority-levels'],
    queryFn: async () => {
      const response = await getPriorityLevels();
      return response.data ?? [];
    },
  });
}

export function useCurrentClassification(patientId) {
  return useQuery({
    queryKey: ['patient-priority', patientId, 'current'],
    queryFn: async () => {
      const response = await getCurrentClassification(patientId);
      return response.data;
    },
    enabled: !!patientId,
  });
}

export function useClassificationHistory(patientId, pageNumber = 1, pageSize = 10) {
  return useQuery({
    queryKey: ['patient-priority', patientId, 'history', pageNumber, pageSize],
    queryFn: async () => {
      const response = await getClassificationHistory(patientId, pageNumber, pageSize);
      return response.data;
    },
    enabled: !!patientId,
  });
}

export function useClassifyPatient(patientId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (clinicalData) => classifyPatient(patientId, clinicalData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-priority', patientId] });
    },
  });
}

export function useOverrideClassification(patientId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ classificationId, overrideData }) =>
      overrideClassification(classificationId, overrideData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-priority', patientId] });
    },
  });
}
