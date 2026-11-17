import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '@/database/database.service';
import { isRecordComplete } from '@/common/utils/gemba-complete.util';
import { MotivatorsService } from '@/motivators/motivators.service';
import { QueryRecordsDto } from './dto/query-records.dto';
import { CreateRecordDto } from './dto/create-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';

const UPDATE_FIELD_MAP: Record<keyof UpdateRecordDto, string> = {
  architectName: 'architect_name',
  macrodomain: 'macrodomain',
  initiativeName: 'initiative_name',
  businessReferent: 'business_referent',
  prepValue: 'prep_value',
  prepBarrier: 'prep_barrier',
};

@Injectable()
export class RecordsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly motivatorsService: MotivatorsService,
  ) {}

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

    await this.motivatorsService.seedForRecord(accessToken, data.id);

    return data;
  }

  async findOne(accessToken: string, id: string) {
    const client = this.db.getUserClient(accessToken);

    const { data, error } = await client
      .from('gemba_records')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new NotFoundException('Record not found');
    }

    return { ...data, isComplete: isRecordComplete(data) };
  }

  async update(accessToken: string, id: string, dto: UpdateRecordDto) {
    const client = this.db.getUserClient(accessToken);

    const payload: Record<string, unknown> = {};
    for (const [key, column] of Object.entries(UPDATE_FIELD_MAP)) {
      const value = dto[key as keyof UpdateRecordDto];
      if (value !== undefined) {
        payload[column] = value;
      }
    }
    payload.updated_at = new Date().toISOString();

    const { data, error } = await client
      .from('gemba_records')
      .update(payload)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      if (error.code === '23505') {
        throw new ConflictException('Architect already exists');
      }
      throw new Error(error.message);
    }

    if (!data) {
      throw new NotFoundException('Record not found');
    }

    return { ...data, isComplete: isRecordComplete(data) };
  }
}
