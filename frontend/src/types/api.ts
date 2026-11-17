export interface RecordRow {
  id: string;
  architect_name: string | null;
  macrodomain: string | null;
  initiative_name: string | null;
  gaps: Array<{ text?: string; type?: string }> | null;
  csat_score: number | null;
  isComplete: boolean;
}

export interface RecordsListResponse {
  records: RecordRow[];
  total: number;
  hasMore: boolean;
}

export interface DashboardMetricsResponse {
  totalArchitects: number;
  completeRecords: number;
  totalGaps: number;
  csatAverage: number | null;
  gapsByType: Record<string, number>;
}

export interface DashboardRadarsResponse {
  gapValues: number[];
  motivatorValues: number[];
}

export interface SettingsResponse {
  targetScope: number;
}

export type StatusFilter = 'all' | 'complete' | 'open';
