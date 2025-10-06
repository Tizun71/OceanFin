import { ArrowDown } from "lucide-react"

interface FlowStep {
  chain: string
  actions: {
    type: string
    protocol: string
    asset: string
    output?: string
  }[]
}

interface StrategyFlowProps {
  steps: FlowStep[]
}

export function StrategyFlow({ steps }: StrategyFlowProps) {
  const totalActions = steps.reduce((acc, step) => acc + step.actions.length, 0)

  return (
    <div className="glass rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-[#00D1FF] to-[#0EA5E9] bg-clip-text text-transparent">
        Strategy Flow
      </h3>

      <div className="flex items-start gap-6">
        <div className="flex-1 space-y-6">
          {steps.map((step, stepIndex) => (
            <div key={stepIndex}>
              <div className="glass rounded-lg p-4 border border-primary/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">{step.chain[0]}</span>
                    </div>
                    <span className="font-semibold text-[#00D1FF]">{step.chain}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{step.actions.length} Actions</span>
                </div>

                <div className="space-y-3">
                  {step.actions.map((action, actionIndex) => (
                    <div key={actionIndex}>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-[#00D1FF]">{action.type}</span>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <div className="w-4 h-4 rounded-full bg-secondary/20" />
                            <span>{action.protocol}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-center my-2">
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10">
                          <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="text-xs font-bold text-primary">{action.asset[0]}</span>
                          </div>
                          <span className="text-sm font-semibold">{action.asset}</span>
                        </div>
                      </div>

                      {action.output && actionIndex < step.actions.length - 1 && (
                        <div className="flex items-center justify-center">
                          <ArrowDown className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {stepIndex < steps.length - 1 && (
                <div className="flex items-center justify-center my-4">
                  <ArrowDown className="w-5 h-5 text-primary" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="w-48 glass rounded-lg p-4">
          <h4 className="text-sm font-semibold mb-3 text-[#00D1FF]">{totalActions} Steps</h4>
          <div className="space-y-2 text-sm">
            {steps.map((step, index) => (
              <div key={index}>
                {step.actions.map((action, actionIndex) => (
                  <div key={actionIndex} className="flex items-center gap-2 text-muted-foreground">
                    <span className="text-primary">+</span>
                    <span>{action.type}</span>
                    <span className="ml-auto text-xs">x 1</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
