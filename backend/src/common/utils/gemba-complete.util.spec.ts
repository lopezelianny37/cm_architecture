import { isRecordComplete } from './gemba-complete.util';

describe('isRecordComplete', () => {
  it('returns false when all behaviors are na', () => {
    const result = isRecordComplete({
      behaviors: [{ state: 'na' }, { state: 'na' }],
      gaps: [{ text: 'brecha' }],
      flow_steps: [{ objective: 'algo' }],
    });
    expect(result).toBe(false);
  });

  it('returns false when no gap has non-empty text (whitespace-only counts as empty)', () => {
    const result = isRecordComplete({
      behaviors: [{ state: 'si' }],
      gaps: [{ text: '   ' }],
      flow_steps: [{ objective: 'algo' }],
    });
    expect(result).toBe(false);
  });

  it('returns false when no flow step has objective or out', () => {
    const result = isRecordComplete({
      behaviors: [{ state: 'si' }],
      gaps: [{ text: 'brecha' }],
      flow_steps: [{ objective: '', out: '' }],
    });
    expect(result).toBe(false);
  });

  it('returns true when all three criteria are met', () => {
    const result = isRecordComplete({
      behaviors: [{ state: 'na' }, { state: 'par' }],
      gaps: [{ text: 'brecha real' }],
      flow_steps: [{ objective: '', out: 'decisión tomada' }],
    });
    expect(result).toBe(true);
  });

  it('treats missing arrays as empty (returns false)', () => {
    const result = isRecordComplete({});
    expect(result).toBe(false);
  });
});
