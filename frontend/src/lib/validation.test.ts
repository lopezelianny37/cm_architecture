import { describe, expect, it } from 'vitest';
import { isValidEmail } from './validation';

describe('isValidEmail', () => {
  it.each(['ana@example.com', 'a.b+c@sub.example.co', ' trimmed@example.com '])(
    'accepts "%s"',
    (email) => {
      expect(isValidEmail(email)).toBe(true);
    },
  );

  it.each(['not-an-email', 'missing-at.com', '@missing-local.com', 'missing-domain@', ''])(
    'rejects "%s"',
    (email) => {
      expect(isValidEmail(email)).toBe(false);
    },
  );
});
