import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { DuplicateConfirmModal } from './DuplicateConfirmModal';

const existing = { name: 'Ana Pérez', email: 'ana@example.com', submittedAt: '2026-01-15T00:00:00.000Z' };

describe('DuplicateConfirmModal', () => {
  it('shows the explicit replace-or-cancel message with the existing date', () => {
    render(
      <DuplicateConfirmModal existing={existing} onReplace={vi.fn()} onCancel={vi.fn()} loading={false} />,
    );
    expect(screen.getByText(/Ya existe un registro con este nombre o correo/)).toBeInTheDocument();
    expect(screen.getByText(/se eliminará el anterior/)).toBeInTheDocument();
  });

  it('calls onReplace when "Reemplazar" is clicked', () => {
    const onReplace = vi.fn();
    render(
      <DuplicateConfirmModal existing={existing} onReplace={onReplace} onCancel={vi.fn()} loading={false} />,
    );
    fireEvent.click(screen.getByText('Reemplazar'));
    expect(onReplace).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when "Cancelar" is clicked, without calling onReplace', () => {
    const onCancel = vi.fn();
    const onReplace = vi.fn();
    render(
      <DuplicateConfirmModal existing={existing} onReplace={onReplace} onCancel={onCancel} loading={false} />,
    );
    fireEvent.click(screen.getByText('Cancelar'));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onReplace).not.toHaveBeenCalled();
  });

  it('disables both buttons while loading', () => {
    render(
      <DuplicateConfirmModal existing={existing} onReplace={vi.fn()} onCancel={vi.fn()} loading />,
    );
    expect(screen.getByText('Reemplazar')).toBeDisabled();
    expect(screen.getByText('Cancelar')).toBeDisabled();
  });
});
