import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '../lib/apiClient';
import { useToast } from './useToast';
import type { MotivatorItem, RecordDetail, UpdateRecordPayload } from '../types/api';

/**
 * Merges an UpdateRecordPayload (camelCase, what the form sends) into a
 * RecordDetail (snake_case, what the API returns) — only the fields present
 * in the patch are overwritten. Used to update local `record` state
 * optimistically, since without this `record` only ever reflects the
 * initial GET and never the edits made afterwards (even though they do
 * persist to the backend) — any component that re-derives its initial
 * value from `record.*` on remount (e.g. AutoSaveField when its tab
 * unmounts/remounts) would keep showing the stale snapshot forever.
 */
function applyPatchToRecord(record: RecordDetail, patch: UpdateRecordPayload): RecordDetail {
  const next = { ...record };

  if (patch.architectName !== undefined) next.architect_name = patch.architectName;
  if (patch.macrodomain !== undefined) next.macrodomain = patch.macrodomain;
  if (patch.initiativeName !== undefined) next.initiative_name = patch.initiativeName;
  if (patch.businessReferent !== undefined) next.business_referent = patch.businessReferent;
  if (patch.prepValue !== undefined) next.prep_value = patch.prepValue;
  if (patch.prepBarrier !== undefined) next.prep_barrier = patch.prepBarrier;
  if (patch.behaviors !== undefined) next.behaviors = patch.behaviors;
  if (patch.flowSteps !== undefined) next.flow_steps = patch.flowSteps;
  if (patch.debriefStrength !== undefined) next.debrief_strength = patch.debriefStrength;
  if (patch.debriefSelfgap !== undefined) next.debrief_selfgap = patch.debriefSelfgap;
  if (patch.debriefBlock !== undefined) next.debrief_block = patch.debriefBlock;
  if (patch.debriefTry !== undefined) next.debrief_try = patch.debriefTry;
  if (patch.flowQa !== undefined) next.flow_qa = patch.flowQa;
  if (patch.gaps !== undefined) next.gaps = patch.gaps;
  if (patch.conditions !== undefined) next.conditions = patch.conditions;
  if (patch.csatScore !== undefined) next.csat_score = patch.csatScore;
  if (patch.csatComment !== undefined) next.csat_comment = patch.csatComment;

  return next;
}

export function useRecordForm(recordId: string) {
  const [record, setRecord] = useState<RecordDetail | null>(null);
  const [motivators, setMotivators] = useState<MotivatorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    let active = true;
    setLoading(true);

    Promise.all([
      apiClient.get<RecordDetail>(`/api/records/${recordId}`),
      apiClient.get<MotivatorItem[]>(`/api/records/${recordId}/motivators`),
    ]).then(([recordRes, motivatorsRes]) => {
      if (!active) return;
      setRecord(recordRes);
      setMotivators(motivatorsRes);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [recordId]);

  const updateField = useCallback(
    (patch: UpdateRecordPayload) => {
      // Optimistic: apply the patch to local state immediately, independent
      // of network timing, so any field reading from `record.*` (including
      // one that unmounts/remounts via tab switching) always sees the
      // latest edit rather than the stale initial GET snapshot.
      setRecord((prev) => (prev ? applyPatchToRecord(prev, patch) : prev));

      apiClient
        .patch(`/api/records/${recordId}`, patch)
        .then(() => toast.show('✓ Guardado automático'));
    },
    [recordId, toast],
  );

  const saveMotivators = useCallback(
    (items: MotivatorItem[]) => {
      apiClient
        .patch(`/api/records/${recordId}/motivators`, {
          items: items.map((m) => ({ name: m.name, order: m.order, impact: m.impact })),
        })
        .then(() => toast.show('✓ Guardado automático'));
    },
    [recordId, toast],
  );

  return { record, motivators, setMotivators, loading, updateField, saveMotivators, toast };
}
