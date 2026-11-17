import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@/database/database.service';
import { MOT } from '@/common/constants/gemba.constants';
import { MotivatorItemDto } from './dto/motivator-item.dto';

@Injectable()
export class MotivatorsService {
  constructor(private readonly db: DatabaseService) {}

  async seedForRecord(accessToken: string, recordId: string): Promise<void> {
    const client = this.db.getUserClient(accessToken);

    const rows = MOT.map((m, index) => ({
      record_id: recordId,
      name: m.name,
      description: m.description,
      order: index,
      impact: 0,
    }));

    const { error } = await client.from('gemba_moving_motivators').insert(rows);

    if (error) {
      throw new Error(error.message);
    }
  }

  async findByRecord(accessToken: string, recordId: string) {
    const client = this.db.getUserClient(accessToken);

    const { data, error } = await client
      .from('gemba_moving_motivators')
      .select('name, description, order, impact')
      .eq('record_id', recordId)
      .order('order', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return data ?? [];
  }

  async reorder(accessToken: string, recordId: string, items: MotivatorItemDto[]) {
    const client = this.db.getUserClient(accessToken);

    const rows = items.map((item) => ({
      record_id: recordId,
      name: item.name,
      order: item.order,
      impact: item.impact,
    }));

    const { error } = await client
      .from('gemba_moving_motivators')
      .upsert(rows, { onConflict: 'record_id,name' });

    if (error) {
      throw new Error(error.message);
    }

    return this.findByRecord(accessToken, recordId);
  }
}
