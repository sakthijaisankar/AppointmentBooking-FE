import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import queueService from '../api/queueService';

export const useActiveQueue = (doctorId) => {
  return useQuery({
    queryKey: ['queue', 'active', doctorId || 'all'],
    queryFn: () => queueService.getActiveQueue(doctorId),
    refetchInterval: 10000, // Poll every 10 seconds for real-time dashboard updates
  });
};

export const useCheckInPatient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (appointmentId) => queueService.checkInPatient(appointmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queue'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};

export const useUpdateQueueStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ queueId, statusCode }) => queueService.updateQueueStatus(queueId, statusCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queue'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};

export const usePatientQueueStatus = (patientId) => {
  return useQuery({
    queryKey: ['queue', 'patient', patientId],
    queryFn: () => queueService.getPatientQueueStatus(patientId),
    enabled: !!patientId,
    refetchInterval: 15000, // Poll status for patients
  });
};

export const useQueueStatuses = () => {
  return useQuery({
    queryKey: ['queue', 'statuses'],
    queryFn: queueService.getQueueStatuses,
    staleTime: 24 * 60 * 60 * 1000, // Stale for 24h
  });
};
