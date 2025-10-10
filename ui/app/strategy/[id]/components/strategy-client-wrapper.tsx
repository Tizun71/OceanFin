"use client";

import { useState } from "react";
import { StrategyInput } from "./strategy-input";
import { StrategyTabs } from "./strategy-tabs";
import { StrategyHeader } from "./strategy-header";

export function StrategyClientWrapper({ strategy }: { strategy: any }) {
  const [simulateData, setSimulateData] = useState<any>(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <StrategyInput strategy={strategy} onSimulateSuccess={setSimulateData} />
      </div>

      <div className="lg:col-span-2">
        <StrategyHeader strategy={strategy} />
        <StrategyTabs strategy={strategy} simulateData={simulateData} />
      </div>
    </div>
  );
}
