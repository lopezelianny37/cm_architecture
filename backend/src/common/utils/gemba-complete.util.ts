export interface BehaviorObservation {
  state: 'si' | 'par' | 'no' | 'na';
  fact?: string;
  artifact?: string;
}

export interface FlowStep {
  step?: string;
  objective?: string;
  with?: string;
  out?: string;
  waste?: string;
}

export interface GapEntry {
  text?: string;
  type?: string;
  evidence?: string;
  condition?: string;
}

export interface CompletableRecord {
  behaviors?: BehaviorObservation[] | null;
  flow_steps?: FlowStep[] | null;
  gaps?: GapEntry[] | null;
}

export function isRecordComplete(record: CompletableRecord): boolean {
  const behaviors = record.behaviors ?? [];
  const flowSteps = record.flow_steps ?? [];
  const gaps = record.gaps ?? [];

  const hasObservedBehavior = behaviors.some((b) => b.state !== 'na');
  const hasGap = gaps.some((g) => (g.text ?? '').trim().length > 0);
  const hasFlowStep = flowSteps.some((f) => Boolean(f.objective) || Boolean(f.out));

  return hasObservedBehavior && hasGap && hasFlowStep;
}
