import { Module } from '@nestjs/common';
import { AiStrategyBuilderController } from './interfaces/ai-strategy-builder.controller';
import { AiStrategyBuilderService } from './application/ai-strategy-builder.service';
import { StrategyParserService } from './application/strategy-parser.service';
import { StrategyValidatorService } from './application/strategy-validator.service';
import { GeminiAiService } from './application/gemini-ai.service';
import { StrategyConstraintsService } from './application/strategy-constraints.service';
import { StrategyTemplatesService } from './application/strategy-templates.service';
import { DefiModulesModule } from '../defi_modules/defi_modules.module';
import { DefiTokenModule } from '../defi_token/defi_token.module';
import { StrategiesModule } from '../strategies/stategies.module';

@Module({
  imports: [DefiModulesModule, DefiTokenModule, StrategiesModule],
  controllers: [AiStrategyBuilderController],
  providers: [
    AiStrategyBuilderService,
    StrategyParserService,
    StrategyValidatorService,
    GeminiAiService,
    StrategyConstraintsService,
    StrategyTemplatesService,
  ],
  exports: [AiStrategyBuilderService, GeminiAiService, StrategyConstraintsService, StrategyTemplatesService],
})
export class AiStrategyBuilderModule {}
