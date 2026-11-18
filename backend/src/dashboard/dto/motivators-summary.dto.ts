export interface MotivatorsSummaryResponse {
  sampleSize: number;
  radar: Array<{ motivator: string; avgImpact: number }>;
  bars: Array<{ motivator: string; avgPriorityOrder: number }>;
}
