interface PriorityBarChartItem {
  motivator: string;
  score: number;
}

interface PriorityBarChartProps {
  /** Pre-sorted by the caller (ascending by score: 1 = más importante). */
  items: PriorityBarChartItem[];
  ariaLabel: string;
}

const MAX_SCORE = 10;
const BAR_AREA_HEIGHT = 160;

export function PriorityBarChart({ items, ariaLabel }: PriorityBarChartProps) {
  const heights = items.map((item) => Math.max(0, MAX_SCORE - item.score));
  const max = Math.max(1, ...heights);

  return (
    <div role="img" aria-label={ariaLabel}>
      <div className="flex items-end gap-[9px]" style={{ height: `${BAR_AREA_HEIGHT}px` }}>
        {items.map((item, i) => (
          <div
            key={item.motivator}
            className="flex-1 rounded-t-lg"
            title={`${item.motivator}: prioridad ${item.score}`}
            style={{
              height: `${(heights[i] / max) * 100}%`,
              minHeight: '4px',
              background: 'linear-gradient(180deg,var(--blue),#6aa5ef)',
            }}
          />
        ))}
      </div>
      <div className="flex gap-[9px] mt-[7px]">
        {items.map((item) => (
          <span
            key={item.motivator}
            className="flex-1 text-[11px] text-center text-[var(--mut)] leading-tight"
          >
            {item.motivator}
          </span>
        ))}
      </div>
    </div>
  );
}
