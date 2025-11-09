import { AGENT, ASSET_ID, ASSET_SYMBOL, STEP_TYPE } from '../helpers';
import { HydrationStrategyService } from '../../application/hydration-strategy.service';
import { SLIPPAGE_TOLERANCE } from './constant';
import { SimulateResult, Step } from './type';

async function simulateVDOTStrategy(
  assetInId: string,
  tokenAmount: number,
  iterations: number,
  hydrationService: HydrationStrategyService,
) {
  const steps: Step[] = [];
  let iterationAmount = tokenAmount;
  let currentStep = 1;
  const totalSupply = 0;
  const totalBorrow = 0;
  const dotToVdotPrice = await hydrationService.getAssetPrice(ASSET_ID.DOT, ASSET_ID.VDOT);

  // ENABLE EMODE
  steps.push({
    step: currentStep++,
    type: STEP_TYPE.ENABLE_E_MODE,
    agent: AGENT.HYDRATION,
  });

  // LOOPING
  for (let i = 0; i < iterations; i++) {
    // SWAP DOT to vDOT
    steps.push({
      step: currentStep++,
      type: STEP_TYPE.SWAP,
      agent: AGENT.HYDRATION,
      tokenIn: {
        assetId: ASSET_ID.DOT,
        symbol: ASSET_SYMBOL.DOT,
        amount: iterationAmount,
      },
      tokenOut: {
        assetId: ASSET_ID.VDOT,
        symbol: ASSET_SYMBOL.VDOT,
        amount: Number((iterationAmount * dotToVdotPrice).toFixed(3)),
      }
    });

    const vDotSwapOut =
      Number((iterationAmount * dotToVdotPrice).toFixed(3)) *
      (1 - SLIPPAGE_TOLERANCE);

    // SUPPLY
    steps.push({
      step: currentStep++,
      type: STEP_TYPE.SUPPLY,
      agent: AGENT.HYDRATION,
      tokenIn: {
        assetId: ASSET_ID.VDOT,
        symbol: ASSET_SYMBOL.VDOT,
        amount: iterationAmount,
      },
    });

  const borrowMaxAmount = await hydrationService.getMaxBorrow(ASSET_ID.DOT, iterationAmount);

    // BORROW
    steps.push({
      step: currentStep++,
      type: STEP_TYPE.BORROW,
      agent: AGENT.HYDRATION,
      tokenOut: {
        assetId: ASSET_ID.DOT,
        symbol: ASSET_SYMBOL.DOT,
        amount: borrowMaxAmount,
      },
    });

    iterationAmount = borrowMaxAmount;
  }

  const result: SimulateResult = {
    initialCapital: {
      assetId: ASSET_ID.DOT,
      symbol: ASSET_SYMBOL.DOT,
      amount: tokenAmount,
    },
    loops: iterations,
    fee: 0,
    totalSupply,
    totalBorrow,
    steps,
  };

  console.log('Simulation Result:', result);

  return result;
}

export { simulateVDOTStrategy };