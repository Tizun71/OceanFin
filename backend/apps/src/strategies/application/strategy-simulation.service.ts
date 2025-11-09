import { Injectable } from '@nestjs/common'
import { HydrationStrategyService } from './hydration-strategy.service'
import { simulateGDOTStrategy } from '../infrastructure/strategy-simulate/gDOT-looping-simulate'
import { simulateVDOTStrategy } from '../infrastructure/strategy-simulate/vDOT-looping-simulate'

@Injectable()
export class StrategySimulationService {
  constructor(private readonly hydration: HydrationStrategyService) {}

  simulateGdot(assetInId: string, amountIn: number, iterations: number) {
    return simulateGDOTStrategy(assetInId, amountIn, iterations, this.hydration)
  }

  simulateVdot(assetInId: string, amountIn: number, iterations: number) {
    return simulateVDOTStrategy(assetInId, amountIn, iterations, this.hydration)
  }
}
