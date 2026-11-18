import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { StepImpacto } from './StepImpacto';
import { MOT, MOT_NAMES } from '../../constants/gemba.constants';

function renderStep(impacts: Record<string, number> = {}, order: string[] = MOT_NAMES) {
  const onChange = vi.fn();
  const onSubmit = vi.fn();
  const onBack = vi.fn();
  render(
    <StepImpacto
      order={order}
      impacts={impacts}
      onChange={onChange}
      onBack={onBack}
      onSubmit={onSubmit}
      submitting={false}
      error={null}
    />,
  );
  return { onChange, onSubmit, onBack };
}

describe('StepImpacto', () => {
  it('renders all 10 motivators with an adjustable slider', () => {
    renderStep();
    for (const m of MOT) {
      expect(screen.getByLabelText(`Impacto de ${m.name}`)).toBeInTheDocument();
    }
  });

  it('renders the cards in the order passed in from Step 1, not the raw MOT order', () => {
    const customOrder = [...MOT_NAMES].reverse();
    renderStep({}, customOrder);

    const renderedNames = screen
      .getAllByText(new RegExp(`^(${MOT_NAMES.join('|')})$`))
      .map((el) => el.textContent);
    expect(renderedNames).toEqual(customOrder);
  });

  it('moving a slider to its max gives impact = 4 ("Arriba" max)', () => {
    const { onChange } = renderStep();
    const slider = screen.getByLabelText(`Impacto de ${MOT[0].name}`);
    fireEvent.change(slider, { target: { value: '4' } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ [MOT[0].name]: 4 }));
  });

  it('moving a slider to its min gives impact = -4 ("Abajo" max)', () => {
    const { onChange } = renderStep();
    const slider = screen.getByLabelText(`Impacto de ${MOT[0].name}`);
    fireEvent.change(slider, { target: { value: '-4' } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ [MOT[0].name]: -4 }));
  });

  it('leaving a card untouched defaults to impact = 0 (Centro)', () => {
    renderStep();
    const slider = screen.getByLabelText(`Impacto de ${MOT[0].name}`) as HTMLInputElement;
    expect(slider.value).toBe('0');
  });

  it('clicking "Enviar" calls onSubmit', () => {
    const { onSubmit } = renderStep();
    fireEvent.click(screen.getByText('Enviar'));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('disables Atrás/Enviar and shows "Enviando…" while submitting', () => {
    render(
      <StepImpacto
        order={MOT_NAMES}
        impacts={{}}
        onChange={vi.fn()}
        onBack={vi.fn()}
        onSubmit={vi.fn()}
        submitting
        error={null}
      />,
    );
    expect(screen.getByText('Enviando…')).toBeDisabled();
    expect(screen.getByText('Atrás')).toBeDisabled();
  });

  it('shows the error message when present', () => {
    render(
      <StepImpacto
        order={MOT_NAMES}
        impacts={{}}
        onChange={vi.fn()}
        onBack={vi.fn()}
        onSubmit={vi.fn()}
        submitting={false}
        error="No se pudo enviar la información."
      />,
    );
    expect(screen.getByText('No se pudo enviar la información.')).toBeInTheDocument();
  });
});
