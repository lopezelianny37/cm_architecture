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
          className="grid grid-cols-1 tablet:grid-cols-[1.3fr_0.9fr_1.1fr_1.1fr_44px] gap-[8px] items-center my-2 p-[9px] border border-[var(--line)] rounded-xl"
        >
          <input
            className="p-2 min-h-11 border border-[var(--line)] rounded-lg"
            placeholder="Brecha / hallazgo"
            value={g.text}
            onChange={(e) => updateAt(i, { text: e.target.value })}
          />
          <select
            className="p-2 min-h-11 border border-[var(--line)] rounded-lg"
            value={g.type}
            onChange={(e) => updateAt(i, { type: e.target.value })}
          >
            {/* A gap saved before the type list changed may have a value
                that's no longer in TYPES (e.g. "Proceso"). Keep it as its
                own option instead of silently blanking the select — the
                value only changes when the user explicitly picks a new one. */}
            {g.type && !TYPES.includes(g.type) && (
              <option value={g.type}>{g.type} (tipo anterior)</option>
            )}
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <input
            className="p-2 min-h-11 border border-[var(--line)] rounded-lg"
            placeholder="Evidencia"
            value={g.evidence}
            onChange={(e) => updateAt(i, { evidence: e.target.value })}
          />
          <input
            className="p-2 min-h-11 border border-[var(--line)] rounded-lg"
            placeholder="Condición para ejercer el rol"
            value={g.condition}
            onChange={(e) => updateAt(i, { condition: e.target.value })}
          />
          <button
            type="button"
            className="print:hidden w-11 h-11 border border-[var(--line)] rounded-lg bg-white"
            onClick={() => deleteGap(i)}
            aria-label={`Eliminar brecha ${i + 1}`}
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        className="print:hidden border border-[var(--line)] rounded-lg px-3 min-h-11 bg-white mt-2 w-full tablet:w-auto"
        onClick={addGap}
      >
        + Agregar brecha
      </button>
    </div>
  );
}
