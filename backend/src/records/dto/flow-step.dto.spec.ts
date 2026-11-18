import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { FlowStepDto } from './flow-step.dto';

describe('FlowStepDto', () => {
  it.each(['', 'Retrabajo', 'Supuesto', 'Espera', 'Oportunidad'])(
    'accepts valid waste value "%s"',
    async (waste) => {
      const dto = plainToInstance(FlowStepDto, { step: 'x', waste });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    },
  );

  it('rejects an invalid waste value', async () => {
    const dto = plainToInstance(FlowStepDto, { step: 'x', waste: 'Inventado' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('waste');
  });

  it('accepts free-text observations', async () => {
    const dto = plainToInstance(FlowStepDto, {
      step: 'x',
      observations: 'Se saltó este paso por falta de tiempo',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('accepts observations as an empty string', async () => {
    const dto = plainToInstance(FlowStepDto, { step: 'x', observations: '' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects a non-string observations value', async () => {
    const dto = plainToInstance(FlowStepDto, { step: 'x', observations: 42 });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'observations')).toBe(true);
  });
});
