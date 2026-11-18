import { useEffect, useState } from 'react';
import { apiClient } from '../../lib/apiClient';
import { impactToRadius } from '../../lib/impactToRadius';
import { RadarChart } from '../charts/RadarChart';
import { PriorityBarChart } from '../charts/PriorityBarChart';
import { MOT_NAMES } from '../../constants/gemba.constants';
import type { MotivatorResultResponse } from '../../types/api';

interface MotivatorResultViewProps {
  recordId: string;
  toast: { show: (text: string) => void };
}

/**
 * Read-only view of the architect's own Moving Motivators self-assessment,
 * submitted via the public, loginless wizard (see
 * SPEC_MOVING_MOTIVATORS_ADDENDUM.md). The facilitator never edits these
 * values directly.
 */
export function MotivatorResultView({ recordId, toast }: MotivatorResultViewProps) {
  const [result, setResult] = useState<MotivatorResultResponse | null>(null);

  useEffect(() => {
    let active = true;
    apiClient
      .get<MotivatorResultResponse>(`/api/records/${recordId}/motivator-result`)
      .then((res) => {
        if (active) setResult(res);
      });
    return () => {
      active = false;
    };
  }, [recordId]);

  async function handleCopyLink() {
    const link = `${window.location.origin}/motivadores`;
    try {
      await navigator.clipboard.writeText(link);
      toast.show('Enlace copiado');
    } catch {
      toast.show('No se pudo copiar el enlace');
    }
  }

  if (result === null) {
    return <p className="text-[var(--mut)]">Cargando…</p>;
  }

  if (!result.found) {
    return (
      <div>
        <p className="text-[var(--mut)] mb-3">
          Pendiente de autoevaluación. Compartí el enlace con el arquitecto para que complete
          su autoevaluación de Moving Motivators.
        </p>
        <button
          type="button"
          className="print:hidden border border-[var(--line)] rounded-lg px-3 min-h-11 bg-white"
          onClick={handleCopyLink}
        >
          Copiar enlace
        </button>
      </div>
    );
  }

  const { priorities, impacts } = result.result;

  const radarValues = MOT_NAMES.map((name) => {
    const entry = impacts.find((i) => i.motivator === name);
    return impactToRadius(entry?.impact ?? 0);
  });

  const barItems = MOT_NAMES.map((name) => ({
    motivator: name,
    score: priorities.find((p) => p.motivator === name)?.priorityOrder ?? MOT_NAMES.length,
  })).sort((a, b) => a.score - b.score);

  return (
    <div className="grid grid-cols-1 tablet:grid-cols-2 gap-[14px]">
      <div>
        <h3 className="text-[15px] m-0 mb-2">Impacto declarado</h3>
        <RadarChart
          labels={MOT_NAMES}
          values={radarValues}
          color="#2875d9"
          ariaLabel="Radar de motivadores del arquitecto"
        />
      </div>
      <div>
        <h3 className="text-[15px] m-0 mb-2">Prioridad declarada</h3>
        <PriorityBarChart items={barItems} ariaLabel="Prioridad de motivadores del arquitecto" />
      </div>
    </div>
  );
}
