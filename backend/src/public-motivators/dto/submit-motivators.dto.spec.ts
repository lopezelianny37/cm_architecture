import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { SubmitMotivatorsDto } from './submit-motivators.dto';
import { PUBLIC_MACRODOMAINS, MOT } from '@/common/constants/gemba.constants';

function fullPriorities() {
  return MOT.map((m, i) => ({ motivator: m.name, priorityOrder: i + 1 }));
}

function fullImpacts() {
  return MOT.map((m) => ({ motivator: m.name, impact: 0 }));
}

function basePayload() {
  return {
    name: 'Ana Pérez',
    email: 'ana@example.com',
    macrodomain: PUBLIC_MACRODOMAINS[0],
    priorities: fullPriorities(),
    impacts: fullImpacts(),
  };
}

describe('SubmitMotivatorsDto', () => {
  it('accepts a fully valid payload', async () => {
    const dto = plainToInstance(SubmitMotivatorsDto, basePayload());
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it.each(PUBLIC_MACRODOMAINS)('accepts macrodomain "%s"', async (macrodomain) => {
    const dto = plainToInstance(SubmitMotivatorsDto, { ...basePayload(), macrodomain });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects a macrodomain outside the 5 fixed values', async () => {
    const dto = plainToInstance(SubmitMotivatorsDto, { ...basePayload(), macrodomain: 'Otro' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'macrodomain')).toBe(true);
  });

  it('rejects an out-of-range priorityOrder (0)', async () => {
    const payload = basePayload();
    payload.priorities[0].priorityOrder = 0;
    const dto = plainToInstance(SubmitMotivatorsDto, payload);
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects an out-of-range priorityOrder (11)', async () => {
    const payload = basePayload();
    payload.priorities[0].priorityOrder = 11;
    const dto = plainToInstance(SubmitMotivatorsDto, payload);
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects an out-of-range impact (5)', async () => {
    const payload = basePayload();
    payload.impacts[0].impact = 5;
    const dto = plainToInstance(SubmitMotivatorsDto, payload);
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects an out-of-range impact (-5)', async () => {
    const payload = basePayload();
    payload.impacts[0].impact = -5;
    const dto = plainToInstance(SubmitMotivatorsDto, payload);
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects priorities with fewer than 10 items', async () => {
    const payload = basePayload();
    payload.priorities = payload.priorities.slice(0, 9);
    const dto = plainToInstance(SubmitMotivatorsDto, payload);
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects a malformed email', async () => {
    const dto = plainToInstance(SubmitMotivatorsDto, { ...basePayload(), email: 'not-an-email' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'email')).toBe(true);
  });
});
