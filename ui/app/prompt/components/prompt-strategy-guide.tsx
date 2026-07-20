"use client";

import { ArrowUpRight } from "lucide-react";

interface TokenOption {
  value: string;
  label: string;
}

interface Props {
  tokens: TokenOption[];
  onPickExample: (prompt: string) => void;
}

export const EXAMPLE_PROMPTS = [
  "Loop gDOT three times to compound the staking yield",
  "Supply DOT as collateral and borrow USDC against it",
  "Route idle USDC into the highest paying lending market",
];

const OPERATIONS = ["Supply", "Borrow", "Swap", "Join strategy"];

/** Side rail shown until a strategy has been generated. */
export function PromptStrategyGuide({ tokens, onPickExample }: Props) {
  return (
    <aside className="space-y-8 rounded-2xl border border-border bg-surface-1 p-6">
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Start from an example</h2>
        <ul className="space-y-2">
          {EXAMPLE_PROMPTS.map((example) => (
            <li key={example}>
              <button
                type="button"
                onClick={() => onPickExample(example)}
                className="group flex w-full items-start gap-2 rounded-lg px-3 py-2.5 text-left text-[13px] leading-relaxed text-muted-foreground transition-colors duration-200 hover:bg-surface-2 hover:text-foreground active:translate-y-px"
              >
                <span className="flex-1">{example}</span>
                <ArrowUpRight
                  className="mt-0.5 size-3.5 shrink-0 text-accent-light opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                  aria-hidden
                />
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3 border-t border-border pt-6">
        <h2 className="text-sm font-semibold text-foreground">Supported operations</h2>
        <ul className="flex flex-wrap gap-1.5">
          {OPERATIONS.map((op) => (
            <li
              key={op}
              className="rounded-md bg-surface-2 px-2.5 py-1 text-xs text-muted-foreground"
            >
              {op}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3 border-t border-border pt-6">
        <h2 className="text-sm font-semibold text-foreground">Available tokens</h2>
        {tokens.length === 0 ? (
          <p className="text-xs text-muted-foreground-subtle">
            Token list is still loading.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-1.5">
            {tokens.map((token) => (
              <li
                key={token.value}
                className="rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground"
              >
                {token.label}
              </li>
            ))}
          </ul>
        )}
      </section>
    </aside>
  );
}
