import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private client: SupabaseClient;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const url = this.configService.get<string>('SUPABASE_URL');
    const key = this.configService.get<string>('SUPABASE_KEY');

    if (!url || !key) {
      throw new Error('SUPABASE_URL or SUPABASE_KEY is not defined in environment');
    }

    this.client = createClient(url, key);
  }

  getClient(): SupabaseClient {
    if (!this.client) {
      throw new Error('Supabase client is not initialized');
    }
    return this.client;
  }
}
