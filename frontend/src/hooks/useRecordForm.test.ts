import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useRecordForm } from './useRecordForm';
import { apiClient } from '../lib/apiClient';
import type { RecordDetail } from '../types/api';

vi.mock('../lib/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    patch: vi.fn(),
    post: vi.fn(),
  },
}));

function buildRecord(overrides: Partial<RecordDetail> = {}): RecordDetail {
  return {
    id: 'r1',
    architect_name: 'Viejo nombre',
    macrodomain: null,
    initiative_name: null,
    business_referent: null,
    architect_email: null,
    prep_value: '',
    prep_barrier: '',
    behaviors: null,
    flow_steps: null,
    debrief_strength: null,
    debrief_selfgap: null,
    debrief_block: null,
    debrief_try: null,
    flow_qa: null,
    gaps: null,
    conditions: null,
    csat_score: null,
    csat_comment: null,
    isComplete: false,
    ...overrides,
  };
}

describe('useRecordForm', () => {
  beforeEach(() => {
    vi.mocked(apiClient.get).mockReset();
    vi.mocked(apiClient.patch).mockReset();
  });

  it('updateField applies the patch to local record state optimistically, before the PATCH resolves', async () => {
    vi.mocked(apiClient.get).mockImplementation((path: string) => {
      if (path.endsWith('/motivators')) return Promise.resolve([]);
      return Promise.resolve(buildRecord());
    });

    // The PATCH is intentionally left pending for the whole test — if
    // `record.prep_value` only updated once this resolves, the assertion
    // below would fail, proving the update is truly optimistic rather than
    // dependent on network timing.
    vi.mocked(apiClient.patch).mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useRecordForm('r1'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.record?.prep_value).toBe('');

    act(() => {
      result.current.updateField({ prepValue: 'Si logramos X' });
    });

    expect(result.current.record?.prep_value).toBe('Si logramos X');
  });

  it('updateField maps each camelCase payload field to its snake_case record field', async () => {
    vi.mocked(apiClient.get).mockImplementation((path: string) => {
      if (path.endsWith('/motivators')) return Promise.resolve([]);
      return Promise.resolve(buildRecord());
    });
    vi.mocked(apiClient.patch).mockResolvedValue({});

    const { result } = renderHook(() => useRecordForm('r1'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.updateField({
        architectName: 'Nuevo nombre',
        macrodomain: 'Data',
        csatScore: 4,
      });
    });

    expect(result.current.record).toMatchObject({
      architect_name: 'Nuevo nombre',
      macrodomain: 'Data',
      csat_score: 4,
    });
  });

  it('does not clobber fields not present in the patch', async () => {
    vi.mocked(apiClient.get).mockImplementation((path: string) => {
      if (path.endsWith('/motivators')) return Promise.resolve([]);
      return Promise.resolve(buildRecord({ architect_name: 'Mantener' }));
    });
    vi.mocked(apiClient.patch).mockResolvedValue({});

    const { result } = renderHook(() => useRecordForm('r1'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.updateField({ prepValue: 'solo esto cambia' });
    });

    expect(result.current.record?.architect_name).toBe('Mantener');
    expect(result.current.record?.prep_value).toBe('solo esto cambia');
  });
});
