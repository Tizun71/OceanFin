import { AGENT, ASSET_ID, ASSET_SYMBOL, STEP_TYPE } from '../helpers';
import { getAssetPrice } from '../helpers/hydration/get-asset-price';
import { getMaxBorrow } from '../helpers/hydration/get-max-borrow';
import { SLIPPAGE_TOLERANCE } from './constant';
import { SimulateResult, Step } from './type';

async function simulateStrategy(
  assetInId: string,
  tokenAmount: number,
  iterations: number,
) {
  const steps: Step[] = [];
  let iterationAmount = tokenAmount;
  let currentStep = 1;
  const totalSupply = 0;
  const totalBorrow = 0;
  const dotToGdotPrice = await getAssetPrice(ASSET_ID.DOT, ASSET_ID.GDOT);

  // ENABLE BORROWING
  steps.push({
    step: currentStep++,
    type: STEP_TYPE.ENABLE_BORROWING,
    agent: AGENT.HYDRATION,
  });

  // ENABLE EMODE
  steps.push({
    step: currentStep++,
    type: STEP_TYPE.ENABLE_E_MODE,
    agent: AGENT.HYDRATION,
  });

  // LOOPING
  for (let i = 0; i < iterations; i++) {
    const gDotSwapOut =
      Number((iterationAmount * dotToGdotPrice).toFixed(3)) *
      (1 - SLIPPAGE_TOLERANCE);

    // JOIN STRATEGY
    steps.push({
      step: currentStep++,
      type: STEP_TYPE.JOIN_STRATEGY,
      agent: AGENT.HYDRATION,
      tokenIn: {
        assetId: ASSET_ID.DOT,
        symbol: ASSET_SYMBOL.DOT,
        amount: iterationAmount,
      },
      tokenOut: {
        assetId: ASSET_ID.GDOT,
        symbol: ASSET_SYMBOL.GDOT,
        amount: gDotSwapOut,
      },
    });

    const borrowMaxAmount = await getMaxBorrow(ASSET_ID.DOT, iterationAmount);

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

  return result;
}

export { simulateStrategy };
