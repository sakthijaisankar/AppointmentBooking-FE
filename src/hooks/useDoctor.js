import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getDoctors,
  getDoctorById,
  getMyDoctorProfile,
  createDoctorProfile,
  updateDoctorProfile,
  deleteDoctorProfile,
  getDoctorSchedules,
  addDoctorSchedule,
  updateDoctorSchedule,
  deleteDoctorSchedule,
  getSpecializations,
  createSpecialization,
  updateSpecialization,
  deleteSpecialization,
} from '../api/doctorService';

export function useDoctors(search, specializationId, pageNumber = 1) {
  return useQuery({
    queryKey: ['doctors', search, specializationId, pageNumber],
    queryFn: async () => {
      const res = await getDoctors(search, specializationId, pageNumber);
      return res.data;
    },
  });
}

export function useDoctor(doctorId) {
  return useQuery({
    queryKey: ['doctor', doctorId],
    queryFn: async () => {
      const res = await getDoctorById(doctorId);
      return res.data;
    },
    enabled: !!doctorId,
  });
}

export function useMyDoctorProfile() {
  return useQuery({
    queryKey: ['doctor', 'me'],
    queryFn: async () => {
      const res = await getMyDoctorProfile();
      return res.data;
    },
  });
}

export function useCreateDoctor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createDoctorProfile,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['doctors'] }),
  });
}

export function useUpdateDoctor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ doctorId, doctorData }) => updateDoctorProfile(doctorId, doctorData),
    onSuccess: (data, variables) => {
      qc.invalidateQueries({ queryKey: ['doctor', variables.doctorId] });
      qc.invalidateQueries({ queryKey: ['doctors'] });
    },
  });
}

export function useDeleteDoctor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteDoctorProfile,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['doctors'] }),
  });
}

// Schedules hooks
export function useDoctorSchedules(doctorId) {
  return useQuery({
    queryKey: ['doctor', doctorId, 'schedules'],
    queryFn: async () => {
      const res = await getDoctorSchedules(doctorId);
      return res.data ?? [];
    },
    enabled: !!doctorId,
  });
}

export function useAddDoctorSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ doctorId, scheduleData }) => addDoctorSchedule(doctorId, scheduleData),
    onSuccess: (data, variables) => {
      qc.invalidateQueries({ queryKey: ['doctor', variables.doctorId] });
      qc.invalidateQueries({ queryKey: ['doctor', variables.doctorId, 'schedules'] });
    },
  });
}

export function useUpdateDoctorSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ scheduleId, scheduleData }) => updateDoctorSchedule(scheduleId, scheduleData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['doctor'] });
    },
  });
}

export function useDeleteDoctorSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteDoctorSchedule,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['doctor'] });
    },
  });
}

// Specializations hooks
export function useSpecializations() {
  return useQuery({
    queryKey: ['specializations'],
    queryFn: async () => {
      const res = await getSpecializations();
      return res.data ?? [];
    },
  });
}

export function useCreateSpecialization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createSpecialization,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['specializations'] }),
  });
}

export function useUpdateSpecialization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ specId, specData }) => updateSpecialization(specId, specData),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['specializations'] }),
  });
}

export function useDeleteSpecialization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteSpecialization,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['specializations'] }),
  });
}
