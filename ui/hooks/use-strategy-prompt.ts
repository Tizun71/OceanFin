"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { displayToast } from "@/components/shared/toast-manager";

type TokenOption = {
  label: string;
  value: string;
};

export function useStrategyPrompt() {
  const router = useRouter();

  const [loading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [selectedToken, setSelectedToken] = useState("");
  const [prompt, setPrompt] = useState("");
  const [strategyName, setStrategyName] = useState("");

  const tokens: TokenOption[] = [
    { label: "USDC", value: "USDC" },
    { label: "ETH", value: "ETH" },
    { label: "BTC", value: "BTC" },
  ];

  const onCancel = () => {
    router.push("/builder");
  };

  const onNext = async () => {
    try {
      setSubmitting(true);

      console.log({
        selectedToken,
        prompt,
        strategyName,
      });

      displayToast("success", "Prompt submitted successfully.");

    } catch (error) {
      console.error(error);
      displayToast("error", "Failed to process prompt.");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    tokens,
    loading,
    submitting,

    selectedToken,
    prompt,
    strategyName,

    setSelectedToken,
    setPrompt,
    setStrategyName,

    onCancel,
    onNext,
  };
}