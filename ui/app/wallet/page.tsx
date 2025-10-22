"use client";

import { Button } from "@/components/ui/button";
import { useLunoPapiClient } from "@/hooks/use-luno-papiclient";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function WalletPage() {
  const { 
    sendTransaction, 
    walletAddress, 
    isWalletConnected, 
    isReady, 
    isConnecting, 
    error, 
    balance,
    loadingBalance,
    refreshBalance 
  } = useLunoPapiClient();

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Wallet</h1>
        <p className="text-muted-foreground">Manage your Hydration wallet and transactions</p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Connection Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <span>Wallet:</span>
              <Badge variant={isWalletConnected ? "default" : "destructive"}>
                {isWalletConnected ? "Connected" : "Disconnected"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span>SDK:</span>
              <Badge variant={isReady ? "default" : isConnecting ? "secondary" : "destructive"}>
                {isConnecting ? "Connecting..." : isReady ? "Ready" : "Not Ready"}
              </Badge>
            </div>
            {walletAddress && (
              <div className="text-sm text-muted-foreground">
                Address: {walletAddress}
              </div>
            )}
            {error && (
              <div className="text-sm text-red-500">
                Error: {error.message}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Balance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {loadingBalance ? (
              <div>Loading balance...</div>
            ) : (
              <div>
                <div className="text-2xl font-bold">
                  {balance.formattedTotal} HDX
                </div>
                <div className="text-sm text-muted-foreground">
                  Transferable: {balance.formattedTransferable} HDX
                </div>
              </div>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshBalance}
              disabled={loadingBalance || !isReady}
            >
              Refresh Balance
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Action Card */}
      <Card>
        <CardHeader>
          <CardTitle>Set User E-Mode</CardTitle>
          <CardDescription>
            Set the user's e-mode category for Aave protocol on Hydration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={async () => {
              console.log("Button clicked - Debug info:", {
                walletAddress,
                isWalletConnected,
                isReady,
                isConnecting,
                error: error?.message
              });
              
              if (!walletAddress) {
                console.error("No wallet address available");
                toast.error("Wallet address not available");
                return;
              }
              
              if (!isWalletConnected) {
                console.error("Wallet not connected");
                toast.error("Please connect your wallet first");
                return;
              }
              
              if (!isReady) {
                console.error("SDK not ready");
                toast.error("SDK is not ready yet");
                return;
              }
              
              try {
                console.log("Starting transaction...");
                toast.info("Sending transaction...");
                const result = await sendTransaction(walletAddress!, "7MGnzT3vybGJaEgHj2JBFhgSHHGuR1nDkVmNsbkjeEmPRS2Y", "0.01");
                console.log("Transaction result:", result);
                
                if (result.status === "success") {
                  toast.success(`✅ Transaction confirmed: ${result.transactionHash}`);
                  refreshBalance();
                } else {
                  console.error("Transaction failed:", result.errorMessage);
                  toast.error(`❌ Failed: ${result.errorMessage}`);
                }
              } catch (err: any) {
                console.error("Transaction error:", err);
                console.error("Error stack:", err.stack);
                toast.error(err.message || "Transaction failed");
              }
            }}
            disabled={!isWalletConnected || !isReady || isConnecting}
            className="w-full"
          >
            {isConnecting ? "Connecting..." : "Execute Transaction"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
