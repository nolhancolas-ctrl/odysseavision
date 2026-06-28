import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { VideosHero } from "./VideosHero";
import { FeaturedFilm } from "./FeaturedFilm";
import { VideoCollection } from "./VideoCollection";
import { VideosInspiration } from "./VideosInspiration";
import { VideosFinalCTA } from "./VideosFinalCTA";

export function VideosPage() {
  return (
    <main className="min-h-screen bg-[#f4efe4] text-[#242617]">
      <SiteHeader active="Videos" />
      <VideosHero />
      <FeaturedFilm />
      <VideoCollection />
      <VideosInspiration />
      <VideosFinalCTA />
      <SiteFooter />
    </main>
  );
}
