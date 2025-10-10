import { AGENT, ASSET_ID, ASSET_SYMBOL, STEP_TYPE } from "@/utils/constant";

export interface Step {
    step: number;
    type: STEP_TYPE;
    agent?: AGENT;
    tokenIn?: Token;
    tokenOut?: Token;
}

export interface Token {
    assetId: ASSET_ID;
    symbol: ASSET_SYMBOL;
    amount?: number;
}

export interface StrategySimulate {
    initialCapital: Token;
    loops: number;
    fee: number;
    totalSupply: number;
    totalBorrow: number;
    steps: Step[];
}