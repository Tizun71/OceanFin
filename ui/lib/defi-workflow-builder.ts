/**
 * Token payload carried by a workflow step. `address`/`decimals` are the EVM
 * execution metadata (see build-evm-plan.ts); substrate tokens leave them
 * undefined and are resolved by assetId instead.
 */
const buildToken = (
  assetId: any,
  symbol: any,
  amount: any,
  address?: string,
  decimals?: number,
) => ({
  assetId,
  symbol,
  amount,
  address,
  decimals,
});

export const buildWorkflowJson = (nodes: any[]) => {
  let stepNumber = 1;

  const steps = nodes.map((node, index) => {
    const config = node.data.config;

    let tokenIn;

    if (index === 0) {
      if (config?.tokenInId) {
        tokenIn = buildToken(
          config.tokenInId,
          config.tokenInSymbol,
          config.amount,
          config.tokenInAddress,
          config.tokenInDecimals,
        );
      }
    } else {
      const prevConfig = nodes[index - 1].data.config;

      // This step's input is the previous step's output — carry that token's
      // EVM metadata forward too, or the chained step loses its address.
      if (prevConfig?.tokenOutId) {
        tokenIn = buildToken(
          prevConfig.tokenOutId,
          prevConfig.tokenOutSymbol,
          prevConfig.amountOut,
          prevConfig.tokenOutAddress,
          prevConfig.tokenOutDecimals,
        );
      }
    }

    let tokenOut;

    if (config?.tokenOutId) {
      tokenOut = buildToken(
        config.tokenOutId,
        config.tokenOutSymbol,
        config.amountOut,
        config.tokenOutAddress,
        config.tokenOutDecimals,
      );
    }

    return {
      step: stepNumber++,
      type: node.data.action.name.toUpperCase().replace(" ", "_"),
      agent: node.data.module.name.toUpperCase(),
      tokenIn,
      tokenOut,
    };
  });

  return {
    loops: "1",
    fee: 0,
    steps,
  };
};
