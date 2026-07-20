"use client";

import { useState } from "react";
import { StrategyInput } from "./strategy-input";
import { StrategyTabs } from "./strategy-tabs";
import { StrategyHeader } from "./strategy-header";

export function StrategyClientWrapper({ strategy }: { strategy: any }) {
  const [simulateData, setSimulateData] = useState<any>(null);

  return (
    <div className="space-y-6">
      {/* Promoted to page level. The header — title, status, APY, author —
          used to render inside the Overview tab, so switching to "Strategy
          Flow" or "All Activities" dropped every trace of which strategy you
          were looking at. Identity belongs above the tabs, not inside one. */}
      <StrategyHeader strategy={strategy} />

      {/* Replaces the collapsible 25% / 75% split. That sidebar toggled with
          an unlabelled hamburger that mirrored the global nav icon, animated
          `width` (a layout property, so every frame reflowed the flow chart
          beside it), and at `w-1/4` on a phone left the amount field about
          80px wide. The action panel now sits in a fixed-width rail that
          stacks above the tabs on small screens. */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start">
        <div className="min-w-0 order-2 lg:order-1">
          <StrategyTabs strategy={strategy} simulateData={simulateData} />
        </div>

        <aside className="order-1 lg:order-2 lg:sticky lg:top-28">
          <StrategyInput strategy={strategy} onSimulateSuccess={setSimulateData} />
        </aside>
      </div>
    </div>
  );
}
