import { COND } from '../../constants/gemba.constants';
import type { ConditionEntry, ConditionStatus } from '../../types/api';

interface ConditionsChecklistProps {
  conditions: ConditionEntry[];
  onChange: (conditions: ConditionEntry[]) => void;
}

export function ConditionsChecklist({ conditions, onChange }: ConditionsChecklistProps) {
  function updateAt(index: number, patch: Partial<ConditionEntry>) {
    onChange(conditions.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  }

  return (
    <div>
      {COND.map((def, i) => {
        const entry = conditions[i] ?? { status: '', evidence: '' };
        return (
          <div
            key={def.name}
            className="grid grid-cols-1 tablet:grid-cols-[1.4fr_0.8fr_1.2fr] gap-[9px] items-center py-[10px] border-b border-dashed border-[var(--line)]"
          >
            <div>
              <b>{def.name}</b>
              <div className="text-[12px] text-[var(--mut)]">{def.question}</div>
            </div>
            <select
              className="p-2 min-h-11 border border-[var(--line)] rounded-lg"
              value={entry.status}
              onChange={(e) => updateAt(i, { status: e.target.value as ConditionStatus })}
            >
              <option value="">Sin observar</option>
              <option value="si">Sí, habilitada</option>
              <option value="par">Parcial</option>
              <option value="no">No, es barrera</option>
            </select>
            <input
              className="p-2 min-h-11 border border-[var(--line)] rounded-lg"
              placeholder="Evidencia / acción sistémica"
              value={entry.evidence}
              onChange={(e) => updateAt(i, { evidence: e.target.value })}
            />
          </div>
        );
      })}
    </div>
  );
}
