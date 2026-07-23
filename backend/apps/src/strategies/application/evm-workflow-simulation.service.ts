import { Injectable, BadRequestException } from '@nestjs/common';
import { Address, parseUnits, formatUnits } from 'viem';
import { AaveV3Avalanche } from '@bgd-labs/aave-address-book';
import { getAssetPricesUsd } from '../../defi_strategies/infrastructure/evm/aave-oracle';
import { getTraderJoeQuote } from '../../defi_strategies/infrastructure/evm/trader-joe-reader';
import { SimulateResult, Step, Token } from '../infrastructure/strategy-simulate/type';

/**
 * LFJ (Trader Joe) Liquidity Book v2.2 quoter — same deterministic address on
 * Avalanche and Arbitrum. Mirrors ui/config/chains/chain-registry.ts.
 */
const LB_QUOTER: Address = '0x9A550a522BBaDFB69019b0432800Ed17855A51C3';

/** Per-chain Aave market wiring. Extend as more EVM chains get workflows. */
const MARKETS: Record<number, { oracle: Address }> = {
  43114: { oracle: AaveV3Avalanche.ORACLE as Address },
};

const round = (v: number, dp = 6) => Number(v.toFixed(dp));

/**
 * Simulate an EVM workflow (defi_strategy_versions.workflow_json) by walking its
 * steps and filling in the amounts each one would move.
 *
 * The workflow is seeded without amounts on purpose: position sizing depends on
 * the user's capital. Borrow legs are sized in USD via the Aave price oracle
 * (the only way to compare a sAVAX collateral leg against a WAVAX borrow leg),
 * and swaps are quoted against Trader Joe so the output reflects real liquidity.
 *
 * These are estimates for display. Execution re-quotes and runs every call
 * through simulateContract before signing (ui/lib/evm/execute-evm-step.ts).
 */
@Injectable()
export class EvmWorkflowSimulationService {
  async simulate(workflow: any, amountInRaw: number): Promise<SimulateResult> {
    const chainId: number = workflow?.chainId;
    const rawSteps: any[] = workflow?.steps ?? [];

    // Query params arrive as strings; every downstream calculation is numeric.
    const amountIn = Number(amountInRaw);
    if (!Number.isFinite(amountIn) || amountIn <= 0) {
      throw new BadRequestException(`Invalid amountIn: ${amountInRaw}`);
    }

    if (!chainId || rawSteps.length === 0) {
      throw new BadRequestException('Workflow has no chainId or steps');
    }
    const market = MARKETS[chainId];
    if (!market) {
      throw new BadRequestException(`No Aave market configured for chain ${chainId}`);
    }

    const prices = await this.loadPrices(chainId, market.oracle, rawSteps);

    // Amount currently held per token address, seeded with the user's capital.
    // The entry token is the first step that moves one — a workflow can open
    // with ENABLE_E_MODE, which carries no token.
    const entryStep = rawSteps.find((s) => s?.tokenIn?.address);
    if (!entryStep) {
      throw new BadRequestException('Workflow has no step with an input token');
    }
    const held = new Map<string, number>();
    const entryToken = this.tokenOf(entryStep.tokenIn);
    held.set(entryToken.address, amountIn);

    let totalSupplyUsd = 0;
    let totalBorrowUsd = 0;
    let loops = 0;
    // Borrow sizes against the collateral supplied immediately before it.
    let lastSupplyUsd = 0;

    const steps: Step[] = [];

    for (const raw of rawSteps) {
      switch (raw.type) {
        case 'ENABLE_E_MODE': {
          steps.push({
            step: raw.step,
            type: raw.type,
            agent: raw.agent,
            eModeCategoryLabel: raw.eModeCategoryLabel,
          });
          break;
        }

        case 'SUPPLY': {
          const token = this.tokenOf(raw.tokenIn);
          const amount = held.get(token.address) ?? 0;
          held.set(token.address, 0); // deposited into the pool

          const usd = amount * this.priceOf(prices, token.address);
          totalSupplyUsd += usd;
          lastSupplyUsd = usd;

          steps.push({
            step: raw.step,
            type: raw.type,
            agent: raw.agent,
            protocol: raw.protocol,
            tokenIn: { ...raw.tokenIn, amount: round(amount) },
          });
          break;
        }

        case 'BORROW': {
          const out = this.tokenOf(raw.tokenOut);
          // Builder-authored workflows don't persist a collateralRatio; fall back
          // to a conservative 70% LTV (matches the Hydration borrow simulator).
          const ratio = Number(raw.collateralRatio) > 0 ? Number(raw.collateralRatio) : 0.7;
          const borrowUsd = lastSupplyUsd * ratio;
          const amount = borrowUsd / this.priceOf(prices, out.address);

          held.set(out.address, (held.get(out.address) ?? 0) + amount);
          totalBorrowUsd += borrowUsd;
          // One leverage loop per borrow leg; an unlevered supply has none.
          loops += 1;

          steps.push({
            step: raw.step,
            type: raw.type,
            agent: raw.agent,
            protocol: raw.protocol,
            tokenIn: raw.tokenIn,
            tokenOut: { ...raw.tokenOut, amount: round(amount) },
          });
          break;
        }

        case 'SWAP': {
          const tIn = this.tokenOf(raw.tokenIn);
          const tOut = this.tokenOf(raw.tokenOut);
          const amountIn_ = held.get(tIn.address) ?? 0;

          const amountOut = await this.quoteSwap(chainId, tIn, tOut, amountIn_);

          held.set(tIn.address, 0);
          held.set(tOut.address, (held.get(tOut.address) ?? 0) + amountOut);

          steps.push({
            step: raw.step,
            type: raw.type,
            agent: raw.agent,
            tokenIn: { ...raw.tokenIn, amount: round(amountIn_) },
            tokenOut: { ...raw.tokenOut, amount: round(amountOut) },
          });
          break;
        }

        default:
          throw new BadRequestException(`Unsupported workflow step type: ${raw.type}`);
      }
    }

    return {
      initialCapital: {
        assetId: entryToken.address,
        symbol: entryStep.tokenIn.symbol,
        amount: amountIn,
        address: entryToken.address,
        decimals: entryToken.decimals,
      },
      loops,
      fee: 0, // gas is quoted by the wallet at signing time, not modelled here
      totalSupply: round(totalSupplyUsd, 2),
      totalBorrow: round(totalBorrowUsd, 2),
      steps,
    };
  }

  private tokenOf(token: Token | undefined): { address: string; decimals: number } {
    if (!token?.address || token.decimals === undefined) {
      throw new BadRequestException(
        `Workflow token ${token?.symbol ?? '?'} is missing address/decimals`,
      );
    }
    return { address: token.address.toLowerCase(), decimals: token.decimals };
  }

  private priceOf(prices: Record<string, number>, address: string): number {
    const price = prices[address.toLowerCase()];
    if (!price) {
      throw new BadRequestException(`No oracle price for ${address}`);
    }
    return price;
  }

  /** Every distinct token the workflow touches, priced in one oracle call. */
  private async loadPrices(chainId: number, oracle: Address, steps: any[]) {
    const addresses = new Set<string>();
    for (const s of steps) {
      for (const t of [s.tokenIn, s.tokenOut]) {
        if (t?.address) addresses.add(t.address.toLowerCase());
      }
    }
    return getAssetPricesUsd(chainId, oracle, [...addresses] as Address[]);
  }

  private async quoteSwap(
    chainId: number,
    tIn: { address: string; decimals: number },
    tOut: { address: string; decimals: number },
    amountIn: number,
  ): Promise<number> {
    if (amountIn <= 0) return 0;

    const raw = parseUnits(amountIn.toFixed(tIn.decimals), tIn.decimals);
    const quote = await getTraderJoeQuote(
      chainId,
      LB_QUOTER,
      tIn.address as Address,
      tOut.address as Address,
      raw,
    );
    return Number(formatUnits(quote.amountOut, tOut.decimals));
  }
}
