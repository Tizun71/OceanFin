import TokenIcon from "./token-icon";
import { formatAmount, formatPercent } from "./defi-node-utils";
import type { NormalizedDefiNodeData } from "./defi-node.types";

type Props = {
  data: NormalizedDefiNodeData;
};

export function SupplyRightLabel({ apy }: { apy?: number }) {
  return (
    <div className="leading-none text-right">
      <div className="text-[11px] uppercase tracking-wide text-white/65">APY</div>
      <div className="mt-1 text-[18px] font-bold leading-none text-white">
        {formatPercent(apy, 0)}
      </div>
    </div>
  );
}

export default function DefiNodeSupply({ data }: Props) {
  return (
    <div className="pt-2">
      {/* Middle amount */}
      <div className="flex min-h-[88px] items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="text-[30px] font-semibold leading-none text-white">
            {formatAmount(data.amountIn)}
          </div>

          <TokenIcon
            symbol={data.tokenInSymbol}
            textClassName="text-[16px]"
            iconClassName="w-5 h-5"
            className="gap-2"
          />
        </div>
      </div>
    </div>
  );
}