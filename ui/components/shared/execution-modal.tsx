"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Loader2, AlertCircle } from "lucide-react";
import { StrategySimulate, Step as StrategyStep } from "@/types/strategy.type";
import { STEP_TYPE, TEST_USER_PUBLIC_ADDRESS } from "@/utils/constant";
import { buildStepTx } from "@/services/strategy-step-service";
import { getHydrationSDK, disconnectHydrationSDK } from "@/api/hydration/external/sdkClient";
import { useSendTransaction } from "@/hooks/use-send-transaction";
import { usePapiSigner } from "@luno-kit/react";

type ExecutionStatus = "pending" | "processing" | "completed" | "failed";

interface ExecutionStep {
  id: string;
  title: string;
  description: string;
  status: ExecutionStatus;
  original?: StrategyStep;
}

interface ExecutionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  strategy: StrategySimulate;
}

/* ----------------------------- helpers (pure) ----------------------------- */

const formatAmt = (v?: number) => (typeof v === "number" ? Number(v.toFixed(6)) : "-");

const getStepTitle = (s: StrategyStep) => {
  switch (s.type) {
    case STEP_TYPE.ENABLE_BORROWING:
      return "Enable Borrowing";
    case STEP_TYPE.ENABLE_E_MODE:
      return "Enable E-Mode";
    case STEP_TYPE.JOIN_STRATEGY:
      return `Swap ${s.tokenIn?.symbol ?? ""} → ${s.tokenOut?.symbol ?? ""}`;
    case STEP_TYPE.BORROW:
      return `Borrow ${s.tokenOut?.symbol ?? ""}`;
    default:
      return `Step ${s.step}`;
  }
};

const getStepDescription = (s: StrategyStep) => {
  switch (s.type) {
    case STEP_TYPE.ENABLE_BORROWING:
      return "Enable borrowing on protocol";
    case STEP_TYPE.ENABLE_E_MODE:
      return "Enable efficiency mode";
    case STEP_TYPE.JOIN_STRATEGY:
      return `Swap ${formatAmt(s.tokenIn?.amount)} ${s.tokenIn?.symbol ?? ""} for ~${formatAmt(
        s.tokenOut?.amount
      )} ${s.tokenOut?.symbol ?? ""}`;
    case STEP_TYPE.BORROW:
      return `Borrow ${formatAmt(s.tokenOut?.amount)} ${s.tokenOut?.symbol ?? ""}`;
    default:
      return "Execute step";
  }
};

const buildExecutionSteps = (strategy?: StrategySimulate): ExecutionStep[] => {
  return (
    strategy?.steps?.map((s, i) => ({
      id: `${s.step ?? i + 1}`,
      title: getStepTitle(s),
      description: getStepDescription(s),
      status: "pending" as const,
      original: s,
    })) ?? []
  );
};

const statusStyles: Record<ExecutionStatus, string> = {
  completed: "border-emerald-400 bg-emerald-400/10",
  processing: "border-primary bg-primary/10 glow-pink",
  failed: "border-red-500 bg-red-500/10",
  pending: "border-border bg-background/50",
};

/* ------------------------------ sub-components ----------------------------- */

function StepItem({
  step,
  index,
}: {
  step: ExecutionStep;
  index: number;
}) {
  return (
    <div
      className={`p-4 rounded-lg border transition-all duration-300 ${statusStyles[step.status]}`}
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
              <span className="text-xs text-muted-foreground">{index + 1}</span>
            </div>
          )}
        </div>

        <div className="flex-1">
          <h4 className="font-semibold mb-1">{step.title}</h4>
          <p className="text-sm text-muted-foreground">{step.description}</p>
          {step.status === "processing" && (
            <p className="text-xs text-primary mt-2 animate-pulse">Waiting for confirmation...</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- main ---------------------------------- */

export function ExecutionModal({ open, onOpenChange, strategy }: ExecutionModalProps) {
  const [executionSteps, setExecutionSteps] = useState<ExecutionStep[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const abortRef = useRef(false);

  const {executeTransaction} = useSendTransaction();

  const { data, isLoading } = usePapiSigner();

  useEffect(() => {
    if (!open) return;
    setExecutionSteps(buildExecutionSteps(strategy));
    setIsExecuting(false);
  }, [open, strategy]);

  useEffect(() => {
    abortRef.current = false;
    return () => {
      abortRef.current = true;
    };
  }, []);

  const subtitle = useMemo(() => {
    return strategy?.initialCapital
      ? `Initial: ${formatAmt(strategy.initialCapital.amount)} ${strategy.initialCapital.symbol} • Loops: ${strategy.loops}`
      : `Loops: ${strategy?.loops ?? "-"}`;
  }, [strategy]);

  const startExecution = async () => {
    if (!executionSteps.length || isExecuting) return;

    setIsExecuting(true);
    let sdkOpened = false;

    const originals = executionSteps.map((s) => s.original);

    try {
      const {api, sdk} = await getHydrationSDK();
      sdkOpened = true;

      for (let i = 0; i < originals.length; i++) {
        if (abortRef.current) break;

        setExecutionSteps((prev) =>
          prev.map((s, idx) =>
            idx === i ? { ...s, status: "processing" } : idx < i ? { ...s, status: "completed" } : s
          )
        );

        const original = originals[i];
        try {
          if (original) {
            const tx = await buildStepTx(original, TEST_USER_PUBLIC_ADDRESS);
            console.log("Built transaction for step:", original, tx);
            tx.signAndSend(data?.signBytes, {});
            console.log("Transaction result:", result);
          }

          if (abortRef.current) break;

          setExecutionSteps((prev) =>
            prev.map((s, idx) => (idx === i ? { ...s, status: "completed" } : s))
          );
        } catch (err) {
          if (abortRef.current) break;

          setExecutionSteps((prev) =>
            prev.map((s, idx) => (idx === i ? { ...s, status: "failed" } : s))
          );

          break;
        }
      }
    } catch {
      // keep statuses set above
    } finally {
      if (sdkOpened) {
        try {
          await disconnectHydrationSDK();
        } catch {
          // ignore disconnect errors
        }
      }
      setIsExecuting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto glass border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-[#00D1FF] to-[#0EA5E9] bg-clip-text text-transparent">
            Execute Strategy
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {executionSteps.map((step, index) => (
            <StepItem key={step.id} step={step} index={index} />
          ))}

          {!executionSteps.length && (
            <div className="text-sm text-muted-foreground">No steps to execute.</div>
          )}
        </div>

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
            disabled={isExecuting || !executionSteps.length}
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
