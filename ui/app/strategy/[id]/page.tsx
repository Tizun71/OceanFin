import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { StrategyClientWrapper } from "./components/strategy-client-wrapper";
import { getStrategy } from "@/services/strategy-service";

export default async function StrategyPage({ params }: { params: { id: string } }) {
  const strategy = await getStrategy(params.id).catch(() => null);

  if (!strategy) {
    return (
      // Was a dead end: a centred message with no way back to the list.
      <div className="flex flex-col items-center justify-center flex-1 px-6 py-24 text-center">
        <h1 className="text-2xl font-semibold mb-2">Strategy not found</h1>
        <p className="text-muted-foreground max-w-sm">
          This strategy may have been unpublished, or the link is incorrect.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg border border-border-strong px-4 text-sm font-medium transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden />
          Back to strategies
        </Link>
      </div>
    );
  }

  return (
    // `<HeroSection />` used to be rendered here as well as in the root layout,
    // so this route mounted two fixed headers stacked on top of each other —
    // and two copies of the wallet button and chain selector with it.
    // The wrapper also carried a `web3-grid` class that is not defined in any
    // stylesheet, and `min-h-screen` nested inside the layout's own min-h-dvh.
    <div className="w-full mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground mb-6 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden />
        All strategies
      </Link>

      <StrategyClientWrapper strategy={strategy} />
    </div>
  );
}
