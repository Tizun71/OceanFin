"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2 } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ConfirmModal({
  open,
  title = "Delete Strategy",
  message,
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmModalProps) {
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[420px] bg-neutral-900/80 border-white/20 backdrop-blur-3xl p-0 overflow-hidden rounded-[28px] shadow-2xl ring-1 ring-white/10">
        
        <div className="absolute top-0 left-0 right-0 h-[80px] bg-gradient-to-b from-red-500/10 to-transparent pointer-events-none" />

        <div className="p-8 relative z-10">
          <DialogHeader className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/10 border border-red-500/30 flex items-center justify-center mb-2 shadow-inner">
              <AlertTriangle className="w-8 h-8 text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
            </div>
            
            <DialogTitle className="text-2xl font-extrabold text-white tracking-tight">
              {title}
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4 text-center">
            <p className="text-[15px] text-neutral-300 leading-relaxed font-medium">
              {message}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-10">
            <Button
              variant="ghost"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 h-12 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold transition-all border border-white/5 hover:border-white/20"
            >
              Cancel
            </Button>

            <Button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 h-12 bg-red-500 hover:bg-red-400 text-white font-bold rounded-xl shadow-[0_4px_20px_rgba(239,68,68,0.4)] hover:shadow-[0_6px_25px_rgba(239,68,68,0.6)] transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Trash2 size={18} />
                  Delete
                </>
              )}
            </Button>
          </div>
        </div>
        <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />
      </DialogContent>
    </Dialog>
  );
}