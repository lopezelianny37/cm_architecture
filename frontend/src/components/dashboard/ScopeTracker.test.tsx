import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ScopeTracker } from './ScopeTracker';

describe('ScopeTracker', () => {
  it('shows 0% when completionSum is 0', () => {
    render(<ScopeTracker targetScope={5} completionSum={0} onTargetChange={vi.fn()} />);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('shows 100% when completionSum equals the target', () => {
    render(<ScopeTracker targetScope={5} completionSum={5} onTargetChange={vi.fn()} />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('caps at 100% when completionSum exceeds the target', () => {
    render(<ScopeTracker targetScope={3} completionSum={5} onTargetChange={vi.fn()} />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('rounds a fractional completion sum (2.67/5 = 53.4% -> 53%)', () => {
    render(<ScopeTracker targetScope={5} completionSum={1 / 3 + 2 / 3 + 1.67} onTargetChange={vi.fn()} />);
    expect(screen.getByText('53%')).toBeInTheDocument();
  });

  it('updates the displayed percentage instantly while typing a new target, before the debounced save fires', () => {
    render(<ScopeTracker targetScope={5} completionSum={2.5} onTargetChange={vi.fn()} />);
    expect(screen.getByText('50%')).toBeInTheDocument();

    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '10' } });
    expect(screen.getByText('25%')).toBeInTheDocument();
  });
});
