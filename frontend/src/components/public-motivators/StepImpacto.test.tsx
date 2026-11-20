import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { StepImpacto } from './StepImpacto';
import { MOT_NAMES } from '../../constants/gemba.constants';

function renderStep(impacts: Record<string, number> = {}, order: string[] = MOT_NAMES) {
  const onChange = vi.fn();
  const onBack = vi.fn();
  const onSubmit = vi.fn();
  const utils = render(
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
  return { ...utils, onChange, onBack, onSubmit };
}

describe('StepImpacto', () => {
  it('renders a draggable slider for each motivator in the given order', () => {
    renderStep();
    const sliders = screen.getAllByRole('slider');
    expect(sliders).toHaveLength(10);
    expect(sliders.map((s) => s.getAttribute('aria-label'))).toEqual(
      MOT_NAMES.map((name) => `Impacto de ${name}`),
    );
  });

  it('respects a custom order prop for left-to-right placement', () => {
    const customOrder = [...MOT_NAMES].reverse();
    renderStep({}, customOrder);
    const sliders = screen.getAllByRole('slider');
    expect(sliders.map((s) => s.getAttribute('aria-label'))).toEqual(
      customOrder.map((name) => `Impacto de ${name}`),
    );
  });

  it('defaults a motivator with no stored impact to 0 (Centro)', () => {
    renderStep();
    expect(screen.getByLabelText(`Impacto de ${MOT_NAMES[0]}`)).toHaveAttribute(
      'aria-valuenow',
      '0',
    );
  });

  it('reflects an existing impact value via aria-valuenow', () => {
    renderStep({ [MOT_NAMES[0]]: 3, [MOT_NAMES[1]]: -2 });
    expect(screen.getByLabelText(`Impacto de ${MOT_NAMES[0]}`)).toHaveAttribute(
      'aria-valuenow',
      '3',
    );
    expect(screen.getByLabelText(`Impacto de ${MOT_NAMES[1]}`)).toHaveAttribute(
      'aria-valuenow',
      '-2',
    );
  });

  it('ArrowUp/ArrowDown step the focused card by 1, clamped to -4..4', () => {
    const { onChange } = renderStep({ [MOT_NAMES[0]]: 4 });
    const slider = screen.getByLabelText(`Impacto de ${MOT_NAMES[0]}`);

    fireEvent.keyDown(slider, { key: 'ArrowUp' });
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ [MOT_NAMES[0]]: 4 }));

    fireEvent.keyDown(slider, { key: 'ArrowDown' });
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ [MOT_NAMES[0]]: 3 }));
  });

  describe('vertical pointer drag', () => {
    beforeEach(() => {
      vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
        top: 0,
        bottom: 320,
        height: 320,
        left: 0,
        right: 100,
        width: 100,
        x: 0,
        y: 0,
        toJSON() {
          return {};
        },
      } as DOMRect);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    function movePointer(clientY: number) {
      window.dispatchEvent(Object.assign(new Event('pointermove'), { clientY }));
    }

    it('updates the impact live as the pointer moves down the track, snapping to the nearest level', () => {
      const { onChange } = renderStep();
      const slider = screen.getByLabelText(`Impacto de ${MOT_NAMES[0]}`);

      fireEvent(slider, new Event('pointerdown', { bubbles: true }));
      movePointer(40); // fraction 0.125 of 320 -> raw 4 - 1 = 3
      expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ [MOT_NAMES[0]]: 3 }));

      movePointer(160); // fraction 0.5 -> 0 (Centro)
      expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ [MOT_NAMES[0]]: 0 }));

      movePointer(320); // fraction 1 -> -4
      expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ [MOT_NAMES[0]]: -4 }));
    });

    it('stops updating once the pointer is released', () => {
      const { onChange } = renderStep();
      const slider = screen.getByLabelText(`Impacto de ${MOT_NAMES[0]}`);

      fireEvent(slider, new Event('pointerdown', { bubbles: true }));
      movePointer(40);
      const callsWhileDragging = onChange.mock.calls.length;

      act(() => {
        window.dispatchEvent(new Event('pointerup'));
      });
      movePointer(300);
      expect(onChange.mock.calls.length).toBe(callsWhileDragging);
    });

    it('shows the motivator description in a tooltip while dragging, and hides it after release', () => {
      renderStep();
      const name = MOT_NAMES[0];
      const slider = screen.getByLabelText(`Impacto de ${name}`);

      expect(screen.queryByText(/aprueban lo que hago/)).not.toBeInTheDocument();

      fireEvent(slider, new Event('pointerdown', { bubbles: true }));
      expect(screen.getByText(/aprueban lo que hago/)).toBeInTheDocument();

      act(() => {
        window.dispatchEvent(new Event('pointerup'));
      });
      expect(screen.queryByText(/aprueban lo que hago/)).not.toBeInTheDocument();
    });
  });

  it('shows the motivator description in a tooltip while the card is focused', () => {
    renderStep();
    const name = MOT_NAMES[0];
    const slider = screen.getByLabelText(`Impacto de ${name}`);

    fireEvent.focus(slider);
    expect(screen.getByText(/aprueban lo que hago/)).toBeInTheDocument();

    fireEvent.blur(slider);
    expect(screen.queryByText(/aprueban lo que hago/)).not.toBeInTheDocument();
  });

  it('shows the title/instruction text', () => {
    renderStep();
    expect(
      screen.getByText('¿En qué medida son fomentados estos valores actualmente en tu entorno laboral?'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Ordene las tarjetas hacia arriba (muy fomentado) y hacia abajo (muy negativo); en el medio es indiferente o neutral.',
      ),
    ).toBeInTheDocument();
  });

  it('calls onBack when "Atrás" is clicked', () => {
    const { onBack } = renderStep();
    fireEvent.click(screen.getByText('Atrás'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('calls onSubmit when "Enviar" is clicked', () => {
    const { onSubmit } = renderStep();
    fireEvent.click(screen.getByText('Enviar'));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('disables both buttons while submitting', () => {
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
    expect(screen.getByText('Atrás')).toBeDisabled();
    expect(screen.getByText('Enviando…')).toBeDisabled();
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
        error="Algo salió mal"
      />,
    );
    expect(screen.getByText('Algo salió mal')).toBeInTheDocument();
  });
});
