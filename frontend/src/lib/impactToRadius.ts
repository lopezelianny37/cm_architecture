/**
 * Maps a Moving Motivators impact value (-4..4, see
 * SPEC_MOVING_MOTIVATORS_ADDENDUM.md §2 Step 2) to the radius fraction
 * RadarChart expects (0..1): -4 (debilita mucho) -> 0 (centro), 0 (neutro)
 * -> 0.5, +4 (fortalece mucho) -> 1 (borde).
 */
export function impactToRadius(impact: number): number {
  return (impact + 4) / 8;
}
