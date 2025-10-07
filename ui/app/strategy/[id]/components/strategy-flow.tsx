"use client"

import { Step } from "@/app/types/simulate"

export default function StrategyFlow({ steps }: { steps: Step[] }) {
  if (!steps?.length) return <div>No steps available</div>

  return (
    <div className="space-y-4">
      {steps.map((step, i) => (
        <div key={i} className="glass p-4 rounded-lg border border-primary/20">
          <div className="flex justify-between">
            <span>Step {step.step} - {step.type}</span>
            {step.agent && <span className="text-sm text-muted-foreground">Agent: {step.agent}</span>}
          </div>
          {step.tokenIn && (
            <div className="text-sm mt-2">
              Token In: {step.tokenIn.symbol} ({step.tokenIn.amount ?? 0})
            </div>
          )}
          {step.tokenOut && (
            <div className="text-sm mt-1">
              Token Out: {step.tokenOut.symbol} ({step.tokenOut.amount ?? 0})
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
