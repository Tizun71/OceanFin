"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { simulateStrategy } from "@/services/defi-module-service";
import { displayToast } from "./toast-manager";

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

    setError("");
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

    setAmount(value);

    if (!value) {
        setError("Amount is required");
        return;
    }

    if (isNaN(Number(value))) {
        setError("Amount must be a number");
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
      <DialogContent className="sm:max-w-md max-h-[70vh] overflow-y-auto p-4">

        <DialogHeader className="pb-2">
          <DialogTitle className="pb-2">Run Strategy</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
            <input
          type="number"
          min="0"
          placeholder="Enter amount"
          value={amount}
          onChange={handleChange}
          className="border p-2 rounded w-full"
        />

        {error && (
          <p className="text-red-500 text-sm mt-1">
            {error}
          </p>
        )}

        <Button
        className="w-full h-10 bg-card hover:bg-card/80 hover:scale-[1.02] active:scale-[0.98] 
        border-2 border-accent/30 hover:border-accent/50 text-accent font-semibold 
        rounded-xl transition-all duration-200 shadow-sm hover:shadow-md 
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        disabled={!amount || Number(amount) <= 0 || loading}
        onClick={handleRun}
        >
        {loading ? (
            <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-accent/40 border-t-accent rounded-full animate-spin" />
            <span className="animate-pulse">Simulating...</span>
            </span>
        ) : (
            "Simulate Strategy"
        )}
        </Button>
        </div>
        

      </DialogContent>
    </Dialog>
  );
}