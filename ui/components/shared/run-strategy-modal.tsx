"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { simulateStrategy } from "@/services/defi-module-service";
import { displayToast } from "./toast-manager";
import { Rocket, Info} from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  strategyId: string;
  onSimulated: (data: any) => void;
}

export default function RunStrategyModal({
  open,
  onOpenChange,
  strategyId,
  onSimulated,
}: Props) {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRun = async () => {
    const value = Number(amount);
    if (!amount || value <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    setLoading(true);
    try {
      const res = await simulateStrategy(strategyId, value);
      onSimulated(res);
      displayToast("success", "Strategy simulated successfully!");
      onOpenChange(false);
      setAmount("");
    } catch (err) {
      displayToast("error", "Failed to simulate strategy");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value !== "" && !/^\d*\.?\d*$/.test(value)) return;

    setAmount(value);
    if (!value) {
      setError("Amount is required");
      return;
    }
    if (Number(value) <= 0) {
      setError("Amount must be greater than 0");
      return;
    }
    setError("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] bg-popover border border-border rounded-xl p-6 shadow-lg">
        <DialogHeader className="space-y-3 mb-5">
          <div className="w-11 h-11 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center">
            <Rocket className="w-5 h-5 text-accent-light" />
          </div>
          <DialogTitle className="text-lg font-semibold text-foreground">
            Simulate strategy
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Enter the amount of capital to model a dry-run.
          </p>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Amount</label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={handleChange}
              autoFocus
              className="w-full bg-surface-2 border border-border focus:border-accent/60 focus:ring-2 focus:ring-accent/20
                         p-3 rounded-lg text-foreground font-semibold text-lg placeholder:text-muted-foreground/60 transition-all outline-none"
            />

            {error ? (
              <p className="text-destructive text-xs flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-destructive" />
                {error}
              </p>
            ) : (
              <p className="text-muted-foreground text-xs flex items-center gap-1.5">
                <Info size={12} />
                Estimated with current market prices.
              </p>
            )}
          </div>

          <Button
            disabled={!amount || Number(amount) <= 0 || loading}
            onClick={handleRun}
            className="w-full h-11"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                <span className="text-sm">Simulating…</span>
              </div>
            ) : (
              'Run simulation'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}