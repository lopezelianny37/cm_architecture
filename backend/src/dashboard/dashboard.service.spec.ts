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
    expect(result.observationValues).toHaveLength(BEH.length);
    expect(result.motivatorValues).toHaveLength(MOT.length);
    expect(result.observationValues.every((v: number) => v === 0)).toBe(true);
    expect(result.motivatorValues.every((v) => v === 0)).toBe(true);
  });

  it('averages the ordinal level (na=0, no=1, par=2, si=3) per axis, normalized by /3', async () => {
    const records = [
      { behaviors: [{ state: 'na' }] },
      { behaviors: [{ state: 'si' }] },
      { behaviors: [{ state: 'no' }] },
    ];
    const { service } = makeService(records);
    const result = await service.getRadars('token');
    // na=0, si=3, no=1 -> avg level (0+3+1)/3 = 4/3 -> radius (4/3)/3 = 4/9
    expect(result.observationValues[0]).toBeCloseTo(4 / 9);
  });

  it('treats a record with no state at all for an axis the same as na (level 0)', async () => {
    const records = [{ behaviors: [{ state: 'si' }] }, { behaviors: [] }];
    const { service } = makeService(records);
    const result = await service.getRadars('token');
    // si=3, missing=na=0 -> avg (3+0)/2 = 1.5 -> radius 1.5/3 = 0.5
    expect(result.observationValues[0]).toBeCloseTo(0.5);
  });

  it('places a fully-N/A axis at the center (radius 0)', async () => {
    const records = [{ behaviors: [{ state: 'na' }] }, { behaviors: [{ state: 'na' }] }];
    const { service } = makeService(records);
    const result = await service.getRadars('token');
    expect(result.observationValues[0]).toBe(0);
  });

  it('places a fully-Observado axis at the edge (radius 1)', async () => {
    const records = [{ behaviors: [{ state: 'si' }] }, { behaviors: [{ state: 'si' }] }];
    const { service } = makeService(records);
    const result = await service.getRadars('token');
    expect(result.observationValues[0]).toBe(1);
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

describe('DashboardService.getMotivatorsSummary', () => {
  function makeSummaryService(submissions: any[]) {
    const eqMock = jest.fn().mockReturnThis();
    const query: any = {
      select: jest.fn().mockReturnThis(),
      eq: eqMock,
    };
    query.then = (resolve: any) => resolve({ data: submissions, error: null });

    const fromMock = jest.fn().mockReturnValue(query);
    const client = { from: fromMock };
    const db = {
      getServiceRoleClient: jest.fn().mockReturnValue(client),
    } as unknown as DatabaseService;
    const service = new DashboardService(db);
    return { service, fromMock, eqMock };
  }

  it('returns sampleSize:0 and empty-safe (non-NaN) averages when there are no submissions', async () => {
    const { service } = makeSummaryService([]);
    const result = await service.getMotivatorsSummary();

    expect(result.sampleSize).toBe(0);
    expect(result.radar).toHaveLength(MOT.length);
    expect(result.bars).toHaveLength(MOT.length);
    expect(result.radar.every((r) => r.avgImpact === 0)).toBe(true);
    expect(result.bars.every((b) => Number.isFinite(b.avgPriorityOrder))).toBe(true);
  });

  it('computes avgImpact correctly across N submissions', async () => {
    const submissions = [
      { priorities: [], impacts: [{ motivator: MOT[0].name, impact: 4 }] },
      { priorities: [], impacts: [{ motivator: MOT[0].name, impact: -2 }] },
      { priorities: [], impacts: [{ motivator: MOT[0].name, impact: 0 }] },
    ];
    const { service } = makeSummaryService(submissions);
    const result = await service.getMotivatorsSummary();

    const entry = result.radar.find((r) => r.motivator === MOT[0].name)!;
    expect(entry.avgImpact).toBeCloseTo((4 - 2 + 0) / 3);
  });

  it('computes avgPriorityOrder correctly and sorts bars ascending (most important first)', async () => {
    // Give every motivator a value in both submissions so none fall back to
    // the empty-safe default of 0 (which would otherwise sort first and
    // confound the assertion below).
    function fullPriorities(mot0Value: number, mot1Value: number) {
      return MOT.map((m, i) => ({
        motivator: m.name,
        priorityOrder: m.name === MOT[0].name ? mot0Value : m.name === MOT[1].name ? mot1Value : i + 2,
      }));
    }

    const submissions = [
      { priorities: fullPriorities(1, 10), impacts: [] },
      { priorities: fullPriorities(3, 8), impacts: [] },
    ];
    const { service } = makeSummaryService(submissions);
    const result = await service.getMotivatorsSummary();

    const mot0 = result.bars.find((b) => b.motivator === MOT[0].name)!;
    const mot1 = result.bars.find((b) => b.motivator === MOT[1].name)!;
    expect(mot0.avgPriorityOrder).toBeCloseTo((1 + 3) / 2); // 2
    expect(mot1.avgPriorityOrder).toBeCloseTo((10 + 8) / 2); // 9

    const sorted = [...result.bars].sort((a, b) => a.avgPriorityOrder - b.avgPriorityOrder);
    expect(result.bars).toEqual(sorted);
    expect(result.bars[0].motivator).toBe(MOT[0].name); // lowest avg = most important = first
  });

  it('filters by macrodomain when provided', async () => {
    const { service, eqMock } = makeSummaryService([]);
    await service.getMotivatorsSummary('Business Line');
    expect(eqMock).toHaveBeenCalledWith('macrodomain', 'Business Line');
  });

  it('does not filter when macrodomain is omitted', async () => {
    const { service, eqMock } = makeSummaryService([]);
    await service.getMotivatorsSummary();
    expect(eqMock).not.toHaveBeenCalled();
  });
});

describe('DashboardService.getScopeProgress', () => {
  function makeScopeProgressService(records: any[], submittedEmails: string[] = []) {
    const userFromMock = jest.fn().mockReturnValue(
      buildQueryMock({ data: records, error: null }),
    );
    const userClient = { from: userFromMock };

    const submissionsQuery: any = { select: jest.fn().mockReturnThis() };
    submissionsQuery.then = (resolve: any) =>
      resolve({ data: submittedEmails.map((email) => ({ email })), error: null });
    const serviceFromMock = jest.fn().mockReturnValue(submissionsQuery);
    const serviceClient = { from: serviceFromMock };

    const db = {
      getUserClient: jest.fn().mockReturnValue(userClient),
      getServiceRoleClient: jest.fn().mockReturnValue(serviceClient),
    } as unknown as DatabaseService;

    return { service: new DashboardService(db) };
  }

  function record(overrides: Record<string, unknown> = {}) {
    return {
      prep_value: '',
      prep_barrier: '',
      architect_email: null,
      behaviors: [],
      flow_steps: [],
      gaps: [],
      ...overrides,
    };
  }

  it('a record with none of the 3 phases complete contributes 0', async () => {
    const { service } = makeScopeProgressService([record()]);
    const result = await service.getScopeProgress('token');
    expect(result.completionSum).toBe(0);
  });

  it('a record with exactly 1 phase complete (Gemba baseline) contributes 1/3', async () => {
    const r = record({
      behaviors: [{ state: 'si' }],
      flow_steps: [{ objective: 'x' }],
      // no gaps -> Diagnóstico not complete; no prep/email -> Preparar not complete
    });
    const { service } = makeScopeProgressService([r]);
    const result = await service.getScopeProgress('token');
    expect(result.completionSum).toBeCloseTo(1 / 3);
  });

  it('a record with exactly 2 phases complete (Gemba baseline + Diagnóstico) contributes 2/3', async () => {
    const r = record({
      behaviors: [{ state: 'si' }],
      flow_steps: [{ objective: 'x' }],
      gaps: [{ text: 'brecha' }],
    });
    const { service } = makeScopeProgressService([r]);
    const result = await service.getScopeProgress('token');
    expect(result.completionSum).toBeCloseTo(2 / 3);
  });

  it('a record with all 3 phases complete contributes 1', async () => {
    const r = record({
      prep_value: 'Vale la pena si...',
      prep_barrier: 'Me podría dificultar...',
      architect_email: 'arch@test.com',
      behaviors: [{ state: 'si' }],
      flow_steps: [{ objective: 'x' }],
      gaps: [{ text: 'brecha' }],
    });
    const { service } = makeScopeProgressService([r], ['arch@test.com']);
    const result = await service.getScopeProgress('token');
    expect(result.completionSum).toBe(1);
  });

  it('Preparar is NOT complete if prep text is filled but no motivator result was submitted yet', async () => {
    const r = record({
      prep_value: 'Vale la pena si...',
      prep_barrier: 'Me podría dificultar...',
      architect_email: 'nobody@test.com',
    });
    const { service } = makeScopeProgressService([r], ['someone-else@test.com']);
    const result = await service.getScopeProgress('token');
    expect(result.completionSum).toBe(0);
  });

  it('matches the motivator-result email case-insensitively and trims whitespace', async () => {
    const r = record({
      prep_value: 'Vale la pena si...',
      prep_barrier: 'Me podría dificultar...',
      architect_email: '  Arch@Test.com  ',
      behaviors: [{ state: 'si' }],
      flow_steps: [{ objective: 'x' }],
      gaps: [{ text: 'brecha' }],
    });
    const { service } = makeScopeProgressService([r], ['arch@test.com']);
    const result = await service.getScopeProgress('token');
    expect(result.completionSum).toBe(1);
  });

  it('sums the fractions of several records at different completion levels', async () => {
    const zero = record();
    const oneThird = record({ behaviors: [{ state: 'si' }], flow_steps: [{ objective: 'x' }] });
    const twoThirds = record({
      behaviors: [{ state: 'si' }],
      flow_steps: [{ objective: 'x' }],
      gaps: [{ text: 'brecha' }],
    });
    const full = record({
      prep_value: 'Vale la pena si...',
      prep_barrier: 'Me podría dificultar...',
      architect_email: 'arch@test.com',
      behaviors: [{ state: 'si' }],
      flow_steps: [{ objective: 'x' }],
      gaps: [{ text: 'brecha' }],
    });

    const { service } = makeScopeProgressService(
      [zero, oneThird, twoThirds, full],
      ['arch@test.com'],
    );
    const result = await service.getScopeProgress('token');
    expect(result.completionSum).toBeCloseTo(0 + 1 / 3 + 2 / 3 + 1);
  });

  it('returns 0 when the user has no records', async () => {
    const { service } = makeScopeProgressService([]);
    const result = await service.getScopeProgress('token');
    expect(result.completionSum).toBe(0);
  });
});
