"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StrategyOverview, SimulationEmptyState } from "./strategy-overview";
import { StrategyFlow } from "./strategy-flow";
import StrategyPromptDetails from "./strategy-prompt-details";
import { MyActivityTable } from "./activity/strategy-my-activity-table";
import { AllActivityTable } from "./activity/strategy-all-activity-table";
import { Shield, Workflow, FileText, Activity, Users, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";

interface StrategyTabsProps {
  strategy: any;
  simulateData?: any;
}

export function StrategyTabs({ strategy, simulateData }: StrategyTabsProps) {
  const [activeTab, setActiveTab] = useState("overview");
  useEffect(() => {
    if (simulateData) {
      setActiveTab("flow");
    }
  }, [simulateData]);
  const tabs = [
    { value: "overview", label: "Overview", icon: Shield },
    { value: "flow", label: "Strategy Flow", icon: Workflow },
    { value: "prompt", label: "Strategy Prompt", icon: FileText },
    { value: "activities", label: "My Activities", icon: Activity },
    { value: "all", label: "All Activities", icon: Users },
  ];

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      {/* Five bordered pills wrapped onto two ragged rows below ~900px and
          each carried its own glow when active. Replaced with a single
          underlined bar that scrolls horizontally instead of wrapping, so the
          row height never changes as you switch tabs. */}
      <div className="mb-6 -mx-1 overflow-x-auto border-b border-border">
        <TabsList className="flex w-max min-w-full gap-1 bg-transparent border-none justify-start p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="
                  relative flex shrink-0 items-center gap-2 rounded-none rounded-t-md px-4 py-2.5
                  text-sm font-medium text-muted-foreground whitespace-nowrap
                  border-b-2 border-transparent bg-transparent
                  transition-colors duration-200
                  hover:text-foreground hover:bg-surface-1
                  data-[state=active]:text-accent-light
                  data-[state=active]:border-accent
                  data-[state=active]:bg-transparent
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset
                "
              >
                <Icon size={16} aria-hidden />
                {tab.label}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </div>

      {/* === Tab Contents === */}
      <TabsContent value="overview">
        <StrategyOverview strategy={strategy} simulateData={simulateData}
        />
      </TabsContent>

      <TabsContent value="flow">
        <div className="glass rounded-xl p-6">
          {simulateData ? (
            <StrategyFlow
              key={JSON.stringify(simulateData)}
              steps={Array.isArray(simulateData.steps) ? simulateData.steps : []}
              initialCapital={simulateData.initialCapital}
              loops={simulateData.loops}
              fee={simulateData.fee}
            />
          ) : (
            <SimulationEmptyState message="Run a simulation to see each step of this strategy laid out as a flow." />
          )}
        </div>
      </TabsContent>

      <TabsContent value="prompt">
        <div className="glass rounded-xl p-6">
          <StrategyPromptDetails />
        </div>
      </TabsContent>

      <TabsContent value="activities">
        <div className="glass rounded-xl p-6">
          <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
            <h2 className="text-base font-semibold">My activities</h2>
            <a
              href="https://app.hydration.net/borrow/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-accent-light rounded hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <span>See my position on Hydration</span>
              <ExternalLink size={14} aria-hidden />
              {/* The link opened a new tab with no warning to screen readers. */}
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </div>

          <MyActivityTable />
        </div>
      </TabsContent>

      <TabsContent value="all">
        <div className="glass rounded-xl p-6">
          <AllActivityTable />
        </div>
      </TabsContent>
    </Tabs>
  );
}