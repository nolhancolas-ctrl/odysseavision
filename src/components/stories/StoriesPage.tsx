import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { StoriesHero } from "./StoriesHero";
import { StoriesArchive } from "./StoriesArchive";
import { PortfolioNewsletter } from "../portfolio/PortfolioNewsletter";

export function StoriesPage() {
  return (
    <main className="min-h-screen bg-[#f4efe4] text-[#242617]">
      <SiteHeader active="Stories" />
      <StoriesHero />
      <StoriesArchive />
      <PortfolioNewsletter />
      <SiteFooter />
    </main>
  );
}
