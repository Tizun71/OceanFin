import { Global, Module } from '@nestjs/common';
import { PostgresService } from './infrastructure/postgres.service';

/**
 * Database access via node-postgres (replaces Supabase SDK).
 * Global so any feature module can inject PostgresService.
 */
@Global()
@Module({
  providers: [PostgresService],
  exports: [PostgresService],
})
export class DatabaseModule {}
