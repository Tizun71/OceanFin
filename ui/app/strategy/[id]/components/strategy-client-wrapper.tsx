"use client";

import { useState } from "react";
import { StrategyInput } from "./strategy-input";
import { StrategyTabs } from "./strategy-tabs";
import { Menu } from "lucide-react";

export function StrategyClientWrapper({ strategy }: { strategy: any }) {
  const [simulateData, setSimulateData] = useState<any>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-[calc(100vh-60px)] overflow-hidden bg-[--background] text-[--foreground]">
      {/* SIDEBAR */}
      <div
        className={`flex flex-col  transition-all duration-300 ease-in-out
          ${isCollapsed ? "w-[60px]" : "w-1/4"}
        `}
      >
        <div className="flex items-center justify-between px-4 py-3 mt-12">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-gray-700/40 rounded-lg"
            title={isCollapsed ? "Expand" : "Collapse"}
          >
            <Menu size={20} />
          </button>
        </div>
        {!isCollapsed && (
          <div className="flex-1 overflow-y-auto p-4 mt-2">
            <StrategyInput
              strategy={strategy}
              onSimulateSuccess={setSimulateData}
            />
          </div>
        )}
      </div>
      {/* MAIN CONTENT */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out
          ${isCollapsed ? "w-[calc(100%-60px)]" : "w-[75%]"}
        `}
      >
        <div className="h-full overflow-y-auto p-6 flex flex-col gap-6">
          <StrategyTabs strategy={strategy} simulateData={simulateData} />
        </div>
      </div>
    </div>
  );
}
