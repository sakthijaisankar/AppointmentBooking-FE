import { z } from 'zod';

export const classifyPatientSchema = z.object({
  appointmentId: z.number().int().positive().optional().nullable(),
  age: z.number().int().min(0).max(150),
  gender: z.enum(['Male', 'Female', 'Other', 'Unknown']),
  heartRate: z.number().int().min(30).max(250).optional().nullable(),
  bloodPressureSystolic: z.number().int().min(60).max(250).optional().nullable(),
  bloodPressureDiastolic: z.number().int().min(40).max(150).optional().nullable(),
  temperatureCelsius: z.number().min(35).max(42).optional().nullable(),
  oxygenSaturation: z.number().min(50).max(100).optional().nullable(),
  painLevel: z.number().int().min(0).max(10).optional().nullable(),
  symptomSeverityScore: z.number().int().min(0).max(10).optional().nullable(),
  hasChronicCondition: z.boolean(),
  hasRecentHospitalization: z.boolean(),
  primarySymptoms: z.string().max(1000).optional().nullable(),
  comorbidities: z.string().max(1000).optional().nullable(),
});

export const overridePrioritySchema = z.object({
  overridePriorityLevelId: z.number().int().positive(),
  overrideReason: z.string().min(10).max(500),
});
