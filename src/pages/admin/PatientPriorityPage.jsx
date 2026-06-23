import { useParams } from 'react-router-dom';
import ClassificationForm from '../../components/patientPriority/ClassificationForm';
import ClassificationResult from '../../components/patientPriority/ClassificationResult';
import PriorityBadge from '../../components/patientPriority/PriorityBadge';
import {
  useClassifyPatient,
  useClassificationHistory,
  useCurrentClassification,
  useOverrideClassification,
  usePriorityLevels,
} from '../../hooks/usePatientPriority';
import './PatientPriorityPage.css';

export default function PatientPriorityPage() {
  const { patientId: patientIdParam } = useParams();
  const patientId = parseInt(patientIdParam, 10) || 1;

  const { data: priorityLevels } = usePriorityLevels();
  const { data: currentClassification, isLoading: loadingCurrent } = useCurrentClassification(patientId);
  const { data: history } = useClassificationHistory(patientId);

  const classifyMutation = useClassifyPatient(patientId);
  const overrideMutation = useOverrideClassification(patientId);

  const handleClassify = (formData) => {
    const payload = {
      ...formData,
      appointmentId: formData.appointmentId || undefined,
      primarySymptoms: formData.primarySymptoms || undefined,
      comorbidities: formData.comorbidities || undefined,
    };
    classifyMutation.mutate(payload);
  };

  const handleOverride = (classificationId, overrideData) => {
    overrideMutation.mutate({ classificationId, overrideData });
  };

  const displayClassification = classifyMutation.data?.data ?? currentClassification;

  return (
    <div className="patient-priority-page">
      <header className="page-header">
        <div>
          <h1>Patient Priority Classification</h1>
          <p className="page-subtitle">ML-based triage for Patient ID: {patientId}</p>
        </div>
        {displayClassification?.effectivePriorityLevel && (
          <PriorityBadge
            levelCode={displayClassification.effectivePriorityLevel.levelCode}
            levelName={displayClassification.effectivePriorityLevel.levelName}
            colorHex={displayClassification.effectivePriorityLevel.colorHex}
            size="lg"
          />
        )}
      </header>

      <div className="page-grid">
        <ClassificationForm
          onSubmit={handleClassify}
          isLoading={classifyMutation.isPending}
          error={
            classifyMutation.error?.response?.data?.message ||
            classifyMutation.error?.message
          }
        />

        {!loadingCurrent && (
          <ClassificationResult
            classification={displayClassification}
            priorityLevels={priorityLevels}
            onOverride={handleOverride}
            isOverriding={overrideMutation.isPending}
          />
        )}
      </div>

      {history?.items?.length > 0 && (
        <section className="history-section">
          <h2>Classification History</h2>
          <table className="history-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Level</th>
                <th>Confidence</th>
                <th>Risk Score</th>
                <th>Overridden</th>
              </tr>
            </thead>
            <tbody>
              {history.items.map((item) => (
                <tr key={item.patientPriorityClassificationId}>
                  <td>{new Date(item.classifiedAt).toLocaleString()}</td>
                  <td>
                    <PriorityBadge
                      levelCode={(item.effectivePriorityLevel || item.predictedPriorityLevel).levelCode}
                      levelName={(item.effectivePriorityLevel || item.predictedPriorityLevel).levelName}
                      colorHex={(item.effectivePriorityLevel || item.predictedPriorityLevel).colorHex}
                      size="sm"
                    />
                  </td>
                  <td>{(item.confidenceScore * 100).toFixed(1)}%</td>
                  <td>{item.riskScore.toFixed(1)}</td>
                  <td>{item.isOverridden ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
