import TokenIcon from "./token-icon";
import { formatAmount, formatPercent } from "./defi-node-utils";
import type { NormalizedDefiNodeData } from "./defi-node.types";

type Props = {
  data: NormalizedDefiNodeData;
};

export function JoinStrategyRightLabel({ apy }: { apy?: number }) {
  return (
    <div className="leading-none">
      <div className="text-[12px] text-white/70">APY</div>
      <div className="mt-1 text-[18px] font-bold text-white">
        {formatPercent(apy, 0)}
      </div>
    </div>
  );
}

export default function DefiNodeJoinStrategy({ data }: Props) {
  return (
    <div className="pt-3">
      <div className="grid min-h-[92px] grid-cols-[1fr_90px_1fr] items-center">
        {/* LEFT */}
        <div className="flex flex-col items-start">
          <div className="text-[28px] font-semibold leading-none text-white">
            {formatAmount(data.amount)}
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