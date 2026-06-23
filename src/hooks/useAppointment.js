import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  bookAppointment,
  getAppointmentById,
  updateAppointmentStatus,
  getMyAppointments,
  getDoctorAppointments,
  getAllAppointments,
  getAvailableSlots,
  getStatuses
} from '../api/appointmentService';

export function useBookAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: bookAppointment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

export function useAppointment(id) {
  return useQuery({
    queryKey: ['appointment', id],
    queryFn: async () => {
      const res = await getAppointmentById(id);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useUpdateAppointmentStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, statusName, notes }) => updateAppointmentStatus(id, { statusName, notes }),
    onSuccess: (data, variables) => {
      qc.invalidateQueries({ queryKey: ['appointment', variables.id] });
      qc.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

export function useMyAppointments() {
  return useQuery({
    queryKey: ['appointments', 'patient', 'me'],
    queryFn: async () => {
      const res = await getMyAppointments();
      return res.data ?? [];
    },
  });
}

export function useDoctorAppointments() {
  return useQuery({
    queryKey: ['appointments', 'doctor', 'me'],
    queryFn: async () => {
      const res = await getDoctorAppointments();
      return res.data ?? [];
    },
  });
}

export function useAllAppointments(search, statusId, pageNumber = 1) {
  return useQuery({
    queryKey: ['appointments', 'all', search, statusId, pageNumber],
    queryFn: async () => {
      const res = await getAllAppointments(search, statusId, pageNumber);
      return res.data;
    },
  });
}

export function useAvailableSlots(doctorId, date) {
  return useQuery({
    queryKey: ['available-slots', doctorId, date],
    queryFn: async () => {
      const res = await getAvailableSlots(doctorId, date);
      return res.data ?? [];
    },
    enabled: !!doctorId && !!date,
  });
}

export function useStatuses() {
  return useQuery({
    queryKey: ['appointment-statuses'],
    queryFn: async () => {
      const res = await getStatuses();
      return res.data ?? [];
    },
  });
}
