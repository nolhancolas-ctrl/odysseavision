import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { getPublicPageContent } from "@/lib/content/site";
import { PortfolioHero } from "./PortfolioHero";
import { PortfolioCategories } from "./PortfolioCategories";
import { PortfolioFeatured } from "./PortfolioFeatured";
import { PortfolioRecent } from "./PortfolioRecent";
import { PortfolioNewsletter } from "./PortfolioNewsletter";

export async function PortfolioPage() {
  const pageContent = await getPublicPageContent("portfolio");
  const sections = pageContent?.sections ?? {};

  return (
    <main className="min-h-screen bg-[#f4efe4] text-[#242617]">
      <SiteHeader active="Portfolio" />
      <PortfolioHero content={sections.hero} />
      <PortfolioCategories content={sections.categories} />
      <PortfolioFeatured content={sections.featured} />
      <PortfolioRecent content={sections.recent} />
      <PortfolioNewsletter content={sections.newsletter} />
      <SiteFooter />
    </main>
  );
}
