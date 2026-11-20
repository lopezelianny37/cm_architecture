export const IMPACT_MIN = -4;
export const IMPACT_MAX = 4;

/**
 * Where a given impact value sits on the vertical track, as a fraction
 * measured from the TOP (0 = top = +4/most favored, 1 = bottom =
 * -4/most negative) — matches how CSS `top` percentages work for
 * absolutely-positioned elements, which is what StepImpacto.tsx uses this
 * for. Out-of-range input is clamped.
 */
export function impactToTrackFraction(impact: number): number {
  const clamped = Math.max(IMPACT_MIN, Math.min(IMPACT_MAX, impact));
  return (IMPACT_MAX - clamped) / (IMPACT_MAX - IMPACT_MIN);
}

/**
 * Inverse of impactToTrackFraction: a pointer's position on the track (as
 * a 0..1 fraction from the top) snapped to the nearest whole impact value.
 * Out-of-range input (dragging past either end) is clamped, not rejected.
 */
export function trackFractionToImpact(fraction: number): number {
  const clamped = Math.max(0, Math.min(1, fraction));
  const raw = IMPACT_MAX - clamped * (IMPACT_MAX - IMPACT_MIN);
  return Math.max(IMPACT_MIN, Math.min(IMPACT_MAX, Math.round(raw)));
}
