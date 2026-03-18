"use client";
import { normalizeDefiNodeData } from "./nodes/defi-node-utils";

import DefiNodeShell from "./nodes/defi-node-shell";
import DefiNodeDefault from "./nodes/defi-node-default";

import DefiNodeSwap, { SwapRightLabel } from "./nodes/defi-node-swap";
import DefiNodeSupply, { SupplyRightLabel } from "./nodes/defi-node-supply";
import DefiNodeBorrow, { BorrowRightLabel } from "./nodes/defi-node-borrow";
import DefiNodeJoinStrategy, {
  JoinStrategyRightLabel,
} from "./nodes/defi-node-join-strategy";
import { DefiNodeProps } from "./nodes/defi-node.types";

export default function DefiNode({ data, selected }: DefiNodeProps) {

  
  const normalized = normalizeDefiNodeData(data);

  const commonProps = {
    nodeId: data.id,
    selected,
    title: normalized.title,
    protocolName: normalized.protocolName,
    onDelete: data?.onDelete,
  };

  if (!normalized.isConfigured) {
    return (
      <DefiNodeShell {...commonProps}>
        <DefiNodeDefault />
      </DefiNodeShell>
    );
  }

  switch (normalized.type) {
    case "SUPPLY":
      return (
        <DefiNodeShell
          {...commonProps}
          rightLabel={<SupplyRightLabel apy={normalized.apy} />}
        >
          <DefiNodeSupply data={normalized} />
        </DefiNodeShell>
      );

    case "BORROW":
      return (
        <DefiNodeShell
          {...commonProps}
          rightLabel={<BorrowRightLabel apy={normalized.apy} />}
        >
          <DefiNodeBorrow data={normalized} />
        </DefiNodeShell>
      );

    case "JOIN_STRATEGY":
      return (
        <DefiNodeShell
          {...commonProps}
          rightLabel={<JoinStrategyRightLabel apy={normalized.apy} />}
        >
          <DefiNodeJoinStrategy data={normalized} />
        </DefiNodeShell>
      );

    case "SWAP":
    default:
      return (
        <DefiNodeShell
          {...commonProps}
          rightLabel={<SwapRightLabel slippage={normalized.slippage} />}
        >
          <DefiNodeSwap data={normalized} />
        </DefiNodeShell>
      );
  }
}