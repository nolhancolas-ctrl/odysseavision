import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { getPublicPageContent } from "@/lib/content/site";
import { db } from "@/lib/db";
import { HomeHero } from "./HomeHero";
import { HomeIntro } from "./HomeIntro";
import { HomePortfolioPreview } from "./HomePortfolioPreview";
import { HomeFeaturedStory } from "./HomeFeaturedStory";
import { HomeMission } from "./HomeMission";
import { HomeFinalCTA } from "./HomeFinalCTA";

export async function HomePage() {
  const [pageContent, featuredStory] =
    await Promise.all([
      getPublicPageContent("home"),

      db.story
        .findFirst({
          where: {
            status: "PUBLISHED",
            featured: true,
          },
          orderBy: [
            { order: "asc" },
            { createdAt: "desc" },
          ],
          select: {
            slug: true,
          },
        })
        .catch(() => null),
    ]);

  const sections = pageContent?.sections ?? {};

  const featuredStoryHref =
    featuredStory?.slug
      ? `/stories/${featuredStory.slug}`
      : "/stories";

  return (
    <main className="min-h-screen bg-[#f4efe4] text-[#242617]">
      <SiteHeader active="Home" />
      <HomeHero content={sections.hero} />
      <HomeIntro content={sections.intro} />
      <HomePortfolioPreview content={sections["portfolio-preview"]} />
      <HomeFeaturedStory
        content={sections["featured-story"]}
        storyHref={featuredStoryHref}
      />
      <HomeMission content={sections.mission} />
      <HomeFinalCTA content={sections["final-cta"]} />
      <SiteFooter />
    </main>
  );
}
