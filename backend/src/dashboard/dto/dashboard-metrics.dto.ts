export interface DashboardMetricsResponse {
  totalArchitects: number;
  completeRecords: number;
  totalGaps: number;
  csatAverage: number | null;
  gapsByType: Record<string, number>;
}
