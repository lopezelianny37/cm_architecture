import { useState } from 'react';
import { MOT, MOT_COLORS } from '../../constants/gemba.constants';
import { MotivatorIcon } from './MotivatorIcon';
import { DescriptionTooltip } from './DescriptionTooltip';
import { isLongMotivatorName } from '../../lib/motivatorHeaderName';
import { useHoverFocusActive } from '../../lib/useHoverFocusActive';

interface StepOrdenarProps {
  /** Motivator names in left-to-right visual order (left = most important). */
  order: string[];
  onChange: (order: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const MOT_BY_NAME = new Map(MOT.map((m) => [m.name, m]));

function headerSizeClass(name: string): string {
  return isLongMotivatorName(name)
    ? 'text-[7px] desktop:text-[9px] min-[1280px]:text-[12px]'
    : 'text-[8px] desktop:text-[11px] min-[1280px]:text-[14px]';
}

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
  const { active, bind } = useHoverFocusActive();

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
        Arrastre las tarjetas de (← mayor) a (menor →) importancia, según su descripción.
      </p>

      <div className="flex justify-between text-[11px] font-bold text-[var(--mut)] mb-1 px-1">
        <span>← Más importante</span>
        <span>Menos importante →</span>
      </div>

      <div className="grid grid-cols-2 tablet:grid-cols-5 desktop:grid-cols-10 gap-[6px] desktop:gap-[14px] mt-16">
        {order.map((name) => {
          const def = MOT_BY_NAME.get(name);
          if (!def) return null;
          const color = MOT_COLORS[name] ?? 'var(--navy)';
          const isActive = active === name;

          return (
            <div key={name} className="relative cursor-grab min-w-0">
              <div
                draggable
                tabIndex={0}
                onDragStart={() => setDraggedName(name)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(name)}
                aria-label={`${def.name}: ${def.description}`}
                {...bind(name)}
                className="rounded-xl overflow-hidden border border-[var(--line)] bg-white flex flex-col"
              >
                <div style={{ backgroundColor: color }} className="px-[4px] py-[4px] desktop:py-[8px] min-[1280px]:py-[10px] text-center">
                  <b
                    className={`block text-white ${headerSizeClass(def.name)} uppercase tracking-wide leading-tight whitespace-nowrap overflow-hidden text-ellipsis`}
                  >
                    {def.name}
                  </b>
                </div>
                <div
                  style={{ color }}
                  className="flex items-center justify-center p-[6px] desktop:p-[10px] min-[1280px]:p-[14px]"
                >
                  <div className="w-9 h-9 desktop:w-12 desktop:h-12 min-[1280px]:w-16 min-[1280px]:h-16">
                    <MotivatorIcon name={name} />
                  </div>
                </div>
                <div className="flex gap-[4px] desktop:gap-[8px] justify-center p-[4px] desktop:p-[8px]">
                  <button
                    type="button"
                    className="print:hidden w-11 h-11 desktop:w-8 desktop:h-8 border border-[var(--line)] rounded-lg bg-white text-[14px] desktop:text-[13px] shrink-0"
                    onClick={() => onChange(swap(order, name, 'left'))}
                    aria-label={`Mover ${name} a la izquierda`}
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    className="print:hidden w-11 h-11 desktop:w-8 desktop:h-8 border border-[var(--line)] rounded-lg bg-white text-[14px] desktop:text-[13px] shrink-0"
                    onClick={() => onChange(swap(order, name, 'right'))}
                    aria-label={`Mover ${name} a la derecha`}
                  >
                    →
                  </button>
                </div>
              </div>

              {isActive && <DescriptionTooltip description={def.description} position="above" />}
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
