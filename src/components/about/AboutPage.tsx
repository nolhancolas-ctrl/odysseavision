import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { AboutHero } from "./AboutHero";
import { AboutStory } from "./AboutStory";
import { AboutOceanDreams } from "./AboutOceanDreams";
import { AboutCrew } from "./AboutCrew";
import { AboutValues } from "./AboutValues";
import { AboutFinalCTA } from "./AboutFinalCTA";

export function AboutPage() {
  return (
    <main className="min-h-screen bg-[#f4efe4] text-[#242617]">
      <SiteHeader active="About" />
      <AboutHero />
      <AboutStory />
      <AboutOceanDreams />
      <AboutCrew />
      <AboutValues />
      <AboutFinalCTA />
      <SiteFooter />
    </main>
  );
}
