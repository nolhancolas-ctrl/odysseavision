import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { getPublicPageContent } from "@/lib/content/site";
import { AboutHero } from "./AboutHero";
import { AboutStory } from "./AboutStory";
import { AboutOceanDreams } from "./AboutOceanDreams";
import { AboutCrew } from "./AboutCrew";
import { AboutValues } from "./AboutValues";
import { AboutFinalCTA } from "./AboutFinalCTA";

export async function AboutPage() {
  const pageContent = await getPublicPageContent("about");
  const sections = pageContent?.sections ?? {};

  return (
    <main className="min-h-screen bg-[#f4efe4] text-[#242617]">
      <SiteHeader active="About" />
      <AboutHero content={sections.hero} />
      <AboutStory content={sections.story} />
      <AboutOceanDreams content={sections["ocean-dreams"]} />
      <AboutCrew content={sections.crew} />
      <AboutValues content={sections.values} />
      <AboutFinalCTA content={sections["final-cta"]} />
      <SiteFooter />
    </main>
  );
}
