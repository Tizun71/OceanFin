import type { Metadata } from "next";
import { ContentPage, ContentSection } from "@/components/shared/content-page";

export const metadata: Metadata = {
  title: "Terms of Service | Ocean Fin",
  description: "The terms that govern your use of Ocean Fin.",
};

export default function TermsPage() {
  return (
    <ContentPage
      title="Terms of Service"
      intro="Last updated July 21, 2026. By using Ocean Fin you agree to the terms below."
    >
      <ContentSection heading="Non-custodial by design">
        <p>
          Ocean Fin never takes custody of your assets or private keys. Every
          transaction is signed in your own wallet and broadcast to the network
          under your control. We cannot move, freeze, or recover your funds.
        </p>
      </ContentSection>

      <ContentSection heading="No financial advice">
        <p>
          Strategies, simulations, and APY estimates are informational tools, not
          investment advice. DeFi carries real risk, including smart-contract
          bugs, liquidation, and total loss of capital. You are responsible for
          your own decisions.
        </p>
      </ContentSection>

      <ContentSection heading="Third-party protocols">
        <p>
          Ocean Fin routes transactions through independent protocols such as Aave
          v3, Benqi, Trader Joe, and LI.FI. We do not operate these protocols and
          are not liable for their behavior, downtime, or losses arising from them.
        </p>
      </ContentSection>

      <ContentSection heading="Acceptable use">
        <p>
          You agree not to use Ocean Fin for unlawful activity, to interfere with
          the service, or to attempt to access it in ways not permitted by these
          terms. We may restrict access that threatens the platform or its users.
        </p>
      </ContentSection>

      <ContentSection heading="Changes">
        <p>
          We may update these terms as the product evolves. Continued use after an
          update means you accept the revised terms. Questions? Reach us on X at{" "}
          <a
            href="https://x.com/oceanfin_"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-light hover:underline"
          >
            @oceanfin_
          </a>
          .
        </p>
      </ContentSection>
    </ContentPage>
  );
}
