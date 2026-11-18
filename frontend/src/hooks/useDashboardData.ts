import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '../lib/apiClient';
import type {
  DashboardMetricsResponse,
  DashboardRadarsResponse,
  MotivatorsSummaryResponse,
  RecordsListResponse,
  RecordRow,
  SettingsResponse,
  StatusFilter,
} from '../types/api';

function buildQuery(params: Record<string, string | undefined>): string {
  const entries = Object.entries(params).filter(([, v]) => v != null && v !== '' && v !== 'all');
  if (entries.length === 0) return '';
  return '?' + entries.map(([k, v]) => `${k}=${encodeURIComponent(v as string)}`).join('&');
}

export function useDashboardData() {
  const [macrodomain, setMacrodomain] = useState('all');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [records, setRecords] = useState<RecordRow[]>([]);
  const [macrodomainOptions, setMacrodomainOptions] = useState<string[]>([]);
  const [totalRecordsInScope, setTotalRecordsInScope] = useState(0);
  const [metrics, setMetrics] = useState<DashboardMetricsResponse | null>(null);
  const [radars, setRadars] = useState<DashboardRadarsResponse | null>(null);
  const [motivatorsSummary, setMotivatorsSummary] = useState<MotivatorsSummaryResponse | null>(
    null,
  );
  const [settings, setSettings] = useState<SettingsResponse>({ targetScope: 5 });
  const [loading, setLoading] = useState(false);
  const [refetchIndex, setRefetchIndex] = useState(0);

  const refetch = useCallback(() => setRefetchIndex((i) => i + 1), []);

  // Macrodomain options: derived from the full unfiltered record set.
  useEffect(() => {
    apiClient
      .get<RecordsListResponse>('/api/records?limit=200')
      .then((res) => {
        const unique = Array.from(
          new Set(
            res.records
              .map((r) => (r.macrodomain ?? '').trim())
              .filter((m) => m.length > 0),
          ),
        ).sort();
        setMacrodomainOptions(unique);
        setTotalRecordsInScope(res.total);
      })
      .catch(() => setMacrodomainOptions([]));
  }, [refetchIndex]);

  // Filtered records + metrics + radars.
  useEffect(() => {
    setLoading(true);
    const query = buildQuery({ macrodomain, status });

    Promise.all([
      apiClient.get<RecordsListResponse>(`/api/records${query}`),
      apiClient.get<DashboardMetricsResponse>(`/api/dashboard/metrics${buildQuery({ macrodomain })}`),
      apiClient.get<DashboardRadarsResponse>(`/api/dashboard/radars${buildQuery({ macrodomain })}`),
      apiClient.get<MotivatorsSummaryResponse>(
        `/api/dashboard/motivators-summary${buildQuery({ macrodomain })}`,
      ),
    ])
      .then(([recordsRes, metricsRes, radarsRes, motivatorsSummaryRes]) => {
        setRecords(recordsRes.records);
        setMetrics(metricsRes);
        setRadars(radarsRes);
        setMotivatorsSummary(motivatorsSummaryRes);
      })
      .finally(() => setLoading(false));
  }, [macrodomain, status, refetchIndex]);

  // Settings (scope tracker target).
  useEffect(() => {
    apiClient
      .get<SettingsResponse>('/api/settings')
      .then(setSettings)
      .catch(() => setSettings({ targetScope: 5 }));
  }, []);

  const updateTargetScope = useCallback((targetScope: number) => {
    setSettings({ targetScope });
    apiClient.patch<SettingsResponse>('/api/settings', { targetScope }).catch(() => {});
  }, []);

  const createRecord = useCallback(
    async (architectName: string) => {
      const created = await apiClient.post<{ id: string }>('/api/records', { architectName });
      refetch();
      return created.id;
    },
    [refetch],
  );

  return {
    macrodomain,
    setMacrodomain,
    status,
    setStatus,
    records,
    macrodomainOptions,
    totalRecordsInScope,
    metrics,
    radars,
    motivatorsSummary,
    settings,
    updateTargetScope,
    loading,
    refetch,
    createRecord,
  };
}
