import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ConditionStatusDto } from './condition-status.dto';

describe('ConditionStatusDto', () => {
  it.each(['', 'si', 'par', 'no'])('accepts valid status "%s"', async (status) => {
    const dto = plainToInstance(ConditionStatusDto, { status, evidence: '' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects an invalid status', async () => {
    const dto = plainToInstance(ConditionStatusDto, { status: 'invalido' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('status');
  });
});
