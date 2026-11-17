import { useRecordForm } from '../hooks/useRecordForm';
import { useAutoSave } from '../hooks/useAutoSave';
import { AutoSaveField } from '../components/form/AutoSaveField';
import { MotivatorList } from '../components/form/MotivatorList';
import { Toast } from '../components/Toast';

interface FormViewProps {
  recordId: string;
  onBack: () => void;
}

export function FormView({ recordId, onBack }: FormViewProps) {
  const { record, motivators, setMotivators, loading, updateField, saveMotivators, toast } =
    useRecordForm(recordId);

  useAutoSave(motivators, saveMotivators);

  if (loading || !record) {
    return <div className="max-w-[1280px] mx-auto p-5">Cargando…</div>;
  }

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
          className="rounded-lg px-[11px] py-2 font-extrabold bg-[var(--navy)] text-white border border-[var(--navy)]"
        >
          0 · Preparar
        </button>
        <button
          type="button"
          disabled
          className="rounded-lg px-[11px] py-2 font-extrabold border border-[var(--line)] bg-white text-[#44516a] opacity-50 cursor-not-allowed"
          title="Disponible en Fase 4"
        >
          1 · Gemba baseline
        </button>
        <button
          type="button"
          disabled
          className="rounded-lg px-[11px] py-2 font-extrabold border border-[var(--line)] bg-white text-[#44516a] opacity-50 cursor-not-allowed"
          title="Disponible en Fase 5"
        >
          2 · Diagnóstico
        </button>
      </nav>

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
          importante. Luego mueve la barra hacia la derecha si el cambio fortalece el motivador
          y hacia la izquierda si lo debilita.
        </p>
        <MotivatorList motivators={motivators} onChange={setMotivators} />
      </div>

      <Toast message={toast.message} />
    </div>
  );
}
