import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { PortfolioHero } from "./PortfolioHero";
import { PortfolioCategories } from "./PortfolioCategories";
import { PortfolioFeatured } from "./PortfolioFeatured";
import { PortfolioRecent } from "./PortfolioRecent";
import { PortfolioNewsletter } from "./PortfolioNewsletter";

export function PortfolioPage() {
  return (
    <main className="min-h-screen bg-[#f4efe4] text-[#242617]">
      <SiteHeader active="Portfolio" />
      <PortfolioHero />
      <PortfolioCategories />
      <PortfolioFeatured />
      <PortfolioRecent />
      <PortfolioNewsletter />
      <SiteFooter />
    </main>
  );
}
