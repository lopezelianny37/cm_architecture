import { useEffect, useRef, useState } from 'react';
import { MOT, MOT_COLORS } from '../../constants/gemba.constants';
import { MotivatorIcon } from './MotivatorIcon';
import {
  IMPACT_MAX,
  IMPACT_MIN,
  impactToTrackFraction,
  trackFractionToImpact,
} from '../../lib/impactTrack';

const MOT_BY_NAME = new Map(MOT.map((m) => [m.name, m]));
const TRACK_LEVELS = [4, 3, 2, 1, 0, -1, -2, -3, -4];
const TRACK_HEIGHT = 320;

interface StepImpactoProps {
  /** Motivator names in the same left-to-right order chosen in Step 1 (left = most important). */
  order: string[];
  /** motivator name -> impact (-4..4), defaults to 0 (Centro) when absent. */
  impacts: Record<string, number>;
  onChange: (impacts: Record<string, number>) => void;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
  error: string | null;
}

export function StepImpacto({
  order,
  impacts,
  onChange,
  onBack,
  onSubmit,
  submitting,
  error,
}: StepImpactoProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [draggingName, setDraggingName] = useState<string | null>(null);
  const [focusedName, setFocusedName] = useState<string | null>(null);

  function setImpact(name: string, value: number) {
    onChange({ ...impacts, [name]: value });
  }

  useEffect(() => {
    if (!draggingName) return;

    function handlePointerMove(e: PointerEvent) {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const fraction = (e.clientY - rect.top) / rect.height;
      setImpact(draggingName as string, trackFractionToImpact(fraction));
    }
    function handlePointerUp() {
      setDraggingName(null);
    }

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draggingName, impacts]);

  function handleKeyDown(name: string, e: React.KeyboardEvent) {
    const current = impacts[name] ?? 0;
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setImpact(name, Math.min(IMPACT_MAX, current + 1));
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setImpact(name, Math.max(IMPACT_MIN, current - 1));
    }
  }

  const activeName = draggingName ?? focusedName;

  return (
    <div className="card bg-white border border-[var(--line)] rounded-2xl p-[18px] shadow-[var(--shadow)]">
      <span className="inline-block rounded-full px-[9px] py-[3px] text-[11px] font-extrabold bg-[var(--sky)] text-[var(--blue)] mb-2">
        Paso 2 · Impacto
      </span>
      <h2 className="text-[19px] m-0 mb-2">
        ¿En qué medida son fomentados estos valores actualmente en tu entorno laboral?
      </h2>
      <p className="text-[var(--mut)] mb-3">
        Ordene las tarjetas hacia arriba (muy fomentado) y hacia abajo (muy negativo); en el
        medio es indiferente o neutral.
      </p>

      <div className="flex">
        <div className="relative shrink-0" style={{ height: TRACK_HEIGHT, width: 16 }}>
          {TRACK_LEVELS.map((level) => (
            <span
              key={level}
              className="absolute left-0 -translate-y-1/2 text-[9px] font-bold text-[var(--mut)]"
              style={{ top: `${impactToTrackFraction(level) * 100}%` }}
            >
              {level > 0 ? `+${level}` : level}
            </span>
          ))}
        </div>

        <div ref={trackRef} className="relative flex-1" style={{ height: TRACK_HEIGHT }}>
          {TRACK_LEVELS.map((level) => (
            <div
              key={level}
              className="absolute left-0 right-0 border-t border-dashed border-[var(--line)]"
              style={{ top: `${impactToTrackFraction(level) * 100}%` }}
            />
          ))}

          <div className="absolute inset-0 grid grid-cols-10">
            {order.map((name) => {
              const def = MOT_BY_NAME.get(name);
              if (!def) return null;
              const color = MOT_COLORS[name] ?? 'var(--navy)';
              const value = impacts[name] ?? 0;
              const isActive = activeName === name;

              return (
                <div key={name} className="relative h-full flex justify-center min-w-0">
                  <div className="absolute top-0 bottom-0 border-l border-dashed border-[var(--line)]" />

                  <div
                    role="slider"
                    tabIndex={0}
                    aria-label={`Impacto de ${name}`}
                    aria-valuemin={IMPACT_MIN}
                    aria-valuemax={IMPACT_MAX}
                    aria-valuenow={value}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      setDraggingName(name);
                    }}
                    onFocus={() => setFocusedName(name)}
                    onBlur={() => setFocusedName((f) => (f === name ? null : f))}
                    onKeyDown={(e) => handleKeyDown(name, e)}
                    className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-11 cursor-grab flex flex-col"
                    style={{ top: `${impactToTrackFraction(value) * 100}%`, touchAction: 'none' }}
                  >
                    <div className="h-full rounded-lg overflow-hidden border border-[var(--line)] bg-white shadow-sm flex flex-col">
                      <div style={{ backgroundColor: color }} className="px-[2px] py-[1px] text-center">
                        <b className="block text-white text-[6px] uppercase leading-none break-words">
                          {def.name}
                        </b>
                      </div>
                      <div style={{ color }} className="flex-1 flex items-center justify-center p-[1px]">
                        <div className="w-4 h-4">
                          <MotivatorIcon name={name} />
                        </div>
                      </div>
                      <div className="text-center text-[8px] font-extrabold text-[var(--navy)] leading-none pb-[1px]">
                        {value > 0 ? `+${value}` : value}
                      </div>
                    </div>

                    {isActive && (
                      <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 w-[110px] bg-[var(--navy)] text-white text-[9px] leading-tight rounded-lg p-[6px] z-10 pointer-events-none">
                        {def.description}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {error && (
        <p className="p-[11px_13px] border-l-4 border-[var(--red)] bg-[#fff0f1] text-[var(--red)] rounded-lg mt-3">
          {error}
        </p>
      )}

      <div className="flex justify-between mt-4">
        <button
          type="button"
          disabled={submitting}
          className="border border-[var(--line)] rounded-lg px-3 min-h-11 bg-white"
          onClick={onBack}
        >
          Atrás
        </button>
        <button
          type="button"
          disabled={submitting}
          className="border-0 rounded-lg px-[13px] min-h-11 font-extrabold bg-[var(--red)] text-white"
          onClick={onSubmit}
        >
          {submitting ? 'Enviando…' : 'Enviar'}
        </button>
      </div>
    </div>
  );
}
