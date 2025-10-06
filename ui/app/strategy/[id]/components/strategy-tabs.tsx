"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StrategyOverview } from "./strategy-overview"

interface StrategyTabsProps {
  strategy: any
}

export function StrategyTabs({ strategy }: StrategyTabsProps) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-4 bg-card/50">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="prompt">Strategy Prompt</TabsTrigger>
        <TabsTrigger value="activities">My Activities</TabsTrigger>
        <TabsTrigger value="all">All Activities</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="mt-6">
        <StrategyOverview strategy={strategy} />
      </TabsContent>
      <TabsContent value="prompt" className="mt-6">
        <div className="glass rounded-lg p-6">
          <p className="text-muted-foreground">Strategy prompt details coming soon...</p>
        </div>
      </TabsContent>
      <TabsContent value="activities" className="mt-6">
        <div className="glass rounded-lg p-6">
          <p className="text-muted-foreground">Your activities will appear here...</p>
        </div>
      </TabsContent>
      <TabsContent value="all" className="mt-6">
        <div className="glass rounded-lg p-6">
          <p className="text-muted-foreground">All activities will appear here...</p>
        </div>
      </TabsContent>
    </Tabs>
  )
}
