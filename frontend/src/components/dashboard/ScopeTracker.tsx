import { useState, useEffect, useRef } from 'react';

interface ScopeTrackerProps {
  targetScope: number;
  /**
   * Sum, across all records, of each record's completion fraction (0, 1/3,
   * 2/3, or 1 across Preparar/Gemba baseline/Diagnóstico — see
   * DashboardService.getScopeProgress). Gradual, not a plain record count.
   */
  completionSum: number;
  onTargetChange: (newTarget: number) => void;
}

export function ScopeTracker({ targetScope, completionSum, onTargetChange }: ScopeTrackerProps) {
  const [localValue, setLocalValue] = useState(targetScope);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocalValue(targetScope);
  }, [targetScope]);

  const pct = Math.min(100, Math.round((completionSum / Math.max(1, localValue)) * 100));

  function handleChange(value: number) {
    const safeValue = Math.max(1, value || 1);
    setLocalValue(safeValue);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onTargetChange(safeValue);
    }, 500);
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <label className="text-[11px] font-bold text-[var(--mut)]">
        Alcance propuesto
        <input
          className="in w-[90px] mt-1 p-2 border border-[var(--line)] rounded-lg block"
          type="number"
          min={1}
          max={500}
          value={localValue}
          onChange={(e) => handleChange(Number(e.target.value))}
        />
      </label>
      <div className="h-[10px] bg-[#e5eaf1] rounded-full overflow-hidden flex-1 min-w-[180px]">
        <i
          className="block h-full"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg,var(--red),var(--blue),var(--green))',
          }}
        />
      </div>
      <b>{pct}%</b>
    </div>
  );
}
