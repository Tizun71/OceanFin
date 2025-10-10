"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StrategyOverview } from "./strategy-overview";
import { StrategyFlow } from "./strategy-flow";

interface StrategyTabsProps {
  strategy: {
    id: string;
    title: string;
    description?: string;
    inputAsset?: string;
    outputAsset?: string;
    steps?: any[];
  };
  simulateData?: any; 
}

export function StrategyTabs({ strategy, simulateData }: StrategyTabsProps) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      {/* === TAB HEADER === */}
      <TabsList className="grid w-full grid-cols-5 bg-card/50 border border-border/40 rounded-xl overflow-hidden backdrop-blur-sm">
        {["overview", "flow", "prompt", "activities", "all"].map((tab) => (
          <TabsTrigger
            key={tab}
            value={tab}
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00D1FF] data-[state=active]:to-[#0EA5E9] data-[state=active]:text-black transition-colors"
          >
            {tab === "overview"
              ? "Overview"
              : tab === "flow"
              ? "Strategy Flow"
              : tab === "prompt"
              ? "Strategy Prompt"
              : tab === "activities"
              ? "My Activities"
              : "All Activities"}
          </TabsTrigger>
        ))}
      </TabsList>

      {/* === TAB CONTENTS === */}
      <TabsContent value="overview" className="mt-6">
        <StrategyOverview strategy={strategy} simulateData={simulateData} />
      </TabsContent>

      <TabsContent value="flow" className="mt-6">
        <div className="glass rounded-lg p-6">
          {simulateData ? (
            <StrategyFlow
              key={simulateData ? JSON.stringify(simulateData) : "empty"} 
              steps={Array.isArray(simulateData.steps) ? simulateData.steps : []}
              initialCapital={simulateData.initialCapital}
              loops={simulateData.loops}
              fee={simulateData.fee}
              totalSupply={simulateData.totalSupply}
              totalBorrow={simulateData.totalBorrow}
            />
          ) : (
            <p className="text-muted-foreground text-sm">
              Run a simulation first to see the flow here.
            </p>
          )}
        </div>
      </TabsContent>

      <TabsContent value="prompt" className="mt-6">
        <div className="glass rounded-lg p-6">
          <p className="text-muted-foreground text-sm">
            Strategy prompt details coming soon...
          </p>
        </div>
      </TabsContent>

      <TabsContent value="activities" className="mt-6">
        <div className="glass rounded-lg p-6">
          <p className="text-muted-foreground text-sm">
            Your activities will appear here...
          </p>
        </div>
      </TabsContent>

      <TabsContent value="all" className="mt-6">
        <div className="glass rounded-lg p-6">
          <p className="text-muted-foreground text-sm">
            All activities will appear here...
          </p>
        </div>
      </TabsContent>
    </Tabs>
  );
}
