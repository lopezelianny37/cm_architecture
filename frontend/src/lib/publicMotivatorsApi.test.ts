import { beforeEach, describe, expect, it, vi } from 'vitest';
import { isDuplicateResult, submitMotivators, type SubmitMotivatorsPayload } from './publicMotivatorsApi';

function payload(overrides: Partial<SubmitMotivatorsPayload> = {}): SubmitMotivatorsPayload {
  return {
    name: 'Ana Pérez',
    email: 'ana@example.com',
    macrodomain: 'Business Line',
    priorities: [{ motivator: 'Curiosidad', priorityOrder: 1 }],
    impacts: [{ motivator: 'Curiosidad', impact: 2 }],
    ...overrides,
  };
}

describe('submitMotivators', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('POSTs to /api/public/moving-motivators with the exact payload as the body', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ submittedAt: '2026-11-18T00:00:00.000Z' }),
    } as Response);

    const body = payload();
    await submitMotivators(body);

    expect(fetch).toHaveBeenCalledWith(
      '/api/public/moving-motivators',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
    );
  });

  it('returns { submittedAt } on 201', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ submittedAt: '2026-11-18T00:00:00.000Z' }),
    } as Response);

    const result = await submitMotivators(payload());
    expect(isDuplicateResult(result)).toBe(false);
    expect(result).toEqual({ submittedAt: '2026-11-18T00:00:00.000Z' });
  });

  it('returns the duplicate shape on 409, without throwing', async () => {
    const existing = { name: 'Ana Pérez', email: 'ana@example.com', submittedAt: '2026-01-01' };
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({ duplicate: true, existing }),
    } as Response);

    const result = await submitMotivators(payload());
    expect(isDuplicateResult(result)).toBe(true);
    if (isDuplicateResult(result)) {
      expect(result.existing).toEqual(existing);
    }
  });

  it('throws with the backend message on a validation error (400)', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ message: ['email must be an email'] }),
    } as Response);

    await expect(submitMotivators(payload())).rejects.toThrow('email must be an email');
  });

  it('throws a generic message on a rate-limit error (429)', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({ message: 'ThrottlerException: Too Many Requests' }),
    } as Response);

    await expect(submitMotivators(payload())).rejects.toThrow('Too Many Requests');
  });
});
