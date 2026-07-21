import { AGENT, ASSET_ID, ASSET_SYMBOL, STEP_TYPE } from "@/utils/constant";

export interface Step {
    step: number;
    type: STEP_TYPE;
    agent?: AGENT;
    /**
     * EVM lending protocol for SUPPLY/BORROW routing. Defaults to AAVE when
     * absent (back-compat). BENQI routes to its qiToken markets in
     * lib/evm/build-evm-plan. Set from the builder module's protocol.
     */
    protocol?: "AAVE" | "BENQI";
    tokenIn?: Token;
    tokenOut?: Token;
    /**
     * ENABLE_E_MODE carries the category LABEL, not an id: ids are
     * governance-mutable, so the id is resolved on-chain before signing
     * (lib/evm/aave-emode.ts).
     */
    eModeCategoryLabel?: string;
}

export interface Token {
    assetId: ASSET_ID;
    symbol: ASSET_SYMBOL;
    amount?: number;
    // EVM extensions (optional). Substrate tokens leave these undefined; EVM
    // strategy steps carry the on-chain token address + decimals for execution.
    address?: `0x${string}`;
    decimals?: number;
}

export interface StrategySimulate {
    initialCapital: Token;
    loops: number;
    fee: number;
    totalSupply: number;
    totalBorrow: number;
    steps: Step[];
}