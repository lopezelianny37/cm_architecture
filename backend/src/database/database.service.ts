import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private supabase: SupabaseClient;

  async onModuleInit() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.warn('⚠️  Supabase credentials not configured. Using development mode.');
    }

    this.supabase = createClient(
      supabaseUrl || 'http://localhost:54321',
      supabaseKey || 'dev-key',
    );
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  getUserClient(accessToken: string): SupabaseClient {
    const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:54321';
    const supabaseKey = process.env.SUPABASE_KEY || 'dev-key';

    return createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    });
  }

  async checkConnection(): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.rpc('ping', {});
      if (error) {
        console.log('Database ping: RPC not ready, testing auth.users query...');
        const { error: err } = await this.supabase.auth.getUser();
        return !err;
      }
      return true;
    } catch {
      return false;
    }
  }
}
