import { useState } from 'react';
import { MOT } from '../../constants/gemba.constants';

interface StepOrdenarProps {
  /** Motivator names in left-to-right visual order. */
  order: string[];
  onChange: (order: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const MOT_BY_NAME = new Map(MOT.map((m) => [m.name, m]));

function swap(order: string[], name: string, direction: 'left' | 'right'): string[] {
  const index = order.indexOf(name);
  const targetIndex = direction === 'left' ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= order.length) return order;

  const next = [...order];
  [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
  return next;
}

export function StepOrdenar({ order, onChange, onNext, onBack }: StepOrdenarProps) {
  const [draggedName, setDraggedName] = useState<string | null>(null);

  function handleDrop(targetName: string) {
    if (!draggedName || draggedName === targetName) return;

    const fromIndex = order.indexOf(draggedName);
    const toIndex = order.indexOf(targetName);
    if (fromIndex === -1 || toIndex === -1) return;

    const reordered = [...order];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);

    onChange(reordered);
    setDraggedName(null);
  }

  return (
    <div className="card bg-white border border-[var(--line)] rounded-2xl p-[18px] shadow-[var(--shadow)]">
      <span className="inline-block rounded-full px-[9px] py-[3px] text-[11px] font-extrabold bg-[var(--sky)] text-[var(--blue)] mb-2">
        Paso 1 · Ordenar
      </span>
      <h2 className="text-[19px] m-0 mb-2">¿Qué te mueve?</h2>
      <p className="text-[var(--mut)] mb-3">
        Arrastrá las tarjetas: a la izquierda las menos importantes, a la derecha las más
        importantes para vos.
      </p>

      <div className="flex justify-between text-[11px] font-bold text-[var(--mut)] mb-1 px-1">
        <span>← Menos importante</span>
        <span>Más importante →</span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {order.map((name) => {
          const def = MOT_BY_NAME.get(name);
          if (!def) return null;
          return (
            <div
              key={name}
              draggable
              onDragStart={() => setDraggedName(name)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(name)}
              className="flex-none w-[150px] border border-[var(--line)] rounded-xl p-[10px] bg-white cursor-grab"
            >
              <b className="block text-[13px] mb-1">{def.name}</b>
              <span className="text-[11px] text-[var(--mut)]">{def.description}</span>
              <div className="flex justify-between mt-2">
                <button
                  type="button"
                  className="print:hidden w-11 h-11 border border-[var(--line)] rounded-lg bg-white"
                  onClick={() => onChange(swap(order, name, 'left'))}
                  aria-label={`Mover ${name} a la izquierda`}
                >
                  ←
                </button>
                <button
                  type="button"
                  className="print:hidden w-11 h-11 border border-[var(--line)] rounded-lg bg-white"
                  onClick={() => onChange(swap(order, name, 'right'))}
                  aria-label={`Mover ${name} a la derecha`}
                >
                  →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between mt-4">
        <button
          type="button"
          className="border border-[var(--line)] rounded-lg px-3 min-h-11 bg-white"
          onClick={onBack}
        >
          Atrás
        </button>
        <button
          type="button"
          className="border-0 rounded-lg px-[13px] min-h-11 font-extrabold bg-[var(--red)] text-white"
          onClick={onNext}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
