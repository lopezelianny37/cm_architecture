import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MotivatorResultView } from './MotivatorResultView';
import { apiClient } from '../../lib/apiClient';
import { MOT_NAMES } from '../../constants/gemba.constants';

vi.mock('../../lib/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

function buildToast() {
  return { show: vi.fn() };
}

describe('MotivatorResultView', () => {
  beforeEach(() => {
    vi.mocked(apiClient.get).mockReset();
  });

  it('shows the pending state with a copy-link button when found is false', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ found: false });
    const toast = buildToast();

    render(<MotivatorResultView recordId="r1" toast={toast} />);

    await waitFor(() =>
      expect(screen.getByText(/Pendiente de autoevaluación/)).toBeInTheDocument(),
    );
    expect(screen.getByRole('button', { name: /Copiar enlace/ })).toBeInTheDocument();
    expect(
      screen.queryByLabelText('Radar de motivadores del arquitecto'),
    ).not.toBeInTheDocument();
  });

  it('copies the public wizard link to the clipboard and shows a toast', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ found: false });
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    const toast = buildToast();

    render(<MotivatorResultView recordId="r1" toast={toast} />);
    await waitFor(() => screen.getByRole('button', { name: /Copiar enlace/ }));

    fireEvent.click(screen.getByRole('button', { name: /Copiar enlace/ }));

    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/motivadores`),
    );
    expect(toast.show).toHaveBeenCalledWith('Enlace copiado');
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
    const toast = buildToast();

    render(<MotivatorResultView recordId="r1" toast={toast} />);

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
