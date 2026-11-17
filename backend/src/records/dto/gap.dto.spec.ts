import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { GapDto } from './gap.dto';
import { TYPES } from '@/common/constants/gemba.constants';

describe('GapDto', () => {
  it('accepts all 10 valid gap types', async () => {
    for (const type of TYPES) {
      const dto = plainToInstance(GapDto, { text: 'brecha', type, evidence: '', condition: '' });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    }
  });

  it('rejects an invalid gap type', async () => {
    const dto = plainToInstance(GapDto, { text: 'brecha', type: 'Inventado' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('type');
  });
});
