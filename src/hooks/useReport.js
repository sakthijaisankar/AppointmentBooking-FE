import { useQuery } from '@tanstack/react-query';
import reportService from '../api/reportService';

export const useDashboardSummary = () =>
  useQuery({
    queryKey: ['reports', 'summary'],
    queryFn: () => reportService.getSummary(),
    refetchInterval: 30000, // Refresh summary stats every 30s
  });

export const useAppointmentStats = () =>
  useQuery({
    queryKey: ['reports', 'appointments'],
    queryFn: () => reportService.getAppointments(),
  });

export const useQueueEmergencyStats = () =>
  useQuery({
    queryKey: ['reports', 'queue-emergency'],
    queryFn: () => reportService.getQueueEmergency(),
  });

export const useDoctorPerformanceStats = () =>
  useQuery({
    queryKey: ['reports', 'doctors'],
    queryFn: () => reportService.getDoctors(),
  });

export const usePatientAnalytics = () =>
  useQuery({
    queryKey: ['reports', 'patients'],
    queryFn: () => reportService.getPatients(),
  });
