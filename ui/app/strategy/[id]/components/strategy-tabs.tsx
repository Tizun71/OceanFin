"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StrategyOverview } from "./strategy-overview";
import { StrategyFlow } from "./strategy-flow";
import StrategyPromptDetails from "./strategy-prompt-details";
import { MyActivityTable } from "./activity/strategy-my-activity-table";
import { AllActivityTable } from "./activity/strategy-all-activity-table";
import { Shield, Workflow, FileText, Activity, Users, ExternalLink, Bot } from "lucide-react";
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
      <TabsList
        className="
          flex flex-wrap gap-3 bg-transparent border-none justify-start 
          mt-10 mb-6
        "
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="
                flex items-center gap-2 px-5 py-2.5 rounded-full
                border border-border bg-card/40 backdrop-blur-sm
                text-sm font-medium text-foreground/70
                hover:bg-card/60 hover:border-accent/40 hover:text-foreground
                data-[state=active]:bg-accent/20
                data-[state=active]:text-accent-light
                data-[state=active]:border-accent
                data-[state=active]:shadow-[0_0_15px_rgba(0,194,203,0.3)]
                transition-all duration-300
              "
            >
              <Icon size={16} className="opacity-80" />
              {tab.label}
            </TabsTrigger>
          );
        })}
      </TabsList>

      {/* === Tab Contents === */}
      <TabsContent value="overview">
        <StrategyOverview strategy={strategy} simulateData={simulateData}
        />
      </TabsContent>

      <TabsContent value="flow">
        <div className="glass rounded-lg p-6">
          {simulateData ? (
            <StrategyFlow
              key={JSON.stringify(simulateData)}
              steps={Array.isArray(simulateData.steps) ? simulateData.steps : []}
              initialCapital={simulateData.initialCapital}
              loops={simulateData.loops}
              fee={simulateData.fee}
            />
          ) : (
            <div className="flex flex-col items-center justify-center px-4">
              <div className="w-10 h-10 mb-4 rounded-full bg-accent/10 flex items-center justify-center">
                <Bot className="w-10 h-10 text-accent/50" />
              </div>
              <p className="text-muted-foreground text-center max-w-md text-sm">
                Please run a simulation first to see the strategy details and expected results.
              </p>
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="prompt">
        <div className="glass rounded-lg p-6">
          <StrategyPromptDetails />
        </div>
      </TabsContent>

      <TabsContent value="activities">
        <div className="glass rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="text-lg font-semibold">My Activities</div>
            <a
              href="https://app.hydration.net/borrow/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm hover:underline"
            >
              <span>See My Position on Hydration</span>
              <ExternalLink size={16} className="opacity-80" />
            </a>
          </div>

          <MyActivityTable />
        </div>
      </TabsContent>

      <TabsContent value="all">
        <div className="glass rounded-lg p-6">
          <AllActivityTable />
        </div>
      </TabsContent>
    </Tabs>
  );
}