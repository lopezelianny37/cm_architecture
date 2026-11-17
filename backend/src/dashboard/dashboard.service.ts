import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@/database/database.service';
import { BEH, MOT, TYPES } from '@/common/constants/gemba.constants';
import { isRecordComplete, GapEntry, FlowStep } from '@/common/utils/gemba-complete.util';
import { DashboardMetricsResponse } from './dto/dashboard-metrics.dto';
import { DashboardRadarsResponse } from './dto/dashboard-radars.dto';

interface BehaviorRow {
  state: 'si' | 'par' | 'no' | 'na';
}

interface MotivatorRow {
  name: string;
  order: number;
}

interface MetricsRow {
  behaviors?: BehaviorRow[] | null;
  flow_steps?: FlowStep[] | null;
  gaps?: GapEntry[] | null;
  csat_score?: number | null;
}

interface RadarRow {
  behaviors?: BehaviorRow[] | null;
  gemba_moving_motivators?: MotivatorRow[] | null;
}

@Injectable()
export class DashboardService {
  constructor(private readonly db: DatabaseService) {}

  private async fetchRecords<T>(
    accessToken: string,
    macrodomain: string | undefined,
    select: string,
  ): Promise<T[]> {
    const client = this.db.getUserClient(accessToken);
    let query = client.from('gemba_records').select(select);

    if (macrodomain) {
      query = query.eq('macrodomain', macrodomain);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []) as T[];
  }

  async getMetrics(
    accessToken: string,
    macrodomain?: string,
  ): Promise<DashboardMetricsResponse> {
    const rows = await this.fetchRecords<MetricsRow>(
      accessToken,
      macrodomain,
      'behaviors, flow_steps, gaps, csat_score',
    );

    const totalArchitects = rows.length;
    const completeRecords = rows.filter((r) => isRecordComplete(r)).length;

    const allGaps = rows.flatMap((r) =>
      (r.gaps ?? []).filter((g) => (g.text ?? '').trim().length > 0),
    );
    const totalGaps = allGaps.length;

    const scores = rows
      .map((r) => r.csat_score)
      .filter((s): s is number => s != null);
    const csatAverage =
      scores.length > 0
        ? scores.reduce((a, b) => a + b, 0) / scores.length
        : null;

    const gapsByType: Record<string, number> = Object.fromEntries(
      TYPES.map((t) => [t, 0]),
    );
    allGaps.forEach((g) => {
      const type = g.type ?? 'Sin clasificar';
      gapsByType[type] = (gapsByType[type] ?? 0) + 1;
    });

    return {
      totalArchitects,
      completeRecords,
      totalGaps,
      csatAverage,
      gapsByType,
    };
  }

  async getRadars(
    accessToken: string,
    macrodomain?: string,
  ): Promise<DashboardRadarsResponse> {
    const rows = await this.fetchRecords<RadarRow>(
      accessToken,
      macrodomain,
      'behaviors, gemba_moving_motivators(name, order)',
    );

    const gapValues = BEH.map((_, i) => {
      const values = rows
        .map((r) => r.behaviors?.[i]?.state)
        .filter((s): s is 'si' | 'par' | 'no' => s != null && s !== 'na')
        .map((s) => ({ si: 0, par: 0.5, no: 1 }[s]));

      return values.length > 0
        ? values.reduce((a, b) => a + b, 0) / values.length
        : 0;
    });

    const motivatorValues = MOT.map((m) => {
      const values = rows
        .map((r) => (r.gemba_moving_motivators ?? []).find((x) => x.name === m.name))
        .filter((item): item is MotivatorRow => item != null)
        .map((item) => (item.order + 1) / MOT.length);

      return values.length > 0
        ? values.reduce((a, b) => a + b, 0) / values.length
        : 0;
    });

    return { gapValues, motivatorValues };
  }
}
