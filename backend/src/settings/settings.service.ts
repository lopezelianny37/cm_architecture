import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@/database/database.service';

const DEFAULT_TARGET_SCOPE = 5;

@Injectable()
export class SettingsService {
  constructor(private readonly db: DatabaseService) {}

  async getSettings(accessToken: string, userId: string) {
    const client = this.db.getUserClient(accessToken);

    const { data, error } = await client
      .from('gemba_settings')
      .select('target_scope')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return {
      targetScope: data?.target_scope ?? DEFAULT_TARGET_SCOPE,
    };
  }

  async upsertTargetScope(
    accessToken: string,
    userId: string,
    targetScope: number,
  ) {
    const client = this.db.getUserClient(accessToken);

    const { data, error } = await client
      .from('gemba_settings')
      .upsert(
        { user_id: userId, target_scope: targetScope },
        { onConflict: 'user_id' },
      )
      .select('target_scope')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return { targetScope: data.target_scope };
  }
}
