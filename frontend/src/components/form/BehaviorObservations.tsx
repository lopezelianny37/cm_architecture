import { BEH } from '../../constants/gemba.constants';
import type { BehaviorObservation, BehaviorState } from '../../types/api';

interface BehaviorObservationsProps {
  behaviors: BehaviorObservation[];
  onChange: (behaviors: BehaviorObservation[]) => void;
}

const STATE_OPTIONS: Array<[BehaviorState, string]> = [
  ['si', '✓ Observado'],
  ['par', '◐ Parcial'],
  ['no', '○ No observado'],
  ['na', 'N/A'],
];

export function BehaviorObservations({ behaviors, onChange }: BehaviorObservationsProps) {
  function updateAt(index: number, patch: Partial<BehaviorObservation>) {
    const next = behaviors.map((b, i) => (i === index ? { ...b, ...patch } : b));
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-3">
      {BEH.map((def, i) => {
        const observation = behaviors[i] ?? { state: 'na', fact: '', artifact: '' };
        return (
          <div key={def.name} className="border border-[var(--line)] rounded-xl p-[13px]">
            <div className="flex gap-[10px]">
              <span className="flex-none w-[28px] h-[28px] rounded-full grid place-items-center bg-[#fff0f1] text-[var(--red)] font-black">
                {i + 1}
              </span>
              <div className="flex-1">
                <h3 className="text-[15px] m-0 mb-1">{def.name}</h3>
                <div className="text-[12px] text-[var(--mut)] mb-2">{def.description}</div>
                <div className="flex gap-[6px] flex-wrap mb-2">
                  {STATE_OPTIONS.map(([value, label]) => (
                    <label
                      key={value}
                      className="px-[8px] py-[5px] border border-[var(--line)] rounded-lg text-[12px]"
                    >
                      <input
                        type="radio"
                        name={`behavior-${i}`}
                        value={value}
                        checked={observation.state === value}
                        onChange={() => updateAt(i, { state: value })}
                        className="mr-1 accent-[var(--red)]"
                      />
                      {label}
                    </label>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <label className="block text-[11px] font-bold text-[var(--mut)]">
                    Hecho observado
                    <textarea
                      className="w-full mt-1 p-2 border border-[var(--line)] rounded-lg"
                      rows={2}
                      placeholder="Hecho, cita o decisión; no juicio."
                      value={observation.fact}
                      onChange={(e) => updateAt(i, { fact: e.target.value })}
                    />
                  </label>
                  <label className="block text-[11px] font-bold text-[var(--mut)]">
                    Evidencia / artefacto
                    <textarea
                      className="w-full mt-1 p-2 border border-[var(--line)] rounded-lg"
                      rows={2}
                      placeholder="Documento, correo, canvas, decisión, captura…"
                      value={observation.artifact}
                      onChange={(e) => updateAt(i, { artifact: e.target.value })}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
