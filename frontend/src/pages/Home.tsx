import { useState } from 'react';
import { useDashboardData } from '../hooks/useDashboardData';
import { useToast } from '../hooks/useToast';
import { Hero } from '../components/dashboard/Hero';
import { MetricsCards } from '../components/dashboard/MetricsCards';
import { Filters } from '../components/dashboard/Filters';
import { ScopeTracker } from '../components/dashboard/ScopeTracker';
import { RosterTable } from '../components/dashboard/RosterTable';
import { BarChart } from '../components/charts/BarChart';
import { RadarChart } from '../components/charts/RadarChart';
import { PriorityBarChart } from '../components/charts/PriorityBarChart';
import { Toast } from '../components/Toast';
import { BEH_SHORT_LABELS, MOT_NAMES, PUBLIC_MACRODOMAINS } from '../constants/gemba.constants';
import { gapValueToRadius } from '../lib/radarVisualization';
import { impactToRadius } from '../lib/impactToRadius';

interface HomeProps {
  onOpenRecord: (id: string) => void;
}

export function Home({ onOpenRecord }: HomeProps) {
  const {
    macrodomain,
    setMacrodomain,
    status,
    setStatus,
    records,
    macrodomainOptions,
    completionSum,
    metrics,
    radars,
    motivatorsSummary,
    settings,
    updateTargetScope,
    createRecord,
  } = useDashboardData();

  const [newArchitectName, setNewArchitectName] = useState('');
  const [newMacrodomain, setNewMacrodomain] = useState('');
  const toast = useToast();
  const motivatorsWizardUrl = `${window.location.origin}/motivadores`;

  async function handleCopyMotivatorsLink() {
    try {
      await navigator.clipboard.writeText(motivatorsWizardUrl);
      toast.show('Enlace copiado');
    } catch {
      toast.show('No se pudo copiar el enlace');
    }
  }

  async function handleCreate() {
    const name = newArchitectName.trim();
    if (!name || !newMacrodomain) return;
    const id = await createRecord(name, newMacrodomain);
    setNewArchitectName('');
    setNewMacrodomain('');
    onOpenRecord(id);
  }

  return (
    <div className="max-w-[1280px] mx-auto p-5 flex flex-col gap-[14px]">
      <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-[1.45fr_0.8fr] gap-[14px]">
        <Hero />
        <div className="card bg-white border border-[var(--line)] rounded-2xl p-[18px] shadow-[var(--shadow)]">
          <h3 className="text-[15px] m-0 mb-2">Avance del ciclo</h3>
          <ScopeTracker
            targetScope={settings.targetScope}
            completionSum={completionSum}
            onTargetChange={updateTargetScope}
          />
          <p className="text-[var(--mut)] mt-2">
            El alcance crece por ciclos: MVP de 5 arquitectos → piloto ampliado → expansión →
            escala, según evidencia.
          </p>
          <div className="flex gap-2 mt-2 flex-col tablet:flex-row">
            <input
              className="border border-[var(--line)] rounded-lg p-2 flex-1 min-h-11"
              placeholder="Nombre del arquitecto"
              value={newArchitectName}
              onChange={(e) => setNewArchitectName(e.target.value)}
            />
            <select
              className="border border-[var(--line)] rounded-lg p-2 min-h-11 bg-white"
              aria-label="Macrodominio del nuevo arquitecto"
              value={newMacrodomain}
              onChange={(e) => setNewMacrodomain(e.target.value)}
            >
              <option value="">Seleccioná un macrodominio</option>
              {PUBLIC_MACRODOMAINS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <button
              className="print:hidden border-0 rounded-lg px-[13px] py-2 min-h-11 font-extrabold bg-[var(--red)] text-white disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleCreate}
              disabled={!newArchitectName.trim() || !newMacrodomain}
            >
              + Nuevo arquitecto / ciclo
            </button>
          </div>
        </div>
      </div>

      <div className="card bg-white border border-[var(--line)] rounded-2xl p-[18px] shadow-[var(--shadow)]">
        <Filters
          macrodomains={macrodomainOptions}
          macrodomain={macrodomain}
          status={status}
          onMacrodomainChange={setMacrodomain}
          onStatusChange={setStatus}
        />
      </div>

      <MetricsCards
        totalArchitects={metrics?.totalArchitects ?? 0}
        completeRecords={metrics?.completeRecords ?? 0}
        totalGaps={metrics?.totalGaps ?? 0}
      />

      <div className="card bg-white border border-[var(--line)] rounded-2xl p-[18px] shadow-[var(--shadow)] min-h-[310px]">
        <h2 className="text-[19px] m-0 mb-2">Radar de brechas del equipo</h2>
        <p className="text-[var(--mut)]">Ejes más cerca del centro indican mayor brecha.</p>
        <RadarChart
          labels={BEH_SHORT_LABELS}
          values={(radars?.gapValues ?? new Array(8).fill(0)).map(gapValueToRadius)}
          color="#d71920"
          ariaLabel="Radar de brechas"
          strokeWidth={2.5}
          fillOpacity={0.28}
        />
      </div>

      <div className="card bg-white border border-[var(--line)] rounded-2xl p-[18px] shadow-[var(--shadow)]">
        <div className="flex justify-between items-start gap-[9px] flex-wrap mb-2">
          <div>
            <h2 className="text-[19px] m-0 mb-2">Moving Motivators del equipo</h2>
            <p className="text-[var(--mut)]">
              Promedio de la autoevaluación pública completada por los arquitectos.
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
        {motivatorsSummary && motivatorsSummary.sampleSize === 0 ? (
          <p className="text-[var(--mut)]">
            Todavía no hay autoevaluaciones registradas para este filtro.
          </p>
        ) : (
          <div className="grid grid-cols-1 tablet:grid-cols-2 gap-[14px]">
            <div>
              <h3 className="text-[15px] m-0 mb-2">Radar de impacto</h3>
              <RadarChart
                labels={MOT_NAMES}
                values={MOT_NAMES.map((name) =>
                  impactToRadius(
                    motivatorsSummary?.radar.find((r) => r.motivator === name)?.avgImpact ?? 0,
                  ),
                )}
                color="#2875d9"
                ariaLabel="Radar de impacto de motivadores del equipo"
              />
            </div>
            <div>
              <h3 className="text-[15px] m-0 mb-2">Prioridad</h3>
              <PriorityBarChart
                items={(motivatorsSummary?.bars ?? []).map((b) => ({
                  motivator: b.motivator,
                  score: b.avgPriorityOrder,
                }))}
                ariaLabel="Prioridad de motivadores del equipo"
              />
            </div>
          </div>
        )}
      </div>

      <div className="card bg-white border border-[var(--line)] rounded-2xl p-[18px] shadow-[var(--shadow)]">
        <h2 className="text-[19px] m-0 mb-2">Brechas identificadas por clasificación</h2>
        <BarChart gapsByType={metrics?.gapsByType ?? {}} />
      </div>

      <div className="card bg-white border border-[var(--line)] rounded-2xl p-[18px] shadow-[var(--shadow)]">
        <h2 className="text-[19px] m-0 mb-2">Seguimiento de arquitectos</h2>
        <RosterTable records={records} onOpen={onOpenRecord} />
      </div>

      <Toast message={toast.message} />
    </div>
  );
}
