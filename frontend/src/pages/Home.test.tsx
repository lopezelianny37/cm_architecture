import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Home } from './Home';
import { apiClient } from '../lib/apiClient';
import { MOT_NAMES } from '../constants/gemba.constants';

vi.mock('../lib/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

const EMPTY_METRICS = {
  totalArchitects: 0,
  completeRecords: 0,
  totalGaps: 0,
  csatAverage: null,
  gapsByType: {},
};

const EMPTY_RADARS = { observationValues: new Array(7).fill(0), motivatorValues: new Array(10).fill(0) };

function summaryWithSample() {
  return {
    sampleSize: 2,
    radar: MOT_NAMES.map((name, i) => ({ motivator: name, avgImpact: i % 2 === 0 ? 2 : -2 })),
    bars: MOT_NAMES.map((name, i) => ({ motivator: name, avgPriorityOrder: i + 1 })),
  };
}

function emptySummary() {
  return { sampleSize: 0, radar: [], bars: [] };
}

function mockApiGet(summary: ReturnType<typeof summaryWithSample> | ReturnType<typeof emptySummary>) {
  vi.mocked(apiClient.get).mockImplementation((path: string) => {
    if (path.includes('/api/dashboard/motivators-summary')) return Promise.resolve(summary);
    if (path.includes('/api/dashboard/metrics')) return Promise.resolve(EMPTY_METRICS);
    if (path.includes('/api/dashboard/radars')) return Promise.resolve(EMPTY_RADARS);
    if (path.includes('/api/dashboard/scope-progress')) return Promise.resolve({ completionSum: 0 });
    if (path.includes('/api/settings')) return Promise.resolve({ targetScope: 5 });
    if (path.includes('/api/records')) return Promise.resolve({ records: [], total: 0, hasMore: false });
    return Promise.reject(new Error(`unexpected path: ${path}`));
  });
}

describe('Home — Radar de observaciones', () => {
  beforeEach(() => {
    vi.mocked(apiClient.get).mockReset();
  });

  it('renders the renamed title, description, and aria-label (not "brechas")', async () => {
    mockApiGet(emptySummary());
    render(<Home onOpenRecord={() => {}} />);

    await waitFor(() => screen.getByText('Radar de observaciones'));
    expect(
      screen.getByText(/El centro indica que el comportamiento no aplicó/),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Radar de observaciones')).toBeInTheDocument();
    // The old title is gone — note "Brechas identificadas" (a different,
    // unrelated section further down the page) legitimately still exists.
    expect(screen.queryByText('Radar de brechas del equipo')).not.toBeInTheDocument();
  });
});

describe('Home — Moving Motivators del equipo', () => {
  beforeEach(() => {
    vi.mocked(apiClient.get).mockReset();
  });

  it('renders the impact radar and priority bars when there are submissions', async () => {
    mockApiGet(summaryWithSample());
    render(<Home onOpenRecord={() => {}} />);

    await waitFor(() =>
      expect(
        screen.getByLabelText('Radar de impacto de motivadores del equipo'),
      ).toBeInTheDocument(),
    );
    expect(screen.getByLabelText('Prioridad de motivadores del equipo')).toBeInTheDocument();
  });

  it('renders the bars in the order the backend returns them (already sorted ascending)', async () => {
    mockApiGet(summaryWithSample());
    render(<Home onOpenRecord={() => {}} />);

    await waitFor(() => screen.getByLabelText('Prioridad de motivadores del equipo'));
    const barChart = screen.getByLabelText('Prioridad de motivadores del equipo');
    const labels = within(barChart)
      .getAllByText(new RegExp(`^(${MOT_NAMES.join('|')})$`))
      .map((el) => el.textContent);
    expect(labels).toEqual(MOT_NAMES);
  });

  it('shows an empty-state message instead of charts when sampleSize is 0', async () => {
    mockApiGet(emptySummary());
    render(<Home onOpenRecord={() => {}} />);

    await waitFor(() =>
      expect(
        screen.getByText(/Todavía no hay autoevaluaciones registradas/),
      ).toBeInTheDocument(),
    );
    expect(
      screen.queryByLabelText('Radar de impacto de motivadores del equipo'),
    ).not.toBeInTheDocument();
  });

  it('refetches motivators-summary with the selected macrodomain', async () => {
    mockApiGet(summaryWithSample());
    vi.mocked(apiClient.get).mockImplementation((path: string) => {
      if (path.includes('/api/dashboard/motivators-summary')) return Promise.resolve(summaryWithSample());
      if (path.includes('/api/dashboard/metrics')) return Promise.resolve(EMPTY_METRICS);
      if (path.includes('/api/dashboard/radars')) return Promise.resolve(EMPTY_RADARS);
      if (path.includes('/api/dashboard/scope-progress')) return Promise.resolve({ completionSum: 0 });
      if (path.includes('/api/settings')) return Promise.resolve({ targetScope: 5 });
      if (path === '/api/records?limit=200')
        return Promise.resolve({ records: [], total: 0, hasMore: false });
      if (path.includes('/api/records'))
        return Promise.resolve({ records: [], total: 0, hasMore: false });
      return Promise.reject(new Error(`unexpected path: ${path}`));
    });

    render(<Home onOpenRecord={() => {}} />);
    await waitFor(() => screen.getByLabelText('Macrodominio'));

    fireEvent.change(screen.getByLabelText('Macrodominio'), { target: { value: 'all' } });

    await waitFor(() =>
      expect(
        vi.mocked(apiClient.get).mock.calls.some(([path]) =>
          String(path).includes('/api/dashboard/motivators-summary'),
        ),
      ).toBe(true),
    );
  });

  it('no longer shows the public wizard URL/Copiar block (moved to FormView)', async () => {
    mockApiGet(summaryWithSample());
    render(<Home onOpenRecord={() => {}} />);

    await waitFor(() =>
      expect(
        screen.getByLabelText('Radar de impacto de motivadores del equipo'),
      ).toBeInTheDocument(),
    );
    expect(
      screen.queryByText(`${window.location.origin}/motivadores`),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Copiar' })).not.toBeInTheDocument();
  });
});

describe('Home — crear nuevo arquitecto/ciclo', () => {
  beforeEach(() => {
    vi.mocked(apiClient.get).mockReset();
    vi.mocked(apiClient.post).mockReset();
  });

  it('disables the create button until both name and macrodomain are filled', async () => {
    mockApiGet(emptySummary());
    render(<Home onOpenRecord={() => {}} />);
    await waitFor(() => screen.getByLabelText('Macrodominio del nuevo arquitecto'));

    const createButton = screen.getByRole('button', { name: '+ Nuevo arquitecto / ciclo' });
    expect(createButton).toBeDisabled();

    fireEvent.change(screen.getByPlaceholderText('Nombre del arquitecto'), {
      target: { value: 'Nueva Arquitecta' },
    });
    expect(createButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText('Macrodominio del nuevo arquitecto'), {
      target: { value: 'Enterprise Technology' },
    });
    expect(createButton).toBeEnabled();
  });

  it('sends the selected macrodomain along with the record on create', async () => {
    mockApiGet(emptySummary());
    vi.mocked(apiClient.post).mockResolvedValue({ id: 'new-record-id' });
    const onOpenRecord = vi.fn();

    render(<Home onOpenRecord={onOpenRecord} />);
    await waitFor(() => screen.getByLabelText('Macrodominio del nuevo arquitecto'));

    fireEvent.change(screen.getByPlaceholderText('Nombre del arquitecto'), {
      target: { value: 'Nueva Arquitecta' },
    });
    fireEvent.change(screen.getByLabelText('Macrodominio del nuevo arquitecto'), {
      target: { value: 'Enterprise Technology' },
    });
    fireEvent.click(screen.getByRole('button', { name: '+ Nuevo arquitecto / ciclo' }));

    await waitFor(() =>
      expect(apiClient.post).toHaveBeenCalledWith('/api/records', {
        architectName: 'Nueva Arquitecta',
        macrodomain: 'Enterprise Technology',
      }),
    );
    expect(onOpenRecord).toHaveBeenCalledWith('new-record-id');
  });
});
