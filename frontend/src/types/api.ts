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

export type BehaviorState = 'si' | 'par' | 'no' | 'na';

export interface BehaviorObservation {
  state: BehaviorState;
  fact: string;
  artifact: string;
}

export type WasteType = '' | 'Retrabajo' | 'Supuesto' | 'Espera' | 'Oportunidad';

export interface FlowStep {
  step: string;
  objective: string;
  with: string;
  out: string;
  waste: WasteType;
}

export interface RecordDetail {
  id: string;
  architect_name: string | null;
  macrodomain: string | null;
  initiative_name: string | null;
  business_referent: string | null;
  prep_value: string | null;
  prep_barrier: string | null;
  behaviors: BehaviorObservation[] | null;
  flow_steps: FlowStep[] | null;
  isComplete: boolean;
}

export interface UpdateRecordPayload {
  architectName?: string;
  macrodomain?: string;
  initiativeName?: string;
  businessReferent?: string;
  prepValue?: string;
  prepBarrier?: string;
  behaviors?: BehaviorObservation[];
  flowSteps?: FlowStep[];
}

export interface MotivatorItem {
  name: string;
  description: string;
  order: number;
  impact: number;
}
