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
    initiative_status: null,
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

describe('FormView — campo Estado de la iniciativa', () => {
  beforeEach(() => {
    vi.mocked(apiClient.get).mockReset();
    vi.mocked(apiClient.patch).mockReset();
    vi.mocked(apiClient.patch).mockResolvedValue({});
  });

  it('starts empty when the record has no initiative_status yet', async () => {
    mockGet(buildRecord({ initiative_status: null }));
    render(<FormView recordId="r1" onBack={() => {}} />);

    await waitFor(() => screen.getByLabelText('Estado de la iniciativa'));
    const field = screen.getByLabelText('Estado de la iniciativa') as HTMLInputElement;
    expect(field.value).toBe('');
  });

  it('loads the existing value from the record', async () => {
    mockGet(buildRecord({ initiative_status: 'En evaluación con negocio' }));
    render(<FormView recordId="r1" onBack={() => {}} />);

    await waitFor(() => screen.getByLabelText('Estado de la iniciativa'));
    const field = screen.getByLabelText('Estado de la iniciativa') as HTMLInputElement;
    expect(field.value).toBe('En evaluación con negocio');
  });

  it('auto-saves the typed value through updateField', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockGet(buildRecord({ initiative_status: null }));
    render(<FormView recordId="r1" onBack={() => {}} />);

    await waitFor(() => screen.getByLabelText('Estado de la iniciativa'));
    fireEvent.change(screen.getByLabelText('Estado de la iniciativa'), {
      target: { value: 'Aprobada' },
    });

    await act(async () => {
      vi.advanceTimersByTime(600);
    });

    expect(apiClient.patch).toHaveBeenCalledWith('/api/records/r1', {
      initiativeStatus: 'Aprobada',
    });
    vi.useRealTimers();
  });
});

describe('FormView — tab "0 · Resumen" y radar de observaciones individual', () => {
  beforeEach(() => {
    vi.mocked(apiClient.get).mockReset();
    vi.mocked(apiClient.patch).mockReset();
    vi.mocked(apiClient.patch).mockResolvedValue({});
  });

  it('renders "0 · Resumen" instead of "0 · Preparar"', async () => {
    mockGet(buildRecord());
    render(<FormView recordId="r1" onBack={() => {}} />);

    await waitFor(() => screen.getByText('0 · Resumen'));
    expect(screen.queryByText('0 · Preparar')).not.toBeInTheDocument();
  });

  it('shows the individual observation radar in the default (Resumen) tab', async () => {
    mockGet(buildRecord());
    render(<FormView recordId="r1" onBack={() => {}} />);

    await waitFor(() =>
      expect(
        screen.getByLabelText('Radar de observaciones individual'),
      ).toBeInTheDocument(),
    );
  });

  it('places the radar last, after "Preparar" and "Moving Motivators"', async () => {
    mockGet(buildRecord());
    render(<FormView recordId="r1" onBack={() => {}} />);

    await waitFor(() => screen.getByLabelText('Radar de observaciones individual'));
    const headings = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    expect(headings).toEqual([
      'Preparar: valor, barreras y motivadores',
      'Moving Motivators',
      'Radar de observaciones individual',
    ]);
  });

  it('no longer shows the radar on the Diagnóstico tab', async () => {
    mockGet(
      buildRecord({
        behaviors: [{ state: 'si', fact: '', artifact: '' }],
        flow_steps: [{ step: '', objective: 'Entender', with: '', out: '', waste: '', observations: '' }],
      }),
    );
    render(<FormView recordId="r1" onBack={() => {}} />);

    await waitFor(() => screen.getByText('2 · Diagnóstico'));
    fireEvent.click(screen.getByText('2 · Diagnóstico'));

    await waitFor(() => screen.getByText('El arquitecto habla primero'));
    expect(
      screen.queryByLabelText('Radar de observaciones individual'),
    ).not.toBeInTheDocument();
  });
});

describe('FormView — enlace público del wizard (movido desde Home)', () => {
  beforeEach(() => {
    vi.mocked(apiClient.get).mockReset();
    vi.mocked(apiClient.patch).mockReset();
    vi.mocked(apiClient.patch).mockResolvedValue({});
  });

  it('shows the public wizard URL inside the Moving Motivators card', async () => {
    mockGet(buildRecord());
    render(<FormView recordId="r1" onBack={() => {}} />);

    await waitFor(() =>
      expect(
        screen.getByText(`${window.location.origin}/motivadores`),
      ).toBeInTheDocument(),
    );
  });

  it('copies the link and shows a confirmation toast when "Copiar" is clicked', async () => {
    mockGet(buildRecord());
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(<FormView recordId="r1" onBack={() => {}} />);

    await waitFor(() => screen.getByText(`${window.location.origin}/motivadores`));
    fireEvent.click(screen.getByRole('button', { name: 'Copiar' }));

    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/motivadores`),
    );
    expect(await screen.findByText('Enlace copiado')).toBeInTheDocument();
  });
});
