interface RadarChartProps {
  labels: string[];
  values: number[];
  color: string;
  ariaLabel: string;
}

const CX = 210;
const CY = 142;
const R = 105;

function point(n: number, i: number, v = 1): [number, number] {
  const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
  return [CX + Math.cos(angle) * R * v, CY + Math.sin(angle) * R * v];
}

export function RadarChart({ labels, values, color, ariaLabel }: RadarChartProps) {
  const n = labels.length;
  const gridLevels = [1, 2, 3, 4];

  const dataPoints = values.map((v, i) => point(n, i, Math.max(0, Math.min(1, v))));
  const dataPolygon = dataPoints.map((p) => p.join(',')).join(' ');

  return (
    <svg className="radar" viewBox="0 0 420 290" aria-label={ariaLabel} style={{ width: '100%', height: '275px' }}>
      {gridLevels.map((l) => {
        const ringPoints = labels
          .map((_, i) => point(n, i, l / 4).join(','))
          .join(' ');
        return (
          <polygon key={l} points={ringPoints} fill="none" stroke="#dce3ed" />
        );
      })}

      {labels.map((label, i) => {
        const [x, y] = point(n, i);
        const [qx, qy] = point(n, i, 1.22);
        const anchor = qx < CX - 10 ? 'end' : qx > CX + 10 ? 'start' : 'middle';
        return (
          <g key={label}>
            <line x1={CX} y1={CY} x2={x} y2={y} stroke="#dce3ed" />
            <text x={qx} y={qy} textAnchor={anchor} fontSize={10} fill="#66738a">
              {label}
            </text>
          </g>
        );
      })}

      <polygon points={dataPolygon} fill={color} fillOpacity={0.2} stroke={color} strokeWidth={2} />

      {values.map((v, i) => {
        const [x, y] = point(n, i, v);
        return <circle key={i} cx={x} cy={y} r={3} fill={color} />;
      })}
    </svg>
  );
}
