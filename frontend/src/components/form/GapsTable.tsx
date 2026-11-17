import { TYPES } from '../../constants/gemba.constants';
import type { Gap } from '../../types/api';

interface GapsTableProps {
  gaps: Gap[];
  onChange: (gaps: Gap[]) => void;
}

function emptyGap(): Gap {
  return { text: '', type: TYPES[0], evidence: '', condition: '' };
}

export function GapsTable({ gaps, onChange }: GapsTableProps) {
  function updateAt(index: number, patch: Partial<Gap>) {
    onChange(gaps.map((g, i) => (i === index ? { ...g, ...patch } : g)));
  }

  function addGap() {
    onChange([...gaps, emptyGap()]);
  }

  function deleteGap(index: number) {
    onChange(gaps.filter((_, i) => i !== index));
  }

  return (
    <div>
      {gaps.map((g, i) => (
        <div
          key={i}
          className="grid grid-cols-1 md:grid-cols-[1.3fr_0.9fr_1.1fr_1.1fr_34px] gap-[8px] items-center my-2 p-[9px] border border-[var(--line)] rounded-xl"
        >
          <input
            className="p-2 border border-[var(--line)] rounded-lg"
            placeholder="Brecha / hallazgo"
            value={g.text}
            onChange={(e) => updateAt(i, { text: e.target.value })}
          />
          <select
            className="p-2 border border-[var(--line)] rounded-lg"
            value={g.type}
            onChange={(e) => updateAt(i, { type: e.target.value })}
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <input
            className="p-2 border border-[var(--line)] rounded-lg"
            placeholder="Evidencia"
            value={g.evidence}
            onChange={(e) => updateAt(i, { evidence: e.target.value })}
          />
          <input
            className="p-2 border border-[var(--line)] rounded-lg"
            placeholder="Condición para ejercer el rol"
            value={g.condition}
            onChange={(e) => updateAt(i, { condition: e.target.value })}
          />
          <button
            type="button"
            className="w-[32px] h-[32px] border border-[var(--line)] rounded-lg bg-white"
            onClick={() => deleteGap(i)}
            aria-label={`Eliminar brecha ${i + 1}`}
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        className="border border-[var(--line)] rounded-lg px-3 py-2 bg-white mt-2"
        onClick={addGap}
      >
        + Agregar brecha
      </button>
    </div>
  );
}
