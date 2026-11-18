import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ImportModal } from './ImportModal';

describe('ImportModal — mensaje de "siempre agrega", ya no destructivo', () => {
  it('shows the non-destructive, always-appends message', () => {
    render(<ImportModal open onClose={vi.fn()} onImport={vi.fn()} />);

    expect(
      screen.getByText('Se agregará a tu información existente, sin eliminar nada.'),
    ).toBeInTheDocument();
  });

  it('no longer shows the old destructive/irreversible warning', () => {
    render(<ImportModal open onClose={vi.fn()} onImport={vi.fn()} />);

    expect(screen.queryByText(/borra PERMANENTEMENTE/)).not.toBeInTheDocument();
    expect(screen.queryByText(/No se puede deshacer/)).not.toBeInTheDocument();
  });

  it('calls onImport with the selected file when "Cargar respaldo" is clicked', async () => {
    const onImport = vi.fn().mockResolvedValue(undefined);
    render(<ImportModal open onClose={vi.fn()} onImport={onImport} />);

    const file = new File(['{"records":[]}'], 'respaldo.json', { type: 'application/json' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    fireEvent.click(screen.getByText('Cargar respaldo'));

    expect(onImport).toHaveBeenCalledWith(file);
  });
});
