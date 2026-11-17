import { ConflictException, Injectable } from '@nestjs/common';
import { DatabaseService } from '@/database/database.service';
import { isRecordComplete } from '@/common/utils/gemba-complete.util';
import { QueryRecordsDto } from './dto/query-records.dto';
import { CreateRecordDto } from './dto/create-record.dto';

@Injectable()
export class RecordsService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(accessToken: string, filters: QueryRecordsDto) {
    const client = this.db.getUserClient(accessToken);
    const limit = filters.limit ?? 50;
    const offset = filters.offset ?? 0;

    let query = client
      .from('gemba_records')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (filters.macrodomain) {
      query = query.eq('macrodomain', filters.macrodomain);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new Error(error.message);
    }

    const rows = (data ?? []).map((record) => ({
      ...record,
      isComplete: isRecordComplete(record),
    }));

    const filteredByStatus =
      !filters.status || filters.status === 'all'
        ? rows
        : rows.filter((r) =>
            filters.status === 'complete' ? r.isComplete : !r.isComplete,
          );

    const total = filteredByStatus.length;
    const paged = filteredByStatus.slice(offset, offset + limit);

    return {
      records: paged,
      total,
      hasMore: offset + limit < total,
    };
  }

  async create(accessToken: string, userId: string, dto: CreateRecordDto) {
    const client = this.db.getUserClient(accessToken);

    const { data, error } = await client
      .from('gemba_records')
      .insert({
        user_id: userId,
        architect_name: dto.architectName,
        macrodomain: dto.macrodomain ?? null,
        initiative_name: dto.initiativeName ?? null,
        business_referent: dto.businessReferent ?? null,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new ConflictException('Architect already exists');
      }
      throw new Error(error.message);
    }

    return data;
  }
}
