import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { GapDto } from './gap.dto';
import { TYPES } from '@/common/constants/gemba.constants';

describe('GapDto', () => {
  it('accepts all current gap types', async () => {
    for (const type of TYPES) {
      const dto = plainToInstance(GapDto, { text: 'brecha', type, evidence: '', condition: '' });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    }
  });

  it('accepts a legacy type that is no longer in TYPES, so editing an older gap without changing its type never 400s', async () => {
    const dto = plainToInstance(GapDto, { text: 'brecha', type: 'Proceso' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects a non-string type', async () => {
    const dto = plainToInstance(GapDto, { text: 'brecha', type: 12345 });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('type');
  });
});
