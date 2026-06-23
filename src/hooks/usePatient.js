import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addEmergencyContact,
  addMedicalHistory,
  createPatientProfile,
  deleteDocument,
  deleteEmergencyContact,
  deleteMedicalHistory,
  getEmergencyContacts,
  getMedicalHistory,
  getMyPatientProfile,
  getPatientById,
  getPatients,
  getDocuments,
  updateEmergencyContact,
  updateMedicalHistory,
  updateMyPatientProfile,
  uploadDocument,
} from '../api/patientService';

export function useMyPatientProfile() {
  return useQuery({
    queryKey: ['patient', 'me'],
    queryFn: async () => {
      const res = await getMyPatientProfile();
      return res.data;
    },
  });
}

export function useCreatePatientProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createPatientProfile,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['patient'] }),
  });
}

export function useUpdatePatientProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateMyPatientProfile,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['patient'] }),
  });
}

export function usePatients(search, pageNumber = 1) {
  return useQuery({
    queryKey: ['patients', search, pageNumber],
    queryFn: async () => {
      const res = await getPatients(search, pageNumber);
      return res.data;
    },
  });
}

export function usePatient(patientId) {
  return useQuery({
    queryKey: ['patient', patientId],
    queryFn: async () => {
      const res = await getPatientById(patientId);
      return res.data;
    },
    enabled: !!patientId,
  });
}

export function useEmergencyContacts() {
  return useQuery({
    queryKey: ['patient', 'emergency-contacts'],
    queryFn: async () => {
      const res = await getEmergencyContacts();
      return res.data ?? [];
    },
  });
}

export function useAddEmergencyContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: addEmergencyContact,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['patient'] }),
  });
}

export function useMedicalHistory() {
  return useQuery({
    queryKey: ['patient', 'medical-history'],
    queryFn: async () => {
      const res = await getMedicalHistory();
      return res.data ?? [];
    },
  });
}

export function useAddMedicalHistory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: addMedicalHistory,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['patient'] }),
  });
}

export function useDocuments() {
  return useQuery({
    queryKey: ['patient', 'documents'],
    queryFn: async () => {
      const res = await getDocuments();
      return res.data ?? [];
    },
  });
}

export function useUploadDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ metadata, file }) => uploadDocument(metadata, file),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['patient'] }),
  });
}

export function useDeleteEmergencyContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteEmergencyContact,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['patient'] }),
  });
}

export function useDeleteMedicalHistory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteMedicalHistory,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['patient'] }),
  });
}

export function useDeleteDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['patient'] }),
  });
}

export { updateEmergencyContact, updateMedicalHistory, deleteEmergencyContact, deleteMedicalHistory, deleteDocument };
