import { HeroSection } from "@/components/hero-section";
import { StrategyClientWrapper } from "./components/strategy-client-wrapper";

async function getStrategy(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/strategies/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return null;
  }

  return res.json();
}

export default async function StrategyPage({ params }: { params: { id: string } }) {
  const strategy = await getStrategy(params.id);

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
