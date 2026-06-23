import './PriorityBadge.css';

const DEFAULT_COLORS = {
  CRITICAL: '#DC2626',
  HIGH: '#EA580C',
  MEDIUM: '#CA8A04',
  LOW: '#16A34A',
};

export default function PriorityBadge({ levelCode, levelName, colorHex, size = 'md' }) {
  const bgColor = colorHex || DEFAULT_COLORS[levelCode] || '#6B7280';

  return (
    <span
      className={`priority-badge priority-badge--${size}`}
      style={{ backgroundColor: bgColor }}
      title={levelCode}
    >
      {levelName || levelCode}
    </span>
  );
}
