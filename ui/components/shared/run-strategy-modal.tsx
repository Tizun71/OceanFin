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
      <DialogContent className="sm:max-w-[440px] bg-neutral-900/90 border-white/20 backdrop-blur-3xl p-0 overflow-hidden rounded-[28px] shadow-2xl ring-1 ring-white/10">
        
        <div className="absolute top-0 left-0 right-0 h-[100px] bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

        <div className="p-8 relative z-10">
          <DialogHeader className="flex flex-col items-center text-center space-y-3 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-inner">
              <Rocket className="w-7 h-7 text-primary" />
            </div>
            <DialogTitle className="text-2xl font-extrabold text-white">
              Initialize Strategy
            </DialogTitle>
            <p className="text-sm text-neutral-400">Enter the amount to simulate execution</p>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-2">
              <div className="relative flex items-center group">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={amount}
                  onChange={handleChange}
                  className="w-full bg-white/[0.03] border border-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 
                             p-4 pl-14 pr-24 rounded-2xl text-white font-bold text-xl placeholder:text-neutral-600 transition-all outline-none"
                />

                <div className="absolute right-4 z-20 pointer-events-none">
                  <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded-md border border-white/5">
                    Amount
                  </span>
                </div>
              </div>

              {error ? (
                <p className="text-red-400 text-[11px] font-bold flex items-center gap-1.5 ml-2">
                  <span className="w-1 h-1 rounded-full bg-red-400 animate-ping" />
                  {error}
                </p>
              ) : (
                <p className="text-neutral-500 text-[11px] flex items-center gap-1.5 ml-2">
                  <Info size={12} />
                  Simulated results based on current market data.
                </p>
              )}
            </div>

            <Button
              disabled={!amount || Number(amount) <= 0 || loading}
              onClick={handleRun}
              className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl transition-all duration-300 shadow-[0_8px_20px_rgba(var(--primary-rgb),0.2)]"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="uppercase tracking-widest text-xs">Processing...</span>
                </div>
              ) : (
                <span className="tracking-widest uppercase">Run Simulation</span>
              )}
            </Button>
          </div>
        </div>
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </DialogContent>
    </Dialog>
  );
}