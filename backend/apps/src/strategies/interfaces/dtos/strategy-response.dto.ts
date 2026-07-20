/**
 * Note: `assets` holds ICON PATHS (the cards render them with <Image src=…/>),
 * not token symbols. The real input token is `inputAsset`, resolved from the
 * strategy's workflow.
 */
export class StrategyInputAssetDto {
  symbol: string;
  /** ERC-20 address on EVM chains. */
  address?: string;
  decimals?: number;
  /** Chain slug the workflow runs on. */
  chain?: string;
}

export class StrategyResponseDto {
  id: string;
  title?: string;
  strategistName: string;
  strategistHandle?: string;
  apy: number;
  tags?: string[];
  assets?: string[];
  agents?: string[];
  chains?: string[];
  /** Present when the strategy has an executable workflow. */
  inputAsset?: StrategyInputAssetDto | null;
}
