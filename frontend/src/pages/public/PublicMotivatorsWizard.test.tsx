import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { PublicMotivatorsWizard } from './PublicMotivatorsWizard';
import { PUBLIC_MACRODOMAINS } from '../../constants/gemba.constants';

function fillStep0() {
  fireEvent.change(screen.getByPlaceholderText('Tu nombre completo'), {
    target: { value: 'Ana Pérez' },
  });
  fireEvent.change(screen.getByPlaceholderText('tu.correo@empresa.com'), {
    target: { value: 'ana@example.com' },
  });
  fireEvent.change(screen.getByLabelText('Macrodominio'), {
    target: { value: PUBLIC_MACRODOMAINS[0] },
  });
  fireEvent.click(screen.getByText('Siguiente'));
}

function advanceToStep2() {
  fillStep0();
  fireEvent.click(screen.getByText('Siguiente')); // Step 1 -> Step 2
}

describe('PublicMotivatorsWizard', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('renders Step 0 (Identificación) by default, with no authenticated-app header/nav chrome', () => {
    render(<PublicMotivatorsWizard />);

    expect(screen.getByText('Paso 0 · Identificación')).toBeInTheDocument();
    // The authenticated app's header has "Salir", "Descargar información",
    // "Cargar información" — none of that belongs on a public, login-free page.
    expect(screen.queryByText('Salir')).not.toBeInTheDocument();
    expect(screen.queryByText('Descargar información')).not.toBeInTheDocument();
    expect(screen.queryByText('Cargar información')).not.toBeInTheDocument();
  });

  it('advances to Step 1 (Ordenar) once Step 0 is valid and "Siguiente" is clicked', () => {
    render(<PublicMotivatorsWizard />);
    fillStep0();

    expect(screen.getByText('Paso 1 · Ordenar')).toBeInTheDocument();
    expect(screen.queryByText('Paso 0 · Identificación')).not.toBeInTheDocument();
  });

  it('"Atrás" from Step 1 returns to Step 0 without losing its data', () => {
    render(<PublicMotivatorsWizard />);

    fireEvent.change(screen.getByPlaceholderText('Tu nombre completo'), {
      target: { value: 'Ana Pérez' },
    });
    fireEvent.change(screen.getByPlaceholderText('tu.correo@empresa.com'), {
      target: { value: 'ana@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Macrodominio'), {
      target: { value: PUBLIC_MACRODOMAINS[1] },
    });
    fireEvent.click(screen.getByText('Siguiente'));
    expect(screen.getByText('Paso 1 · Ordenar')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Atrás'));

    expect(screen.getByText('Paso 0 · Identificación')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Tu nombre completo')).toHaveValue('Ana Pérez');
    expect(screen.getByPlaceholderText('tu.correo@empresa.com')).toHaveValue('ana@example.com');
    expect(screen.getByLabelText('Macrodominio')).toHaveValue(PUBLIC_MACRODOMAINS[1]);
  });

  it('advances from Step 1 to Step 2 (Impacto)', () => {
    render(<PublicMotivatorsWizard />);
    advanceToStep2();
    expect(screen.getByText('Paso 2 · Impacto')).toBeInTheDocument();
  });

  it('first-time submitter: "Enviar" posts the payload and shows the confirmation screen with no results', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ submittedAt: '2026-11-18T00:00:00.000Z' }),
    } as Response);

    render(<PublicMotivatorsWizard />);
    advanceToStep2();
    fireEvent.click(screen.getByText('Enviar'));

    await waitFor(() => expect(screen.getByText('¡Gracias!')).toBeInTheDocument());

    expect(screen.getByText('Tu información fue enviada.')).toBeInTheDocument();
    // No motivator results (names, scores) are ever shown to the architect.
    expect(screen.queryByText('Curiosidad')).not.toBeInTheDocument();

    const [, options] = vi.mocked(fetch).mock.calls[0];
    const body = JSON.parse(options!.body as string);
    expect(body).toMatchObject({
      name: 'Ana Pérez',
      email: 'ana@example.com',
      macrodomain: PUBLIC_MACRODOMAINS[0],
      confirmReplace: false,
    });
    expect(body.priorities).toHaveLength(10);
    expect(body.impacts).toHaveLength(10);
  });

  it('duplicate flow: 409 shows the confirm modal; "Reemplazar" resubmits with confirmReplace:true and shows the confirmation screen', async () => {
    const existing = { name: 'Ana Pérez', email: 'ana@example.com', submittedAt: '2026-01-01T00:00:00.000Z' };
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({ duplicate: true, existing }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ submittedAt: '2026-11-18T00:00:00.000Z' }),
      } as Response);

    render(<PublicMotivatorsWizard />);
    advanceToStep2();
    fireEvent.click(screen.getByText('Enviar'));

    await waitFor(() => expect(screen.getByText('Ya existe un registro')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Reemplazar'));

    await waitFor(() => expect(screen.getByText('¡Gracias!')).toBeInTheDocument());

    expect(fetch).toHaveBeenCalledTimes(2);
    const secondCallBody = JSON.parse(vi.mocked(fetch).mock.calls[1][1]!.body as string);
    expect(secondCallBody.confirmReplace).toBe(true);
  });

  it('duplicate flow: "Cancelar" returns to the wizard without submitting, Step 0 data still editable', async () => {
    const existing = { name: 'Ana Pérez', email: 'ana@example.com', submittedAt: '2026-01-01T00:00:00.000Z' };
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({ duplicate: true, existing }),
    } as Response);

    render(<PublicMotivatorsWizard />);
    advanceToStep2();
    fireEvent.click(screen.getByText('Enviar'));

    await waitFor(() => expect(screen.getByText('Ya existe un registro')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Cancelar'));

    expect(screen.queryByText('Ya existe un registro')).not.toBeInTheDocument();
    expect(screen.getByText('Paso 2 · Impacto')).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledTimes(1);

    // Architect can go back and edit Step 0 and retry.
    fireEvent.click(screen.getByText('Atrás'));
    fireEvent.click(screen.getByText('Atrás'));
    expect(screen.getByPlaceholderText('Tu nombre completo')).toHaveValue('Ana Pérez');
  });

  it('network failure on submit shows an error message and keeps the data (retry possible)', async () => {
    vi.mocked(fetch).mockRejectedValue(new TypeError('Failed to fetch'));

    render(<PublicMotivatorsWizard />);
    advanceToStep2();
    fireEvent.click(screen.getByText('Enviar'));

    await waitFor(() => expect(screen.getByText('Failed to fetch')).toBeInTheDocument());

    // Still on Step 2, nothing lost — retry is just clicking Enviar again.
    expect(screen.getByText('Paso 2 · Impacto')).toBeInTheDocument();
    expect(screen.getByText('Enviar')).not.toBeDisabled();
  });
});
