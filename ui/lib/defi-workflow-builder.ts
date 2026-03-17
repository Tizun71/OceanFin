export const buildWorkflowJson = (nodes: any[]) => {
  let stepNumber = 1;

  const steps = nodes.map((node, index) => {
    const config = node.data.config;

    let tokenIn;

    if (index === 0) {
      if (config?.tokenInId) {
        tokenIn = {
          assetId: config.tokenInId,
          symbol: config.tokenInSymbol,
          amount: config.amount,
        };
      }
    } else {
      const prevConfig = nodes[index - 1].data.config;

      if (prevConfig?.tokenOutId) {
        tokenIn = {
          assetId: prevConfig.tokenOutId,
          symbol: prevConfig.tokenOutSymbol,
          amount: prevConfig.amountOut,
        };
      }
    }

    let tokenOut;

    if (config?.tokenOutId) {
      tokenOut = {
        assetId: config.tokenOutId,
        symbol: config.tokenOutSymbol,
        amount: config.amountOut,
      };
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