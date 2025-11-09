import { Injectable } from '@nestjs/common'
import { STRATEGY_LIST } from './strategy-list'
import { HydrationPoolService } from './hydration-pool.service'

@Injectable()
export class RewardsService {
  constructor(private readonly pool: HydrationPoolService) {}

  async calculateAPY(strategistName: string) {
    if (strategistName === STRATEGY_LIST.gDOT_LOOPING) return this.calGdotAPY()
    if (strategistName === STRATEGY_LIST.vDOT_LOOPING) return this.calVDotAPY()
    throw new Error('Strategy not found')
  }

  private async fetchVDOTStakeApy(): Promise<number> {
    try {
      const res = await fetch('https://dapi.bifrost.io/api/site')
      const data = await res.json()
      const v = data?.vDOT?.apy || data?.apy?.vDOT || 0
      return Number(v) / 100
    } catch {
      return 0
    }
  }

  private sumPow(start: number, n: number, ltv: number): number {
    let total = 0
    for (let i = start; i <= n; i++) total += Math.pow(ltv, i)
    return total
  }

  private async calGdotAPY() {
    const RAY = 1e27
    const dot = await this.pool.getPoolDataBySymbol('DOT') as any
    const vdot = await this.pool.getPoolDataBySymbol('vDOT') as any
    const gdotPool = await this.pool.getPoolById('690') as any
    const liquidityRate = Number(vdot?.liquidityRate ?? 0) / RAY + Number(dot?.liquidityRate ?? 0) / RAY
    const borrowRate = Number(dot?.variableBorrowRate ?? 0) / RAY
    const ltv = 0.9
    const loops = 3
    const vdotStakeApy = await this.fetchVDOTStakeApy()
    const feeLP = gdotPool?.fee && gdotPool.fee[1] ? Number(gdotPool.fee[0]) / Number(gdotPool.fee[1]) : 0
    const supplyExposure = this.sumPow(0, loops, ltv)
    const borrowExposure = this.sumPow(1, loops, ltv)
    const apy = ((liquidityRate + feeLP + vdotStakeApy) * supplyExposure - borrowRate * borrowExposure) * 100
    return { apy }
  }

  private async calVDotAPY() {
    const RAY = 1e27
    const dot = await this.pool.getPoolDataBySymbol('DOT') as any
    const vdot = await this.pool.getPoolDataBySymbol('vDOT') as any
    const liquidityRate = Number(vdot?.liquidityRate ?? 0) / RAY
    const borrowRate = Number(dot?.variableBorrowRate ?? 0) / RAY
    const ltv = 0.9
    const loops = 3
    const vdotStakeApy = await this.fetchVDOTStakeApy()
    const supplyExposure = this.sumPow(0, loops, ltv)
    const borrowExposure = this.sumPow(1, loops, ltv)
    const apy = ((liquidityRate + vdotStakeApy) * supplyExposure - borrowRate * borrowExposure) * 100
    return { apy }
  }
}
