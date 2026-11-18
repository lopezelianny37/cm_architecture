import { MOT } from '../../constants/gemba.constants';

interface StepImpactoProps {
  /** motivator name -> impact (-4..4), defaults to 0 (Centro) when absent. */
  impacts: Record<string, number>;
  onChange: (impacts: Record<string, number>) => void;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
  error: string | null;
}

export function StepImpacto({
  impacts,
  onChange,
  onBack,
  onSubmit,
  submitting,
  error,
}: StepImpactoProps) {
  function setImpact(name: string, value: number) {
    onChange({ ...impacts, [name]: value });
  }

  return (
    <div className="card bg-white border border-[var(--line)] rounded-2xl p-[18px] shadow-[var(--shadow)]">
      <span className="inline-block rounded-full px-[9px] py-[3px] text-[11px] font-extrabold bg-[var(--sky)] text-[var(--blue)] mb-2">
        Paso 2 · Impacto
      </span>
      <h2 className="text-[19px] m-0 mb-2">¿Cómo impacta el nuevo rol?</h2>
      <p className="text-[var(--mut)] mb-3">
        Para cada motivador: arriba si el cambio lo favorece, abajo si lo debilita, al centro si
        es neutro. Podés ajustar la intensidad entre −4 y +4.
      </p>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {MOT.map((def) => {
          const value = impacts[def.name] ?? 0;
          return (
            <div
              key={def.name}
              className="flex-none w-[130px] flex flex-col items-center border border-[var(--line)] rounded-xl p-[10px] bg-white"
            >
              <b className="text-[12px] text-center mb-1">{def.name}</b>
              <span className="text-[10px] text-[var(--green)] font-bold">Arriba</span>
              <div className="h-[140px] flex items-center justify-center my-1">
                <input
                  type="range"
                  min={-4}
                  max={4}
                  step={1}
                  value={value}
                  onChange={(e) => setImpact(def.name, Number(e.target.value))}
                  aria-label={`Impacto de ${def.name}`}
                  style={{ transform: 'rotate(-90deg)', width: '120px' }}
                />
              </div>
              <span className="text-[10px] text-[var(--red)] font-bold">Abajo</span>
              <b className="mt-2 text-[14px] text-[var(--navy)]">
                {value > 0 ? `+${value}` : value}
              </b>
            </div>
          );
        })}
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
          className="border border-[var(--line)] rounded-lg px-3 min-h-11 bg-white disabled:opacity-50"
          onClick={onBack}
        >
          Atrás
        </button>
        <button
          type="button"
          disabled={submitting}
          className="border-0 rounded-lg px-[13px] min-h-11 font-extrabold bg-[var(--red)] text-white disabled:opacity-50"
          onClick={onSubmit}
        >
          {submitting ? 'Enviando…' : 'Enviar'}
        </button>
      </div>
    </div>
  );
}
