"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { bindEvmAccount } from "@/api/hydration/bind-evm-account"
import { useLunoPapiClient } from "@/hooks/use-luno-papiclient"

interface BindAccountModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onBindSuccess?: () => void
}

export function BindAccountModal({ open, onOpenChange, onBindSuccess }: BindAccountModalProps) {
  const [loadingBind, setLoadingBind] = useState(false)
  const { walletAddress, sendTransaction } = useLunoPapiClient()

  const handleBindAccount = async () => {
    if (!walletAddress) return

    setLoadingBind(true)
    try {
      const tx = await bindEvmAccount()
      if (!tx) {
        onBindSuccess?.()
        onOpenChange(false)
        return
      }

      const result = await sendTransaction(tx)

      if (result?.status === "success") {
        onBindSuccess?.()
        onOpenChange(false)
      } else {
        throw new Error(result?.errorMessage || "Binding failed")
      }
    } catch (error: any) {
      console.error("Error binding account:", error)
      alert(error?.message || "Failed to bind account")
    } finally {
      setLoadingBind(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary">Bind EVM Account</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            You need to bind your Substrate account to an EVM account to execute strategies on Hydration.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="p-4 rounded-lg bg-accent/10 border border-accent/30">
            <p className="text-sm text-foreground">
              This is a one-time setup that allows your account to interact with EVM-based contracts.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={loadingBind}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-accent hover:bg-accent/90 text-white"
              onClick={handleBindAccount}
              disabled={loadingBind}
            >
              {loadingBind ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Binding...
                </span>
              ) : (
                "Bind Account"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}