import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { StepOrdenar } from './StepOrdenar';
import { MOT, MOT_COLORS, MOT_NAMES } from '../../constants/gemba.constants';

function renderStep(order = MOT_NAMES) {
  const onChange = vi.fn();
  const onNext = vi.fn();
  const onBack = vi.fn();
  const utils = render(
    <StepOrdenar order={order} onChange={onChange} onNext={onNext} onBack={onBack} />,
  );
  return { ...utils, onChange, onNext, onBack };
}

function descriptionFor(name: string): string {
  return MOT.find((m) => m.name === name)!.description;
}

describe('StepOrdenar', () => {
  it('renders all 10 motivator cards with no description visible by default', () => {
    renderStep();
    for (const m of MOT) {
      expect(screen.queryByText(m.description)).not.toBeInTheDocument();
    }
  });

  it('shows the description as a tooltip above the card on hover, and hides it on mouse leave', () => {
    renderStep();
    const name = MOT_NAMES[0];
    const description = descriptionFor(name);
    const card = screen.getByText(name).closest('[draggable]')!;

    fireEvent.mouseEnter(card);
    expect(screen.getByText(description)).toBeInTheDocument();

    fireEvent.mouseLeave(card);
    expect(screen.queryByText(description)).not.toBeInTheDocument();
  });

  it('shows the tooltip on focus and hides it on blur (keyboard/touch fallback where hover is unavailable)', () => {
    renderStep();
    const name = MOT_NAMES[0];
    const description = descriptionFor(name);
    const card = screen.getByText(name).closest('[draggable]')!;

    fireEvent.focus(card);
    expect(screen.getByText(description)).toBeInTheDocument();

    fireEvent.blur(card);
    expect(screen.queryByText(description)).not.toBeInTheDocument();
  });

  it('is focusable (tabIndex) so the hover fallback works without a mouse', () => {
    renderStep();
    const card = screen.getByText(MOT_NAMES[0]).closest('[draggable]')!;
    expect(card).toHaveAttribute('tabIndex', '0');
  });

  it('exposes the description via aria-label for assistive tech', () => {
    renderStep();
    for (const m of MOT) {
      const card = screen.getByText(m.name).closest('[draggable]')!;
      expect(card).toHaveAttribute('aria-label', `${m.name}: ${m.description}`);
    }
  });

  it('keeps every header on a single line, shrinking the font for the longest names', () => {
    renderStep();
    const longNames = new Set(['Aceptación', 'Curiosidad', 'Relaciones']);
    for (const m of MOT) {
      const header = screen.getByText(m.name);
      expect(header).toHaveClass('whitespace-nowrap');
      expect(header.className).toMatch(longNames.has(m.name) ? /text-\[7px\]/ : /text-\[8px\]/);
    }
  });

  it("renders each card's header in its assigned MOT_COLORS color", () => {
    renderStep();
    for (const m of MOT) {
      const header = screen.getByText(m.name);
      expect(header.parentElement).toHaveStyle({ backgroundColor: MOT_COLORS[m.name] });
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

  it('shows the updated instructional text', () => {
    renderStep();
    expect(
      screen.getByText('Arrastre las tarjetas de (← mayor) a (menor →) importancia, según su descripción.'),
    ).toBeInTheDocument();
  });
});
