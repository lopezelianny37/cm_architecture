import { useState } from 'react';
import { useDashboardData } from '../hooks/useDashboardData';
import { Hero } from '../components/dashboard/Hero';
import { MetricsCards } from '../components/dashboard/MetricsCards';
import { Filters } from '../components/dashboard/Filters';
import { ScopeTracker } from '../components/dashboard/ScopeTracker';
import { RosterTable } from '../components/dashboard/RosterTable';
import { BarChart } from '../components/charts/BarChart';
import { RadarChart } from '../components/charts/RadarChart';
import { BEH_SHORT_LABELS, MOT_NAMES } from '../constants/gemba.constants';
import { gapValueToRadius } from '../lib/radarVisualization';

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
    totalRecordsInScope,
    metrics,
    radars,
    settings,
    updateTargetScope,
    createRecord,
  } = useDashboardData();

  const [newArchitectName, setNewArchitectName] = useState('');

  async function handleCreate() {
    const name = newArchitectName.trim();
    if (!name) return;
    const id = await createRecord(name);
    setNewArchitectName('');
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
            currentCount={totalRecordsInScope}
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
            <button
              className="print:hidden border-0 rounded-lg px-[13px] py-2 min-h-11 font-extrabold bg-[var(--red)] text-white"
              onClick={handleCreate}
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

      <div className="grid grid-cols-1 tablet:grid-cols-2 gap-[14px]">
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
        <div className="card bg-white border border-[var(--line)] rounded-2xl p-[18px] shadow-[var(--shadow)] min-h-[310px]">
          <h2 className="text-[19px] m-0 mb-2">Radar de motivadores</h2>
          <p className="text-[var(--mut)]">Promedio de importancia declarada por los arquitectos.</p>
          <RadarChart
            labels={MOT_NAMES}
            values={radars?.motivatorValues ?? new Array(10).fill(0)}
            color="#2875d9"
            ariaLabel="Radar de motivadores"
          />
        </div>
      </div>

      <div className="card bg-white border border-[var(--line)] rounded-2xl p-[18px] shadow-[var(--shadow)]">
        <h2 className="text-[19px] m-0 mb-2">Brechas identificadas por clasificación</h2>
        <BarChart gapsByType={metrics?.gapsByType ?? {}} />
      </div>

      <div className="card bg-white border border-[var(--line)] rounded-2xl p-[18px] shadow-[var(--shadow)]">
        <h2 className="text-[19px] m-0 mb-2">Seguimiento de arquitectos</h2>
        <RosterTable records={records} onOpen={onOpenRecord} />
      </div>
    </div>
  );
}
