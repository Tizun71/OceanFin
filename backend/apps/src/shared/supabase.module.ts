import { Module } from '@nestjs/common';
import { SupabaseService } from './infrastructure/supabase.service';

@Module({
  providers: [SupabaseService],
  exports: [SupabaseService],
})
export class SupabaseModule {}
