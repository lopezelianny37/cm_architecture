import { TYPES } from '../../constants/gemba.constants';

interface BarChartProps {
  gapsByType: Record<string, number>;
}

export function BarChart({ gapsByType }: BarChartProps) {
  const counts = TYPES.map((type) => gapsByType[type] ?? 0);
  const max = Math.max(1, ...counts);

  return (
    <div>
      {TYPES.map((type, i) => (
        <div
          key={type}
          style={{
            display: 'grid',
            gridTemplateColumns: '180px 1fr 42px',
            gap: '9px',
            alignItems: 'center',
            margin: '10px 0',
          }}
        >
          <span>{type}</span>
          <div style={{ height: '12px', background: '#e8edf4', borderRadius: '10px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${(counts[i] / max) * 100}%`,
                background: 'linear-gradient(90deg,var(--blue),#6aa5ef)',
                borderRadius: '10px',
              }}
            />
          </div>
          <b>{counts[i]}</b>
        </div>
      ))}
    </div>
  );
}
