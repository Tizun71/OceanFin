import TokenIcon from "./token-icon";
import { formatAmount, formatPercent } from "./defi-node-utils";
import type { NormalizedDefiNodeData } from "./defi-node.types";

type Props = {
  data: NormalizedDefiNodeData;
};

export function SwapRightLabel({ slippage }: { slippage?: number }) {
  return (
    <div className="leading-none">
      <div className="text-[12px] text-white/70">Slippage</div>
      <div className="mt-1 text-[18px] font-bold text-white">
        {formatPercent(slippage !== undefined ? slippage * 100 : undefined, 0)}
      </div>
    </div>
  );
}

export default function DefiNodeSwap({ data }: Props) {
  return (
    <div className="pt-3">
      <div className="grid grid-cols-[1fr_90px_1fr] items-center min-h-[92px]">
        {/* LEFT */}
        <div className="flex flex-col items-start">
          <div className="text-[28px] font-semibold leading-none text-white">
            {formatAmount(data.amountIn)}
          </div>
          <div className="mt-4">
            <TokenIcon symbol={data.tokenInSymbol} />
          </div>
        </div>

        {/* ARROW */}
        <div className="flex items-center justify-center">
          <div className="text-[40px] leading-none text-white/90">→</div>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col items-end">
          <div className="text-[28px] font-semibold leading-none text-white">
            {formatAmount(data.amountOut)}
          </div>
          <div className="mt-4">
            <TokenIcon symbol={data.tokenOutSymbol} />
          </div>
        </div>
      </div>
    </div>
  );
}