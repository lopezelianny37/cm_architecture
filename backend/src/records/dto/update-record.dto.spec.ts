import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UpdateRecordDto } from './update-record.dto';

describe('UpdateRecordDto.csatScore', () => {
  it.each([1, 2, 3, 4, 5])('accepts valid score %i', async (csatScore) => {
    const dto = plainToInstance(UpdateRecordDto, { csatScore });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('accepts null (sin responder)', async () => {
    const dto = plainToInstance(UpdateRecordDto, { csatScore: null });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects a score below 1', async () => {
    const dto = plainToInstance(UpdateRecordDto, { csatScore: 0 });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects a score above 5', async () => {
    const dto = plainToInstance(UpdateRecordDto, { csatScore: 6 });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});

describe('UpdateRecordDto.architectEmail', () => {
  it('accepts a valid email', async () => {
    const dto = plainToInstance(UpdateRecordDto, { architectEmail: 'ana@example.com' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('accepts an empty string (not yet filled in)', async () => {
    const dto = plainToInstance(UpdateRecordDto, { architectEmail: '' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects a malformed email', async () => {
    const dto = plainToInstance(UpdateRecordDto, { architectEmail: 'not-an-email' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'architectEmail')).toBe(true);
  });
});

describe('UpdateRecordDto.initiativeStatus', () => {
  it('accepts free text, with no fixed options', async () => {
    const dto = plainToInstance(UpdateRecordDto, { initiativeStatus: 'En evaluación' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('accepts an empty string', async () => {
    const dto = plainToInstance(UpdateRecordDto, { initiativeStatus: '' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects a non-string value', async () => {
    const dto = plainToInstance(UpdateRecordDto, { initiativeStatus: 42 });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'initiativeStatus')).toBe(true);
  });
});
