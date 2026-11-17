import { DashboardService } from './dashboard.service';
import { DatabaseService } from '@/database/database.service';
import { BEH, MOT } from '@/common/constants/gemba.constants';

function buildQueryMock(result: { data: any[]; error: any }) {
  const query: any = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
  };
  query.then = (resolve: any) => resolve(result);
  return query;
}

function makeService(records: any[]) {
  const fromMock = jest.fn().mockReturnValue(
    buildQueryMock({ data: records, error: null }),
  );
  const client = { from: fromMock };
  const db = {
    getUserClient: jest.fn().mockReturnValue(client),
  } as unknown as DatabaseService;
  const service = new DashboardService(db);
  return { service, fromMock };
}

describe('DashboardService.getMetrics', () => {
  it('returns zeros and null csatAverage when no records', async () => {
    const { service } = makeService([]);
    const result = await service.getMetrics('token');

    expect(result.totalArchitects).toBe(0);
    expect(result.completeRecords).toBe(0);
    expect(result.totalGaps).toBe(0);
    expect(result.csatAverage).toBeNull();
  });

  it('excludes null csat_score from the average', async () => {
    const { service } = makeService([
      { behaviors: [], gaps: [], flow_steps: [], csat_score: null },
      { behaviors: [], gaps: [], flow_steps: [], csat_score: 4 },
      { behaviors: [], gaps: [], flow_steps: [], csat_score: 2 },
    ]);
    const result = await service.getMetrics('token');
    expect(result.csatAverage).toBe(3);
  });

  it('counts gaps by type without breaking on an unrecognized type', async () => {
    const { service } = makeService([
      {
        behaviors: [],
        flow_steps: [],
        gaps: [
          { text: 'g1', type: 'Conocimiento' },
          { text: 'g2', type: 'TipoInventado' },
          { text: '   ', type: 'Conocimiento' },
        ],
      },
    ]);
    const result = await service.getMetrics('token');

    expect(result.totalGaps).toBe(2);
    expect(result.gapsByType['Conocimiento']).toBe(1);
    expect(result.gapsByType['TipoInventado']).toBe(1);
  });

  it('counts complete records using isRecordComplete semantics', async () => {
    const { service } = makeService([
      {
        behaviors: [{ state: 'si' }],
        gaps: [{ text: 'brecha' }],
        flow_steps: [{ objective: 'x' }],
      },
      {
        behaviors: [{ state: 'na' }],
        gaps: [],
        flow_steps: [],
      },
    ]);
    const result = await service.getMetrics('token');
    expect(result.completeRecords).toBe(1);
    expect(result.totalArchitects).toBe(2);
  });

  it('applies macrodomain filter via query.eq', async () => {
    const { service, fromMock } = makeService([]);
    await service.getMetrics('token', 'Data');
    const queryInstance = fromMock.mock.results[0].value;
    expect(queryInstance.eq).toHaveBeenCalledWith('macrodomain', 'Data');
  });
});

describe('DashboardService.getRadars', () => {
  it('returns arrays of the correct length with zeros when no records', async () => {
    const { service } = makeService([]);
    const result = await service.getRadars('token');
    expect(result.gapValues).toHaveLength(BEH.length);
    expect(result.motivatorValues).toHaveLength(MOT.length);
    expect(result.gapValues.every((v) => v === 0)).toBe(true);
    expect(result.motivatorValues.every((v) => v === 0)).toBe(true);
  });

  it('ignores na/null behavior states when averaging gapValues', async () => {
    const records = [
      { behaviors: [{ state: 'na' }] },
      { behaviors: [{ state: 'si' }] },
      { behaviors: [{ state: 'no' }] },
    ];
    const { service } = makeService(records);
    const result = await service.getRadars('token');
    // only 'si' (0) and 'no' (1) count -> avg 0.5, 'na' ignored
    expect(result.gapValues[0]).toBe(0.5);
  });

  it('ignores records missing a given motivator by name', async () => {
    const records = [
      { behaviors: [], gemba_moving_motivators: [{ name: MOT[0].name, order: 9 }] },
      { behaviors: [], gemba_moving_motivators: [] },
    ];
    const { service } = makeService(records);
    const result = await service.getRadars('token');
    // only one record has the motivator: (9+1)/10 = 1
    expect(result.motivatorValues[0]).toBe(1);
  });
});
