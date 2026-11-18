import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { StepOrdenar } from './StepOrdenar';
import { MOT, MOT_NAMES } from '../../constants/gemba.constants';

function renderStep(order = MOT_NAMES) {
  const onChange = vi.fn();
  const onNext = vi.fn();
  const onBack = vi.fn();
  const utils = render(
    <StepOrdenar order={order} onChange={onChange} onNext={onNext} onBack={onBack} />,
  );
  return { ...utils, onChange, onNext, onBack };
}

describe('StepOrdenar', () => {
  it('renders all 10 motivator cards, with the description available as a title tooltip', () => {
    renderStep();
    for (const m of MOT) {
      const card = screen.getByText(m.name).closest('[draggable]');
      expect(card).toHaveAttribute('title', m.description);
    }
  });

  it('dragging the last card onto the first slot moves it there (visual order updates via onChange)', () => {
    const { onChange } = renderStep();
    const lastName = MOT_NAMES[MOT_NAMES.length - 1];
    const firstName = MOT_NAMES[0];

    const lastCard = screen.getByText(lastName).closest('[draggable]')!;
    const firstCard = screen.getByText(firstName).closest('[draggable]')!;

    fireEvent.dragStart(lastCard);
    fireEvent.drop(firstCard);

    expect(onChange).toHaveBeenCalledTimes(1);
    const newOrder = onChange.mock.calls[0][0] as string[];
    expect(newOrder[0]).toBe(lastName);
    expect(newOrder).toHaveLength(10);
    // No motivator lost or duplicated by the reorder.
    expect(new Set(newOrder).size).toBe(10);
  });

  it('the → button on the leftmost card moves it one slot to the right', () => {
    const { onChange } = renderStep();
    const firstName = MOT_NAMES[0];

    fireEvent.click(screen.getByLabelText(`Mover ${firstName} a la derecha`));

    expect(onChange).toHaveBeenCalledTimes(1);
    const newOrder = onChange.mock.calls[0][0] as string[];
    expect(newOrder[1]).toBe(firstName);
  });

  it('the ← button on the leftmost card is a no-op (already at the edge)', () => {
    const { onChange } = renderStep();
    const firstName = MOT_NAMES[0];

    fireEvent.click(screen.getByLabelText(`Mover ${firstName} a la izquierda`));

    const newOrder = onChange.mock.calls[0][0] as string[];
    expect(newOrder).toEqual(MOT_NAMES);
  });

  it('"Siguiente" is enabled (the order always has all 10 positions defined by construction)', () => {
    renderStep();
    expect(screen.getByText('Siguiente')).not.toBeDisabled();
  });

  it('calls onBack when "Atrás" is clicked', () => {
    const { onBack } = renderStep();
    fireEvent.click(screen.getByText('Atrás'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('labels the left side as most important and the right side as least important', () => {
    renderStep();
    expect(screen.getByText('← Más importante')).toBeInTheDocument();
    expect(screen.getByText('Menos importante →')).toBeInTheDocument();
  });
});
