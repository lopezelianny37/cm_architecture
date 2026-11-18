import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { DatabaseService } from '@/database/database.service';
import { ImportPayloadDto } from './dto/import-payload.dto';
import { ImportRecordDto } from './dto/import-record.dto';

interface MotivatorRow {
  name: string;
  description: string | null;
  order: number;
  impact: number;
}

interface DbRecordRow {
  id: string;
  created_at: string;
  architect_name: string | null;
  macrodomain: string | null;
  initiative_name: string | null;
  business_referent: string | null;
  prep_value: string | null;
  prep_barrier: string | null;
  behaviors: Array<{ state?: string; fact?: string; artifact?: string }> | null;
  flow_steps: Array<{
    step?: string;
    objective?: string;
    with?: string;
    out?: string;
    waste?: string;
  }> | null;
  debrief_strength: string | null;
  debrief_selfgap: string | null;
  debrief_block: string | null;
  debrief_try: string | null;
  flow_qa: string[] | null;
  gaps: Array<{ text?: string; type?: string; evidence?: string; condition?: string }> | null;
  conditions: Array<{ status?: string; evidence?: string }> | null;
  csat_score: number | null;
  csat_comment: string | null;
  gemba_moving_motivators?: MotivatorRow[];
}

@Injectable()
export class ImportExportService {
  constructor(private readonly db: DatabaseService) {}

  /** Exported/imported JSON shape matches the original HTML prototype's
   * blankRecord() 1:1 (meta/prep/run1/diag/csat, field names included) so
   * that backups are round-trippable and potentially interoperable with
   * exports from the original prototype. */
  private toExportShape(record: DbRecordRow) {
    const motivators = [...(record.gemba_moving_motivators ?? [])].sort(
      (a, b) => a.order - b.order,
    );

    return {
      id: record.id,
      created: record.created_at,
      meta: {
        arch: record.architect_name ?? '',
        macro: record.macrodomain ?? '',
        init: record.initiative_name ?? '',
        business: record.business_referent ?? '',
      },
      prep: {
        value: record.prep_value ?? '',
        barrier: record.prep_barrier ?? '',
        mot: motivators.map((m) => ({
          name: m.name,
          desc: m.description ?? '',
          impact: m.impact,
          order: m.order,
        })),
      },
      run1: {
        beh: (record.behaviors ?? []).map((b) => ({
          s: b.state ?? 'na',
          fact: b.fact ?? '',
          artifact: b.artifact ?? '',
        })),
        flow: (record.flow_steps ?? []).map((f) => ({
          step: f.step ?? '',
          objective: f.objective ?? '',
          with: f.with ?? '',
          out: f.out ?? '',
          waste: f.waste ?? '',
        })),
      },
      diag: {
        strength: record.debrief_strength ?? '',
        selfgap: record.debrief_selfgap ?? '',
        block: record.debrief_block ?? '',
        try: record.debrief_try ?? '',
        flowq: record.flow_qa ?? ['', '', '', ''],
        gaps: (record.gaps ?? []).map((g) => ({
          text: g.text ?? '',
          type: g.type ?? '',
          evidence: g.evidence ?? '',
          condition: g.condition ?? '',
        })),
        conditions: (record.conditions ?? []).map((c) => ({
          s: c.status ?? '',
          evidence: c.evidence ?? '',
        })),
      },
      csat: {
        score: record.csat_score != null ? String(record.csat_score) : '',
        comment: record.csat_comment ?? '',
      },
    };
  }

  private fromImportShape(record: ImportRecordDto, userId: string) {
    const csatScoreRaw = record.csat?.score;
    const csatScore =
      csatScoreRaw != null && csatScoreRaw !== '' ? Number(csatScoreRaw) : null;

    return {
      user_id: userId,
      architect_name: record.meta?.arch ?? '',
      macrodomain: record.meta?.macro ?? null,
      initiative_name: record.meta?.init ?? null,
      business_referent: record.meta?.business ?? null,
      prep_value: record.prep?.value ?? null,
      prep_barrier: record.prep?.barrier ?? null,
      behaviors: (record.run1?.beh ?? []).map((b) => ({
        state: b.s ?? 'na',
        fact: b.fact ?? '',
        artifact: b.artifact ?? '',
      })),
      flow_steps: (record.run1?.flow ?? []).map((f) => ({
        step: f.step ?? '',
        objective: f.objective ?? '',
        with: f.with ?? '',
        out: f.out ?? '',
        waste: f.waste ?? '',
      })),
      debrief_strength: record.diag?.strength ?? null,
      debrief_selfgap: record.diag?.selfgap ?? null,
      debrief_block: record.diag?.block ?? null,
      debrief_try: record.diag?.try ?? null,
      flow_qa: record.diag?.flowq ?? ['', '', '', ''],
      gaps: (record.diag?.gaps ?? []).map((g) => ({
        text: g.text ?? '',
        type: g.type ?? '',
        evidence: g.evidence ?? '',
        condition: g.condition ?? '',
      })),
      conditions: (record.diag?.conditions ?? []).map((c) => ({
        status: c.s ?? '',
        evidence: c.evidence ?? '',
      })),
      csat_score:
        csatScore != null && !Number.isNaN(csatScore) ? csatScore : null,
      csat_comment: record.csat?.comment ?? null,
    };
  }

  /** Validates and transforms an arbitrary parsed-JSON payload into an
   * ImportPayloadDto. Separated from `importBackup` so it can be unit
   * tested directly without a database. */
  validatePayload(raw: unknown): ImportPayloadDto {
    if (typeof raw !== 'object' || raw === null || !Array.isArray((raw as any).records)) {
      throw new BadRequestException('El archivo no es un respaldo válido');
    }

    const instance = plainToInstance(ImportPayloadDto, raw);
    const errors = validateSync(instance, { whitelist: false });

    if (errors.length > 0) {
      throw new BadRequestException('El archivo no es un respaldo válido');
    }

    return instance;
  }

  async exportAll(accessToken: string) {
    const client = this.db.getUserClient(accessToken);

    const { data: records, error } = await client
      .from('gemba_records')
      .select('*, gemba_moving_motivators(name, description, order, impact)')
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    const { data: settings } = await client
      .from('gemba_settings')
      .select('target_scope')
      .maybeSingle();

    return {
      target: settings?.target_scope ?? 5,
      records: (records ?? []).map((r: DbRecordRow) => this.toExportShape(r)),
    };
  }

  async exportOne(accessToken: string, id: string) {
    const client = this.db.getUserClient(accessToken);

    const { data: record, error } = await client
      .from('gemba_records')
      .select('*, gemba_moving_motivators(name, description, order, impact)')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!record) {
      throw new NotFoundException('Record not found');
    }

    return this.toExportShape(record as DbRecordRow);
  }

  /**
   * Always appends: inserts every record in the file as a new row,
   * never touching the user's existing records. A record sharing an
   * architect_name with an existing one (or another record in the same
   * file) is simply created as its own duplicate — no dedup, by design
   * (see the comment on the dropped UNIQUE constraint in
   * supabase/migrations/20261119_import_always_appends.sql).
   */
  async importBackup(accessToken: string, userId: string, raw: unknown) {
    const payload = this.validatePayload(raw);
    const client = this.db.getUserClient(accessToken);

    let imported = 0;

    for (const record of payload.records) {
      const insertPayload = this.fromImportShape(record, userId);

      const { data, error } = await client
        .from('gemba_records')
        .insert(insertPayload)
        .select()
        .single();

      if (error) {
        throw new BadRequestException(
          `Error al importar "${insertPayload.architect_name || 'registro sin nombre'}": ${error.message}`,
        );
      }

      const motivators = (record.prep?.mot ?? []).map((m, index) => ({
        record_id: data.id,
        name: m.name,
        description: m.desc ?? '',
        order: m.order ?? index,
        impact: m.impact ?? 0,
      }));

      if (motivators.length > 0) {
        const { error: motError } = await client
          .from('gemba_moving_motivators')
          .insert(motivators);

        if (motError) {
          throw new Error(motError.message);
        }
      }

      imported++;
    }

    if (payload.target != null) {
      await client
        .from('gemba_settings')
        .upsert({ user_id: userId, target_scope: payload.target }, { onConflict: 'user_id' });
    }

    return { imported };
  }
}
