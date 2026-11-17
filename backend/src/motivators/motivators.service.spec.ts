import { MotivatorsService } from './motivators.service';
import { DatabaseService } from '@/database/database.service';
import { MOT } from '@/common/constants/gemba.constants';

describe('MotivatorsService', () => {
  function makeService() {
    const insertMock = jest.fn().mockResolvedValue({ error: null });
    const upsertMock = jest.fn().mockResolvedValue({ error: null });
    const orderMock = jest.fn().mockResolvedValue({ data: [], error: null });
    const eqMock = jest.fn().mockReturnValue({ order: orderMock });
    const selectMock = jest.fn().mockReturnValue({ eq: eqMock });

    const client = {
      from: jest.fn().mockReturnValue({
        insert: insertMock,
        upsert: upsertMock,
        select: selectMock,
      }),
    };
    const db = {
      getUserClient: jest.fn().mockReturnValue(client),
    } as unknown as DatabaseService;

    const service = new MotivatorsService(db);
    return { service, insertMock, upsertMock, client };
  }

  it('seeds 10 motivators with order 0-9 and impact 0', async () => {
    const { service, insertMock } = makeService();
    await service.seedForRecord('token', 'record-1');

    expect(insertMock).toHaveBeenCalledTimes(1);
    const rows = insertMock.mock.calls[0][0];
    expect(rows).toHaveLength(MOT.length);
    expect(rows[0]).toMatchObject({ record_id: 'record-1', order: 0, impact: 0 });
    expect(rows[9]).toMatchObject({ order: 9 });
  });

  it('reorder updates the order field for all items passed', async () => {
    const { service, upsertMock } = makeService();
    const items = [
      { name: MOT[0].name, order: 1, impact: 2 },
      { name: MOT[1].name, order: 0, impact: -1 },
    ];

    await service.reorder('token', 'record-1', items);

    expect(upsertMock).toHaveBeenCalledWith(
      [
        { record_id: 'record-1', name: MOT[0].name, order: 1, impact: 2 },
        { record_id: 'record-1', name: MOT[1].name, order: 0, impact: -1 },
      ],
      { onConflict: 'record_id,name' },
    );
  });
});
