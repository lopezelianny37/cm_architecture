import type { BehaviorObservation } from '../types/api';

/**
 * Same mapping as the team radar in dashboard.service.ts (gapValues), but
 * applied to a single record instead of averaged across many: Observado
 * (si)=0, Parcial (par)=0.5, No observado (no)=1, N/A (na) and any other
 * unexpected value default to 0 (there's nothing to average since each
 * behavior only has one state in a single record).
 */
const STATE_VALUES: Record<string, number> = { si: 0, par: 0.5, no: 1 };

export function computeIndividualGapRadar(behaviors: BehaviorObservation[]): number[] {
  return behaviors.map((b) => STATE_VALUES[b.state] ?? 0);
}
