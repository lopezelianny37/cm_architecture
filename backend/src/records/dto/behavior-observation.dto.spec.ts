import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { BehaviorObservationDto } from './behavior-observation.dto';

describe('BehaviorObservationDto', () => {
  it.each(['si', 'par', 'no', 'na'])('accepts valid state "%s"', async (state) => {
    const dto = plainToInstance(BehaviorObservationDto, { state, fact: '', artifact: '' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects an invalid state', async () => {
    const dto = plainToInstance(BehaviorObservationDto, { state: 'invalido' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('state');
  });
});
