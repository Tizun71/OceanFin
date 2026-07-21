import type { Metadata } from "next";
import { ContentPage } from "@/components/shared/content-page";

export const metadata: Metadata = {
  title: "FAQs | Ocean Fin",
  description: "Common questions about using Ocean Fin.",
};

const faqs = [
  {
    q: "Does Ocean Fin hold my funds?",
    a: "No. Ocean Fin is fully non-custodial. Your assets stay in your wallet and every transaction is signed by you. We never take custody of keys or funds.",
  },
  {
    q: "Do I need to know how DeFi works?",
    a: "No. The DeFi Builder handles the plumbing, and you can borrow strategies other people already tuned. If you can drag a block or click a button, you can use it.",
  },
  {
    q: "What does simulation actually show?",
    a: "It runs your strategy against your real balance and current prices, then shows the expected steps and amounts before anything moves on-chain.",
  },
  {
    q: "Which chains and protocols are supported?",
    a: "Avalanche C-Chain is live today: Aave v3, Benqi, Trader Joe v2.2, sAVAX, and LI.FI. Base and Arbitrum run on the same rails and are coming next.",
  },
  {
    q: "How much does it cost?",
    a: "Ocean Fin does not charge to build or simulate. You only pay the network gas and any fees charged by the underlying protocols you interact with.",
  },
  {
    q: "Is it safe?",
    a: "You stay in control the whole time, but DeFi carries real risk: smart-contract bugs, liquidation, and market moves can cost you. Only commit what you can afford to lose.",
  },
];

export default function FaqsPage() {
  return (
    <ContentPage
      title="FAQs"
      intro="Quick answers to the questions people ask most."
    >
      {/* Plain Q/A list rather than an accordion: nothing worth hiding behind a
          click, and the whole page stays scannable and searchable in one view. */}
      <dl className="grid gap-6 sm:grid-cols-2">
        {faqs.map((item) => (
          <div key={item.q} className="rounded-xl border border-white/10 bg-surface-1 p-5">
            <dt className="text-sm font-semibold text-foreground">{item.q}</dt>
            <dd className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.a}</dd>
          </div>
        ))}
      </dl>
    </ContentPage>
  );
}
