import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MotivatorResultView } from './MotivatorResultView';
import { apiClient } from '../../lib/apiClient';
import { MOT_NAMES } from '../../constants/gemba.constants';

vi.mock('../../lib/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe('MotivatorResultView', () => {
  beforeEach(() => {
    vi.mocked(apiClient.get).mockReset();
  });

  it('shows the pending-state message when found is false, with no copy-link button of its own', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ found: false });

    render(<MotivatorResultView recordId="r1" />);

    await waitFor(() =>
      expect(screen.getByText(/Pendiente de autoevaluación/)).toBeInTheDocument(),
    );
    // The copy-link affordance now lives one level up, in the "Moving
    // Motivators" card header (FormView.tsx) — not duplicated here.
    expect(screen.queryByRole('button', { name: /Copiar/ })).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText('Radar de motivadores del arquitecto'),
    ).not.toBeInTheDocument();
  });

  it('renders a read-only radar and priority bars when found is true, with no editable controls', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      found: true,
      result: {
        name: 'Ana',
        email: 'ana@example.com',
        macrodomain: 'Data',
        submittedAt: '2026-01-01T00:00:00.000Z',
        priorities: MOT_NAMES.map((name, i) => ({ motivator: name, priorityOrder: i + 1 })),
        impacts: MOT_NAMES.map((name) => ({ motivator: name, impact: 2 })),
      },
    });

    render(<MotivatorResultView recordId="r1" />);

    await waitFor(() =>
      expect(screen.getByLabelText('Radar de motivadores del arquitecto')).toBeInTheDocument(),
    );
    expect(
      screen.getByLabelText('Prioridad de motivadores del arquitecto'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('slider')).not.toBeInTheDocument();
    expect(screen.queryByText(/Pendiente de autoevaluación/)).not.toBeInTheDocument();
  });
});
