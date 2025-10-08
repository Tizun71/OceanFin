"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Loader2, AlertCircle } from "lucide-react";

interface ExecutionStep {
  id: string;
  title: string;
  description: string;
  status: "pending" | "processing" | "completed" | "failed";
}

interface ExecutionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  strategy: {
    title: string;
    steps?: {
      id: string;
      title: string;
      description: string;
    }[];
  };
}

export function ExecutionModal({
  open,
  onOpenChange,
  strategy,
}: ExecutionModalProps) {
  
  const [executionSteps, setExecutionSteps] = useState<ExecutionStep[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);

  useEffect(() => {
    if (open) {
      const steps =
        strategy.steps && strategy.steps.length > 0
          ? strategy.steps.map((step, i) => ({
              id: step.id || `${i + 1}`,
              title: step.title,
              description: step.description,
              status: "pending" as const,
            }))
          : [
              {
                id: "1",
                title: "Approve Token",
                description: "Approve DOT spending on Bifrost",
                status: "pending" as const,
              },
              {
                id: "2",
                title: "Stake DOT",
                description: "Stake DOT on Bifrost protocol",
                status: "pending" as const,
              },
              {
                id: "3",
                title: "Bridge vDOT",
                description: "Bridge vDOT to Acala via XCM",
                status: "pending" as const,
              },
              {
                id: "4",
                title: "Swap to aUSD",
                description: "Swap vDOT for aUSD on Acala DEX",
                status: "pending" as const,
              },
            ];
      setExecutionSteps(steps);
      setIsExecuting(false);
    }
  }, [open, strategy]);

  const startExecution = () => {
    setIsExecuting(true);

    executionSteps.forEach((_, index) => {
      setTimeout(() => {
        setExecutionSteps((prev) =>
          prev.map((s, i) => {
            if (i === index) return { ...s, status: "processing" };
            if (i < index) return { ...s, status: "completed" };
            return s;
          })
        );

        setTimeout(() => {
          setExecutionSteps((prev) =>
            prev.map((s, i) =>
              i === index ? { ...s, status: "completed" } : s
            )
          );

          if (index === executionSteps.length - 1) {
            setIsExecuting(false);
          }
        }, 2000);
      }, index * 3000);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg glass border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-[#00D1FF] to-[#0EA5E9] bg-clip-text text-transparent">
            Execute Strategy
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{strategy.title}</p>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {executionSteps.map((step, index) => (
            <div
              key={step.id}
              className={`p-4 rounded-lg border transition-all duration-300 ${
                step.status === "completed"
                  ? "border-emerald-400 bg-emerald-400/10"
                  : step.status === "processing"
                  ? "border-primary bg-primary/10 glow-pink"
                  : step.status === "failed"
                  ? "border-red-500 bg-red-500/10"
                  : "border-border bg-background/50"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {step.status === "completed" && (
                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                  {step.status === "processing" && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    </div>
                  )}
                  {step.status === "failed" && (
                    <div className="w-6 h-6 rounded-full bg-destructive flex items-center justify-center">
                      <AlertCircle className="w-4 h-4 text-white" />
                    </div>
                  )}
                  {step.status === "pending" && (
                    <div className="w-6 h-6 rounded-full border-2 border-muted flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">
                        {index + 1}
                      </span>
                    </div>
                  )}
                </div>

                {/* step */}
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">{step.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                  {step.status === "processing" && (
                    <p className="text-xs text-primary mt-2 animate-pulse">
                      Waiting for confirmation...
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* === Action Buttons === */}
        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            className="flex-1 bg-transparent hover:bg-muted/40"
            onClick={() => onOpenChange(false)}
            disabled={isExecuting}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-[#00D1FF] to-[#0EA5E9] hover:opacity-90 glow-pink text-black font-semibold"
            onClick={startExecution}
            disabled={isExecuting}
          >
            {isExecuting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Executing...
              </>
            ) : (
              "Start Execution"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
