import { useEffect, useState } from 'react';
import { useRecordForm } from '../hooks/useRecordForm';
import { useAutoSave } from '../hooks/useAutoSave';
import { AutoSaveField } from '../components/form/AutoSaveField';
import { MotivatorResultView } from '../components/form/MotivatorResultView';
import { BehaviorObservations } from '../components/form/BehaviorObservations';
import { FlowTable } from '../components/form/FlowTable';
import { DebriefSection } from '../components/form/DebriefSection';
import { FlowQA } from '../components/form/FlowQA';
import { GapsTable } from '../components/form/GapsTable';
import { ConditionsChecklist } from '../components/form/ConditionsChecklist';
import { RadarChart } from '../components/charts/RadarChart';
import { Toast } from '../components/Toast';
import { exportOneRecord } from '../lib/exportImport';
import { computeIndividualObservationRadar } from '../lib/individualRadar';
import { BEH_SHORT_LABELS, PUBLIC_MACRODOMAINS } from '../constants/gemba.constants';
import type { BehaviorObservation, ConditionEntry, FlowStep, Gap } from '../types/api';

interface FormViewProps {
  recordId: string;
  onBack: () => void;
}

type TabId = 'prep' | 'gemba' | 'diag';

function defaultBehaviors(): BehaviorObservation[] {
  return Array.from({ length: 7 }, () => ({ state: 'na', fact: '', artifact: '' }));
}

function defaultConditions(): ConditionEntry[] {
  return Array.from({ length: 7 }, () => ({ status: '', evidence: '' }));
}

export function FormView({ recordId, onBack }: FormViewProps) {
  const { record, loading, updateField, toast } = useRecordForm(recordId);
  const motivatorsWizardUrl = `${window.location.origin}/motivadores`;

  async function handleCopyMotivatorsLink() {
    try {
      await navigator.clipboard.writeText(motivatorsWizardUrl);
      toast.show('Enlace copiado');
    } catch {
      toast.show('No se pudo copiar el enlace');
    }
  }

  const [activeTab, setActiveTab] = useState<TabId>('prep');
  const [behaviors, setBehaviors] = useState<BehaviorObservation[] | null>(null);
  const [flowSteps, setFlowSteps] = useState<FlowStep[] | null>(null);
  const [flowQa, setFlowQa] = useState<string[] | null>(null);
  const [gaps, setGaps] = useState<Gap[] | null>(null);
  const [conditions, setConditions] = useState<ConditionEntry[] | null>(null);

  const dataReady = !loading && record !== null;

  useAutoSave(
    behaviors,
    (v) => {
      if (v) updateField({ behaviors: v });
    },
    { enabled: dataReady && behaviors !== null },
  );
  useAutoSave(
    flowSteps,
    (v) => {
      if (v) updateField({ flowSteps: v });
    },
    { enabled: dataReady && flowSteps !== null },
  );
  useAutoSave(
    flowQa,
    (v) => {
      if (v) updateField({ flowQa: v });
    },
    { enabled: dataReady && flowQa !== null },
  );
  useAutoSave(
    gaps,
    (v) => {
      if (v) updateField({ gaps: v });
    },
    { enabled: dataReady && gaps !== null },
  );
  useAutoSave(
    conditions,
    (v) => {
      if (v) updateField({ conditions: v });
    },
    { enabled: dataReady && conditions !== null },
  );

  useEffect(() => {
    if (!record) return;
    if (behaviors === null) setBehaviors(record.behaviors ?? defaultBehaviors());
    if (flowSteps === null) setFlowSteps(record.flow_steps ?? []);
    if (flowQa === null) setFlowQa(record.flow_qa ?? ['', '', '', '']);
    if (gaps === null) setGaps(record.gaps ?? []);
    if (conditions === null) setConditions(record.conditions ?? defaultConditions());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record]);

  if (
    loading ||
    !record ||
    behaviors === null ||
    flowSteps === null ||
    flowQa === null ||
    gaps === null ||
    conditions === null
  ) {
    return <div className="max-w-[1280px] mx-auto p-5">Cargando…</div>;
  }

  const currentBehaviors = behaviors;
  const currentFlowSteps = flowSteps;
  const currentFlowQa = flowQa;
  const currentGaps = gaps;
  const currentConditions = conditions;

  const hasObservedBehavior = currentBehaviors.some((b) => b.state !== 'na');
  const hasFlowStep = currentFlowSteps.some((f) => f.objective || f.out);
  const diagReady = hasObservedBehavior && hasFlowStep;

  // A record saved before the macrodomain list was fixed to
  // PUBLIC_MACRODOMAINS may hold a free-text value (e.g. "Data",
  // "Channels") — keep it as its own option instead of silently losing it,
  // the same accommodation already used for legacy gap types in GapsTable.
  const macrodomainOptions = [
    { value: '', label: 'Seleccioná un macrodominio' },
    ...(record.macrodomain && !PUBLIC_MACRODOMAINS.includes(record.macrodomain)
      ? [{ value: record.macrodomain, label: `${record.macrodomain} (macrodominio anterior)` }]
      : []),
    ...PUBLIC_MACRODOMAINS.map((m) => ({ value: m, label: m })),
  ];

  async function handleExportRecord() {
    try {
      await exportOneRecord(recordId);
      toast.show('Respaldo descargado');
    } catch {
      toast.show('No se pudo descargar el respaldo');
    }
  }

  return (
    <div className="max-w-[1280px] mx-auto p-5 flex flex-col gap-[14px]">
      <div className="card bg-white border border-[var(--line)] rounded-2xl p-[18px] shadow-[var(--shadow)]">
        <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-[11px]">
          <AutoSaveField
            label="Arquitecto"
            initialValue={record.architect_name ?? ''}
            placeholder="Nombre"
            onSave={(v) => updateField({ architectName: v })}
          />
          <AutoSaveField
            label="Macrodominio"
            initialValue={record.macrodomain ?? ''}
            as="select"
            options={macrodomainOptions}
            onSave={(v) => updateField({ macrodomain: v })}
          />
          <AutoSaveField
            label="Iniciativa real"
            initialValue={record.initiative_name ?? ''}
            placeholder="Nombre de la iniciativa"
            onSave={(v) => updateField({ initiativeName: v })}
          />
          <AutoSaveField
            label="Estado de la iniciativa"
            initialValue={record.initiative_status ?? ''}
            placeholder="Ej.: En evaluación, Aprobada, En curso"
            onSave={(v) => updateField({ initiativeStatus: v })}
          />
          <AutoSaveField
            label="Referente de Negocio"
            initialValue={record.business_referent ?? ''}
            placeholder="Nombre / rol"
            onSave={(v) => updateField({ businessReferent: v })}
          />
          <AutoSaveField
            label="Correo del arquitecto"
            initialValue={record.architect_email ?? ''}
            placeholder="arquitecto@empresa.com"
            onSave={(v) => updateField({ architectEmail: v })}
          />
        </div>
        <div className="flex justify-between items-center gap-[9px] mt-3 flex-wrap">
          <span className="text-[11px] text-[var(--green)]">✓ Guardado automático</span>
          <div className="print:hidden flex gap-[9px] flex-col tablet:flex-row w-full tablet:w-auto">
            <button
              type="button"
              className="border border-[var(--line)] rounded-lg px-3 min-h-11 bg-white"
              onClick={handleExportRecord}
            >
              Descargar respaldo completo
            </button>
            <button
              type="button"
              className="border border-[var(--line)] rounded-lg px-3 min-h-11 bg-white"
              onClick={onBack}
            >
              Volver al home
            </button>
          </div>
        </div>
      </div>

      <nav className="print:hidden flex gap-[7px] flex-wrap">
        <button
          type="button"
          onClick={() => setActiveTab('prep')}
          className={`rounded-lg px-[11px] min-h-11 font-extrabold border ${
            activeTab === 'prep'
              ? 'bg-[var(--navy)] border-[var(--navy)] text-white'
              : 'bg-white border-[var(--line)] text-[#44516a]'
          }`}
        >
          0 · Resumen
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('gemba')}
          className={`rounded-lg px-[11px] min-h-11 font-extrabold border ${
            activeTab === 'gemba'
              ? 'bg-[var(--navy)] border-[var(--navy)] text-white'
              : 'bg-white border-[var(--line)] text-[#44516a]'
          }`}
        >
          1 · Gemba baseline
        </button>
        <button
          type="button"
          disabled={!diagReady}
          onClick={() => diagReady && setActiveTab('diag')}
          title={
            diagReady
              ? undefined
              : 'Registra al menos 1 comportamiento observado y 1 paso de flujo con objetivo/salida antes de continuar'
          }
          className={`rounded-lg px-[11px] min-h-11 font-extrabold border ${
            !diagReady
              ? 'bg-white border-[var(--line)] text-[#44516a] opacity-50 cursor-not-allowed'
              : activeTab === 'diag'
                ? 'bg-[var(--navy)] border-[var(--navy)] text-white'
                : 'bg-white border-[var(--line)] text-[#44516a]'
          }`}
        >
          2 · Diagnóstico {!diagReady && '⚠'}
        </button>
      </nav>

      {activeTab === 'prep' && (
        <>
          <div className="card bg-white border border-[var(--line)] rounded-2xl p-[18px] shadow-[var(--shadow)]">
            <span className="inline-block rounded-full px-[9px] py-[3px] text-[11px] font-extrabold bg-[#fff4dc] text-[var(--amber)] mb-2">
              Desire · Management 3.0
            </span>
            <h2 className="text-[19px] m-0 mb-3">Preparar: valor, barreras y motivadores</h2>
            <div className="grid grid-cols-1 tablet:grid-cols-2 gap-[11px]">
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

          <div className="card bg-white border border-[var(--line)] rounded-2xl p-[18px] shadow-[var(--shadow)]">
            <div className="flex justify-between items-start gap-[9px] flex-wrap mb-2">
              <div>
                <h2 className="text-[19px] m-0 mb-2">Moving Motivators</h2>
                <p className="text-[var(--mut)]">
                  Autoevaluación del propio arquitecto, completada de forma independiente a
                  través de un enlace. Completa el correo del arquitecto arriba para vincular su
                  resultado a este registro.
                </p>
              </div>
              <div className="print:hidden flex items-center gap-[7px] text-[13px]">
                <span className="text-[var(--mut)]">{motivatorsWizardUrl}</span>
                <button
                  type="button"
                  className="border border-[var(--line)] rounded-lg px-[9px] min-h-9 bg-white"
                  onClick={handleCopyMotivatorsLink}
                >
                  Copiar
                </button>
              </div>
            </div>
            <MotivatorResultView recordId={recordId} toast={toast} />
          </div>

          <div className="card bg-white border border-[var(--line)] rounded-2xl p-[18px] shadow-[var(--shadow)] min-h-[310px]">
            <h2 className="text-[19px] m-0 mb-2">Radar de observaciones individual</h2>
            <p className="text-[var(--mut)]">
              Tu perfil de observación en este ciclo. El centro indica que el comportamiento no
              aplicó; se aleja del centro según fue no observado, parcial u observado.
            </p>
            <RadarChart
              labels={BEH_SHORT_LABELS}
              values={computeIndividualObservationRadar(currentBehaviors)}
              color="#d71920"
              ariaLabel="Radar de observaciones individual"
              strokeWidth={2.5}
              fillOpacity={0.28}
            />
          </div>
        </>
      )}

      {activeTab === 'gemba' && (
        <>
          <div className="card bg-white border border-[var(--line)] rounded-2xl p-[18px] shadow-[var(--shadow)]">
            <span className="inline-block rounded-full px-[9px] py-[3px] text-[11px] font-extrabold bg-[#fff0f1] text-[var(--red)] mb-2">
              Gemba 1 · Baseline
            </span>
            <h2 className="text-[19px] m-0 mb-2">Observar el trabajo real</h2>
            <p className="text-[var(--mut)] mb-3">
              Registra hechos, decisiones y artefactos. "N/A" significa que no apareció
              en esta situación, no que la persona no tenga la capacidad.
            </p>
            <BehaviorObservations behaviors={currentBehaviors} onChange={setBehaviors} />
          </div>

          <div className="card bg-white border border-[var(--line)] rounded-2xl p-[18px] shadow-[var(--shadow)]">
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

      {activeTab === 'diag' && diagReady && (
        <>
          <div className="card bg-white border border-[var(--line)] rounded-2xl p-[18px] shadow-[var(--shadow)]">
            <span className="inline-block rounded-full px-[9px] py-[3px] text-[11px] font-extrabold bg-[var(--sky)] text-[var(--blue)] mb-2">
              Debrief
            </span>
            <h2 className="text-[19px] m-0 mb-3">El arquitecto habla primero</h2>
            <DebriefSection
              strength={record.debrief_strength ?? ''}
              selfgap={record.debrief_selfgap ?? ''}
              block={record.debrief_block ?? ''}
              tryNext={record.debrief_try ?? ''}
              onSaveStrength={(v) => updateField({ debriefStrength: v })}
              onSaveSelfgap={(v) => updateField({ debriefSelfgap: v })}
              onSaveBlock={(v) => updateField({ debriefBlock: v })}
              onSaveTry={(v) => updateField({ debriefTry: v })}
            />
            <h3 className="mt-4 mb-2">Conversación sobre el flujo real</h3>
            <FlowQA answers={currentFlowQa} onChange={setFlowQa} />
          </div>

          <div className="card bg-white border border-[var(--line)] rounded-2xl p-[18px] shadow-[var(--shadow)]">
            <h2 className="text-[19px] m-0 mb-2">Brechas priorizadas</h2>
            <p className="text-[var(--mut)] mb-2">
              <b>Conocimiento</b> se refiere a ¿Qué sabe? Es decir, no sabe o no conoce algo
              necesario, ya sea información, conceptos y marcos que la persona debe comprender.{' '}
              <b>Competencia</b> se refiere a que no integra el conocimiento ni lo ejecuta;
              responde a ¿Qué logra hacer eficazmente en la práctica?
            </p>
            <div className="p-[11px_13px] border-l-4 border-[var(--blue)] bg-[var(--sky)] rounded-lg mb-3">
              Clasifica el hallazgo por causa principal. No todo se resuelve formando al
              arquitecto.
            </div>
            <GapsTable gaps={currentGaps} onChange={setGaps} />
          </div>

          <div className="card bg-white border border-[var(--line)] rounded-2xl p-[18px] shadow-[var(--shadow)]">
            <h2 className="text-[19px] m-0 mb-2">Condiciones para ejercer el rol</h2>
            <p className="text-[var(--mut)] mb-2">
              Permite distinguir brechas personales de barreras del sistema. Una condición no
              habilitada no debe cargarse solo al arquitecto.
            </p>
            <ConditionsChecklist conditions={currentConditions} onChange={setConditions} />
          </div>
        </>
      )}

      <Toast message={toast.message} />
    </div>
  );
}
