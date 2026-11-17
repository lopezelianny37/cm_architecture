import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '../lib/apiClient';
import { useToast } from './useToast';
import type { MotivatorItem, RecordDetail, UpdateRecordPayload } from '../types/api';

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
