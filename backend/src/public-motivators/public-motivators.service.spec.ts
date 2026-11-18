import { BadRequestException, HttpException } from '@nestjs/common';
import { PublicMotivatorsService } from './public-motivators.service';
import { DatabaseService } from '@/database/database.service';
import { MOT } from '@/common/constants/gemba.constants';

function fullPriorities() {
  return MOT.map((m, i) => ({ motivator: m.name, priorityOrder: i + 1 }));
}

function fullImpacts() {
  return MOT.map((m) => ({ motivator: m.name, impact: 0 }));
}

function validDto(overrides: Record<string, unknown> = {}) {
  return {
    name: 'Ana Pérez',
    email: 'ana@example.com',
    macrodomain: 'Business Line',
    priorities: fullPriorities(),
    impacts: fullImpacts(),
    ...overrides,
  } as any;
}

describe('PublicMotivatorsService', () => {
  function makeService(matchesByEmail: any[] = [], matchesByName: any[] = []) {
    const insertedRows: any[] = [];
    const deletedIds: string[][] = [];

    const ilikeMock = jest.fn().mockImplementation((column: string) => {
      const data = column === 'email' ? matchesByEmail : matchesByName;
      return Promise.resolve({ data, error: null });
    });

    const selectMock = jest.fn().mockReturnValue({ ilike: ilikeMock });

    const insertMock = jest.fn().mockImplementation((payload: any) => {
      insertedRows.push(payload);
      return {
        select: () => ({
          single: () =>
            Promise.resolve({
              data: { submitted_at: '2026-11-18T00:00:00.000Z' },
              error: null,
            }),
        }),
      };
    });

    const inMock = jest.fn().mockImplementation((_col: string, ids: string[]) => {
      deletedIds.push(ids);
      return Promise.resolve({ error: null });
    });
    const deleteMock = jest.fn().mockReturnValue({ in: inMock });

    const fromMock = jest.fn().mockReturnValue({
      select: selectMock,
      insert: insertMock,
      delete: deleteMock,
    });

    const client = { from: fromMock };
    const db = {
      getServiceRoleClient: jest.fn().mockReturnValue(client),
    } as unknown as DatabaseService;

    const service = new PublicMotivatorsService(db);
    return { service, insertedRows, deletedIds, ilikeMock };
  }

  it('inserts and returns submittedAt when there is no existing match', async () => {
    const { service, insertedRows } = makeService([], []);
    const result = await service.submit(validDto());

    expect(result).toEqual({ submittedAt: '2026-11-18T00:00:00.000Z' });
    expect(insertedRows).toHaveLength(1);
    expect(insertedRows[0]).toMatchObject({ email: 'ana@example.com', name: 'Ana Pérez' });
  });

  it('matches duplicate-check by lower(trim(email)) OR lower(trim(name)) — queries both independently', async () => {
    const { service, ilikeMock } = makeService([], []);
    await service.submit(validDto({ name: '  Ana Pérez  ', email: '  ana@example.com  ' }));

    expect(ilikeMock).toHaveBeenCalledWith('email', 'ana@example.com');
    expect(ilikeMock).toHaveBeenCalledWith('name', 'Ana Pérez');
  });

  it('throws 409 with the existing record when a match is found and confirmReplace is not set', async () => {
    const existing = {
      id: 'row-1',
      name: 'Ana Pérez',
      email: 'ana@example.com',
      submitted_at: '2026-01-01T00:00:00.000Z',
    };
    const { service, insertedRows } = makeService([existing], []);

    await expect(service.submit(validDto())).rejects.toThrow(HttpException);
    expect(insertedRows).toHaveLength(0);

    try {
      await service.submit(validDto());
    } catch (err) {
      expect((err as HttpException).getStatus()).toBe(409);
      expect((err as HttpException).getResponse()).toMatchObject({
        duplicate: true,
        existing: { name: 'Ana Pérez', email: 'ana@example.com' },
      });
    }
  });

  it('confirmReplace=true deletes the matched row(s) before inserting the new one', async () => {
    const existing = {
      id: 'row-1',
      name: 'Ana Pérez',
      email: 'ana@example.com',
      submitted_at: '2026-01-01T00:00:00.000Z',
    };
    const { service, insertedRows, deletedIds } = makeService([existing], []);

    const result = await service.submit(validDto({ confirmReplace: true }));

    expect(deletedIds).toEqual([['row-1']]);
    expect(insertedRows).toHaveLength(1);
    expect(result).toEqual({ submittedAt: '2026-11-18T00:00:00.000Z' });
  });

  it('rejects a payload with a duplicate motivator in priorities', async () => {
    const { service } = makeService([], []);
    const priorities = fullPriorities();
    priorities[1] = { ...priorities[0] };

    await expect(service.submit(validDto({ priorities }))).rejects.toThrow(BadRequestException);
  });

  it('rejects a payload missing a motivator in impacts', async () => {
    const { service } = makeService([], []);
    const impacts = fullImpacts().slice(0, 9);

    await expect(service.submit(validDto({ impacts }))).rejects.toThrow(BadRequestException);
  });
});
