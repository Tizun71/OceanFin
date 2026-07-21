import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage, ContentSection } from "@/components/shared/content-page";

export const metadata: Metadata = {
  title: "Docs | Ocean Fin",
  description: "Learn how the DeFi Builder and Strategy Library work.",
};

export default function DocsPage() {
  return (
    <ContentPage
      title="Docs"
      intro="Everything you need to go from connected wallet to your first running strategy."
    >
      <ContentSection heading="Connect a wallet">
        <p>
          Click <span className="text-foreground">Connect</span> in the header and
          pick MetaMask, Core, or WalletConnect. Ocean Fin binds to your address to
          show your strategies. Your keys never leave your wallet.
        </p>
      </ContentSection>

      <ContentSection heading="Build a strategy">
        <p>
          Open the{" "}
          <Link href="/builder" className="text-accent-light hover:underline">
            DeFi Builder
          </Link>{" "}
          and drag operation blocks onto the canvas: Swap, Supply, Borrow, Loop,
          and Bridge. Connect them in order. Invalid combinations are caught before
          you can deploy, and live prices update as you build.
        </p>
      </ContentSection>

      <ContentSection heading="Borrow a strategy">
        <p>
          Not building from scratch? The home page lists community strategies ranked
          by current APY. Open one to see its steps, then simulate it against your
          own balance before anything moves on-chain.
        </p>
      </ContentSection>

      <ContentSection heading="Simulate, then run">
        <p>
          Every strategy is simulated up front, so you see the expected outcome and
          amounts before signing. When it looks right, run it in one click. Ocean
          Fin batches the steps and hands each transaction to your wallet to confirm.
        </p>
      </ContentSection>

      <ContentSection heading="Supported protocols">
        <p>
          Ocean Fin routes through Trader Joe (LFJ) v2.2 for swaps, Aave v3 and
          Benqi for lending and borrowing, sAVAX for liquid staking, and LI.FI for
          cross-chain moves. Avalanche C-Chain is live today, with Base and Arbitrum
          on the same rails.
        </p>
      </ContentSection>
    </ContentPage>
  );
}
