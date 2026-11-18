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
  initiativeStatus: 'initiative_status',
  businessReferent: 'business_referent',
  architectEmail: 'architect_email',
  prepValue: 'prep_value',
  prepBarrier: 'prep_barrier',
  behaviors: 'behaviors',
  flowSteps: 'flow_steps',
  debriefStrength: 'debrief_strength',
  debriefSelfgap: 'debrief_selfgap',
  debriefBlock: 'debrief_block',
  debriefTry: 'debrief_try',
  flowQa: 'flow_qa',
  gaps: 'gaps',
  conditions: 'conditions',
  csatScore: 'csat_score',
  csatComment: 'csat_comment',
};

const DEFAULT_BEHAVIORS = () =>
  Array.from({ length: 7 }, () => ({ state: 'na', fact: '', artifact: '' }));

const DEFAULT_FLOW_STEPS = () => [
  { step: 'Recibe / identifica la necesidad', objective: '', with: '', out: '', waste: '', observations: '' },
  { step: 'Comprende / analiza', objective: '', with: '', out: '', waste: '', observations: '' },
  { step: 'Explora / recomienda', objective: '', with: '', out: '', waste: '', observations: '' },
];

const DEFAULT_FLOW_QA = () => ['', '', '', ''];

const DEFAULT_CONDITIONS = () =>
  Array.from({ length: 7 }, () => ({ status: '', evidence: '' }));

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

  /**
   * Architect-name uniqueness is enforced here, not by a DB constraint
   * (dropped — see supabase/migrations/20261119_import_always_appends.sql,
   * which needs duplicate names allowed for imported records). Manual
   * creation/renaming should still catch an accidental duplicate.
   *
   * Uses .limit(1) + array length rather than .maybeSingle(): an import can
   * now legitimately leave 2+ records sharing a name, and .maybeSingle()
   * errors (not just returns null) when a query matches more than one row.
   */
  private async assertArchitectNameAvailable(
    client: ReturnType<DatabaseService['getUserClient']>,
    architectName: string,
    excludeId?: string,
  ) {
    let query = client
      .from('gemba_records')
      .select('id')
      .eq('architect_name', architectName)
      .limit(1);
    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    if (data && data.length > 0) throw new ConflictException('Architect already exists');
  }

  async create(accessToken: string, userId: string, dto: CreateRecordDto) {
    const client = this.db.getUserClient(accessToken);

    await this.assertArchitectNameAvailable(client, dto.architectName);

    const { data, error } = await client
      .from('gemba_records')
      .insert({
        user_id: userId,
        architect_name: dto.architectName,
        macrodomain: dto.macrodomain ?? null,
        initiative_name: dto.initiativeName ?? null,
        business_referent: dto.businessReferent ?? null,
        behaviors: DEFAULT_BEHAVIORS(),
        flow_steps: DEFAULT_FLOW_STEPS(),
        flow_qa: DEFAULT_FLOW_QA(),
        gaps: [],
        conditions: DEFAULT_CONDITIONS(),
      })
      .select()
      .single();

    if (error) {
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

  /**
   * See SPEC_MOVING_MOTIVATORS_ADDENDUM.md §4. Looks up this record's
   * architect_email via the USER-scoped client (RLS enforces owner-only
   * access — a non-owner's record simply won't be found, 404), then joins
   * moving_motivator_submissions by email via the SERVICE-ROLE client,
   * since authenticated users have zero RLS access to that table.
   */
  async getMotivatorResult(accessToken: string, id: string) {
    const userClient = this.db.getUserClient(accessToken);

    const { data: record, error } = await userClient
      .from('gemba_records')
      .select('architect_email')
      .eq('id', id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!record) throw new NotFoundException('Record not found');

    if (!record.architect_email) {
      return { found: false };
    }

    const serviceClient = this.db.getServiceRoleClient();
    const { data: submission, error: subError } = await serviceClient
      .from('moving_motivator_submissions')
      .select('name, email, macrodomain, submitted_at, priorities, impacts')
      .ilike('email', record.architect_email.trim())
      .order('submitted_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (subError) throw new Error(subError.message);
    if (!submission) return { found: false };

    return {
      found: true,
      result: {
        name: submission.name,
        email: submission.email,
        macrodomain: submission.macrodomain,
        submittedAt: submission.submitted_at,
        priorities: submission.priorities,
        impacts: submission.impacts,
      },
    };
  }

  async update(accessToken: string, id: string, dto: UpdateRecordDto) {
    const client = this.db.getUserClient(accessToken);

    if (dto.architectName !== undefined) {
      await this.assertArchitectNameAvailable(client, dto.architectName, id);
    }

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
      throw new Error(error.message);
    }

    if (!data) {
      throw new NotFoundException('Record not found');
    }

    return { ...data, isComplete: isRecordComplete(data) };
  }
}
