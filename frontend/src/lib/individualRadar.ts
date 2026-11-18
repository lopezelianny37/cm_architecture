import type { BehaviorObservation } from '../types/api';

/**
 * Same mapping as the team radar in dashboard.service.ts (observationValues),
 * applied to a single record instead of averaged across many. Ordinal
 * 4-level scale, N/A included as a real observation ("didn't apply here"),
 * not missing data: na=0 (centro), no=1, par=2, si=3 (borde) — normalized
 * by /3 directly into the radius RadarChart expects, no inversion needed.
 */
const OBSERVATION_LEVELS: Record<string, number> = { na: 0, no: 1, par: 2, si: 3 };

export function computeIndividualObservationRadar(behaviors: BehaviorObservation[]): number[] {
  return behaviors.map((b) => (OBSERVATION_LEVELS[b.state] ?? 0) / 3);
}
