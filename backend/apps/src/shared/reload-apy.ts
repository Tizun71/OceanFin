import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cron from 'node-cron';
import { calculateAPY } from 'src/strategies/infrastructure/rewards/get-apy';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class ReloadApyJob implements OnModuleInit {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration is missing from env');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async onModuleInit() {
    await this.reloadAllAPY();
    cron.schedule('*/30 * * * * *', async () => {
    console.log('Reload apy every 30s');
   await this.reloadAllAPY();
});

  }

  async reloadAllAPY() {
  const { data: strategies, error } = await this.supabase
    .from('strategies')
    .select('id, strategist_name, assets');

  if (error) {
    console.error('Err', error.message);
    return;
  }

  if (!strategies || strategies.length === 0) {
    console.log('No strategies found to update APY.');
    return;
  }

  await Promise.all(
    strategies.map(async (strategy) => {
      try {
        console.log(`Load APY for ID: ${strategy.id}`);

        const result = await calculateAPY();

        const { error: updateError } = await this.supabase
          .from('strategies')
          .update({
            apy: result.apy,
          })
          .eq('id', strategy.id);

        if (updateError) throw updateError;

        console.log(
          `Update apy for ${strategy.strategist_name} (ID: ${strategy.id}) = ${result.apy}`
        );
      } catch (err: any) {
        console.error(`Error update APY for ID ${strategy.id}:`, err.message);
      }
    })
  );
}

}
