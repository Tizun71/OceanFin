import { HeroSection } from "@/components/hero-section";
import { StrategyClientWrapper } from "./components/strategy-client-wrapper";
import { getStrategy } from "@/services/strategy-service";

export default async function StrategyPage({ params }: { params: { id: string } }) {
  const strategy = await getStrategy(params.id).catch(() => null);

  if (!strategy) return <div>Strategy not found</div>;

  return (
    <div className="flex min-h-screen">
      <main className="flex-1 web3-grid">
        <HeroSection />
        <div className="container mx-auto px-6 py-8">
          <StrategyClientWrapper strategy={strategy} />
        </div>
      </main>
    </div>
  );
}
