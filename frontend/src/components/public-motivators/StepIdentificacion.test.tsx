import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { StepIdentificacion, type IdentificacionData } from './StepIdentificacion';
import { PUBLIC_MACRODOMAINS } from '../../constants/gemba.constants';

function renderStep(initial: Partial<IdentificacionData> = {}, onNext = vi.fn()) {
  const data: IdentificacionData = { name: '', email: '', macrodomain: '', ...initial };
  let current = data;
  const onChange = vi.fn((next: IdentificacionData) => {
    current = next;
  });
  const utils = render(<StepIdentificacion data={current} onChange={onChange} onNext={onNext} />);
  return { ...utils, onChange, onNext };
}

describe('StepIdentificacion', () => {
  it('disables "Siguiente" when all fields are empty', () => {
    renderStep();
    expect(screen.getByText('Siguiente')).toBeDisabled();
  });

  it('shows an inline error and keeps "Siguiente" disabled for an invalid email format', () => {
    renderStep({ name: 'Ana', email: 'not-an-email', macrodomain: PUBLIC_MACRODOMAINS[0] });
    expect(screen.getByText('Ingresá un correo electrónico válido.')).toBeInTheDocument();
    expect(screen.getByText('Siguiente')).toBeDisabled();
  });

  it('renders exactly the 5 fixed macrodomain options, in order, no "Otro", no free text', () => {
    renderStep();
    const select = screen.getByLabelText('Macrodominio') as HTMLSelectElement;
    const optionLabels = Array.from(select.options).map((o) => o.textContent);

    // First option is the empty placeholder; the rest must be exactly
    // PUBLIC_MACRODOMAINS, in order.
    expect(optionLabels.slice(1)).toEqual(PUBLIC_MACRODOMAINS);
    expect(optionLabels).not.toContain('Otro');
    expect(screen.queryByPlaceholderText(/macrodominio/i)).not.toBeInTheDocument();
  });

  it('enables "Siguiente" once all 3 fields are valid, and calls onNext when clicked', () => {
    const onNext = vi.fn();
    renderStep(
      { name: 'Ana Pérez', email: 'ana@example.com', macrodomain: PUBLIC_MACRODOMAINS[2] },
      onNext,
    );

    const button = screen.getByText('Siguiente');
    expect(button).not.toBeDisabled();

    fireEvent.click(button);
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('calls onChange when typing in the name field', () => {
    const { onChange } = renderStep();
    fireEvent.change(screen.getByPlaceholderText('Tu nombre completo'), {
      target: { value: 'Ana' },
    });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ name: 'Ana' }));
  });
});
