import PriorityBadge from './PriorityBadge';
import './ClassificationResult.css';

export default function ClassificationResult({ classification, onOverride, priorityLevels, isOverriding }) {
  if (!classification) {
    return (
      <div className="classification-result classification-result--empty">
        <p>No priority classification on record. Submit clinical features to classify.</p>
      </div>
    );
  }

  const effective = classification.effectivePriorityLevel || classification.predictedPriorityLevel;

  return (
    <div className="classification-result">
      <div className="result-header">
        <h3>Classification Result</h3>
        <PriorityBadge
          levelCode={effective.levelCode}
          levelName={effective.levelName}
          colorHex={effective.colorHex}
          size="lg"
        />
      </div>

      <dl className="result-details">
        <div>
          <dt>Predicted Level</dt>
          <dd>{classification.predictedPriorityLevel.levelName}</dd>
        </div>
        <div>
          <dt>Confidence</dt>
          <dd>{(classification.confidenceScore * 100).toFixed(1)}%</dd>
        </div>
        <div>
          <dt>Risk Score</dt>
          <dd>{classification.riskScore.toFixed(1)}</dd>
        </div>
        <div>
          <dt>Model Version</dt>
          <dd>{classification.modelVersion}</dd>
        </div>
        <div>
          <dt>Classified At</dt>
          <dd>{new Date(classification.classifiedAt).toLocaleString()}</dd>
        </div>
      </dl>

      {classification.classificationReason && (
        <p className="result-reason">
          <strong>Reason:</strong> {classification.classificationReason}
        </p>
      )}

      {classification.isOverridden && (
        <div className="result-override">
          <strong>Overridden:</strong> {classification.overrideReason}
        </div>
      )}

      {!classification.isOverridden && onOverride && priorityLevels?.length > 0 && (
        <div className="override-section">
          <h4>Clinical Override</h4>
          <select id="overrideLevel" defaultValue="">
            <option value="" disabled>Select override level</option>
            {priorityLevels
              .filter((l) => l.priorityLevelId !== classification.predictedPriorityLevel.priorityLevelId)
              .map((level) => (
                <option key={level.priorityLevelId} value={level.priorityLevelId}>
                  {level.levelName}
                </option>
              ))}
          </select>
          <textarea id="overrideReason" placeholder="Clinical justification (min 10 chars)" rows={2} />
          <button
            type="button"
            className="btn-secondary"
            disabled={isOverriding}
            onClick={() => {
              const levelId = parseInt(document.getElementById('overrideLevel').value, 10);
              const reason = document.getElementById('overrideReason').value;
              if (levelId && reason.length >= 10) {
                onOverride(classification.patientPriorityClassificationId, {
                  overridePriorityLevelId: levelId,
                  overrideReason: reason,
                });
              }
            }}
          >
            {isOverriding ? 'Saving...' : 'Apply Override'}
          </button>
        </div>
      )}
    </div>
  );
}
