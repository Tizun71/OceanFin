"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Target, Sparkles, X } from "lucide-react";

interface Props {
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}

export default function CreateStrategyModal({
  open,
  loading,
  onClose,
  onCreate,
}: Props) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (!open) setName("");
  }, [open]);

  if (!open) return null;

  const handleSubmit = () => {
    if (!name.trim()) return;
    onCreate(name);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-background/60 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div className="relative w-full max-w-[440px] bg-neutral-900/90 border border-white/10 backdrop-blur-3xl rounded-[28px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ring-1 ring-white/5">
        
        <div className="absolute top-0 left-0 right-0 h-[100px] bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

        <button 
          onClick={onClose}
          className="absolute right-6 top-6 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all z-20"
        >
          <X size={18} />
        </button>

        <div className="p-8 relative z-10">
          {/* Header Section */}
          <div className="flex flex-col items-center text-center space-y-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-inner">
              <Target className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
              New Strategy
            </h2>
            <p className="text-sm text-muted-foreground font-medium leading-relaxed">
              Define a name for your automated <br/> execution workflow.
            </p>
          </div>

          {/* Input Section */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1 opacity-80">
                Strategy Identifier
              </label>
              <div className="relative group">
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder="e.g. Yield Farming V1"
                  className="w-full bg-white/[0.03] border border-white/10 focus:border-primary/40 focus:ring-4 focus:ring-primary/5 
                             p-4 rounded-2xl text-foreground font-bold text-lg placeholder:text-muted-foreground/30 transition-all outline-none"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-focus-within:opacity-40 transition-opacity pointer-events-none">
                  <Sparkles size={18} className="text-primary" />
                </div>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={loading || !name.trim()}
              className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl 
                       shadow-[0_8px_25px_rgba(0,0,0,0.2)] active:scale-[0.97] transition-all duration-300 border-t border-white/10"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  <span className="tracking-widest uppercase text-sm font-black">Creating...</span>
                </div>
              ) : (
                <span className="tracking-widest uppercase text-sm font-black">Create Strategy</span>
              )}
            </Button>
          </div>
        </div>

        {/* Bottom Accent Line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-50" />
      </div>
    </div>
  );
}