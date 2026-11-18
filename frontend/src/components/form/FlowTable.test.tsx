import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FlowTable } from './FlowTable';
import type { FlowStep } from '../../types/api';

function buildStep(overrides: Partial<FlowStep> = {}): FlowStep {
  return { step: '', objective: '', with: '', out: '', waste: '', observations: '', ...overrides };
}

describe('FlowTable — columna Observaciones', () => {
  it('renders an Observaciones input per step, pre-filled with the existing value', () => {
    render(
      <FlowTable
        flowSteps={[buildStep({ observations: 'Se saltó este paso' }), buildStep()]}
        onChange={vi.fn()}
      />,
    );

    const inputs = screen.getAllByPlaceholderText('Observaciones');
    expect(inputs).toHaveLength(2);
    expect((inputs[0] as HTMLInputElement).value).toBe('Se saltó este paso');
    expect((inputs[1] as HTMLInputElement).value).toBe('');
  });

  it('typing in Observaciones calls onChange with only that field patched', () => {
    const onChange = vi.fn();
    const steps = [buildStep({ step: 'Recibe la necesidad' })];
    render(<FlowTable flowSteps={steps} onChange={onChange} />);

    fireEvent.change(screen.getByPlaceholderText('Observaciones'), {
      target: { value: 'Faltó contexto del área solicitante' },
    });

    expect(onChange).toHaveBeenCalledWith([
      { ...steps[0], observations: 'Faltó contexto del área solicitante' },
    ]);
  });

  it('a newly added step starts with an empty observations field', () => {
    const onChange = vi.fn();
    render(<FlowTable flowSteps={[]} onChange={onChange} />);

    fireEvent.click(screen.getByText('+ Agregar paso'));

    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({ observations: '' }),
    ]);
  });
});
