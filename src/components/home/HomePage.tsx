import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { HomeHero } from "./HomeHero";
import { HomeIntro } from "./HomeIntro";
import { HomePortfolioPreview } from "./HomePortfolioPreview";
import { HomeFeaturedStory } from "./HomeFeaturedStory";
import { HomeAboutPreview } from "./HomeAboutPreview";
import { HomeMission } from "./HomeMission";
import { HomeFinalCTA } from "./HomeFinalCTA";

export function HomePage() {
  return (
    <main className="min-h-screen bg-[#f4efe4] text-[#242617]">
      <SiteHeader active="Home" />
      <HomeHero />
      <HomeIntro />
      <HomePortfolioPreview />
      <HomeFeaturedStory />
      <HomeAboutPreview />
      <HomeMission />
      <HomeFinalCTA />
      <SiteFooter />
    </main>
  );
}