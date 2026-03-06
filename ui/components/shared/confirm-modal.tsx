"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

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
  title = "Confirm Delete",
  message,
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmModalProps) {
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-md">

        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-400">
            <AlertTriangle size={18} />
            {title}
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-neutral-400 mt-2">
          {message}
        </p>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            onClick={onConfirm}
            disabled={loading}
            className="bg-red-500 hover:bg-red-600"
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}