"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StrategyOverview } from "./strategy-overview";
import { StrategyFlow } from "./strategy-flow";
import StrategyPromptDetails from "./strategy-prompt-details";
import { MyActivityTable } from "./activity/strategy-my-activity-table";
import { AllActivityTable } from "./activity/strategy-all-activity-table";
import { Shield, Workflow, FileText, Activity, Users } from "lucide-react"; // icon set

interface StrategyTabsProps {
  strategy: any;
  simulateData?: any;
}

export function StrategyTabs({ strategy, simulateData }: StrategyTabsProps) {
  const tabs = [
    { value: "overview", label: "Overview", icon: Shield },
    { value: "flow", label: "Strategy Flow", icon: Workflow },
    { value: "prompt", label: "Strategy Prompt", icon: FileText },
    { value: "activities", label: "My Activities", icon: Activity },
    { value: "all", label: "All Activities", icon: Users },
  ];

  return (
    <Tabs defaultValue="overview" className="w-full">
      {/* === Tabs Header - Chip Style === */}
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
                 flex items-center gap-2 px-4 py-2.5 rounded-full
                  border border-gray-300
                  text-sm font-medium text-gray-700
                  hover:bg-gray-100 hover:border-gray-400
                  data-[state=active]:bg-gray-200
                  data-[state=active]:text-gray-900
                  data-[state=active]:border-gray-500
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
        <StrategyOverview strategy={strategy} simulateData={simulateData} />
      </TabsContent>

      <TabsContent value="flow">
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

      <TabsContent value="prompt">
        <div className="glass rounded-lg p-6">
          <StrategyPromptDetails />
        </div>
      </TabsContent>

      <TabsContent value="activities">
        <div className="glass rounded-lg p-6">
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
