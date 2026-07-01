import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { getPublicPageContent } from "@/lib/content/site";
import { HomeHero } from "./HomeHero";
import { HomeIntro } from "./HomeIntro";
import { HomePortfolioPreview } from "./HomePortfolioPreview";
import { HomeFeaturedStory } from "./HomeFeaturedStory";
import { HomeAboutPreview } from "./HomeAboutPreview";
import { HomeMission } from "./HomeMission";
import { HomeFinalCTA } from "./HomeFinalCTA";

export async function HomePage() {
  const pageContent = await getPublicPageContent("home");
  const sections = pageContent?.sections ?? {};

  return (
    <main className="min-h-screen bg-[#f4efe4] text-[#242617]">
      <SiteHeader active="Home" />
      <HomeHero content={sections.hero} />
      <HomeIntro content={sections.intro} />
      <HomePortfolioPreview content={sections["portfolio-preview"]} />
      <HomeFeaturedStory content={sections["featured-story"]} />
      <HomeAboutPreview content={sections["about-preview"]} />
      <HomeMission content={sections.mission} />
      <HomeFinalCTA content={sections["final-cta"]} />
      <SiteFooter />
    </main>
  );
}
