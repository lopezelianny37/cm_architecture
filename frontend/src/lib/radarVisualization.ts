/**
 * Gap radar values (dashboard radars.gapValues and computeIndividualGapRadar)
 * use the aggregation semantics: 0=Observado (sin brecha), 0.5=Parcial,
 * 1=No observado (mayor brecha) — that's the data model and must stay
 * untouched (dashboard.service.ts, individualRadar.ts).
 *
 * For the chart itself we want the opposite spatial reading: center =
 * biggest gap, edge = no gap, so axes closer to the center visually mean
 * more room for improvement. This inverts a gap value into the radius
 * RadarChart expects, WITHOUT touching RadarChart.tsx (shared with the
 * motivators radar, which must keep its original direction: edge = most
 * important motivator, and is never passed through this function).
 */
export function gapValueToRadius(gapValue: number): number {
  return 1 - gapValue;
}
