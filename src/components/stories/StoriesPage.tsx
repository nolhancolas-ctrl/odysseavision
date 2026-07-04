import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { getPublicPageContent } from "@/lib/content/site";
import { getPublicStoriesArchive } from "@/lib/content/stories";
import { StoriesHero } from "./StoriesHero";
import { StoriesArchive } from "./StoriesArchive";
import { PortfolioNewsletter } from "../portfolio/PortfolioNewsletter";

export async function StoriesPage() {
  const [pageContent, archive] = await Promise.all([
    getPublicPageContent("stories"),
    getPublicStoriesArchive(),
  ]);

  const sections = pageContent?.sections ?? {};

  return (
    <main className="min-h-screen bg-[#f4efe4] text-[#242617]">
      <SiteHeader active="Stories" />
      <StoriesHero content={sections.hero} />
      <StoriesArchive
        content={sections.archive}
        stories={archive.stories}
        storyCategories={archive.storyCategories}
      />
      <PortfolioNewsletter content={sections.newsletter} />
      <SiteFooter />
    </main>
  );
}
