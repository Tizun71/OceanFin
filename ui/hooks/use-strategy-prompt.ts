"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { displayToast } from "@/components/shared/toast-manager";
import { AIStrategyService, BuildStrategyResponse } from "@/services/ai-strategy-service";

type TokenOption = {
  label: string;
  value: string;
};

export function useStrategyPrompt() {
  const router = useRouter();

  const [loading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [strategyResult, setStrategyResult] = useState<BuildStrategyResponse | null>(null);

  const [selectedToken, setSelectedToken] = useState("");
  const [tokenAmount, setTokenAmount] = useState<number>(2); // Default amount
  const [prompt, setPrompt] = useState("");

  // Updated tokens for Hydration/Polkadot ecosystem
  const tokens: TokenOption[] = [
    { label: "DOT", value: "DOT" },
    { label: "VDOT", value: "VDOT" },
    { label: "GDOT", value: "GDOT" },
    { label: "USDT", value: "USDT" },
    { label: "USDC", value: "USDC" },
  ];

  const onCancel = () => {
    router.push("/builder");
  };

  const onNext = async () => {
    try {
      setSubmitting(true);

      // Validate prompt
      const validation = AIStrategyService.validatePrompt(prompt);
      if (!validation.isValid) {
        displayToast("error", validation.error!);
        return;
      }

      // Build additional context from selected token and amount
      const additionalContext = selectedToken 
        ? `${AIStrategyService.formatTokenToContext(selectedToken)} with ${tokenAmount} ${selectedToken}`
        : undefined;

      // Call AI Strategy Builder API
      console.log('Sending API request with:', {
        userIntent: prompt,
        additionalContext,
        tokenAmount,
      });
      
      const result = await AIStrategyService.buildStrategy({
        userIntent: prompt,
        additionalContext,
        tokenAmount, // Add token amount to API call
      });

      console.log('Received strategy result:', result);

      // Validate token consistency after strategy is generated
      const tokenConsistencyValidation = AIStrategyService.validateTokenConsistency(
        result.steps, 
        selectedToken
      );

      if (!tokenConsistencyValidation.isValid) {
        displayToast("error", tokenConsistencyValidation.error!);
        return;
      }

      setStrategyResult(result);

      // Show success message with strategy info
      const { steps, validation: strategyValidation, metadata } = result;
      
      if (!strategyValidation.isValid) {
        displayToast("warning", `Strategy created with warnings: ${strategyValidation.errors.join(', ')}`);
      } else {
        displayToast("success", `Strategy created successfully! ${steps.length} steps, ${metadata.riskLevel} risk level.`);
      }

      // Store strategy result in localStorage for next page
      localStorage.setItem('generatedStrategy', JSON.stringify({
        name: `Strategy ${new Date().toLocaleString()}`, // Auto-generate name
        result,
        selectedToken,
        tokenAmount,
        prompt,
      }));

      // Don't navigate immediately, let user review the preview first
      // router.push("/strategy-review");

    } catch (error: any) {
      console.error('Strategy generation failed:', error);
      displayToast("error", error.message || "Failed to generate strategy.");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    tokens,
    loading,
    submitting,
    strategyResult,

    selectedToken,
    tokenAmount,
    prompt,

    setSelectedToken,
    setTokenAmount,
    setPrompt,

    onCancel,
    onNext,
  };
}