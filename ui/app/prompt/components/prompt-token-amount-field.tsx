"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { resolveAssetIcon } from "@/lib/iconMap";

interface TokenOption {
  value: string;
  label: string;
}

interface Props {
  tokens: TokenOption[];
  selectedToken: string;
  tokenAmount: number;
  onSelectToken: (value: string) => void;
  onChangeAmount: (value: number) => void;
}

const resolveIcon = (symbol?: string) => resolveAssetIcon(symbol) || "/icons/default.png";

/**
 * Amount + token pair rendered as one bonded control instead of two floating
 * pills, so the pair reads as a single value the way an exchange input does.
 */
export function PromptTokenAmountField({
  tokens,
  selectedToken,
  tokenAmount,
  onSelectToken,
  onChangeAmount,
}: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const selectedLabel =
    tokens.find((t) => t.value === selectedToken)?.label || selectedToken;

  return (
    <div
      ref={containerRef}
      className="relative flex items-stretch rounded-xl border border-border bg-surface-1 transition-colors duration-200 focus-within:border-accent-light/60 hover:border-border-strong"
    >
      <div className="flex flex-1 flex-col justify-center px-4 py-3">
        <label
          htmlFor="starting-amount"
          className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground-subtle"
        >
          Amount
        </label>
        <input
          id="starting-amount"
          type="number"
          inputMode="decimal"
          value={tokenAmount || ""}
          onChange={(e) => onChangeAmount(Number(e.target.value))}
          min="0"
          step="0.000001"
          placeholder="0.00"
          className="w-full bg-transparent text-2xl font-semibold tabular-nums text-foreground outline-none placeholder:text-muted-foreground-subtle/60 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
      </div>

      <div className="my-3 w-px bg-border" aria-hidden />

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex min-w-[172px] items-center gap-3 rounded-r-xl px-4 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring active:bg-surface-3"
      >
        {selectedToken ? (
          <>
            <img
              src={resolveIcon(selectedToken)}
              alt=""
              className="size-6 rounded-full border border-border object-contain"
            />
            <span className="truncate">{selectedLabel}</span>
          </>
        ) : (
          <span className="text-muted-foreground">Select token</span>
        )}
        <ChevronDown
          className={`ml-auto size-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Starting token"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-[var(--z-overlay)] max-h-64 w-[220px] overflow-y-auto rounded-xl border border-border bg-popover p-1 shadow-[var(--shadow-lg)] backdrop-blur-xl custom-scroll"
        >
          {tokens.map((token) => {
            const isSelected = token.value === selectedToken;
            return (
              <li key={token.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onSelectToken(token.value);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-popover-foreground transition-colors duration-150 hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-ring"
                >
                  <img
                    src={resolveIcon(token.value)}
                    alt=""
                    className="size-5 rounded-full border border-border object-contain"
                  />
                  <span className="truncate">{token.label}</span>
                  {isSelected && (
                    <Check className="ml-auto size-4 text-accent-light" aria-hidden />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
