import { useEffect, useState } from 'react';
import { useRecordForm } from '../hooks/useRecordForm';
import { useAutoSave } from '../hooks/useAutoSave';
import { AutoSaveField } from '../components/form/AutoSaveField';
import { MotivatorList } from '../components/form/MotivatorList';
import { BehaviorObservations } from '../components/form/BehaviorObservations';
import { FlowTable } from '../components/form/FlowTable';
import { Toast } from '../components/Toast';
import type { BehaviorObservation, FlowStep } from '../types/api';

interface FormViewProps {
  recordId: string;
  onBack: () => void;
}

type TabId = 'prep' | 'gemba' | 'diag';

function defaultBehaviors(): BehaviorObservation[] {
  return Array.from({ length: 8 }, () => ({ state: 'na', fact: '', artifact: '' }));
}

export function FormView({ recordId, onBack }: FormViewProps) {
  const { record, motivators, setMotivators, loading, updateField, saveMotivators, toast } =
    useRecordForm(recordId);

  const [activeTab, setActiveTab] = useState<TabId>('prep');
  const [behaviors, setBehaviors] = useState<BehaviorObservation[] | null>(null);
  const [flowSteps, setFlowSteps] = useState<FlowStep[] | null>(null);

  useAutoSave(motivators, saveMotivators);
  useAutoSave(behaviors, (v) => {
    if (v) updateField({ behaviors: v });
  });
  useAutoSave(flowSteps, (v) => {
    if (v) updateField({ flowSteps: v });
  });

  useEffect(() => {
    if (record && behaviors === null) {
      setBehaviors(record.behaviors ?? defaultBehaviors());
    }
    if (record && flowSteps === null) {
      setFlowSteps(record.flow_steps ?? []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record]);

  if (loading || !record || behaviors === null || flowSteps === null) {
    return <div className="max-w-[1280px] mx-auto p-5">Cargando…</div>;
  }

  const currentBehaviors = behaviors;
  const currentFlowSteps = flowSteps;

  const hasObservedBehavior = currentBehaviors.some((b) => b.state !== 'na');
  const hasFlowStep = currentFlowSteps.some((f) => f.objective || f.out);
  const diagReady = hasObservedBehavior && hasFlowStep;

  return (
    <div className="max-w-[1280px] mx-auto p-5 flex flex-col gap-[14px]">
      <div className="bg-white border border-[var(--line)] rounded-2xl p-[18px] shadow-[var(--shadow)]">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-[11px]">
          <AutoSaveField
            label="Arquitecto"
            initialValue={record.architect_name ?? ''}
            placeholder="Nombre"
            onSave={(v) => updateField({ architectName: v })}
          />
          <AutoSaveField
            label="Macrodominio"
            initialValue={record.macrodomain ?? ''}
            placeholder="Ej.: Data, Channels"
            onSave={(v) => updateField({ macrodomain: v })}
          />
          <AutoSaveField
            label="Iniciativa real"
            initialValue={record.initiative_name ?? ''}
            placeholder="Nombre de la iniciativa"
            onSave={(v) => updateField({ initiativeName: v })}
          />
          <AutoSaveField
            label="Referente de Negocio"
            initialValue={record.business_referent ?? ''}
            placeholder="Nombre / rol"
            onSave={(v) => updateField({ businessReferent: v })}
          />
        </div>
        <div className="flex justify-between items-center gap-[9px] mt-3 flex-wrap">
          <span className="text-[11px] text-[var(--green)]">✓ Guardado automático</span>
          <button
            type="button"
            className="border border-[var(--line)] rounded-lg px-3 py-1 bg-white"
            onClick={onBack}
          >
            Volver al home
          </button>
        </div>
      </div>

      <nav className="flex gap-[7px] flex-wrap">
        <button
          type="button"
          onClick={() => setActiveTab('prep')}
          className={`rounded-lg px-[11px] py-2 font-extrabold border ${
            activeTab === 'prep'
              ? 'bg-[var(--navy)] border-[var(--navy)] text-white'
              : 'bg-white border-[var(--line)] text-[#44516a]'
          }`}
        >
          0 · Preparar
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('gemba')}
          className={`rounded-lg px-[11px] py-2 font-extrabold border ${
            activeTab === 'gemba'
              ? 'bg-[var(--navy)] border-[var(--navy)] text-white'
              : 'bg-white border-[var(--line)] text-[#44516a]'
          }`}
        >
          1 · Gemba baseline
        </button>
        <button
          type="button"
          disabled
          title={
            diagReady
              ? 'Disponible en Fase 5'
              : 'Registra al menos 1 comportamiento observado y 1 paso de flujo con objetivo/salida antes de continuar'
          }
          className="rounded-lg px-[11px] py-2 font-extrabold border border-[var(--line)] bg-white text-[#44516a] opacity-50 cursor-not-allowed"
        >
          2 · Diagnóstico {!diagReady && '⚠'}
        </button>
      </nav>

      {activeTab === 'prep' && (
        <>
          <div className="bg-white border border-[var(--line)] rounded-2xl p-[18px] shadow-[var(--shadow)]">
            <span className="inline-block rounded-full px-[9px] py-[3px] text-[11px] font-extrabold bg-[#fff4dc] text-[var(--amber)] mb-2">
              Desire · Management 3.0
            </span>
            <h2 className="text-[19px] m-0 mb-3">Preparar: valor, barreras y motivadores</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[11px]">
              <AutoSaveField
                label="¿Para mí este piloto habrá valido la pena si…?"
                initialValue={record.prep_value ?? ''}
                as="textarea"
                rows={4}
                onSave={(v) => updateField({ prepValue: v })}
              />
              <AutoSaveField
                label="¿Qué me podría dificultar ejercer este nuevo rol?"
                initialValue={record.prep_barrier ?? ''}
                as="textarea"
                rows={4}
                onSave={(v) => updateField({ prepBarrier: v })}
              />
            </div>
          </div>

          <div className="bg-white border border-[var(--line)] rounded-2xl p-[18px] shadow-[var(--shadow)]">
            <h2 className="text-[19px] m-0 mb-2">Moving Motivators</h2>
            <p className="text-[var(--mut)] mb-3">
              Ordena las tarjetas de arriba a abajo, desde la menos importante hasta la más
              importante. Luego mueve la barra hacia la derecha si el cambio fortalece el
              motivador y hacia la izquierda si lo debilita.
            </p>
            <MotivatorList motivators={motivators} onChange={setMotivators} />
          </div>
        </>
      )}

      {activeTab === 'gemba' && (
        <>
          <div className="bg-white border border-[var(--line)] rounded-2xl p-[18px] shadow-[var(--shadow)]">
            <span className="inline-block rounded-full px-[9px] py-[3px] text-[11px] font-extrabold bg-[#fff0f1] text-[var(--red)] mb-2">
              Gemba 1 · Baseline
            </span>
            <h2 className="text-[19px] m-0 mb-2">Observar el trabajo real</h2>
            <p className="text-[var(--mut)] mb-3">
              Registra hechos, decisiones y artefactos. "No observado" significa que no apareció
              en esta situación, no que la persona no tenga la capacidad.
            </p>
            <BehaviorObservations behaviors={currentBehaviors} onChange={setBehaviors} />
          </div>

          <div className="bg-white border border-[var(--line)] rounded-2xl p-[18px] shadow-[var(--shadow)]">
            <h2 className="text-[19px] m-0 mb-2">Flujo real que siguió</h2>
            <div className="p-[11px_13px] border-l-4 border-[var(--blue)] bg-[var(--sky)] rounded-lg mb-3">
              Reconstruye los pasos reales que el arquitecto sigue desde que recibe una
              iniciativa hasta que recomienda o acompaña una decisión. <b>Pregunta Gemba:</b>{' '}
              "Muéstrame qué hiciste primero, luego qué ocurrió y quién participó". Registra el
              proceso real, no el proceso ideal.
            </div>
            <FlowTable flowSteps={currentFlowSteps} onChange={setFlowSteps} />
          </div>
        </>
      )}

      <Toast message={toast.message} />
    </div>
  );
}
