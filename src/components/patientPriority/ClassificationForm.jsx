import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { classifyPatientSchema } from '../../schemas/patientPrioritySchema';
import './ClassificationForm.css';

const defaultValues = {
  appointmentId: null,
  age: 30,
  gender: 'Male',
  heartRate: null,
  bloodPressureSystolic: null,
  bloodPressureDiastolic: null,
  temperatureCelsius: null,
  oxygenSaturation: null,
  painLevel: null,
  symptomSeverityScore: null,
  hasChronicCondition: false,
  hasRecentHospitalization: false,
  primarySymptoms: '',
  comorbidities: '',
};

export default function ClassificationForm({ onSubmit, isLoading, error }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(classifyPatientSchema),
    defaultValues,
  });

  return (
    <form className="classification-form" onSubmit={handleSubmit(onSubmit)}>
      <h3>Clinical Features for ML Classification</h3>

      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="age">Age *</label>
          <input id="age" type="number" {...register('age', { valueAsNumber: true })} />
          {errors.age && <span className="field-error">{errors.age.message}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="gender">Gender *</label>
          <select id="gender" {...register('gender')}>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
            <option value="Unknown">Unknown</option>
          </select>
          {errors.gender && <span className="field-error">{errors.gender.message}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="heartRate">Heart Rate (bpm)</label>
          <input id="heartRate" type="number" {...register('heartRate', { valueAsNumber: true })} />
        </div>

        <div className="form-field">
          <label htmlFor="bloodPressureSystolic">BP Systolic</label>
          <input id="bloodPressureSystolic" type="number" {...register('bloodPressureSystolic', { valueAsNumber: true })} />
        </div>

        <div className="form-field">
          <label htmlFor="bloodPressureDiastolic">BP Diastolic</label>
          <input id="bloodPressureDiastolic" type="number" {...register('bloodPressureDiastolic', { valueAsNumber: true })} />
        </div>

        <div className="form-field">
          <label htmlFor="oxygenSaturation">SpO2 (%)</label>
          <input id="oxygenSaturation" type="number" step="0.1" {...register('oxygenSaturation', { valueAsNumber: true })} />
        </div>

        <div className="form-field">
          <label htmlFor="temperatureCelsius">Temperature (°C)</label>
          <input id="temperatureCelsius" type="number" step="0.1" {...register('temperatureCelsius', { valueAsNumber: true })} />
        </div>

        <div className="form-field">
          <label htmlFor="painLevel">Pain Level (0-10)</label>
          <input id="painLevel" type="number" {...register('painLevel', { valueAsNumber: true })} />
        </div>

        <div className="form-field">
          <label htmlFor="symptomSeverityScore">Symptom Severity (0-10)</label>
          <input id="symptomSeverityScore" type="number" {...register('symptomSeverityScore', { valueAsNumber: true })} />
        </div>
      </div>

      <div className="form-field form-field--full">
        <label htmlFor="primarySymptoms">Primary Symptoms</label>
        <textarea id="primarySymptoms" rows={3} {...register('primarySymptoms')} placeholder="e.g. chest pain, breathing difficulty" />
      </div>

      <div className="form-field form-field--full">
        <label htmlFor="comorbidities">Comorbidities</label>
        <textarea id="comorbidities" rows={2} {...register('comorbidities')} placeholder="e.g. diabetes, hypertension" />
      </div>

      <div className="form-checkboxes">
        <label>
          <input type="checkbox" {...register('hasChronicCondition')} />
          Has Chronic Condition
        </label>
        <label>
          <input type="checkbox" {...register('hasRecentHospitalization')} />
          Recent Hospitalization
        </label>
      </div>

      {error && <div className="form-error">{error}</div>}

      <button type="submit" className="btn-primary" disabled={isLoading}>
        {isLoading ? 'Classifying...' : 'Run ML Classification'}
      </button>
    </form>
  );
}
