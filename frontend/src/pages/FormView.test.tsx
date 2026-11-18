import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FormView } from './FormView';
import { apiClient } from '../lib/apiClient';
import type { RecordDetail } from '../types/api';

vi.mock('../lib/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

function buildRecord(overrides: Partial<RecordDetail> = {}): RecordDetail {
  return {
    id: 'r1',
    architect_name: 'Arquitecta de prueba',
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

function mockGet(record: RecordDetail) {
  vi.mocked(apiClient.get).mockImplementation((path: string) => {
    if (path.endsWith('/motivators')) return Promise.resolve([]);
    return Promise.resolve(record);
  });
}

describe('FormView — select de Macrodominio', () => {
  beforeEach(() => {
    vi.mocked(apiClient.get).mockReset();
    vi.mocked(apiClient.patch).mockReset();
    vi.mocked(apiClient.patch).mockResolvedValue({});
  });

  it('shows the placeholder selected when the record has no macrodomain yet', async () => {
    mockGet(buildRecord({ macrodomain: null }));
    render(<FormView recordId="r1" onBack={() => {}} />);

    await waitFor(() => screen.getByLabelText('Macrodominio'));
    const select = screen.getByLabelText('Macrodominio') as HTMLSelectElement;
    expect(select.value).toBe('');
  });

  it('lists the fixed PUBLIC_MACRODOMAINS options in order', async () => {
    mockGet(buildRecord({ macrodomain: 'Business Line' }));
    render(<FormView recordId="r1" onBack={() => {}} />);

    await waitFor(() => screen.getByLabelText('Macrodominio'));
    const select = screen.getByLabelText('Macrodominio') as HTMLSelectElement;
    const optionLabels = Array.from(select.options).map((o) => o.value);
    expect(optionLabels).toEqual([
      '',
      'CX & Engagement',
      'Business Line',
      'Enterprise Technology',
      'Enablement Service',
      'Technology Foundation',
    ]);
    expect(select.value).toBe('Business Line');
  });

  it('keeps a legacy free-text macrodomain as its own option instead of losing it', async () => {
    mockGet(buildRecord({ macrodomain: 'Data' }));
    render(<FormView recordId="r1" onBack={() => {}} />);

    await waitFor(() => screen.getByLabelText('Macrodominio'));
    const select = screen.getByLabelText('Macrodominio') as HTMLSelectElement;

    expect(select.value).toBe('Data');
    expect(
      screen.getByRole('option', { name: 'Data (macrodominio anterior)' }),
    ).toBeInTheDocument();
  });

  it('auto-saves the chosen macrodomain through updateField', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockGet(buildRecord({ macrodomain: null }));
    render(<FormView recordId="r1" onBack={() => {}} />);

    await waitFor(() => screen.getByLabelText('Macrodominio'));
    fireEvent.change(screen.getByLabelText('Macrodominio'), {
      target: { value: 'Technology Foundation' },
    });

    await act(async () => {
      vi.advanceTimersByTime(600);
    });

    expect(apiClient.patch).toHaveBeenCalledWith('/api/records/r1', {
      macrodomain: 'Technology Foundation',
    });
    vi.useRealTimers();
  });
});
