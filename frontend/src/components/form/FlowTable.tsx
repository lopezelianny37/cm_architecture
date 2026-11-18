import { WASTE_TYPES } from '../../constants/gemba.constants';
import type { FlowStep, WasteType } from '../../types/api';

interface FlowTableProps {
  flowSteps: FlowStep[];
  onChange: (flowSteps: FlowStep[]) => void;
}

function emptyStep(): FlowStep {
  return { step: '', objective: '', with: '', out: '', waste: '', observations: '' };
}

export function FlowTable({ flowSteps, onChange }: FlowTableProps) {
  function updateAt(index: number, patch: Partial<FlowStep>) {
    onChange(flowSteps.map((f, i) => (i === index ? { ...f, ...patch } : f)));
  }

  function addStep() {
    onChange([...flowSteps, emptyStep()]);
  }

  function deleteStep(index: number) {
    onChange(flowSteps.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div
        className="hidden desktop:grid gap-[7px] text-[10px] font-extrabold text-[var(--mut)] my-2"
        style={{ gridTemplateColumns: '34px 1.15fr 1fr 1fr 1fr 0.85fr 1.15fr 34px' }}
      >
        <span></span>
        <span>Qué hizo</span>
        <span>Objetivo del paso</span>
        <span>Con quién</span>
        <span>Salida / decisión</span>
        <span>Tipo</span>
        <span>Observaciones</span>
        <span></span>
      </div>

      {flowSteps.map((f, i) => (
        <div
          key={i}
          className="grid grid-cols-[34px_1fr] desktop:grid-cols-[34px_1.15fr_1fr_1fr_1fr_0.85fr_1.15fr_34px] gap-[7px] items-start desktop:items-center my-2 pb-3 desktop:pb-0 border-b desktop:border-b-0 border-[var(--line)]"
        >
          <span className="w-[30px] h-[30px] rounded-full grid place-items-center bg-[var(--sky)] text-[var(--blue)] font-extrabold">
            {i + 1}
          </span>
          <input
            className="col-start-2 desktop:col-auto mb-[7px] desktop:mb-0 p-2 min-h-11 border border-[var(--line)] rounded-lg"
            placeholder="Qué hizo"
            value={f.step}
            onChange={(e) => updateAt(i, { step: e.target.value })}
          />
          <input
            className="col-start-2 desktop:col-auto mb-[7px] desktop:mb-0 p-2 min-h-11 border border-[var(--line)] rounded-lg"
            placeholder="Objetivo del paso"
            value={f.objective}
            onChange={(e) => updateAt(i, { objective: e.target.value })}
          />
          <input
            className="col-start-2 desktop:col-auto mb-[7px] desktop:mb-0 p-2 min-h-11 border border-[var(--line)] rounded-lg"
            placeholder="Con quién"
            value={f.with}
            onChange={(e) => updateAt(i, { with: e.target.value })}
          />
          <input
            className="col-start-2 desktop:col-auto mb-[7px] desktop:mb-0 p-2 min-h-11 border border-[var(--line)] rounded-lg"
            placeholder="Salida / decisión"
            value={f.out}
            onChange={(e) => updateAt(i, { out: e.target.value })}
          />
          <select
            className="col-start-2 desktop:col-auto mb-[7px] desktop:mb-0 p-2 min-h-11 border border-[var(--line)] rounded-lg"
            value={f.waste}
            onChange={(e) => updateAt(i, { waste: e.target.value as WasteType })}
          >
            <option value="">Clasificar…</option>
            {WASTE_TYPES.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
          <input
            className="col-start-2 desktop:col-auto mb-[7px] desktop:mb-0 p-2 min-h-11 border border-[var(--line)] rounded-lg"
            placeholder="Observaciones"
            value={f.observations}
            onChange={(e) => updateAt(i, { observations: e.target.value })}
          />
          <button
            type="button"
            className="print:hidden col-start-2 desktop:col-auto justify-self-start w-11 h-11 border border-[var(--line)] rounded-lg bg-white"
            onClick={() => deleteStep(i)}
            aria-label={`Eliminar paso ${i + 1}`}
          >
            ×
          </button>
        </div>
      ))}

      <button
        type="button"
        className="print:hidden border border-[var(--line)] rounded-lg px-3 min-h-11 bg-white mt-2 w-full desktop:w-auto"
        onClick={addStep}
      >
        + Agregar paso
      </button>
    </div>
  );
}
