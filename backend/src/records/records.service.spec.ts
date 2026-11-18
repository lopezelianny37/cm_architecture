import { RecordsService } from './records.service';
import { DatabaseService } from '@/database/database.service';
import { MotivatorsService } from '@/motivators/motivators.service';

function buildQueryMock(result: { data: any[]; error: any; count: number }) {
  const query: any = {
    select: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue(result),
  };
  // Make the query itself thenable to resolve with the result
  query.then = (resolve: any) => resolve(result);
  return query;
}

describe('RecordsService', () => {
  function makeService(records: any[], count?: number) {
    const queryResult = { data: records, error: null, count: count ?? records.length };
    const fromMock = jest.fn().mockReturnValue(buildQueryMock(queryResult));
    const client = { from: fromMock };
    const db = {
      getUserClient: jest.fn().mockReturnValue(client),
    } as unknown as DatabaseService;
    const motivatorsService = {
      seedForRecord: jest.fn().mockResolvedValue(undefined),
    } as unknown as MotivatorsService;
    const service = new RecordsService(db, motivatorsService);
    return { service, fromMock, client, motivatorsService };
  }

  it('returns empty records with total 0 when no rows', async () => {
    const { service } = makeService([]);
    const result = await service.findAll('token', {});
    expect(result.records).toEqual([]);
    expect(result.total).toBe(0);
    expect(result.hasMore).toBe(false);
  });

  it('marks isComplete=true only when behaviors+gaps+flow criteria met', async () => {
    const completeRecord = {
      id: '1',
      behaviors: [{ state: 'si' }],
      gaps: [{ text: 'brecha' }],
      flow_steps: [{ objective: 'algo' }],
    };
    const incompleteRecord = {
      id: '2',
      behaviors: [{ state: 'na' }],
      gaps: [],
      flow_steps: [],
    };

    const { service } = makeService([completeRecord, incompleteRecord]);
    const result = await service.findAll('token', {});

    expect(result.records.find((r: any) => r.id === '1').isComplete).toBe(true);
    expect(result.records.find((r: any) => r.id === '2').isComplete).toBe(false);
  });

  it('filters by status=complete only returning complete records', async () => {
    const completeRecord = {
      id: '1',
      behaviors: [{ state: 'si' }],
      gaps: [{ text: 'brecha' }],
      flow_steps: [{ objective: 'algo' }],
    };
    const incompleteRecord = {
      id: '2',
      behaviors: [{ state: 'na' }],
      gaps: [],
      flow_steps: [],
    };

    const { service } = makeService([completeRecord, incompleteRecord]);
    const result = await service.findAll('token', { status: 'complete' });

    expect(result.records).toHaveLength(1);
    expect(result.records[0].id).toBe('1');
    expect(result.total).toBe(1);
  });

  it('paginates with limit/offset', async () => {
    const records = Array.from({ length: 5 }, (_, i) => ({
      id: String(i),
      behaviors: [],
      gaps: [],
      flow_steps: [],
    }));

    const { service } = makeService(records);
    const result = await service.findAll('token', { limit: 2, offset: 2 });

    expect(result.records).toHaveLength(2);
    expect(result.records[0].id).toBe('2');
    expect(result.hasMore).toBe(true);
  });
});

describe('RecordsService.getMotivatorResult', () => {
  function makeGetMotivatorResultService(
    recordResult: { data: any; error: any },
    submissionResult: { data: any; error: any } = { data: null, error: null },
  ) {
    const userClient = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue(recordResult),
      }),
    };
    const serviceRoleFrom = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue(submissionResult),
    });
    const serviceClient = { from: serviceRoleFrom };

    const db = {
      getUserClient: jest.fn().mockReturnValue(userClient),
      getServiceRoleClient: jest.fn().mockReturnValue(serviceClient),
    } as unknown as DatabaseService;
    const motivatorsService = {
      seedForRecord: jest.fn(),
    } as unknown as MotivatorsService;

    const service = new RecordsService(db, motivatorsService);
    return { service, userClient, serviceRoleFrom };
  }

  it('returns found:false when the record has no architect_email', async () => {
    const { service, serviceRoleFrom } = makeGetMotivatorResultService({
      data: { architect_email: null },
      error: null,
    });

    const result = await service.getMotivatorResult('token', 'record-1');

    expect(result).toEqual({ found: false });
    expect(serviceRoleFrom).not.toHaveBeenCalled();
  });

  it('returns found:false when architect_email is set but no submission matches', async () => {
    const { service } = makeGetMotivatorResultService(
      { data: { architect_email: 'ana@example.com' }, error: null },
      { data: null, error: null },
    );

    const result = await service.getMotivatorResult('token', 'record-1');

    expect(result).toEqual({ found: false });
  });

  it('returns found:true with the shaped result when a submission matches', async () => {
    const { service } = makeGetMotivatorResultService(
      { data: { architect_email: 'ana@example.com' }, error: null },
      {
        data: {
          name: 'Ana Pérez',
          email: 'ana@example.com',
          macrodomain: 'Business Line',
          submitted_at: '2026-11-18T00:00:00.000Z',
          priorities: [{ motivator: 'Curiosidad', priorityOrder: 1 }],
          impacts: [{ motivator: 'Curiosidad', impact: 2 }],
        },
        error: null,
      },
    );

    const result = await service.getMotivatorResult('token', 'record-1');

    expect(result).toEqual({
      found: true,
      result: {
        name: 'Ana Pérez',
        email: 'ana@example.com',
        macrodomain: 'Business Line',
        submittedAt: '2026-11-18T00:00:00.000Z',
        priorities: [{ motivator: 'Curiosidad', priorityOrder: 1 }],
        impacts: [{ motivator: 'Curiosidad', impact: 2 }],
      },
    });
  });

  it('throws NotFoundException when the record is not found (RLS hides non-owned records)', async () => {
    const { service } = makeGetMotivatorResultService({ data: null, error: null });

    await expect(service.getMotivatorResult('token', 'not-mine')).rejects.toThrow(
      'Record not found',
    );
  });

  it('matches the submission case-insensitively via .ilike(), not .eq()', async () => {
    const { service, serviceRoleFrom } = makeGetMotivatorResultService(
      { data: { architect_email: '  Ana@Example.com  ' }, error: null },
      { data: null, error: null },
    );

    await service.getMotivatorResult('token', 'record-1');

    const queryBuilder = serviceRoleFrom.mock.results[0].value;
    expect(queryBuilder.ilike).toHaveBeenCalledWith('email', 'Ana@Example.com');
  });
});
