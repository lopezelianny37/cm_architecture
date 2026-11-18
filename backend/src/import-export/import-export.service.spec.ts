import { BadRequestException } from '@nestjs/common';
import { ImportExportService } from './import-export.service';
import { DatabaseService } from '@/database/database.service';

function validBackup() {
  return {
    target: 5,
    records: [
      {
        meta: { arch: 'Ana Pérez', macro: 'Data', init: 'Iniciativa X', business: 'Juan' },
        prep: {
          value: 'Habrá valido la pena si...',
          barrier: 'El tiempo',
          mot: [{ name: 'Curiosidad', desc: 'desc', impact: 1, order: 0 }],
        },
        run1: {
          beh: [{ s: 'si', fact: 'hecho', artifact: 'evidencia' }],
          flow: [{ step: 'paso 1', objective: 'obj', with: 'con quien', out: 'salida', waste: '' }],
        },
        diag: {
          strength: 'bien',
          selfgap: 'brecha',
          block: 'bloqueo',
          try: 'probaria',
          flowq: ['', '', '', ''],
          gaps: [{ text: 'brecha', type: 'Proceso', evidence: '', condition: '' }],
          conditions: [{ s: 'si', evidence: '' }],
        },
        csat: { score: '4', comment: 'bien' },
      },
    ],
  };
}

describe('ImportExportService.validatePayload', () => {
  const service = new ImportExportService({} as DatabaseService);

  it('passes schema validation for a valid backup', () => {
    const result = service.validatePayload(validBackup());
    expect(result.records).toHaveLength(1);
    expect(result.records[0].meta?.arch).toBe('Ana Pérez');
  });

  it('fails schema validation when records is missing', () => {
    expect(() => service.validatePayload({ target: 5 })).toThrow(BadRequestException);
  });

  it('fails schema validation when the payload is not an object', () => {
    expect(() => service.validatePayload('not json')).toThrow(BadRequestException);
    expect(() => service.validatePayload(null)).toThrow(BadRequestException);
  });

  it('fails schema validation when records is empty', () => {
    expect(() => service.validatePayload({ records: [] })).toThrow(BadRequestException);
  });

  it('fails with a clear message when a nested field has the wrong type', () => {
    const backup = validBackup();
    (backup.records[0].meta as any).arch = 12345; // should be a string
    expect(() => service.validatePayload(backup)).toThrow('El archivo no es un respaldo válido');
  });

  it('allows duplicate architect names within the same backup (import always appends, no dedup)', () => {
    const backup = validBackup();
    backup.records.push({ ...backup.records[0] });
    expect(() => service.validatePayload(backup)).not.toThrow();
  });
});

describe('ImportExportService.importBackup', () => {
  function makeService() {
    const insertedRecords: any[] = [];
    const insertedMotivators: any[] = [];
    const deleteMock = jest.fn();

    const fromMock = jest.fn().mockImplementation((table: string) => {
      if (table === 'gemba_records') {
        return {
          delete: deleteMock,
          insert: (payload: any) => {
            insertedRecords.push(payload);
            const inserted = { id: `generated-${insertedRecords.length}`, ...payload };
            return {
              select: () => ({
                single: () => Promise.resolve({ data: inserted, error: null }),
              }),
            };
          },
        };
      }
      if (table === 'gemba_moving_motivators') {
        return {
          insert: (rows: any[]) => {
            insertedMotivators.push(...rows);
            return Promise.resolve({ error: null });
          },
        };
      }
      if (table === 'gemba_settings') {
        return { upsert: jest.fn().mockResolvedValue({ error: null }) };
      }
      throw new Error(`Unexpected table ${table}`);
    });

    const client = { from: fromMock };
    const db = {
      getUserClient: jest.fn().mockReturnValue(client),
    } as unknown as DatabaseService;

    const service = new ImportExportService(db);
    return { service, insertedRecords, insertedMotivators, deleteMock };
  }

  it('never deletes existing records — only inserts (always-append semantics)', async () => {
    const { service, deleteMock, insertedRecords } = makeService();

    await service.importBackup('token', 'user-1', validBackup());

    expect(deleteMock).not.toHaveBeenCalled();
    expect(insertedRecords).toHaveLength(1);
    expect(insertedRecords[0].architect_name).toBe('Ana Pérez');
    expect(insertedRecords[0].user_id).toBe('user-1');
  });

  it('inserts every record even when the architect name repeats, with no dedup', async () => {
    const backup = validBackup();
    backup.records.push({ ...backup.records[0] });

    const { service, insertedRecords } = makeService();
    const result = await service.importBackup('token', 'user-1', backup);

    expect(insertedRecords).toHaveLength(2);
    expect(insertedRecords[0].architect_name).toBe('Ana Pérez');
    expect(insertedRecords[1].architect_name).toBe('Ana Pérez');
    expect(result).toEqual({ imported: 2 });
  });

  it('imports the motivators for each record alongside it', async () => {
    const { service, insertedMotivators } = makeService();

    await service.importBackup('token', 'user-1', validBackup());

    expect(insertedMotivators).toHaveLength(1);
    expect(insertedMotivators[0]).toMatchObject({ name: 'Curiosidad', impact: 1, order: 0 });
  });

  it('returns the count of imported records', async () => {
    const { service } = makeService();
    const result = await service.importBackup('token', 'user-1', validBackup());
    expect(result).toEqual({ imported: 1 });
  });
});
